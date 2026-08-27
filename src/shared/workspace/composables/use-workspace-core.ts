import { computed, ref, watch, type Ref } from 'vue'

import { usePhotoDetailBySlugQuery } from '@/shared/composables/use-photo-detail-by-slug'
import { useMarkPhotoReviewed } from './use-mark-photo-reviewed'
import { useWorkspaceCardNavigation } from './use-workspace-card-navigation'
import type { MobileSheet } from '../types/mobile-sheet.type'
import type { IReviewQueueSource } from '../types/workspace-queue-source.types'
import type { IReviewWorkspaceState } from '../types/workspace-state.types'
import type { WorkspaceMode } from '../types/workspace-mode.types'

const PREFETCH_THRESHOLD = 5

export function useReviewWorkspaceCore(
  source: IReviewQueueSource,
  options: {
    initialSlug?: string | null
    mode?: WorkspaceMode
    onlyPending?: Ref<boolean>
    onCloseAfterSave?: () => void
    onCurrentSlugChange?: (slug: string | null) => void
  } = {},
): IReviewWorkspaceState {
  const mode: WorkspaceMode = options.mode ?? 'flow'

  const currentSlug = ref<string | null>(options.initialSlug ?? null)
  const onlyPending = options.onlyPending ?? ref<boolean>(true)

  const queueItems = source.items
  const totalCount = source.totalCount
  const isQueuePending = source.isPending

  const reviewedCount = computed(
    () => queueItems.value.filter((it) => it.reviewedAt !== null).length,
  )

  const photoSlug = computed(() => currentSlug.value ?? '')
  const photoQuery = usePhotoDetailBySlugQuery(photoSlug)
  const photo = computed(() => photoQuery.data.value ?? null)

  const currentIndex = computed(() =>
    queueItems.value.findIndex((it) => it.publicSlug === currentSlug.value),
  )

  const lastKnownIndex = ref<number>(-1)
  watch(
    currentIndex,
    (idx) => {
      if (idx >= 0) lastKnownIndex.value = idx
    },
    { immediate: true },
  )

  watch(
    [queueItems, currentSlug, isQueuePending],
    ([items, slug, queuePending]) => {
      if (queuePending) return

      if (items.length === 0) {
        if (slug !== null) currentSlug.value = null
        return
      }

      if (!slug) {
        if (mode === 'edit-one') return
        const first = items[0]
        if (first) currentSlug.value = first.publicSlug
        return
      }

      const found = items.some((it) => it.publicSlug === slug)
      if (found) return

      if (mode === 'edit-one') {
        currentSlug.value = null
        return
      }

      const target = items[lastKnownIndex.value] ?? items[items.length - 1] ?? items[0]
      if (target) currentSlug.value = target.publicSlug
    },
    { immediate: true },
  )
  const hasPrev = computed(() => currentIndex.value > 0)
  const hasNext = computed(
    () =>
      (currentIndex.value >= 0 && currentIndex.value < queueItems.value.length - 1) ||
      source.hasNextPage.value,
  )

  watch([currentIndex, queueItems, () => source.hasNextPage.value], ([idx, items, hasMore]) => {
    if (!hasMore || source.isFetchingNextPage.value) return
    if (idx >= 0 && idx >= items.length - PREFETCH_THRESHOLD) {
      source.fetchNextPage()
    }
  })

  function goNext() {
    if (!hasNext.value) return
    const next = queueItems.value[currentIndex.value + 1]
    if (next) {
      currentSlug.value = next.publicSlug
    } else if (source.hasNextPage.value && !source.isFetchingNextPage.value) {
      source.fetchNextPage()
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
    options.onCurrentSlugChange?.(slug)
  })

  const cardNav = useWorkspaceCardNavigation()

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
      {
        photoId: photo.value.id,
        photoSlug: photo.value.publicSlug,
        eventSlug: photo.value.eventSlug,
      },
      {
        onSuccess: () => {
          if (mode === 'edit-one') {
            options.onCloseAfterSave?.()
            return
          }
          goNext()
        },
      },
    )
  }

  return {
    queueItems,
    totalCount,
    reviewedCount,
    isQueuePending,
    photo,
    isPhotoPending: computed(() => photoQuery.isPending.value),
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
    onlyPending,
    saveAndAdvance,
    mode,
  }
}
