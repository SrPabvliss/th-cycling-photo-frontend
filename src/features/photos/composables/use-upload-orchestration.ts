import { computed, ref, watch, type Ref } from 'vue'
import { useMessage } from 'naive-ui'

import { formatFileSize } from '@/shared/utils/format.utils'
import { MAX_FILES, MAX_FILE_SIZE } from '../constants/upload.constants'
import type { IRejectionSummary } from '../types/upload-status'
import { useUploadStore } from '../stores/upload.store'
import { useUploadQueue } from './use-upload-queue'

export function useUploadOrchestration(eventId: Ref<string>, quotaRemaining?: Ref<number | null>) {
  const store = useUploadStore()
  const message = useMessage()
  const {
    isActive,
    isOnline,
    autoConfirmedCount,
    photoCategoryId,
    startUpload,
    pauseUpload,
    resumeUpload,
    cancelUpload,
  } = useUploadQueue(eventId)

  const selectedFiles = ref<File[]>([])
  const isManuallyPaused = ref(false)

  const isComplete = computed(() => {
    const c = store.counts
    return c.total > 0 && c.confirmed + c.failed === c.total
  })

  // The event's remaining quota caps the batch below the global ceiling: signing more than fits
  // used to upload every file to storage only for the batch confirm to reject the lot, leaving the
  // rejected objects orphaned in the bucket.
  const uploadCeiling = computed(() => {
    const remaining = quotaRemaining?.value
    return remaining === null || remaining === undefined
      ? MAX_FILES
      : Math.min(MAX_FILES, remaining)
  })

  const canAddFiles = computed(
    () => selectedFiles.value.length + store.counts.total < uploadCeiling.value,
  )

  watch(isComplete, (complete) => {
    if (complete && autoConfirmedCount.value > 0) {
      const n = autoConfirmedCount.value
      message.info(
        `${n} archivo${n !== 1 ? 's' : ''} ya ${n !== 1 ? 'estaban' : 'estaba'} subido${n !== 1 ? 's' : ''} anteriormente`,
        { duration: 5000 },
      )
    }
  })

  function handleFilesSelected(files: File[]) {
    const room = uploadCeiling.value - selectedFiles.value.length - store.counts.total
    selectedFiles.value = [...selectedFiles.value, ...files.slice(0, room)]

    const dropped = files.length - Math.max(0, room)
    if (dropped > 0) {
      message.warning(
        `Solo caben ${uploadCeiling.value} foto${uploadCeiling.value !== 1 ? 's' : ''} en este evento: se descartaron ${dropped}.`,
        { duration: 6000 },
      )
    }
  }

  function handleFilesRejected(summary: IRejectionSummary) {
    const parts: string[] = []
    if (summary.tooLarge > 0) {
      parts.push(`${summary.tooLarge} exceden ${formatFileSize(MAX_FILE_SIZE)}`)
    }
    if (summary.invalidType > 0) {
      parts.push(`${summary.invalidType} con formato no soportado`)
    }
    message.warning(`Archivos descartados: ${parts.join(', ')}`, { duration: 5000 })
  }

  function handleStartUpload() {
    if (selectedFiles.value.length === 0) return
    startUpload(selectedFiles.value)
    selectedFiles.value = []
  }

  function handlePause() {
    isManuallyPaused.value = true
    pauseUpload()
  }

  function handleResume() {
    isManuallyPaused.value = false
    resumeUpload()
  }

  function handleCancel() {
    isManuallyPaused.value = false
    cancelUpload()
  }

  function handleRemoveItem(id: string) {
    store.removeItem(id)
  }

  function handleNewUpload() {
    store.clear()
  }

  return {
    store,
    selectedFiles,
    isManuallyPaused,
    isComplete,
    canAddFiles,
    isActive,
    isOnline,
    autoConfirmedCount,
    photoCategoryId,
    uploadCeiling,
    handleFilesSelected,
    handleFilesRejected,
    handleStartUpload,
    handlePause,
    handleResume,
    handleCancel,
    handleRemoveItem,
    handleNewUpload,
  }
}
