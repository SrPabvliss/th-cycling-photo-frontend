import { useQueryClient } from '@tanstack/vue-query'
import PQueue from 'p-queue'
import pRetry, { AbortError } from 'p-retry'
import { computed, onUnmounted, ref, type Ref, watch } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { b2UploadClient } from '@/core/http/b2-upload-client'
import { useConnectivityMonitor } from '@/shared/composables/use-connectivity-monitor'
import { PHOTO_QUERY_KEYS } from '../constants/query-keys'
import { useUploadStore } from '../stores/upload.store'
import type { IConfirmPhotoBatchRequest } from '../types/requests/confirm-photo-batch.request'
import type { IApiConfirmBatch } from '../types/responses/confirm-batch.response'
import type { IUploadItem } from '../types/upload-status'
import { classifyUploadError, getUploadErrorMessage } from '../utils/classify-upload-error'
import { usePresignedUrlCache } from './use-presigned-url-cache'

const CONCURRENCY = 4
const QUEUE_TIMEOUT = 300_000 // 5 min per task
const RETRY_COUNT = 3
const CONFIRM_BATCH_SIZE = 20

export function useUploadQueue(eventId: Ref<string>) {
  const store = useUploadStore()
  const queryClient = useQueryClient()
  const presignedUrlCache = usePresignedUrlCache(eventId)
  const { isOnline, destroy: destroyConnectivity } = useConnectivityMonitor()

  // --- p-queue ---

  const queue = new PQueue({
    concurrency: CONCURRENCY,
    timeout: QUEUE_TIMEOUT,
    autoStart: true,
  })

  // --- Batch confirm accumulator ---

  const _pendingConfirm: IUploadItem[] = []

  // --- Photo category for batch ---

  const photoCategoryId = ref<number | null>(null)

  // --- Duplicate tracking ---

  const autoConfirmedCount = ref(0)

  // --- Computed ---

  const isActive = computed(
    () => store.uploads.size > 0 && store.counts.confirmed < store.counts.total,
  )

  // --- Single file upload ---

  async function uploadSingleFile(item: IUploadItem): Promise<void> {
    store.transitionStatus(item.id, 'uploading')

    const result = await presignedUrlCache.fetch(item.fileName, item._file.type)

    // Duplicate: auto-confirm without uploading to B2
    if (result.isDuplicate) {
      store.transitionStatus(item.id, 'confirmed')
      autoConfirmedCount.value++
      return
    }

    const abortController = new AbortController()
    store.setAbortController(item.id, abortController)

    await b2UploadClient.put(result.url, item._file, {
      headers: { 'Content-Type': item._file.type },
      signal: abortController.signal,
      onUploadProgress: (e) => {
        if (e.lengthComputable) {
          store.onFileProgress(item.id, e.loaded!, e.total!)
        }
      },
    })

    store.updateItem(item.id, { objectKey: result.objectKey })
    store.transitionStatus(item.id, 'uploaded')

    _pendingConfirm.push(store.uploads.get(item.id)!)
    if (_pendingConfirm.length >= CONFIRM_BATCH_SIZE) {
      await flushConfirmBatch()
    }
  }

  // --- Upload with retry ---

  async function uploadWithRetry(item: IUploadItem): Promise<void> {
    try {
      await pRetry(
        async () => {
          try {
            await uploadSingleFile(item)
          } catch (error) {
            const classification = classifyUploadError(error)

            if (classification === 'permanent') {
              store.updateItem(item.id, { error: getUploadErrorMessage(error) })
              throw new AbortError(getUploadErrorMessage(error))
            }

            if (classification === 'refresh-url') {
              presignedUrlCache.invalidate(item.fileName)
            }

            // uploading → failed (onFailedAttempt handles retrying → queued)
            store.transitionStatus(item.id, 'failed')
            throw error
          }
        },
        {
          retries: RETRY_COUNT,
          factor: 2,
          minTimeout: 1_000,
          maxTimeout: 30_000,
          randomize: true,
          onFailedAttempt: (error) => {
            // Only cycle to queued if p-retry will retry again
            // (on last failure, item stays in 'failed' state)
            if (error.retriesLeft > 0) {
              store.transitionStatus(item.id, 'retrying')
              store.transitionStatus(item.id, 'queued')
            }
          },
        },
      )
    } catch (error) {
      // All retries exhausted or AbortError — item is already in 'failed'
      if (!(error instanceof AbortError)) {
        store.updateItem(item.id, { error: getUploadErrorMessage(error) })
      }
    }
  }

  // --- Batch confirm ---

  async function flushConfirmBatch(): Promise<void> {
    if (_pendingConfirm.length === 0) return

    const batch = _pendingConfirm.splice(0, _pendingConfirm.length)
    const body: IConfirmPhotoBatchRequest = {
      photos: batch.map((item) => ({
        fileName: item.fileName,
        fileSize: item.fileSize,
        objectKey: item.objectKey!,
        contentType: item._file.type,
      })),
      ...(photoCategoryId.value ? { photoCategoryId: photoCategoryId.value } : {}),
    }

    try {
      const response = await httpClient.post<IApiConfirmBatch>(
        API_ROUTES.PHOTOS.CONFIRM_BATCH(eventId.value),
        body,
        { silent: true },
      )

      if (response.data.confirmed > 0) {
        for (const item of batch) {
          store.transitionStatus(item.id, 'confirmed')
        }
      }
    } catch {
      for (const item of batch) {
        store.updateItem(item.id, { error: 'Error al confirmar la foto' })
        store.transitionStatus(item.id, 'failed')
      }
    }
  }

  // --- Queue lifecycle ---

  function startUpload(files: File[]) {
    store.addFiles(files)

    for (const item of store.items) {
      if (item.status === 'pending') {
        store.transitionStatus(item.id, 'queued')
        queue.add(() => uploadWithRetry(item), { priority: 0 })
      }
    }

    queue.onIdle().then(async () => {
      try {
        await flushConfirmBatch()
      } finally {
        queryClient.invalidateQueries({ queryKey: PHOTO_QUERY_KEYS.all() })
        queryClient.invalidateQueries({ queryKey: [API_ROUTES.EVENTS.BASE] })
        if (photoCategoryId.value) {
          queryClient.invalidateQueries({
            queryKey: [API_ROUTES.PHOTO_CATEGORIES.GET_ALL],
          })
        }
      }
    })
  }

  function pauseUpload() {
    queue.pause()
  }

  function resumeUpload() {
    queue.start()
  }

  function cancelUpload() {
    queue.clear()
    store.clear()
    _pendingConfirm.length = 0
    autoConfirmedCount.value = 0
  }

  // --- Connectivity → queue pause/resume ---

  watch(isOnline, (online) => {
    if (online) {
      queue.start()
    } else {
      queue.pause()
    }
  })

  // --- beforeunload warning ---

  function onBeforeUnload(e: BeforeUnloadEvent) {
    if (isActive.value) {
      e.preventDefault()
    }
  }

  window.addEventListener('beforeunload', onBeforeUnload)

  // --- Cleanup ---

  onUnmounted(() => {
    window.removeEventListener('beforeunload', onBeforeUnload)
    destroyConnectivity()
    queue.clear()
  })

  return {
    isActive,
    isOnline,
    autoConfirmedCount,
    photoCategoryId,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  }
}
