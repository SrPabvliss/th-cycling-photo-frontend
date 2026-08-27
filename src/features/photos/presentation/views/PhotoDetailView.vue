<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
import { NIcon } from 'naive-ui'
import { SnowOutline } from '@vicons/ionicons5'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { useBulkAssignCategory } from '@/features/photo-categories/composables/mutations/use-bulk-assign-category'
import { usePhotoCategoriesQuery } from '@/features/photo-categories/composables/queries/use-photo-categories'
import { photoDetailToListItem } from '@/shared/mappers/photo-detail.mapper'
import { usePhotoDetailBySlugQuery } from '@/shared/composables/use-photo-detail-by-slug'
import { useDeletePhoto } from '../../composables/mutations/use-delete-photo'
import { usePhotoFileOps } from '@/shared/composables/use-photo-file-ops'
import { FROZEN_PHOTO_DETAIL_BANNER } from '../../constants/photo-detail.constants'
import { PHOTO_ROUTE_NAMES } from '../../routes'
import PhotoDetailHeader from '../components/PhotoDetailHeader/PhotoDetailHeader.vue'
import PhotoStage from '../components/PhotoStage/PhotoStage.vue'
import PhotoBibPanel from '../components/PhotoBibPanel/PhotoBibPanel.vue'
import PhotoCategoryCard from '../components/PhotoCategoryCard/PhotoCategoryCard.vue'
import PhotoSalesCard from '../components/PhotoSalesCard/PhotoSalesCard.vue'
import PhotoFileCard from '../components/PhotoFileCard/PhotoFileCard.vue'
import PhotoActionsCard from '../components/PhotoActionsCard/PhotoActionsCard.vue'
import AssignCategoryModal from '../modals/AssignCategoryModal.vue'
import DeletePhotoModal from '../modals/DeletePhotoModal.vue'

const route = useRoute()
const router = useRouter()
const isMobile = useMediaQuery('(max-width: 1023px)')

const slug = computed(() => route.params.slug as string)

const { data: photo, isPending, isError, refetch } = usePhotoDetailBySlugQuery(slug)

const eventSlugRef = computed(() => photo.value?.eventSlug ?? '')
const { data: event } = useEventDetailQuery(eventSlugRef)
const isFrozen = computed(() => event.value?.isFrozen ?? false)

const eventIdRef = computed(() => photo.value?.eventId ?? '')
const { data: photoCategories } = usePhotoCategoriesQuery(eventIdRef)
const { mutate: bulkAssign } = useBulkAssignCategory(eventIdRef)
const { mutate: deletePhoto } = useDeletePhoto()
const { download } = usePhotoFileOps()

const stageState = computed<'image' | 'loading' | 'error'>(() => {
  if (isPending.value) return 'loading'
  if (isError.value) return 'error'
  return 'image'
})

function goBack() {
  if (!photo.value) return
  router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { slug: photo.value.eventSlug } })
}

function goToPrevious() {
  if (!photo.value?.previousSlug) return
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { slug: photo.value.previousSlug } })
}

function goToNext() {
  if (!photo.value?.nextSlug) return
  router.push({ name: PHOTO_ROUTE_NAMES.DETAIL, params: { slug: photo.value.nextSlug } })
}

function openWorkshop() {
  router.push({ name: ROUTE_NAMES.REVIEW_SINGLE_PHOTO, params: { photoSlug: slug.value } })
}

const categories = computed(
  () => photoCategories.value?.map((c) => ({ id: c.id, name: c.name, count: c.photoCount })) ?? [],
)

const showCategoryModal = ref(false)

function openCategoryModal() {
  showCategoryModal.value = true
}

function closeCategoryModal() {
  showCategoryModal.value = false
}

function confirmAssignCategory(categoryId: number | null) {
  if (!photo.value) return
  bulkAssign(
    { photoIds: [photo.value.id], photoCategoryId: categoryId },
    { onSuccess: () => (showCategoryModal.value = false) },
  )
}

const deletePhotoListItem = computed(() => (photo.value ? photoDetailToListItem(photo.value) : null))

const showDeleteModal = ref(false)

function openDeleteModal() {
  showDeleteModal.value = true
}

function closeDeleteModal() {
  showDeleteModal.value = false
}

function confirmDelete(id: string) {
  const eventSlug = photo.value?.eventSlug ?? ''
  deletePhoto(
    { id },
    {
      onSuccess: () => {
        showDeleteModal.value = false
        router.push({ name: PHOTO_ROUTE_NAMES.GALLERY, params: { slug: eventSlug } })
      },
    },
  )
}

function handleDownload() {
  if (!photo.value) return
  download(photo.value.id, photo.value.filename)
}

function viewOrder(id: string) {
  router.push({ name: ROUTE_NAMES.ORDERS_LIST, query: { order: id } })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content pd" :class="{ m: isMobile }">
      <PhotoDetailHeader
        :filename="photo?.filename ?? ''"
        :event-name="event?.name ?? ''"
        :position="photo?.position ?? 1"
        :event-photo-count="photo?.eventPhotoCount ?? 1"
        :sold="(photo?.orders.length ?? 0) > 0"
        :frozen="isFrozen"
        :mobile="isMobile"
        @back="goBack"
        @previous="goToPrevious"
        @next="goToNext"
      />

      <div class="pd-body">
        <PhotoStage
          :state="stageState"
          :image-url="photo?.imageUrl ?? null"
          :filename="photo?.filename ?? ''"
          :width="photo?.width ?? null"
          :height="photo?.height ?? null"
          :file-size="photo?.fileSize ?? 0"
          @retry="refetch()"
        />

        <aside class="pd-rail">
          <div v-if="isPending" class="pd-skels" data-test="pd-skels">
            <div class="pd-skel" />
            <div class="pd-skel" />
            <div class="pd-skel" />
          </div>

          <template v-else-if="photo">
            <div v-if="isFrozen" class="dt-alert blue" data-test="frozen-notice">
              <NIcon :component="SnowOutline" :size="17" />
              <div class="dt-alert-t">
                <b>{{ FROZEN_PHOTO_DETAIL_BANNER.TITLE }}</b>
                <span>{{ FROZEN_PHOTO_DETAIL_BANNER.DETAIL }}</span>
              </div>
            </div>

            <PhotoBibPanel :bibs="photo.bibs" :frozen="isFrozen" @open-workshop="openWorkshop" />

            <PhotoCategoryCard
              :category-name="photo.photoCategoryName"
              :frozen="isFrozen"
              @assign="openCategoryModal"
            />

            <PhotoSalesCard :orders="photo.orders" @view-order="viewOrder" />

            <PhotoFileCard
              :filename="photo.filename"
              :mime-type="photo.mimeType"
              :width="photo.width"
              :height="photo.height"
              :file-size="photo.fileSize"
              :uploaded-at="photo.uploadedAt"
              :processed-at="photo.processedAt"
              :reviewed-at="photo.reviewedAt"
            />

            <PhotoActionsCard
              :file-size="photo.fileSize"
              :frozen="isFrozen"
              @download="handleDownload"
              @delete="openDeleteModal"
            />
          </template>
        </aside>
      </div>

      <AssignCategoryModal
        v-if="photo"
        :show="showCategoryModal"
        :count="1"
        phrase="esta foto"
        :whole-set="false"
        :categories="categories"
        @assign="confirmAssignCategory"
        @close="closeCategoryModal"
      />

      <DeletePhotoModal
        v-if="event && deletePhotoListItem"
        :show="showDeleteModal"
        :photo="deletePhotoListItem"
        :event="event"
        :orders="photo?.orders ?? []"
        @confirm="confirmDelete"
        @close="closeDeleteModal"
      />
    </div>
  </div>
</template>

<style scoped src="./photo-detail-view.css" />
