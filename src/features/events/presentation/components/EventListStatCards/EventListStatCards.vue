<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  CardOutline,
  CheckmarkCircleOutline,
  FlagOutline,
  HourglassOutline,
  ImagesOutline,
} from '@vicons/ionicons5'

import { formatCurrency } from '@/shared/utils/currency.utils'
import type { EventRole } from '../../../types/event-role'
import type { IEventsStats } from '../../../types/responses/events-stats.response'

const props = defineProps<{
  stats: IEventsStats | undefined
  role: EventRole
}>()

function formatCount(value: number | undefined): string {
  return value != null ? value.toLocaleString('de-DE') : '—'
}

const quotaNote = computed(() => {
  const near = (props.stats?.nearOrOverQuota ?? 0) > 0 ? props.stats?.nearOrOverQuota : 0
  return near ? `${near} eventos cerca de su cupo` : 'Ninguno cerca de su cupo'
})

const isOperador = computed(() => props.role === 'operator')
</script>

<template>
  <div class="elsc-tiles">
    <div class="elsc-tile">
      <div class="elsc-tile__head">
        <span class="elsc-tile__label">{{
          isOperador ? 'Eventos asignados' : 'Activos y visibles'
        }}</span>
        <span class="elsc-tile__ic elsc-tile__ic--green">
          <NIcon :component="isOperador ? FlagOutline : CheckmarkCircleOutline" :size="17" />
        </span>
      </div>
      <div class="elsc-tile__val elsc-tile__val--green">
        {{ formatCount(isOperador ? props.stats?.totalEvents : props.stats?.visibleEvents) }}
      </div>
      <div class="elsc-tile__note">
        {{
          isOperador
            ? `${formatCount(props.stats?.activeEvents)} activos · ${formatCount(props.stats?.tabs.archived)} archivados`
            : `de ${formatCount(props.stats?.activeEvents)} activos · el resto no aparece en la galería`
        }}
      </div>
    </div>

    <div class="elsc-tile">
      <div class="elsc-tile__head">
        <span class="elsc-tile__label">Fotos en línea</span>
        <span class="elsc-tile__ic elsc-tile__ic--blue">
          <NIcon :component="ImagesOutline" :size="17" />
        </span>
      </div>
      <div class="elsc-tile__val elsc-tile__val--blue">
        {{ formatCount(props.stats?.photosOnline) }}
      </div>
      <div class="elsc-tile__note">{{ quotaNote }}</div>
    </div>

    <div class="elsc-tile">
      <div class="elsc-tile__head">
        <span class="elsc-tile__label">Fotos por revisar</span>
        <span class="elsc-tile__ic elsc-tile__ic--amber">
          <NIcon :component="HourglassOutline" :size="17" />
        </span>
      </div>
      <div class="elsc-tile__val elsc-tile__val--amber">
        {{ formatCount(props.stats?.pendingReview) }}
      </div>
      <div class="elsc-tile__note">
        {{
          isOperador
            ? `en ${formatCount(props.stats?.eventsPendingReview)} de tus eventos`
            : `en ${formatCount(props.stats?.eventsPendingReview)} eventos`
        }}
      </div>
    </div>

    <div class="elsc-tile">
      <div class="elsc-tile__head">
        <span class="elsc-tile__label">{{ isOperador ? 'Pedidos' : 'Ingresos' }}</span>
        <span class="elsc-tile__ic elsc-tile__ic--navy">
          <NIcon :component="CardOutline" :size="17" />
        </span>
      </div>
      <div class="elsc-tile__val elsc-tile__val--navy">
        {{
          isOperador
            ? formatCount(props.stats?.orders)
            : props.stats
              ? formatCurrency(Number(props.stats.revenue), 'USD')
              : '—'
        }}
      </div>
      <div class="elsc-tile__note">
        {{
          isOperador
            ? `${formatCount(props.stats?.unpaidOrders)} por cobrar`
            : `${formatCount(props.stats?.orders)} pedidos · ${formatCount(props.stats?.unpaidOrders)} por cobrar`
        }}
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-list-stat-cards.css" />
