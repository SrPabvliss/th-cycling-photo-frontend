<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NEmpty, NFlex, NIcon, NResult, NSpin } from 'naive-ui'
import { TimeOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { RETOUCH_ROUTE_NAMES } from '@/features/retouch/routes'
import { useOperatorDashboardQuery } from '../../composables/queries/use-operator-dashboard'
import DashboardGreeting from '../components/DashboardGreeting/DashboardGreeting.vue'
import DashboardStatCards from '../components/DashboardStatCards/DashboardStatCards.vue'
import ActiveEventCard from '../components/ActiveEventCard/ActiveEventCard.vue'
import CompletedEventCard from '../components/CompletedEventCard/CompletedEventCard.vue'
import RecentActivityList from '../components/RecentActivityList/RecentActivityList.vue'

const router = useRouter()
const { currentUser } = useAuth()
const { data: dashboard, isLoading, error, refetch } = useOperatorDashboardQuery()

const sortedActiveEvents = computed(() =>
  [...(dashboard.value?.activeEvents ?? [])].sort(
    (a, b) => b.retouch.pendingPhotos - a.retouch.pendingPhotos,
  ),
)

function handleSelectEvent(eventId: string) {
  router.push({
    name: RETOUCH_ROUTE_NAMES.QUEUE,
    query: { eventId },
  })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content dashboard-content">
      <NSpin :show="isLoading" class="dashboard-spinner">
        <div v-if="error" class="error-container">
          <NResult
            status="error"
            title="Error al cargar el dashboard"
            description="No se pudo obtener la información del operador."
          >
            <template #footer><NButton @click="refetch()">Reintentar</NButton></template>
          </NResult>
        </div>

        <template v-else-if="dashboard">
          <DashboardGreeting
            :first-name="currentUser?.firstName ?? null"
            :summary="dashboard.summary"
          />

          <div class="dashboard-grid">
            <NFlex vertical :size="24">
              <DashboardStatCards :summary="dashboard.summary" />

              <NCard title="Eventos Asignados" size="small">
                <div v-if="sortedActiveEvents.length > 0" class="dashboard-events">
                  <ActiveEventCard
                    v-for="event in sortedActiveEvents"
                    :key="event.eventId"
                    :event="event"
                    @select="handleSelectEvent"
                  />
                </div>
                <NEmpty
                  v-else
                  description="No tienes eventos asignados por el momento"
                  style="padding: 48px 0"
                >
                  <template #extra>
                    <span class="placeholder-text">
                      Un administrador te asignará eventos para clasificar y retocar
                    </span>
                  </template>
                </NEmpty>
              </NCard>

              <NCard
                v-if="dashboard.completedEvents.length > 0"
                title="Eventos Completados"
                size="small"
              >
                <div class="dashboard-events">
                  <CompletedEventCard
                    v-for="event in dashboard.completedEvents"
                    :key="event.eventId"
                    :event="event"
                  />
                </div>
              </NCard>

              <NCard v-else title="Eventos Completados" size="small">
                <NFlex vertical align="center" :size="8" style="padding: 32px 0">
                  <NIcon :component="TimeOutline" :size="28" color="var(--tt-neutral-light)" />
                  <span class="placeholder-text"> Los eventos completados aparecerán aquí </span>
                </NFlex>
              </NCard>
            </NFlex>

            <NFlex vertical :size="24">
              <NCard title="Actividad Reciente" size="small">
                <RecentActivityList :activities="dashboard.recentActivity" />
              </NCard>
            </NFlex>
          </div>
        </template>
      </NSpin>
    </div>
  </div>
</template>

<style scoped src="./styles/operator-dashboard-view.css" />
