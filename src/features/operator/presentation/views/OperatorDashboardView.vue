<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NEmpty, NResult, NSpin } from 'naive-ui'

import { useAuth } from '@/features/auth/composables/use-auth'
import { REVIEW_ROUTE_NAMES } from '@/features/review/routes'
import { RETOUCH_ROUTE_NAMES } from '@/features/retouch/routes'
import { useOperatorDashboardSummaryQuery } from '../../composables/queries/use-operator-dashboard-summary'
import { useOperatorActiveEventsQuery } from '../../composables/queries/use-operator-active-events'
import { useOperatorCompletedEventsQuery } from '../../composables/queries/use-operator-completed-events'
import { useOperatorRecentActivityQuery } from '../../composables/queries/use-operator-recent-activity'
import OperatorGreeting from '../components/OperatorGreeting/OperatorGreeting.vue'
import OperatorKpiBand from '../components/OperatorKpiBand/OperatorKpiBand.vue'
import OperatorQueueJumpCard from '../components/OperatorQueueJumpCard/OperatorQueueJumpCard.vue'
import OperatorEventCard from '../components/OperatorEventCard/OperatorEventCard.vue'
import OperatorActivityList from '../components/OperatorActivityList/OperatorActivityList.vue'
import OperatorCompletedList from '../components/OperatorCompletedList/OperatorCompletedList.vue'
import type { IOperatorActiveEvent } from '../../types/responses/operator-active-event.response'

const router = useRouter()
const { currentUser } = useAuth()

const activePage = ref(1)
const completedPage = ref(1)
const activityPage = ref(1)

const summary = useOperatorDashboardSummaryQuery()
const activeEvents = useOperatorActiveEventsQuery(activePage)
const completedEvents = useOperatorCompletedEventsQuery(completedPage)
const recentActivity = useOperatorRecentActivityQuery(activityPage)

function goToReviewQueue() {
  // Cola review global aun no implementada — siguiente sprint.
}

function goToRetouchQueue() {
  router.push({ name: RETOUCH_ROUTE_NAMES.QUEUE })
}

function goToEventReview(item: IOperatorActiveEvent) {
  router.push({
    name: REVIEW_ROUTE_NAMES.WORKSPACE,
    params: { eventSlug: item.event.slug },
  })
}

function goToEventRetouch(item: IOperatorActiveEvent) {
  router.push({
    name: RETOUCH_ROUTE_NAMES.QUEUE,
    query: { eventSlug: item.event.slug },
  })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content operator-dashboard">
      <OperatorGreeting :first-name="currentUser?.firstName ?? null" />

      <div class="operator-dashboard__grid">
        <div class="operator-dashboard__main">
          <section>
            <NSpin :show="summary.isLoading.value">
              <NResult
                v-if="summary.isError.value"
                status="error"
                title="Error al cargar el resumen"
                size="small"
              >
                <template #footer>
                  <NButton size="small" @click="summary.refetch()">Reintentar</NButton>
                </template>
              </NResult>
              <OperatorKpiBand v-else-if="summary.data.value" :summary="summary.data.value" />
            </NSpin>
          </section>

          <div class="operator-dashboard__queues">
            <OperatorQueueJumpCard
              kind="review"
              :count="summary.data.value?.pendingReviewCount ?? 0"
              disabled
              disabled-hint="Proximamente"
              @click="goToReviewQueue"
            />
            <OperatorQueueJumpCard
              kind="retouch"
              :count="summary.data.value?.pendingRetouchCount ?? 0"
              @click="goToRetouchQueue"
            />
          </div>

          <section class="operator-dashboard__section">
            <header class="operator-dashboard__section-head">
              <h2 class="operator-dashboard__section-title">Mis eventos asignados</h2>
            </header>
            <NSpin :show="activeEvents.isLoading.value">
              <NResult
                v-if="activeEvents.isError.value"
                status="error"
                title="Error al cargar eventos"
                size="small"
              >
                <template #footer>
                  <NButton size="small" @click="activeEvents.refetch()">Reintentar</NButton>
                </template>
              </NResult>
              <div
                v-else-if="!activeEvents.data.value || activeEvents.data.value.items.length === 0"
                class="operator-dashboard__empty-card"
              >
                <NEmpty description="Aun no tienes eventos asignados">
                  <template #extra>
                    <span class="operator-dashboard__empty-hint">
                      Un administrador te asignara eventos para revisar y retocar.
                    </span>
                  </template>
                </NEmpty>
              </div>
              <div v-else class="operator-dashboard__events">
                <OperatorEventCard
                  v-for="item in activeEvents.data.value.items"
                  :key="item.event.id"
                  :item="item"
                  @review-click="goToEventReview"
                  @retouch-click="goToEventRetouch"
                />
              </div>
            </NSpin>
          </section>

          <section class="operator-dashboard__section">
            <header class="operator-dashboard__section-head">
              <h2 class="operator-dashboard__section-title">Eventos completados</h2>
            </header>
            <NCard size="small" content-style="padding: 4px 12px;">
              <NSpin :show="completedEvents.isLoading.value">
                <NResult
                  v-if="completedEvents.isError.value"
                  status="error"
                  title="Error al cargar"
                  size="small"
                >
                  <template #footer>
                    <NButton size="small" @click="completedEvents.refetch()"> Reintentar </NButton>
                  </template>
                </NResult>
                <OperatorCompletedList v-else :items="completedEvents.data.value?.items ?? []" />
              </NSpin>
            </NCard>
          </section>
        </div>

        <aside class="operator-dashboard__aside">
          <section>
            <header class="operator-dashboard__section-head">
              <h2 class="operator-dashboard__section-title">Actividad reciente</h2>
            </header>
            <NCard size="small" content-style="padding: 6px 12px;">
              <NSpin :show="recentActivity.isLoading.value">
                <NResult
                  v-if="recentActivity.isError.value"
                  status="error"
                  title="Error"
                  size="small"
                >
                  <template #footer>
                    <NButton size="small" @click="recentActivity.refetch()">Reintentar</NButton>
                  </template>
                </NResult>
                <OperatorActivityList v-else :items="recentActivity.data.value?.items ?? []" />
              </NSpin>
            </NCard>
          </section>
        </aside>
      </div>
    </div>
  </div>
</template>

<style scoped src="./styles/operator-dashboard-view.css" />
