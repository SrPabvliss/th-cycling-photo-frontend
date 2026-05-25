<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NEmpty, NGrid, NGridItem, NResult, NSpin } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
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

const reviewQueue = useOperatorReviewQueueQuery(selectedEventSlug, status)

const allItems = computed(() => (reviewQueue.data.value?.pages ?? []).flatMap((page) => page.items))
const totalItems = computed(() => {
  const pages = reviewQueue.data.value?.pages
  return pages?.[pages.length - 1]?.pagination.total ?? 0
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

const sentinel = useInfiniteScrollTrigger(() => reviewQueue.fetchNextPage(), {
  isBusy: computed(() => reviewQueue.isFetchingNextPage.value),
  canLoadMore: computed(() => reviewQueue.hasNextPage.value ?? false),
})

function handleEventChange(slug: string) {
  router.push({
    name: OPERATOR_ROUTE_NAMES.EVENT_REVIEW_QUEUE,
    params: { eventSlug: slug },
  })
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
        @update:status="(value) => (status = value)"
        @update:selected-event-slug="handleEventChange"
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
        <template v-else>
          <NGrid :cols="4" :x-gap="12" :y-gap="12" responsive="screen">
            <NGridItem v-for="item in allItems" :key="item.id">
              <OperatorReviewCard :item="item" @click="handleCardClick" />
            </NGridItem>
          </NGrid>
          <div ref="sentinel" class="queue-sentinel" aria-hidden="true" />
          <div v-if="reviewQueue.isFetchingNextPage.value" class="queue-loading-more">
            <NSpin :size="20" /> <span>Cargando más...</span>
          </div>
          <div
            v-else-if="!reviewQueue.hasNextPage.value && allItems.length > 0"
            class="queue-end-marker"
          >
            <span>—— fin de la cola ——</span>
          </div>
        </template>
      </NSpin>
    </div>
  </div>
</template>

<style scoped src="./styles/operator-event-review-queue-view.css" />
