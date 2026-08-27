<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NButton, NResult } from 'naive-ui'

import { env } from '@/core/config/env'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import EventDetailSkeleton from '../../components/EventDetailSkeleton/EventDetailSkeleton.vue'
import EventDetailHeader from './panels/EventDetailHeader.vue'
import EventActionMenu from './panels/EventActionMenu.vue'
import EventAlerts from './panels/EventAlerts.vue'
import EventMoneyRow from './panels/EventMoneyRow.vue'
import EventQuotaPanel from './panels/EventQuotaPanel.vue'
import EventWorkPanel from './panels/EventWorkPanel.vue'
import EventPhotosPanel from './panels/EventPhotosPanel.vue'
import EventCategoriesPanel from './panels/EventCategoriesPanel.vue'
import EventCoverPanel from './panels/EventCoverPanel.vue'
import EventBrandPanel from './panels/EventBrandPanel.vue'
import EventAdminPanel from './panels/EventAdminPanel.vue'
import CoverUploadModal from './modals/CoverUploadModal.vue'
import FreezeEventModal from './modals/FreezeEventModal.vue'
import PhotoQuotaModal from './modals/PhotoQuotaModal.vue'
import ArchiveEventModal from './modals/ArchiveEventModal.vue'

type PickKey = 'edit' | 'configure' | 'gallery' | 'freeze' | 'quota' | 'archive'
type ModalKey = 'cover' | 'freeze' | 'quota' | 'archive' | null

const route = useRoute()
const router = useRouter()
const isMobile = useMediaQuery('(max-width: 1023px)')

const slug = computed(() => route.params.slug as string)

const { data: event, isPending, isError, refetch } = useEventDetailQuery(slug)

const { has } = usePermissions()

const isArchived = computed(() => event.value?.status === 'archived')
const isFrozen = computed(() => event.value?.isFrozen ?? false)
const isClosedForWork = computed(() => isFrozen.value || isArchived.value)

const hasEventUpdate = computed(() => has(PERMISSIONS.EVENT_UPDATE))

const canEdit = hasEventUpdate
const canFreeze = computed(() => has(PERMISSIONS.EVENT_FREEZE))
const canSetQuota = computed(() => has(PERMISSIONS.EVENT_PHOTO_QUOTA_SET))
const canArchive = computed(() =>
  isArchived.value ? has(PERMISSIONS.EVENT_RESTORE) : has(PERMISSIONS.EVENT_ARCHIVE),
)
const showOrganizer = computed(() => has(PERMISSIONS.EVENT_READ_ALL))

const canEditCategories = computed(() => hasEventUpdate.value && !isClosedForWork.value)

const blockedLabel = computed(() => {
  if (isArchived.value) return 'Archivado · sin cambios'
  if (isFrozen.value) return 'Congelado · sin cambios'
  return null
})

const openModal = ref<ModalKey>(null)

function closeModal() {
  openModal.value = null
}

const isMobileMenuOpen = ref(false)
const mobileActionBarRef = ref<HTMLElement | null>(null)

const isHeaderMenuOpen = ref(false)
const headerRef = ref<InstanceType<typeof EventDetailHeader> | null>(null)

function toggleMobileMenu() {
  isMobileMenuOpen.value = !isMobileMenuOpen.value
}

function handleDocumentClick(domEvent: MouseEvent) {
  const target = domEvent.target as Node | null

  if (
    isMobileMenuOpen.value &&
    mobileActionBarRef.value &&
    target &&
    !mobileActionBarRef.value.contains(target)
  ) {
    isMobileMenuOpen.value = false
  }

  if (
    isHeaderMenuOpen.value &&
    headerRef.value &&
    target &&
    !headerRef.value.$el.contains(target)
  ) {
    isHeaderMenuOpen.value = false
  }
}

onMounted(() => document.addEventListener('click', handleDocumentClick))
onUnmounted(() => document.removeEventListener('click', handleDocumentClick))

function handleUpload() {
  router.push({ name: ROUTE_NAMES.PHOTOS_UPLOAD, params: { slug: slug.value } })
}

function handleEdit() {
  router.push({ name: EVENT_ROUTE_NAMES.EDIT, params: { slug: slug.value } })
}

const PICK_HANDLERS: Record<PickKey, () => void> = {
  edit: () => handleEdit(),
  configure: () => handleConfigure(),
  gallery: () => window.open(`${env.VITE_APP_BASE_URL}/gallery/${slug.value}`, '_blank', 'noopener'),
  freeze: () => (openModal.value = 'freeze'),
  quota: () => (openModal.value = 'quota'),
  archive: () => (openModal.value = 'archive'),
}

function handlePick(key: PickKey) {
  isMobileMenuOpen.value = false
  PICK_HANDLERS[key]()
}

function handleSearch(plate: string) {
  router.push({
    name: ROUTE_NAMES.PHOTOS_GALLERY,
    params: { slug: slug.value },
    query: { plateNumber: plate },
  })
}

function handleViewAll() {
  router.push({ name: ROUTE_NAMES.PHOTOS_GALLERY, params: { slug: slug.value } })
}

function handleStartReview() {
  router.push({ name: ROUTE_NAMES.REVIEW_WORKSPACE, params: { eventSlug: slug.value } })
}

function handleConfigure() {
  router.push({ name: EVENT_ROUTE_NAMES.CONFIGURATION_EDIT, params: { slug: slug.value } })
}

function handleAdminFreeze() {
  openModal.value = 'freeze'
}

function handleChangeQuota() {
  openModal.value = 'quota'
}

function handleArchive() {
  openModal.value = 'archive'
}

function handleUploadCover() {
  openModal.value = 'cover'
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content detail-content">
      <EventDetailSkeleton v-if="isPending" />

      <div v-else-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar evento"
          description="No se pudo obtener el detalle del evento."
        >
          <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
        </NResult>
      </div>

      <template v-else-if="event">
        <EventDetailHeader
          ref="headerRef"
          :event="event"
          :can-edit="canEdit"
          :can-freeze="canFreeze"
          :can-set-quota="canSetQuota"
          :can-archive="canArchive"
          :show-organizer="showOrganizer"
          v-model:menu-open="isHeaderMenuOpen"
          @upload="handleUpload"
          @edit="handleEdit"
          @pick="handlePick"
        />

        <template v-if="isMobile">
          <div ref="mobileActionBarRef" class="mobile-action-bar" data-test="mobile-action-bar">
            <span
              v-if="blockedLabel"
              class="mobile-action-bar__blocked"
              data-test="mobile-action-bar-blocked"
            >
              {{ blockedLabel }}
            </span>
            <NButton
              v-else
              type="primary"
              data-test="mobile-action-bar-upload"
              @click="handleUpload"
            >
              Subir fotos
            </NButton>
            <NButton data-test="mobile-action-bar-more" @click="toggleMobileMenu">
              Más acciones
            </NButton>
            <EventActionMenu
              v-if="isMobileMenuOpen"
              class="mobile-action-bar__menu"
              :event="event"
              :can-edit="canEdit"
              :can-freeze="canFreeze"
              :can-set-quota="canSetQuota"
              :can-archive="canArchive"
              :sheet="true"
              data-test="mobile-action-menu"
              @pick="handlePick"
            />
          </div>

          <EventAlerts :event="event" :can-edit="canEdit" @upload-cover="handleUploadCover" />
          <EventMoneyRow :event="event" />
          <EventQuotaPanel
            :event="event"
            :can-set-quota="canSetQuota"
            @change-quota="handleChangeQuota"
          />
          <EventWorkPanel :event="event" @start-review="handleStartReview" />
          <EventCoverPanel :event="event" :can-edit="canEdit" @upload-cover="handleUploadCover" />
          <EventPhotosPanel :event="event" @search="handleSearch" @view-all="handleViewAll" />
          <EventCategoriesPanel :event-id="event.id" :can-edit="canEditCategories" />
          <EventBrandPanel
            :event="event"
            :can-configure="canEdit"
            :show-organizer="showOrganizer"
            @configure="handleConfigure"
          />
          <EventAdminPanel
            :event="event"
            :can-freeze="canFreeze"
            :can-set-quota="canSetQuota"
            :can-archive="canArchive"
            @freeze="handleAdminFreeze"
            @change-quota="handleChangeQuota"
            @archive="handleArchive"
          />
        </template>

        <template v-else>
          <EventAlerts :event="event" :can-edit="canEdit" @upload-cover="handleUploadCover" />
          <EventMoneyRow :event="event" />
          <EventQuotaPanel
            :event="event"
            :can-set-quota="canSetQuota"
            @change-quota="handleChangeQuota"
          />

          <div class="detail-columns">
            <div class="detail-columns__left">
              <EventWorkPanel :event="event" @start-review="handleStartReview" />
              <EventPhotosPanel :event="event" @search="handleSearch" @view-all="handleViewAll" />
              <EventCategoriesPanel :event-id="event.id" :can-edit="canEditCategories" />
            </div>
            <div class="detail-columns__right">
              <EventCoverPanel
                :event="event"
                :can-edit="canEdit"
                @upload-cover="handleUploadCover"
              />
              <EventBrandPanel
                :event="event"
                :can-configure="canEdit"
                :show-organizer="showOrganizer"
                @configure="handleConfigure"
              />
            </div>
          </div>

          <EventAdminPanel
            :event="event"
            :can-freeze="canFreeze"
            :can-set-quota="canSetQuota"
            :can-archive="canArchive"
            @freeze="handleAdminFreeze"
            @change-quota="handleChangeQuota"
            @archive="handleArchive"
          />
        </template>

        <CoverUploadModal
          :show="openModal === 'cover'"
          :event="event"
          @update:show="closeModal"
          @done="closeModal"
        />
        <FreezeEventModal
          :show="openModal === 'freeze'"
          :event="event"
          @update:show="closeModal"
          @done="closeModal"
        />
        <PhotoQuotaModal
          :show="openModal === 'quota'"
          :event="event"
          @update:show="closeModal"
          @done="closeModal"
        />
        <ArchiveEventModal
          :show="openModal === 'archive'"
          :event="event"
          @update:show="closeModal"
          @done="closeModal"
        />
      </template>
    </div>
  </div>
</template>

<style scoped src="./event-detail-view.css" />
