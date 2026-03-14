import { computed, ref, watch, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import type { IPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import { useWorkspacePhotosQuery } from './queries/use-workspace-photos'
import { useResumePointQuery } from './queries/use-resume-point'

export function useWorkspaceNavigation(
  eventId: Ref<string>,
  classifiedFilter?: Ref<boolean | undefined>,
) {
  const route = useRoute()
  const router = useRouter()

  const workspacePage = ref(1)

  // Resume: only needed when entering without a photoId and no filter
  const hasPhotoIdInUrl = computed(() => !!route.query.photoId)
  const needsResume = computed(
    () => !hasPhotoIdInUrl.value && classifiedFilter?.value === undefined,
  )
  const resumeResolved = ref(hasPhotoIdInUrl.value) // skip resume if URL has photoId

  const { data: resumeData, isFetched: isResumeFetched } = useResumePointQuery(
    eventId,
    computed(() => needsResume.value && !resumeResolved.value),
  )

  const {
    data: photosData,
    isPending: isLoadingPhotos,
    isPlaceholderData,
  } = useWorkspacePhotosQuery(eventId, workspacePage, classifiedFilter)

  const photos = computed(() => photosData.value?.items ?? [])
  const pagination = computed(() => photosData.value?.pagination)
  const totalPhotos = computed(() => pagination.value?.total ?? 0)

  const currentPhotoId = computed(() => (route.query.photoId as string) || null)

  const currentIndex = computed(() => {
    if (!currentPhotoId.value) return -1
    return photos.value.findIndex((p: IPhotoListItem) => p.id === currentPhotoId.value)
  })

  const progress = computed(() => {
    if (!pagination.value || currentIndex.value < 0) {
      return { current: 0, total: totalPhotos.value }
    }
    const globalIndex = (workspacePage.value - 1) * pagination.value.limit + currentIndex.value
    return { current: globalIndex + 1, total: totalPhotos.value }
  })

  const hasNext = computed(() => {
    if (!pagination.value) return false
    const isLastInPage = currentIndex.value >= photos.value.length - 1
    const hasMorePages = workspacePage.value < pagination.value.totalPages
    return !isLastInPage || hasMorePages
  })

  const hasPrev = computed(() => {
    if (currentIndex.value > 0) return true
    return workspacePage.value > 1
  })

  function navigateToPhoto(photoId: string) {
    router.replace({ query: { ...route.query, photoId } })
  }

  function goNext() {
    if (!hasNext.value) return
    const nextPhoto = photos.value[currentIndex.value + 1]
    if (nextPhoto) {
      navigateToPhoto(nextPhoto.id)
    } else if (pagination.value && workspacePage.value < pagination.value.totalPages) {
      workspacePage.value++
    }
  }

  function goPrev() {
    if (!hasPrev.value) return
    const prevPhoto = photos.value[currentIndex.value - 1]
    if (prevPhoto) {
      navigateToPhoto(prevPhoto.id)
    } else if (workspacePage.value > 1) {
      workspacePage.value--
    }
  }

  // Step 1: When resume data arrives, apply it BEFORE loading photos
  watch(
    [() => resumeData.value, isResumeFetched],
    ([data, fetched]) => {
      if (resumeResolved.value) return
      if (!fetched) return

      resumeResolved.value = true

      if (data?.photoId) {
        workspacePage.value = data.page
      }
      // If data.photoId is null → all classified, page stays 1 and empty state will show
    },
    { immediate: true },
  )

  // Step 2: Auto-select photo ONLY after resume is resolved.
  // MUST use { immediate: true } — on subsequent visits TanStack Query returns
  // cached data instantly, so photos.value never "changes" and a non-immediate
  // watcher would never fire.
  // Includes currentPhotoId so filter-toggle (which clears photoId) triggers re-selection.
  watch(
    () => [photos.value, resumeResolved.value, currentPhotoId.value] as const,
    ([newPhotos, , photoId]) => {
      if (!resumeResolved.value) return
      // Don't auto-select from stale data (keepPreviousData during filter/page transition)
      if (isPlaceholderData.value) return
      if (!newPhotos.length) return

      // If resume gave us a target photoId and we haven't navigated yet
      if (resumeData.value?.photoId && !photoId) {
        const resumePhoto = newPhotos.find(
          (p: IPhotoListItem) => p.id === resumeData.value!.photoId,
        )
        if (resumePhoto) {
          navigateToPhoto(resumePhoto.id)
          return
        }
      }

      const firstPhoto = newPhotos[0]
      if (!firstPhoto) return

      // No photo selected yet → go to first
      if (!photoId) {
        navigateToPhoto(firstPhoto.id)
        return
      }

      // Current photo not in this page (page crossing) → go to first
      const isCurrentInPage = newPhotos.some((p: IPhotoListItem) => p.id === photoId)
      if (!isCurrentInPage) {
        navigateToPhoto(firstPhoto.id)
      }
    },
    { immediate: true },
  )

  // Reset page when filter changes
  watch(
    () => classifiedFilter?.value,
    (newVal, oldVal) => {
      // Skip initial trigger
      if (oldVal === undefined && newVal === undefined) return
      workspacePage.value = 1
      // Clear current photo so auto-select kicks in with new results
      router.replace({ query: { ...route.query, photoId: undefined } })
    },
  )

  return {
    currentPhotoId,
    photos,
    progress,
    hasNext,
    hasPrev,
    isLoadingPhotos: computed(() => isLoadingPhotos.value || !resumeResolved.value),
    totalPhotos,
    resumeData,
    goNext,
    goPrev,
    goToPhoto: navigateToPhoto,
  }
}
