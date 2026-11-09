<script setup lang="ts">
import { computed } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import { NIcon } from 'naive-ui'
import {
  BagOutline,
  CashOutline,
  PeopleOutline,
  RepeatOutline,
  SparklesOutline,
} from '@vicons/ionicons5'

import type { IApiBuyersStats } from '../../../types/responses/buyers-stats.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  stats: IApiBuyersStats | undefined
}>()

const isMobile = useMediaQuery('(max-width: 767px)')

function formatCount(value: number | undefined): string {
  return value != null ? formatNumber(value) : '—'
}

const neverBoughtCount = computed(() => {
  if (props.stats == null) return null
  return props.stats.totalBuyers - props.stats.boughtCount
})

const averageTicketLabel = computed(() =>
  props.stats != null ? `$${props.stats.averageTicket}` : '—',
)
</script>

<template>
  <div v-if="!isMobile" class="bsc-metrics">
    <div class="bsc-metric">
      <div class="bsc-metric__head">
        <span class="bsc-metric__label">Total registrados</span>
        <span class="bsc-metric__ic bsc-metric__ic--navy">
          <NIcon :component="PeopleOutline" :size="17" />
        </span>
      </div>
      <div class="bsc-metric__val bsc-metric__val--navy">{{ formatCount(stats?.totalBuyers) }}</div>
      <div class="bsc-metric__note">Cuentas de comprador</div>
    </div>

    <div class="bsc-metric">
      <div class="bsc-metric__head">
        <span class="bsc-metric__label">Compraron alguna vez</span>
        <span class="bsc-metric__ic bsc-metric__ic--blue">
          <NIcon :component="BagOutline" :size="17" />
        </span>
      </div>
      <div class="bsc-metric__val bsc-metric__val--blue">
        {{ formatCount(stats?.boughtCount) }}
        <em v-if="stats">{{ stats.boughtPercent }}%</em>
      </div>
      <div v-if="stats" class="bsc-bar">
        <i
          class="bsc-bar__fill bsc-bar__fill--blue"
          :style="{ width: stats.boughtPercent + '%' }"
        />
      </div>
      <div class="bsc-metric__note">
        {{ neverBoughtCount != null ? formatCount(neverBoughtCount) : '—' }} nunca compraron
      </div>
    </div>

    <div class="bsc-metric">
      <div class="bsc-metric__head">
        <span class="bsc-metric__label">Recurrentes</span>
        <span class="bsc-metric__ic bsc-metric__ic--violet">
          <NIcon :component="RepeatOutline" :size="17" />
        </span>
      </div>
      <div class="bsc-metric__val bsc-metric__val--violet">
        {{ formatCount(stats?.recurrentCount) }}
      </div>
      <div class="bsc-metric__note">2 o más pedidos</div>
    </div>

    <div class="bsc-metric">
      <div class="bsc-metric__head">
        <span class="bsc-metric__label">Nuevos · 30 días</span>
        <span class="bsc-metric__ic bsc-metric__ic--amber">
          <NIcon :component="SparklesOutline" :size="17" />
        </span>
      </div>
      <div class="bsc-metric__val bsc-metric__val--amber">
        {{ formatCount(stats?.newLast30Days) }}
      </div>
      <div class="bsc-metric__note">Registrados este mes</div>
    </div>

    <div class="bsc-metric">
      <div class="bsc-metric__head">
        <span class="bsc-metric__label">Ticket promedio</span>
        <span class="bsc-metric__ic bsc-metric__ic--green">
          <NIcon :component="CashOutline" :size="17" />
        </span>
      </div>
      <div class="bsc-metric__val bsc-metric__val--green">{{ averageTicketLabel }}</div>
      <div class="bsc-metric__note">Por pedido pagado</div>
    </div>
  </div>

  <div v-else class="bsc-hero">
    <div class="bsc-hero__main">
      <span class="bsc-hero__label">Compraron alguna vez</span>
      <span class="bsc-hero__val">
        {{ formatCount(stats?.boughtCount) }}
        <em v-if="stats">{{ stats.boughtPercent }}%</em>
      </span>
      <div v-if="stats" class="bsc-bar">
        <i
          class="bsc-bar__fill bsc-bar__fill--blue"
          :style="{ width: stats.boughtPercent + '%' }"
        />
      </div>
      <span class="bsc-hero__note">
        {{ neverBoughtCount != null ? formatCount(neverBoughtCount) : '—' }} nunca compraron
      </span>
    </div>
    <div class="bsc-hero__side">
      <div>
        <b class="bsc-hero__side-val bsc-hero__side-val--violet">{{
          formatCount(stats?.recurrentCount)
        }}</b>
        <span>Recurrentes</span>
      </div>
      <div>
        <b class="bsc-hero__side-val bsc-hero__side-val--amber">{{
          formatCount(stats?.newLast30Days)
        }}</b>
        <span>Nuevos 30d</span>
      </div>
      <div>
        <b class="bsc-hero__side-val bsc-hero__side-val--green">{{ averageTicketLabel }}</b>
        <span>Ticket prom.</span>
      </div>
    </div>
  </div>
</template>

<style scoped src="./buyer-stats-cards.css" />
