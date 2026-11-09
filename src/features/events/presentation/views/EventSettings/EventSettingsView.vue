<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import SectionRail from './SectionRail.vue'
import EventDataSection from './sections/EventDataSection.vue'
import EventConfigurationSection from './sections/EventConfigurationSection.vue'

const route = useRoute()
const router = useRouter()
const slug = computed(() => route.params.slug as string)

const { data: event } = useEventDetailQuery(slug)

const SECTIONS = [
  { key: 'configuration', label: 'Configuración' },
  { key: 'data', label: 'Datos del evento' },
]

const active = computed(() =>
  route.name === EVENT_ROUTE_NAMES.CONFIGURATION_EDIT ? 'configuration' : 'data',
)

function select(key: string) {
  router.replace({
    name: key === 'configuration' ? EVENT_ROUTE_NAMES.CONFIGURATION_EDIT : EVENT_ROUTE_NAMES.EDIT,
    params: { slug: slug.value },
  })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content event-settings-view">
      <div class="event-settings-container">
        <PageHeader :title="event?.name ?? 'Editar evento'" :back-to="'/events/' + slug" />

        <div class="event-settings-layout">
          <SectionRail :sections="SECTIONS" :active="active" @select="select" />

          <div class="event-settings-content">
            <div v-show="active === 'data'" data-test="section-panel">
              <EventDataSection :slug="slug" />
            </div>
            <div v-show="active === 'configuration'" data-test="section-panel">
              <EventConfigurationSection :slug="slug" />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-settings-view.css" />
