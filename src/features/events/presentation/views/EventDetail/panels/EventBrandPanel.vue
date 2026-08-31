<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon } from 'naive-ui'
import { SettingsOutline } from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { useEventConfiguration } from '../../../../composables/queries/use-event-configuration'
import type { IEventDetail } from '../../../../types/responses/event-detail.response'

const props = defineProps<{ event: IEventDetail; canConfigure: boolean; showOrganizer: boolean }>()

const emit = defineEmits<{ configure: [] }>()

const eventId = computed(() => props.event.id)
const { data: configuration } = useEventConfiguration(eventId)

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')

const watermarkUrl = computed(() => configuration.value?.watermarkUrl ?? null)

const whatsappLabel = computed(() => configuration.value?.whatsappNumber || 'Sin número')

const publicNameLabel = computed(() => configuration.value?.publicName || 'Sin nombre público')

const lastUploadLabel = computed(() =>
  props.event.lastUploadAt ? formatDate(props.event.lastUploadAt) : 'Nunca',
)

const PLATFORM_TIERS = [
  { range: '1–2 fotos', price: '$4.00' },
  { range: '3–6 fotos', price: '$3.00' },
  { range: '7–9 fotos', price: '$2.50' },
  { range: '10 o más', price: '$2.00' },
]
</script>

<template>
  <section class="brand">
    <div class="brand__head">
      <h4>Origen y marca</h4>
      <NButton
        v-if="canConfigure && !isClosedForWork"
        type="primary"
        size="small"
        data-test="brand-configure"
        @click="emit('configure')"
      >
        <template #icon><NIcon :component="SettingsOutline" /></template>
        Configuración
      </NButton>
      <span v-else-if="canConfigure" class="brand__blocked" data-test="brand-blocked">
        Sin cambios en este estado
      </span>
    </div>

    <dl class="brand__list">
      <div v-if="showOrganizer" class="brand__row" data-test="brand-organizer">
        <dt>Organizador</dt>
        <dd>{{ event.organizerName }}</dd>
      </div>
      <div class="brand__row" data-test="brand-public-name">
        <dt>Nombre público</dt>
        <dd>{{ publicNameLabel }}</dd>
      </div>
      <div class="brand__row" data-test="brand-watermark">
        <dt>Marca de agua</dt>
        <dd>
          <img
            v-if="watermarkUrl"
            class="brand__watermark"
            :src="watermarkUrl"
            alt="Marca de agua del evento"
          />
          <span v-else>Sin marca de agua</span>
        </dd>
      </div>
      <div class="brand__row" data-test="brand-whatsapp">
        <dt>WhatsApp</dt>
        <dd>{{ whatsappLabel }}</dd>
      </div>
      <div class="brand__row" data-test="brand-created">
        <dt>Creado</dt>
        <dd>{{ formatDate(event.createdAt) }}</dd>
      </div>
      <div class="brand__row" data-test="brand-last-upload">
        <dt>Última subida</dt>
        <dd>{{ lastUploadLabel }}</dd>
      </div>
    </dl>

    <p class="brand__explanation" data-test="brand-explanation">
      La marca se copió dentro del evento al crearlo: si el organizador cambia su nombre o su marca
      de agua, este evento conserva la que lanzó. La configuración edita solo esta copia.
    </p>

    <div class="brand__prices" data-test="brand-prices">
      <h4 class="brand__prices-heading" data-test="brand-prices-heading">
        Precios de la plataforma · iguales en todos los eventos
      </h4>
      <table class="brand__prices-table">
        <thead>
          <tr>
            <th scope="col">Fotos en la compra</th>
            <th scope="col">Precio de cada una</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="tier in PLATFORM_TIERS" :key="tier.range" data-test="brand-prices-row">
            <th scope="row">{{ tier.range }}</th>
            <td>{{ tier.price }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>
</template>

<style scoped src="./event-brand-panel.css" />
