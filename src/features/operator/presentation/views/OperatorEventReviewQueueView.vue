<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NEmpty, NGrid, NGridItem, NResult, NSpin } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useOperatorActiveEventsQuery } from '@/features/operator/composables/queries/use-operator-active-events'
import { useOperatorReviewQueueQuery } from '@/features/operator/composables/queries/use-operator-review-queue'
import { OPERATOR_PATH, OPERATOR_ROUTE_NAMES } from '../../routes'
import OperatorReviewCard from '../components/OperatorReviewCard/OperatorReviewCard.vue'
import OperatorReviewQueueFilterBar from '../components/OperatorReviewQueueFilterBar/OperatorReviewQueueFilterBar.vue'
import type { TReviewQueueStatusFilter } from '../../types/review-queue-status-filter'
import type { IOperatorReviewQueueItem } from '../../types/responses/operator-review-queue-item.response'

const route = useRoute()
const router = useRouter()

const routeEventSlug = computed(() => route.params.eventSlug as string)
const selectedEventSlug = ref<string | null>(routeEventSlug.value)
const status = ref<TReviewQueueStatusFilter>('all')
const currentPage = ref<number>(1)

const reviewQueue = useOperatorReviewQueueQuery(selectedEventSlug, status)

const allItems = computed(() => (reviewQueue.data.value?.pages ?? []).flatMap((page) => page.items))
const totalItems = computed(() => {
  const pages = reviewQueue.data.value?.pages
  return pages?.[pages.length - 1]?.pagination.total ?? 0
})
const totalPages = computed(() => {
  const pages = reviewQueue.data.value?.pages
  return pages?.[pages.length - 1]?.pagination.totalPages ?? 1
})
const currentEventName = computed(() => allItems.value[0]?.event.name ?? 'Cola de revisión')

const assignedEventsPage = ref(1)
const assignedEvents = useOperatorActiveEventsQuery(assignedEventsPage)

const eventOptions = computed(() =>
  (assignedEvents.data.value?.items ?? []).map((assigned) => ({
    label: assigned.event.name,
    value: assigned.event.slug,
  })),
)

function handleEventChange(slug: string) {
  router.push({
    name: OPERATOR_ROUTE_NAMES.EVENT_REVIEW_QUEUE,
    params: { eventSlug: slug },
  })
}

function handleStatusChange(value: TReviewQueueStatusFilter) {
  status.value = value
  currentPage.value = 1
}

function handleCardClick(item: IOperatorReviewQueueItem) {
  router.push({
    name: OPERATOR_ROUTE_NAMES.PHOTO_REVIEW,
    params: { photoSlug: item.publicSlug },
  })
}

function startReview() {
  router.push({
    name: OPERATOR_ROUTE_NAMES.EVENT_REVIEW_WORKSPACE,
    params: { eventSlug: routeEventSlug.value },
  })
}

function handlePageChange(page: number) {
  currentPage.value = page
  if (page > 1 && reviewQueue.hasNextPage.value) {
    reviewQueue.fetchNextPage()
  }
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content review-queue">
      <PageHeader
        :title="currentEventName"
        :subtitle="`Cola de revisión · ${totalItems} foto${totalItems === 1 ? '' : 's'}`"
        :back-to="OPERATOR_PATH"
      >
        <NButton type="primary" @click="startReview">Iniciar revisión</NButton>
      </PageHeader>

      <OperatorReviewQueueFilterBar
        :status="status"
        :selected-event-slug="selectedEventSlug"
        :event-options="eventOptions"
        :page="currentPage"
        :page-count="totalPages"
        @update:status="handleStatusChange"
        @update:selected-event-slug="handleEventChange"
        @update:page="handlePageChange"
      />

      <NSpin :show="reviewQueue.isPending.value">
        <NResult v-if="reviewQueue.isError.value" status="error" title="Error al cargar la cola">
          <template #footer>
            <NButton @click="reviewQueue.refetch()">Reintentar</NButton>
          </template>
        </NResult>
        <NEmpty
          v-else-if="!reviewQueue.isPending.value && allItems.length === 0"
          description="No hay fotos que coincidan con el filtro"
        />
        <NGrid v-else :cols="4" :x-gap="12" :y-gap="12" responsive="screen">
          <NGridItem v-for="item in allItems" :key="item.id">
            <OperatorReviewCard :item="item" @click="handleCardClick" />
          </NGridItem>
        </NGrid>
      </NSpin>
    </div>
  </div>
</template>

<style scoped src="./styles/operator-event-review-queue-view.css" />
