import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { refDebounced } from '@vueuse/core'

import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'

import type {
  BibMatchMode,
  GalleryBibFilter,
  GallerySaleFilter,
  GallerySort,
  IGalleryFilterState,
} from '../types/gallery-filters.types'

export function useGalleryFilters(eventId: () => string) {
  const route = useRoute()
  const selectionStore = usePhotoSelectionStore()

  const bib = ref<GalleryBibFilter | null>(null)
  const photoCategoryId = ref<number | null>(null)
  const uncategorized = ref(false)
  const sale = ref<GallerySaleFilter | null>(null)
  const plateNumber = ref('')
  const debouncedPlateNumber = refDebounced(plateNumber, 300)
  const bibMatch = ref<BibMatchMode>('exact')
  const sort = ref<GallerySort>('recent')

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

  watch(photoCategoryId, (value) => {
    if (value !== null) uncategorized.value = false
  })

  watch(uncategorized, (value) => {
    if (value) photoCategoryId.value = null
  })

  const filters = computed<IGalleryFilterState>(() => ({
    eventId: eventId(),
    bib: bib.value,
    photoCategoryId: photoCategoryId.value,
    uncategorized: uncategorized.value,
    sale: sale.value,
    plateNumber: debouncedPlateNumber.value,
    bibMatch: bibMatch.value,
    sort: sort.value,
  }))

  const hasActiveFilters = computed(
    () =>
      !!(
        bib.value ||
        photoCategoryId.value ||
        uncategorized.value ||
        sale.value ||
        debouncedPlateNumber.value
      ),
  )

  const activeFilterCount = computed(
    () =>
      [
        bib.value,
        photoCategoryId.value || uncategorized.value,
        sale.value,
        debouncedPlateNumber.value,
      ].filter(Boolean).length,
  )

  function clearFilters() {
    bib.value = null
    photoCategoryId.value = null
    uncategorized.value = false
    sale.value = null
    plateNumber.value = ''
    bibMatch.value = 'exact'
  }

  return {
    bib,
    photoCategoryId,
    uncategorized,
    sale,
    plateNumber,
    bibMatch,
    sort,
    filters,
    hasActiveFilters,
    activeFilterCount,
    clearFilters,
  }
}
