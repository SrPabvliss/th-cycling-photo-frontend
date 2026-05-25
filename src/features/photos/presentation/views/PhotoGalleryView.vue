<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  NButton,
  NCheckbox,
  NEmpty,
  NFlex,
  NGrid,
  NGridItem,
  NIcon,
  NModal,
  NPagination,
  NResult,
  NSelect,
} from 'naive-ui'
import { CloseOutline } from '@vicons/ionicons5'

import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import { useBulkAssignCategory } from '@/features/photo-categories/composables/mutations/use-bulk-assign-category'
import { usePhotoSelectionStore } from '@/features/preview-links/stores/photo-selection.store'
import { usePhotosSearchQuery } from '../../composables/queries/use-photos-search'
import { useGalleryFilters } from '../../composables/use-gallery-filters'
import { usePhotoSelection } from '../../composables/use-photo-selection'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import PhotoCard from '../components/PhotoCard/PhotoCard.vue'
import PhotoGalleryHeader from '../components/PhotoGalleryHeader/PhotoGalleryHeader.vue'
import PhotoGallerySkeleton from '../components/PhotoGallerySkeleton/PhotoGallerySkeleton.vue'
import GalleryFilterSidebar from '../components/GalleryFilterSidebar/GalleryFilterSidebar.vue'
import PhotoSelectionBar from '../components/PhotoSelectionBar/PhotoSelectionBar.vue'

const router = useRouter()
const selectionStore = usePhotoSelectionStore()

const slug = computed(() => router.currentRoute.value.params.slug as string)
const PHOTOS_PER_PAGE = 8

const { data: event } = useEventDetailQuery(slug)
const eventId = computed(() => event.value?.id ?? '')

const {
  page,
  activeStatus,
  plateNumber,
  bibMatch,
  helmetColors,
  clothingColors,
  bikeColors,
  photoCategoryId,
  filters,
  hasActiveFilters,
} = useGalleryFilters(() => eventId.value)

const { data: categories } = usePhotoCategoriesQuery(eventId)
const { mutate: bulkAssign } = useBulkAssignCategory(eventId.value)
const {
  data: photosData,
  isPending,
  isError,
  refetch,
} = usePhotosSearchQuery(filters, page, PHOTOS_PER_PAGE)

const pageCount = computed(() => photosData.value?.pagination?.totalPages ?? 0)
const totalResults = computed(() => photosData.value?.pagination?.total ?? 0)
const items = computed(() => photosData.value?.items)

const {
  visiblePhotoIds,
  allVisibleSelected,
  showSelectAllBanner,
  isSelectingAll,
  handlePhotoSelect,
  toggleSelectAllVisible,
  selectAllMatchingResults,
} = usePhotoSelection(items, totalResults, filters)

function handlePhotoClick(slug: string) {
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { slug } })
}

function handleGeneratePreview() {
  router.push({ name: 'preview-links-create', params: { eventId: eventId.value } })
}

const showCategoryModal = ref(false)
const selectedCategoryForAssign = ref<number | null>(null)

const categoryOptions = computed(
  () => categories.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

function handleAssignCategory() {
  showCategoryModal.value = true
  selectedCategoryForAssign.value = null
}

function confirmAssignCategory() {
  const photoIds = Array.from(selectionStore.selectedIds)
  if (photoIds.length === 0) return
  bulkAssign(
    { photoIds, photoCategoryId: selectedCategoryForAssign.value },
    {
      onSuccess: () => {
        showCategoryModal.value = false
        selectionStore.clear()
      },
    },
  )
}

onUnmounted(() => {
  if (!router.currentRoute.value.name?.toString().startsWith('preview-links')) {
    selectionStore.exitSelectionMode()
  }
})
</script>

<template>
  <div class="page-view">
    <div class="page-view__content gallery-content">
      <PhotoGallerySkeleton v-if="isPending && !photosData" />

      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar fotos"
          description="No se pudo obtener la galería de fotos."
        >
          <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
        </NResult>
      </div>

      <template v-else-if="event">
        <PhotoGalleryHeader
          :event="event"
          :event-id="eventId"
          :event-slug="slug"
          :back-to="'/events/' + slug"
        >
          <template #extra-actions>
            <NButton
              v-if="!selectionStore.isSelectionMode"
              @click="selectionStore.enterSelectionMode()"
            >
              Seleccionar fotos
            </NButton>
            <NButton v-else type="error" ghost @click="selectionStore.exitSelectionMode()">
              <template #icon><NIcon :component="CloseOutline" /></template>
              Cancelar selección
            </NButton>
          </template>
        </PhotoGalleryHeader>

        <div class="gallery-layout">
          <GalleryFilterSidebar
            :active-status="activeStatus"
            :plate-number="plateNumber"
            :bib-match="bibMatch"
            :helmet-colors="helmetColors"
            :clothing-colors="clothingColors"
            :bike-colors="bikeColors"
            :photo-category-id="photoCategoryId"
            :categories="categories ?? []"
            :has-active-filters="hasActiveFilters"
            @update:plate-number="plateNumber = $event"
            @update:bib-match="bibMatch = $event"
            @update:active-status="
              (s) => {
                activeStatus = s
                page = 1
              }
            "
            @update:photo-category-id="
              (id) => {
                photoCategoryId = id
                page = 1
              }
            "
            @update:helmet-colors="helmetColors = $event"
            @update:clothing-colors="clothingColors = $event"
            @update:bike-colors="bikeColors = $event"
            @clear-filters="
              () => {
                plateNumber = ''
                bibMatch = 'exact'
                helmetColors = []
                clothingColors = []
                bikeColors = []
                activeStatus = null
                photoCategoryId = null
                page = 1
              }
            "
          />

          <div class="gallery-main">
            <div class="gallery-toolbar">
              <NFlex :size="12" align="center">
                <NCheckbox
                  v-if="selectionStore.isSelectionMode && photosData && photosData.items.length > 0"
                  :checked="allVisibleSelected"
                  @update:checked="toggleSelectAllVisible"
                >
                  Seleccionar todo
                </NCheckbox>
                <span v-if="selectionStore.hasSelection" class="selection-count">
                  {{ selectionStore.selectedCount }} foto{{
                    selectionStore.selectedCount !== 1 ? 's' : ''
                  }}
                  seleccionada{{ selectionStore.selectedCount !== 1 ? 's' : '' }}
                </span>
                <span v-if="!selectionStore.hasSelection" class="pagination-info">
                  {{ totalResults }} foto{{ totalResults !== 1 ? 's' : '' }}
                </span>
              </NFlex>

              <NPagination
                v-if="pageCount > 1"
                :page="page"
                :page-count="pageCount"
                size="small"
                :page-slot="7"
                @update:page="(p: number) => (page = p)"
              />
            </div>

            <div v-if="showSelectAllBanner" class="select-all-banner">
              Las {{ visiblePhotoIds.length }} fotos de esta página están seleccionadas.
              <button
                class="select-all-banner__action"
                :disabled="isSelectingAll"
                @click="selectAllMatchingResults"
              >
                {{
                  isSelectingAll
                    ? 'Seleccionando...'
                    : `Seleccionar las ${totalResults} fotos que coinciden con el filtro`
                }}
              </button>
            </div>

            <div class="gallery-scroll">
              <div v-if="photosData && photosData.items.length === 0" class="empty-container">
                <NEmpty description="No hay fotos que coincidan con los filtros" />
              </div>

              <NGrid v-else :cols="4" :x-gap="12" :y-gap="12">
                <NGridItem v-for="photo in photosData?.items" :key="photo.id">
                  <PhotoCard
                    :photo="photo"
                    :selectable="selectionStore.isSelectionMode"
                    :selected="selectionStore.isSelected(photo.id)"
                    @click="handlePhotoClick"
                    @select="handlePhotoSelect"
                  />
                </NGridItem>
              </NGrid>
            </div>
          </div>
        </div>
      </template>
    </div>

    <PhotoSelectionBar
      @generate-preview="handleGeneratePreview"
      @assign-category="handleAssignCategory"
    />

    <NModal
      v-model:show="showCategoryModal"
      preset="card"
      title="Asignar categoría"
      style="max-width: 400px"
    >
      <NFlex vertical :size="16">
        <NSelect
          v-model:value="selectedCategoryForAssign"
          :options="categoryOptions"
          placeholder="Sin categoría (quitar)"
          clearable
        />
        <NFlex justify="end" :size="8">
          <NButton @click="showCategoryModal = false">Cancelar</NButton>
          <NButton type="primary" @click="confirmAssignCategory">Asignar</NButton>
        </NFlex>
      </NFlex>
    </NModal>
  </div>
</template>

<style scoped src="./photo-gallery-view.css" />
