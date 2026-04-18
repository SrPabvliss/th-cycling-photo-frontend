import { defineStore } from 'pinia'
import { computed, markRaw, shallowRef } from 'vue'

import { assertValidTransition } from '../types/upload-status'
import type { IUploadItem, UploadStatus } from '../types/upload-status'

const PROGRESS_FLUSH_INTERVAL = 150 // ms — ~7 updates/sec

export const useUploadStore = defineStore('upload', () => {
  // shallowRef: Vue only tracks the Map reference, not 500 individual entries
  const uploads = shallowRef<Map<string, IUploadItem>>(new Map())

  // --- Non-reactive progress accumulator ---
  // High-frequency onUploadProgress events write here (~240/sec with 4 concurrent uploads)
  // A timer flushes to the reactive store at a throttled rate
  const _progressBuffer = new Map<string, { loaded: number; total: number }>()
  let _flushTimer: ReturnType<typeof setTimeout> | null = null

  // --- Computed ---

  const items = computed(() => Array.from(uploads.value.values()))

  const totalProgress = computed(() => {
    let loaded = 0
    let total = 0
    for (const item of uploads.value.values()) {
      loaded += item.progress * item.fileSize
      total += item.fileSize
    }
    return total === 0 ? 0 : loaded / total
  })

  const counts = computed(() => {
    const result: Record<UploadStatus, number> = {
      pending: 0,
      queued: 0,
      uploading: 0,
      uploaded: 0,
      confirmed: 0,
      failed: 0,
      retrying: 0,
    }

    for (const item of uploads.value.values()) {
      result[item.status]++
    }

    return { ...result, total: uploads.value.size }
  })

  // --- Actions ---

  function addFiles(files: File[]) {
    const next = new Map(uploads.value)

    for (const file of files) {
      const id = crypto.randomUUID()
      next.set(id, {
        id,
        fileName: file.name,
        fileSize: file.size,
        status: 'pending',
        progress: 0,
        _file: markRaw(file),
        _abortController: null,
      })
    }

    uploads.value = next
  }

  function updateItem(id: string, partial: Partial<Omit<IUploadItem, 'id' | '_file'>>) {
    const current = uploads.value.get(id)
    if (!current) return

    const next = new Map(uploads.value)
    next.set(id, { ...current, ...partial })
    uploads.value = next
  }

  function transitionStatus(id: string, to: UploadStatus) {
    const current = uploads.value.get(id)
    if (!current) return

    assertValidTransition(current.status, to)

    const next = new Map(uploads.value)
    next.set(id, { ...current, status: to })
    uploads.value = next
  }

  function setAbortController(id: string, controller: AbortController) {
    const current = uploads.value.get(id)
    if (!current) return

    const next = new Map(uploads.value)
    next.set(id, { ...current, _abortController: markRaw(controller) })
    uploads.value = next
  }

  // --- Progress throttling ---

  function onFileProgress(fileId: string, loaded: number, total: number) {
    _progressBuffer.set(fileId, { loaded, total })

    if (!_flushTimer) {
      _flushTimer = setTimeout(() => {
        _flushProgressToStore()
        _flushTimer = null
      }, PROGRESS_FLUSH_INTERVAL)
    }
  }

  function _flushProgressToStore() {
    if (_progressBuffer.size === 0) return

    const next = new Map(uploads.value)
    let changed = false

    for (const [fileId, { loaded, total }] of _progressBuffer) {
      const item = next.get(fileId)
      if (!item) continue

      const progress = total === 0 ? 0 : loaded / total
      if (item.progress !== progress) {
        next.set(fileId, { ...item, progress })
        changed = true
      }
    }

    _progressBuffer.clear()

    if (changed) {
      uploads.value = next
    }
  }

  // --- Cleanup ---

  function clear() {
    // Abort all active uploads
    for (const item of uploads.value.values()) {
      item._abortController?.abort()
    }

    uploads.value = new Map()
    _progressBuffer.clear()

    if (_flushTimer) {
      clearTimeout(_flushTimer)
      _flushTimer = null
    }
  }

  function removeItem(id: string) {
    const current = uploads.value.get(id)
    if (!current) return

    current._abortController?.abort()

    const next = new Map(uploads.value)
    next.delete(id)
    uploads.value = next
  }

  return {
    // State
    uploads,

    // Computed
    items,
    totalProgress,
    counts,

    // Actions
    addFiles,
    updateItem,
    transitionStatus,
    setAbortController,
    onFileProgress,
    clear,
    removeItem,
  }
})
