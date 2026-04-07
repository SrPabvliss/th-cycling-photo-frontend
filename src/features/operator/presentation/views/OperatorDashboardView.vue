<script setup lang="ts">
import { useRouter } from 'vue-router'
import { NSpin, NResult } from 'naive-ui'

import { useAuth } from '@/features/auth/composables/use-auth'
import { OPERATOR_ROUTE_NAMES } from '../../routes'
import { useOperatorDashboardQuery } from '../../composables/queries/use-operator-dashboard'
import DashboardGreeting from '../components/DashboardGreeting/DashboardGreeting.vue'
import ActiveEventCard from '../components/ActiveEventCard/ActiveEventCard.vue'
import CompletedEventCard from '../components/CompletedEventCard/CompletedEventCard.vue'
import RecentActivityList from '../components/RecentActivityList/RecentActivityList.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { data: dashboard, isLoading, error } = useOperatorDashboardQuery()

function handleSelectEvent(eventId: string) {
  router.push({ name: OPERATOR_ROUTE_NAMES.EVENT_WORKSPACE, params: { eventId } })
}
</script>

<template>
  <div class="operator-dashboard">
    <NSpin :show="isLoading" class="operator-dashboard__spinner">
      <template v-if="error">
        <NResult status="error" title="Error al cargar el dashboard" />
      </template>

      <template v-if="dashboard">
        <DashboardGreeting
          :first-name="currentUser?.firstName ?? null"
          :summary="dashboard.summary"
        />

        <div class="operator-dashboard__grid">
          <div class="operator-dashboard__main">
            <section class="operator-dashboard__section">
              <h2 class="operator-dashboard__section-title">Eventos Asignados</h2>
              <div class="operator-dashboard__events">
                <ActiveEventCard
                  v-for="event in dashboard.activeEvents"
                  :key="event.eventId"
                  :event="event"
                  @select="handleSelectEvent"
                />
              </div>
            </section>

            <section
              v-if="dashboard.completedEvents.length > 0"
              class="operator-dashboard__section"
            >
              <h2 class="operator-dashboard__section-title">Eventos Completados</h2>
              <div class="operator-dashboard__events">
                <CompletedEventCard
                  v-for="event in dashboard.completedEvents"
                  :key="event.eventId"
                  :event="event"
                />
              </div>
            </section>
          </div>

          <aside class="operator-dashboard__sidebar">
            <RecentActivityList :activities="dashboard.recentActivity" />
          </aside>
        </div>
      </template>
    </NSpin>
  </div>
</template>

<style scoped src="./styles/operator-dashboard-view.css" />
