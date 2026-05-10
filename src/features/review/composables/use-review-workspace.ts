import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { usePhotoDetailBySlugQuery } from '@/features/photos/composables/queries/use-photo-detail-by-slug'
import { useReviewQueueQuery } from './queries/use-review-queue'
import { useMarkPhotoReviewed } from './mutations/use-mark-photo-reviewed'
import { QUEUE_PAGINATION_DEFAULTS } from '../constants/queue-pagination'
import { useCardNavigation } from './use-card-navigation'
import type { MobileSheet } from '../types/mobile-sheet.type'

export function useReviewWorkspace() {
  const route = useRoute()
  const router = useRouter()

  const eventSlug = computed(() => route.params.eventSlug as string)
  const initialSlug = (route.query.photo as string | undefined) ?? null
  const currentSlug = ref<string | null>(initialSlug)

  const onlyPending = ref<boolean>(true)

  const queueOptions = computed(() => ({
    limit: QUEUE_PAGINATION_DEFAULTS.WORKSPACE_PAGE_SIZE,
    onlyPending: onlyPending.value,
  }))

  const queueQuery = useReviewQueueQuery(eventSlug, queueOptions)

  const queueItems = computed(() => (queueQuery.data.value?.pages ?? []).flatMap((p) => p.items))
  const totalCount = computed(() => {
    const pages = queueQuery.data.value?.pages
    return pages?.[pages.length - 1]?.total ?? 0
  })
  const reviewedCount = computed(
    () => queueItems.value.filter((it) => it.reviewedAt !== null).length,
  )

  watch(
    [queueItems, currentSlug],
    ([items, slug]) => {
      if (!slug && items.length > 0) {
        const first = items[0]
        if (first) currentSlug.value = first.publicSlug
      }
    },
    { immediate: true },
  )

  const photoSlug = computed(() => currentSlug.value ?? '')
  const photoQuery = usePhotoDetailBySlugQuery(photoSlug)
  const photo = computed(() => photoQuery.data.value ?? null)

  const currentIndex = computed(() =>
    queueItems.value.findIndex((it) => it.publicSlug === currentSlug.value),
  )
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(
    () =>
      (currentIndex.value >= 0 && currentIndex.value < queueItems.value.length - 1) ||
      queueQuery.hasNextPage.value === true,
  )

  watch([currentIndex, queueItems, () => queueQuery.hasNextPage.value], ([idx, items, hasMore]) => {
    if (!hasMore || queueQuery.isFetchingNextPage.value) return
    if (idx >= 0 && idx >= items.length - QUEUE_PAGINATION_DEFAULTS.PREFETCH_THRESHOLD) {
      queueQuery.fetchNextPage()
    }
  })

  function goNext() {
    if (!hasNext.value) return
    const next = queueItems.value[currentIndex.value + 1]
    if (next) {
      currentSlug.value = next.publicSlug
    } else if (queueQuery.hasNextPage.value && !queueQuery.isFetchingNextPage.value) {
      queueQuery.fetchNextPage()
    }
  }

  function goPrev() {
    if (!hasPrev.value) return
    const prev = queueItems.value[currentIndex.value - 1]
    if (prev) currentSlug.value = prev.publicSlug
  }

  function selectSlug(slug: string) {
    currentSlug.value = slug
  }

  watch(currentSlug, (slug) => {
    if (!slug) return
    router.replace({
      name: route.name as string,
      params: route.params,
      query: { ...route.query, photo: slug },
    })
  })

  const cardNav = useCardNavigation()

  watch(currentSlug, () => {
    cardNav.reset()
  })

  const markReviewed = useMarkPhotoReviewed()

  const mobileSheet = ref<MobileSheet>(null)
  const showCheatsheet = ref(false)

  function openSheet(sheet: MobileSheet) {
    mobileSheet.value = sheet
  }
  function closeSheet() {
    mobileSheet.value = null
  }

  function saveAndAdvance() {
    if (!photo.value) return
    markReviewed.mutate(
      { photoId: photo.value.id, photoSlug: photo.value.publicSlug },
      { onSuccess: () => goNext() },
    )
  }

  return {
    eventSlug,
    queueItems,
    totalCount,
    reviewedCount,
    onlyPending,
    isQueuePending: queueQuery.isPending,
    photo,
    isPhotoPending: photoQuery.isPending,
    currentSlug,
    currentIndex,
    hasNext,
    hasPrev,
    goNext,
    goPrev,
    selectSlug,
    cardNav,
    mobileSheet,
    openSheet,
    closeSheet,
    showCheatsheet,
    saveAndAdvance,
  }
}
