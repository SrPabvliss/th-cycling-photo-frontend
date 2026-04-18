import { computed, ref, watch, type Ref } from 'vue'
import { useQueryClient } from '@tanstack/vue-query'

import { useRetouchQueueQuery } from '@/features/operator/composables/queries/use-retouch-queue'
import { OPERATOR_QUERY_KEYS } from '@/features/operator/constants/query-keys'
import type { IRetouchQueueOrder } from '@/features/operator/types/responses/retouch-queue.response'

export function useRetouchMode(eventId: Ref<string>, enabled: Ref<boolean>) {
  const queryClient = useQueryClient()

  const { data: orders, isLoading, error } = useRetouchQueueQuery(eventId, enabled)

  // Track photos uploaded in this session for optimistic UI
  const uploadedPhotoIds = ref(new Set<string>())

  // Current order = first in FIFO queue
  const currentOrder = computed<IRetouchQueueOrder | null>(() => orders.value?.[0] ?? null)

  // Photos of the current order
  const orderPhotos = computed(() => currentOrder.value?.items ?? [])

  // Navigation within the order
  const currentIndex = ref(0)

  const currentPhotoId = computed(() => {
    if (orderPhotos.value.length === 0) return null
    const idx = Math.min(currentIndex.value, orderPhotos.value.length - 1)
    return orderPhotos.value[idx]?.photoId ?? null
  })

  const hasNext = computed(() => currentIndex.value < orderPhotos.value.length - 1)
  const hasPrev = computed(() => currentIndex.value > 0)

  function goNext() {
    if (hasNext.value) currentIndex.value++
  }

  function goPrev() {
    if (hasPrev.value) currentIndex.value--
  }

  function selectPhoto(photoId: string) {
    const idx = orderPhotos.value.findIndex((p) => p.photoId === photoId)
    if (idx >= 0) currentIndex.value = idx
  }

  // Check if a photo is retouched (server state OR optimistic)
  function isPhotoRetouched(photoId: string): boolean {
    if (uploadedPhotoIds.value.has(photoId)) return true
    const item = orderPhotos.value.find((p) => p.photoId === photoId)
    return item?.isRetouched ?? false
  }

  // After upload success
  function onPhotoUploaded(photoId: string) {
    uploadedPhotoIds.value.add(photoId)
    queryClient.invalidateQueries({
      queryKey: OPERATOR_QUERY_KEYS.retouchQueue(eventId.value),
    })
    queryClient.invalidateQueries({
      queryKey: OPERATOR_QUERY_KEYS.dashboard(),
    })
  }

  // Progress for current order
  const orderProgress = computed(() => {
    if (!currentOrder.value) return { retouched: 0, total: 0 }
    const retouched = currentOrder.value.items.filter(
      (i) => i.isRetouched || uploadedPhotoIds.value.has(i.photoId),
    ).length
    return { retouched, total: currentOrder.value.totalItems }
  })

  // Total pending orders
  const totalOrders = computed(() => orders.value?.length ?? 0)

  // Reset index when order changes (auto-advance)
  watch(
    () => currentOrder.value?.orderId,
    () => {
      currentIndex.value = 0
      uploadedPhotoIds.value.clear()
    },
  )

  // Is everything done?
  const allDone = computed(() => orders.value !== undefined && orders.value.length === 0)

  return {
    isLoading,
    error,
    currentOrder,
    orderPhotos,
    currentPhotoId,
    currentIndex,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    selectPhoto,
    isPhotoRetouched,
    onPhotoUploaded,
    orderProgress,
    totalOrders,
    allDone,
  }
}
