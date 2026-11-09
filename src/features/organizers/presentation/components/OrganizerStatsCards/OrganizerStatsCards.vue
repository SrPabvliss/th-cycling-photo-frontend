<script setup lang="ts">
import { NIcon } from 'naive-ui'
import {
  BanOutline,
  CheckmarkCircleOutline,
  HourglassOutline,
  SendOutline,
} from '@vicons/ionicons5'

import type { IOrganizersStats } from '../../../types/responses/organizers-stats.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = defineProps<{
  stats: IOrganizersStats | undefined
}>()

function formatCount(value: number | undefined): string {
  return value != null ? formatNumber(value) : '—'
}
</script>

<template>
  <div class="osc-tiles">
    <div class="osc-tile">
      <div class="osc-tile__head">
        <span class="osc-tile__label">Activos</span>
        <span class="osc-tile__ic osc-tile__ic--green">
          <NIcon :component="CheckmarkCircleOutline" :size="17" />
        </span>
      </div>
      <div class="osc-tile__val osc-tile__val--green">{{ formatCount(props.stats?.active) }}</div>
      <div class="osc-tile__note">Con cupo disponible</div>
    </div>

    <div class="osc-tile osc-tile--alarm">
      <div class="osc-tile__head">
        <span class="osc-tile__label">Sin cupo</span>
        <span class="osc-tile__ic osc-tile__ic--red">
          <NIcon :component="BanOutline" :size="17" />
        </span>
      </div>
      <div class="osc-tile__val osc-tile__val--red">{{ formatCount(props.stats?.noQuota) }}</div>
      <div class="osc-tile__note">No pueden crear eventos</div>
    </div>

    <div class="osc-tile">
      <div class="osc-tile__head">
        <span class="osc-tile__label">Por vencer</span>
        <span class="osc-tile__ic osc-tile__ic--amber">
          <NIcon :component="HourglassOutline" :size="17" />
        </span>
      </div>
      <div class="osc-tile__val osc-tile__val--amber">
        {{ formatCount(props.stats?.expiring) }}
      </div>
      <div class="osc-tile__note">Vencen en 30 días o menos</div>
    </div>

    <div class="osc-tile">
      <div class="osc-tile__head">
        <span class="osc-tile__label">Pendientes</span>
        <span class="osc-tile__ic osc-tile__ic--blue">
          <NIcon :component="SendOutline" :size="17" />
        </span>
      </div>
      <div class="osc-tile__val osc-tile__val--blue">
        {{ formatCount(props.stats?.pending) }}
      </div>
      <div class="osc-tile__note">Invitaciones sin aceptar</div>
    </div>
  </div>
</template>

<style scoped src="./organizer-stats-cards.css" />
