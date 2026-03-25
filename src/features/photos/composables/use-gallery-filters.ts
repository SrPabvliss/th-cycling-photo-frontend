import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'

import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'
import type { IPhotoSearchFilters } from '../composables/queries/use-photos-search'
import type { PhotoStatus } from '../types/responses/photo-list.response'

export function useGalleryFilters(eventId: () => string) {
  const route = useRoute()
  const selectionStore = usePhotoSelectionStore()

  const page = ref(1)
  const activeStatus = ref<PhotoStatus | null>(null)
  const plateNumber = ref('')
  const helmetColors = ref<string[]>([])
  const clothingColors = ref<string[]>([])
  const bikeColors = ref<string[]>([])

  // Read query params on mount (from event detail quick search)
  watch(
    () => route.query,
    (query) => {
      if (query.plateNumber) {
        plateNumber.value = String(query.plateNumber)
        selectionStore.enterSelectionMode()
      }
    },
    { immediate: true },
  )

  const filters = computed<IPhotoSearchFilters>(() => ({
    eventId: eventId(),
    plateNumber: plateNumber.value ? Number(plateNumber.value) : null,
    status: activeStatus.value,
    helmetColor: helmetColors.value.length > 0 ? helmetColors.value.join(',') : null,
    clothingColor: clothingColors.value.length > 0 ? clothingColors.value.join(',') : null,
    bikeColor: bikeColors.value.length > 0 ? bikeColors.value.join(',') : null,
  }))

  const hasActiveFilters = computed(
    () =>
      !!(
        plateNumber.value ||
        activeStatus.value ||
        helmetColors.value.length ||
        clothingColors.value.length ||
        bikeColors.value.length
      ),
  )

  function handleStatusChange(newStatus: PhotoStatus | null) {
    activeStatus.value = newStatus
    page.value = 1
  }

  function clearFilters() {
    plateNumber.value = ''
    helmetColors.value = []
    clothingColors.value = []
    bikeColors.value = []
    activeStatus.value = null
    page.value = 1
  }

  function toggleColor(list: string[], color: string): string[] {
    return list.includes(color) ? list.filter((c) => c !== color) : [...list, color]
  }

  return {
    page,
    activeStatus,
    plateNumber,
    helmetColors,
    clothingColors,
    bikeColors,
    filters,
    hasActiveFilters,
    handleStatusChange,
    clearFilters,
    toggleColor,
  }
}
