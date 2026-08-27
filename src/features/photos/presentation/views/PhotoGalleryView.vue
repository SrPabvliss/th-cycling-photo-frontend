<script setup lang="ts">
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { CloseOutline, SnowOutline } from '@vicons/ionicons5'

import {
  FROZEN_EVENT_GALLERY_BANNER,
  PHOTOS_PER_PAGE,
} from '../../constants/photo-gallery.constants'
import { usePhotoGalleryView } from '../../composables/use-photo-gallery-view'
import GalleryHeader from '../components/GalleryHeader/GalleryHeader.vue'
import GalleryToolbar from '../components/GalleryToolbar/GalleryToolbar.vue'
import GalleryFilterPanel from '../components/GalleryFilterPanel/GalleryFilterPanel.vue'
import GalleryPhotoCard from '../components/GalleryPhotoCard/GalleryPhotoCard.vue'
import GalleryAuditTable from '../components/GalleryAuditTable/GalleryAuditTable.vue'
import GallerySelectionBar from '../components/GallerySelectionBar/GallerySelectionBar.vue'
import PhotoGallerySkeleton from '../components/PhotoGallerySkeleton/PhotoGallerySkeleton.vue'
import AssignCategoryModal from '../modals/AssignCategoryModal.vue'
import DeletePhotoModal from '../modals/DeletePhotoModal.vue'

const {
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
} = usePhotoGalleryView()
</script>

<template>
  <div class="page-view">
    <div class="page-view__content gp" :class="{ m: isMobile }">
      <div class="gp-body">
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
          <GalleryFilterPanel
            v-if="!isMobile"
            :filters="filters"
            :facets="facets"
            :plate-number="plateNumber"
            @update:bib="bib = $event"
            @update:category="photoCategoryId = $event"
            @update:uncategorized="uncategorized = $event"
            @update:sale="sale = $event"
            @update:plate-number="plateNumber = $event"
            @update:bib-match="bibMatch = $event"
            @clear="clearFilters"
          />

          <div class="gp-main">
            <div class="gp-mainscroll">
              <GalleryHeader
                :event="event"
                :event-slug="slug"
                :can-review="canReview"
                @upload="goToUpload"
                @review="goToReview"
              />

              <div v-if="event.isFrozen" class="dt-alert blue gp-alert" data-test="frozen-banner">
                <NIcon :component="SnowOutline" :size="17" />
                <div class="dt-alert-t">
                  <b>{{ FROZEN_EVENT_GALLERY_BANNER.TITLE }}</b>
                  <span>{{ FROZEN_EVENT_GALLERY_BANNER.DETAIL }}</span>
                </div>
              </div>

              <GalleryToolbar
                :loaded="allItems.length"
                :total="totalResults"
                :phrase="phrase"
                :dense="density"
                :sort="sort"
                :all-visible-selected="allVisibleSelected"
                :active-filter-count="activeFilterCount"
                :mobile="isMobile"
                @update:dense="density = $event"
                @update:sort="sort = $event"
                @update:all-visible-selected="onToggleSelectAllVisible"
                @open-filters="showFilterSheet = true"
              />

              <div v-if="!isPending && allItems.length === 0" class="empty-container">
                <p data-test="gallery-empty-state">{{ emptyStateText }}</p>
              </div>

              <GalleryAuditTable
                v-else-if="showAuditTable"
                data-test="gallery-audit-table"
                :photos="allItems"
                :selected-ids="selectionStore.selectedIds"
                :deletable="!event.isFrozen"
                @open="handlePhotoClick"
                @toggle="onTogglePhoto"
                @delete="requestDelete"
              />

              <div v-else class="gp-grid" :class="density" data-test="gallery-grid">
                <GalleryPhotoCard
                  v-for="photo in allItems"
                  :key="photo.id"
                  :photo="photo"
                  :dense="cardDensity"
                  :selected="selectionStore.isSelected(photo.id)"
                  :any-selected="selectionStore.hasSelection"
                  :deletable="!event.isFrozen"
                  @open="handlePhotoClick"
                  @toggle="onTogglePhoto"
                  @delete="requestDelete"
                />
              </div>

              <div ref="sentinel" class="gallery-sentinel" aria-hidden="true" />
              <div v-if="isFetchingNextPage" class="tt-loading">
                <NSpin :size="16" />
                Cargando {{ PHOTOS_PER_PAGE }} más · {{ allItems.length }} de {{ totalResults }}
              </div>
            </div>

            <GallerySelectionBar
              v-if="showSelectionBar"
              :count="selectionStore.selectedCount"
              :total="totalResults"
              :phrase="phrase"
              :whole-set="wholeSetSelected"
              :can-assign="!event.isFrozen"
              @select-all="onSelectAllMatching"
              @only-page="onOnlyPage"
              @clear="onClearSelection"
              @assign="openCategoryModal"
            />
          </div>
        </template>
      </div>

      <template v-if="isMobile && event">
        <div v-if="showFilterSheet" class="tt-scrim" @click="showFilterSheet = false" />
        <div v-if="showFilterSheet" class="gp-sheet">
          <div class="gp-sheet-h">
            <b>Filtros</b>
            <button type="button" class="tt-iconbtn" @click="showFilterSheet = false">
              <NIcon :component="CloseOutline" :size="15" />
            </button>
          </div>
          <GalleryFilterPanel
            :filters="filters"
            :facets="facets"
            :plate-number="plateNumber"
            @update:bib="bib = $event"
            @update:category="photoCategoryId = $event"
            @update:uncategorized="uncategorized = $event"
            @update:sale="sale = $event"
            @update:plate-number="plateNumber = $event"
            @update:bib-match="bibMatch = $event"
            @clear="clearFilters"
          />
        </div>
      </template>

      <AssignCategoryModal
        v-if="event"
        :show="showCategoryModal"
        :count="selectionCount"
        :phrase="phrase"
        :whole-set="wholeSetSelected"
        :categories="categories"
        @assign="confirmAssignCategory"
        @close="closeCategoryModal"
      />

      <DeletePhotoModal
        v-if="event && photoToDelete"
        :show="showDeleteModal"
        :photo="photoToDelete"
        :event="event"
        @confirm="confirmDelete"
        @close="closeDeleteModal"
      />
    </div>
  </div>
</template>

<style scoped src="./photo-gallery-view.css" />
