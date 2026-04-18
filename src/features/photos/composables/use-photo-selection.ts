import { computed, ref, type ComputedRef } from 'vue'

import { httpClient } from '@/core/http/axios-client'
import { API_ROUTES } from '@/core/api/api-routes'
import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'
import { toPhotoListItem } from '../mappers/photo-list.mapper'
import type { IApiPhotoListItem, IPhotoListItem } from '../types/responses/photo-list.response'
import type { IPhotoSearchFilters } from './queries/use-photos-search'

export function usePhotoSelection(
  items: ComputedRef<IPhotoListItem[] | undefined>,
  totalResults: ComputedRef<number>,
  filters: ComputedRef<IPhotoSearchFilters>,
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
      const allPhotos = new Map(selectionStore.selectedPhotos)
      const f = filters.value
      const params: Record<string, unknown> = { limit: 100 }
      const useSearch = !!(
        f.plateNumber ||
        f.status ||
        f.helmetColor ||
        f.clothingColor ||
        f.bikeColor
      )

      for (let p = 1; p <= Math.ceil(totalResults.value / 100); p++) {
        params.page = p
        let apiItems: IApiPhotoListItem[]
        if (useSearch) {
          params.eventId = f.eventId
          if (f.plateNumber) params.plateNumber = f.plateNumber
          if (f.status) params.status = f.status
          if (f.helmetColor) params.helmetColor = f.helmetColor
          if (f.clothingColor) params.clothingColor = f.clothingColor
          if (f.bikeColor) params.bikeColor = f.bikeColor
          apiItems = (
            await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.SEARCH, { params })
          ).data
        } else {
          apiItems = (
            await httpClient.get<IApiPhotoListItem[]>(API_ROUTES.PHOTOS.BY_EVENT(f.eventId), {
              params,
            })
          ).data
        }
        for (const api of apiItems) {
          const mapped = toPhotoListItem(api)
          allPhotos.set(mapped.id, { id: mapped.id, thumbnailUrl: mapped.thumbnailUrl })
        }
      }
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
