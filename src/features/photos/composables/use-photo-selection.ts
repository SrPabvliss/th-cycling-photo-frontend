import { computed, ref, type ComputedRef, type Ref } from 'vue'

import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'
import { toPhotoListItems } from '../mappers/photo-list.mapper'
import type { IApiPhotoListItem, IPhotoListItem } from '../types/responses/photo-list.response'
import type { IGalleryFilterState } from '../types/gallery-filters.types'

const SELECT_ALL_PAGE_SIZE = 100

function buildSelectAllParams(filters: IGalleryFilterState, page: number): Record<string, unknown> {
  const params: Record<string, unknown> = {
    page,
    limit: SELECT_ALL_PAGE_SIZE,
    sort: filters.sort,
  }
  if (filters.bib) params.bib = filters.bib
  if (filters.uncategorized) params.uncategorized = true
  else if (filters.photoCategoryId) params.photoCategoryId = filters.photoCategoryId
  if (filters.sale) params.sale = filters.sale
  if (filters.plateNumber) {
    params.plateNumber = filters.plateNumber
    params.bibMatch = filters.bibMatch
  }
  return params
}

export function usePhotoSelection(
  items: ComputedRef<IPhotoListItem[] | undefined>,
  totalResults: ComputedRef<number>,
  filters: Ref<IGalleryFilterState>,
) {
  const selectionStore = usePhotoSelectionStore()
  const isSelectingAll = ref(false)

  const visiblePhotoIds = computed(() => items.value?.map((p) => p.id) ?? [])

  const visiblePhotos = computed(
    () => items.value?.map((p) => ({ id: p.id, thumbnailUrl: p.thumbnailUrl })) ?? [],
  )

  const allVisibleSelected = computed(
    () =>
      visiblePhotoIds.value.length > 0 &&
      visiblePhotoIds.value.every((id) => selectionStore.isSelected(id)),
  )

  const showSelectAllBanner = computed(
    () =>
      selectionStore.isSelectionMode &&
      allVisibleSelected.value &&
      totalResults.value > visiblePhotoIds.value.length &&
      selectionStore.selectedCount < totalResults.value,
  )

  function handlePhotoSelect(id: string) {
    const photo = items.value?.find((p) => p.id === id)
    if (!photo) return
    selectionStore.togglePhoto({ id: photo.id, thumbnailUrl: photo.thumbnailUrl })
  }

  function toggleSelectAllVisible(checked: boolean) {
    if (checked) {
      selectionStore.selectPhotos(visiblePhotos.value)
    } else {
      selectionStore.clear()
    }
  }

  async function selectAllMatchingResults() {
    isSelectingAll.value = true
    try {
      const pageCount = Math.ceil(totalResults.value / SELECT_ALL_PAGE_SIZE)
      const pages = Array.from({ length: pageCount }, (_, index) => index + 1)

      const allPhotos = await pages.reduce(
        async (accumulatorPromise, page) => {
          const accumulator = await accumulatorPromise
          const response = await httpClient.get<IApiPhotoListItem[]>(
            API_ROUTES.PHOTOS.BY_EVENT(filters.value.eventId),
            { params: buildSelectAllParams(filters.value, page) },
          )
          return toPhotoListItems(response.data).reduce(
            (map, photo) => map.set(photo.id, { id: photo.id, thumbnailUrl: photo.thumbnailUrl }),
            accumulator,
          )
        },
        Promise.resolve(new Map(selectionStore.selectedPhotos)),
      )

      selectionStore.selectAll(Array.from(allPhotos.values()))
    } finally {
      isSelectingAll.value = false
    }
  }

  return {
    visiblePhotoIds,
    allVisibleSelected,
    showSelectAllBanner,
    isSelectingAll,
    handlePhotoSelect,
    toggleSelectAllVisible,
    selectAllMatchingResults,
  }
}
