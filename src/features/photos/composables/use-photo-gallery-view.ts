import { computed, onUnmounted, ref, watch } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { useRouter } from 'vue-router'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { useBulkAssignCategory } from '@/features/photo-categories/composables/mutations/use-bulk-assign-category'
import { usePhotoSelectionStore } from '@/shared/stores/photo-selection.store'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useDeletePhoto } from './mutations/use-delete-photo'
import { useGalleryPhotosInfiniteQuery } from './queries/use-gallery-photos'
import { useGalleryFacetsQuery } from './queries/use-gallery-facets'
import { useGalleryFilters } from './use-gallery-filters'
import { galleryPhrase } from './use-gallery-phrase'
import { usePhotoSelection } from './use-photo-selection'
import { PHOTOS_PER_PAGE } from '../constants/photo-gallery.constants'
import { PHOTO_ROUTE_NAMES } from '../routes'
import type { IPhotoListItem } from '../types/responses/photo-list.response'
import type { GalleryDensity } from '../types/gallery-density.types'

export function usePhotoGalleryView() {
  const router = useRouter()
  const { has } = usePermissions()
  const selectionStore = usePhotoSelectionStore()
  const { mutate: deletePhoto } = useDeletePhoto()

  const slug = computed(() => router.currentRoute.value.params.slug as string)

  const { data: event } = useEventDetailQuery(slug)
  const eventId = computed(() => event.value?.id ?? '')

  const {
    bib,
    photoCategoryId,
    uncategorized,
    sale,
    plateNumber,
    bibMatch,
    sort,
    filters,
    clearFilters,
    activeFilterCount,
  } = useGalleryFilters(() => eventId.value)

  const { data: facets } = useGalleryFacetsQuery(eventId)
  const { mutate: bulkAssign } = useBulkAssignCategory(eventId)

  const {
    data: photosData,
    isPending,
    isError,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    refetch,
  } = useGalleryPhotosInfiniteQuery(filters, PHOTOS_PER_PAGE)

  const allItems = computed(() => photosData.value?.pages.flatMap((p) => p.items) ?? [])
  const totalResults = computed(() => photosData.value?.pages[0]?.pagination.total ?? 0)
  const visibleItems = computed(() => (allItems.value.length > 0 ? allItems.value : undefined))

  const { allVisibleSelected, handlePhotoSelect, toggleSelectAllVisible, selectAllMatchingResults } =
    usePhotoSelection(visibleItems, totalResults, filters)

  const sentinel = useInfiniteScrollTrigger(() => fetchNextPage(), {
    isBusy: computed(() => isFetchingNextPage.value),
    canLoadMore: computed(() => hasNextPage.value ?? false),
  })

  const categories = computed(() => facets.value?.categories ?? [])
  const phrase = computed(() => galleryPhrase(filters.value, categories.value))
  const emptyStateText = computed(() => `No hay ${phrase.value}`)

  const isMobile = useMediaQuery('(max-width: 1023px)')
  const density = ref<GalleryDensity>(isMobile.value ? 'compact' : 'comfortable')
  watch(isMobile, (mobile) => {
    if (mobile && density.value === 'list') density.value = 'compact'
  })

  const showFilterSheet = ref(false)
  const showAuditTable = computed(() => density.value === 'list' && !isMobile.value)
  const cardDensity = computed(() => (density.value === 'comfortable' ? 'comfortable' : 'compact'))

  const wholeSetSelected = ref(false)

  watch(filters, () => {
    wholeSetSelected.value = false
    selectionStore.clear()
  })

  function onSelectAllMatching() {
    selectAllMatchingResults().then(() => {
      wholeSetSelected.value = true
    })
  }

  function onOnlyPage() {
    wholeSetSelected.value = false
    selectionStore.selectAll(
      allItems.value.map((photo) => ({ id: photo.id, thumbnailUrl: photo.thumbnailUrl })),
    )
  }

  function onClearSelection() {
    wholeSetSelected.value = false
    selectionStore.clear()
  }

  function onTogglePhoto(id: string) {
    wholeSetSelected.value = false
    handlePhotoSelect(id)
  }

  function onToggleSelectAllVisible(checked: boolean) {
    wholeSetSelected.value = false
    toggleSelectAllVisible(checked)
  }

  const selectionCount = computed(() =>
    wholeSetSelected.value ? totalResults.value : selectionStore.selectedCount,
  )
  const showSelectionBar = computed(() => selectionCount.value > 0)

  function handlePhotoClick(publicSlug: string) {
    router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { slug: publicSlug } })
  }

  function goToUpload() {
    router.push({ name: PHOTO_ROUTE_NAMES.UPLOAD, params: { slug: slug.value } })
  }

  function goToReview() {
    router.push({ name: ROUTE_NAMES.REVIEW_WORKSPACE, params: { eventSlug: slug.value } })
  }

  const canReview = computed(() => has(PERMISSIONS.REVIEW_QUEUE_READ))

  const deletingIds = ref(new Set<string>())
  const photoToDelete = ref<IPhotoListItem | null>(null)
  const showDeleteModal = computed(() => photoToDelete.value !== null)

  function requestDelete(id: string) {
    if (deletingIds.value.has(id)) return
    const photo = allItems.value.find((p) => p.id === id)
    if (!photo) return
    photoToDelete.value = photo
  }

  function closeDeleteModal() {
    photoToDelete.value = null
  }

  function confirmDelete(id: string) {
    if (deletingIds.value.has(id)) return
    deletingIds.value = new Set(deletingIds.value).add(id)
    photoToDelete.value = null
    deletePhoto(
      { id },
      {
        onSuccess: () => {
          selectionStore.deselectPhotos([id])
          wholeSetSelected.value = false
        },
        onSettled: () => {
          const next = new Set(deletingIds.value)
          next.delete(id)
          deletingIds.value = next
        },
      },
    )
  }

  const showCategoryModal = ref(false)

  function openCategoryModal() {
    showCategoryModal.value = true
  }

  function closeCategoryModal() {
    showCategoryModal.value = false
  }

  function confirmAssignCategory(categoryId: number | null) {
    const photoIds = selectionStore.selectedIds
    if (photoIds.length === 0) return
    bulkAssign(
      { photoIds, photoCategoryId: categoryId },
      {
        onSuccess: () => {
          showCategoryModal.value = false
          selectionStore.clear()
          wholeSetSelected.value = false
        },
      },
    )
  }

  watch(
    () => event.value?.isFrozen,
    (frozen) => {
      if (frozen) selectionStore.exitSelectionMode()
    },
    { immediate: true },
  )

  onUnmounted(() => {
    selectionStore.exitSelectionMode()
  })

  return {
    slug,
    event,
    bib,
    photoCategoryId,
    uncategorized,
    sale,
    plateNumber,
    bibMatch,
    sort,
    filters,
    clearFilters,
    activeFilterCount,
    facets,
    photosData,
    isPending,
    isError,
    isFetchingNextPage,
    refetch,
    allItems,
    totalResults,
    allVisibleSelected,
    sentinel,
    categories,
    phrase,
    emptyStateText,
    isMobile,
    density,
    showFilterSheet,
    showAuditTable,
    cardDensity,
    wholeSetSelected,
    selectionStore,
    selectionCount,
    showSelectionBar,
    canReview,
    photoToDelete,
    showDeleteModal,
    showCategoryModal,
    onSelectAllMatching,
    onOnlyPage,
    onClearSelection,
    onTogglePhoto,
    onToggleSelectAllVisible,
    handlePhotoClick,
    goToUpload,
    goToReview,
    requestDelete,
    closeDeleteModal,
    confirmDelete,
    openCategoryModal,
    closeCategoryModal,
    confirmAssignCategory,
  }
}
