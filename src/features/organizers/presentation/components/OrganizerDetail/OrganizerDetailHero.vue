<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { differenceInCalendarDays } from 'date-fns'
import {
  AlertCircle,
  BanOutline,
  CheckmarkCircle,
  CheckmarkCircleOutline,
  HourglassOutline,
  ImageOutline,
} from '@vicons/ionicons5'

import { formatDate, formatRelativeTime, parseDateOnly } from '@/shared/utils/date.utils'
import type { IOrganizerDetail } from '../../../types/responses/organizer-detail.response'
import { getInitials } from './organizer-detail.utils'

const props = withDefaults(
  defineProps<{
    organizer: IOrganizerDetail
    showBanner?: boolean
    showIdentity?: boolean
  }>(),
  { showBanner: true, showIdentity: true },
)

const initials = computed(() => getInitials(props.organizer.name))

const daysToExpiry = computed(() => {
  if (!props.organizer.nextExpiry) return null
  return differenceInCalendarDays(parseDateOnly(props.organizer.nextExpiry), new Date())
})

const createdDate = computed(() => formatDate(props.organizer.createdAt))
const createdRelative = computed(() => formatRelativeTime(props.organizer.createdAt))
</script>

<template>
  <div v-if="showBanner" class="od-hero">
    <div class="od-id">
      <span class="od-ava">{{ initials }}</span>
      <div class="od-id__txt">
        <div class="od-id__name">{{ organizer.name }}</div>
        <div class="od-id__holder">
          <span class="od-ellip">{{ organizer.holderName }}</span>
          <i>·</i>
          <span class="od-mailbit" :class="{ 'od-mailbit--warn': !organizer.holderEmailVerified }">
            <NIcon
              :component="organizer.holderEmailVerified ? CheckmarkCircle : AlertCircle"
              :size="12"
            />
            <span class="od-ellip">{{ organizer.holderEmail }}</span>
          </span>
        </div>
      </div>
    </div>
    <span v-if="organizer.state === 'no_quota'" class="od-tag od-tag--sin">
      <NIcon :component="BanOutline" :size="12" />Sin cupo
    </span>
    <span v-else-if="organizer.state === 'expiring'" class="od-tag od-tag--venc">
      <NIcon :component="HourglassOutline" :size="12" />Por vencer · {{ daysToExpiry }} d
    </span>
    <span v-else class="od-tag od-tag--act">
      <NIcon :component="CheckmarkCircleOutline" :size="12" />Activo
    </span>
  </div>

  <section v-if="showIdentity" class="od-sec">
    <h4>Identidad</h4>
    <dl class="od-dl">
      <div>
        <dt>Nombre comercial</dt>
        <dd>{{ organizer.name }}</dd>
      </div>
      <div>
        <dt>Nombre público</dt>
        <dd>
          <span v-if="organizer.publicName">{{ organizer.publicName }}</span>
          <span v-else class="od-sub">Sin definir — se muestra el nombre comercial</span>
        </dd>
      </div>
      <div>
        <dt>Marca de agua</dt>
        <dd>
          <span v-if="organizer.watermarkUrl" class="od-ok"
            ><NIcon :component="ImageOutline" :size="13" />Cargada</span
          >
          <span v-else class="od-sub">Sin marca de agua</span>
        </dd>
      </div>
      <div>
        <dt>WhatsApp</dt>
        <dd>
          <template v-if="organizer.whatsappNumber">
            {{ organizer.whatsappNumber }}
            <span v-if="organizer.whatsappVerified" class="od-ok">verificado</span>
            <span v-else class="od-warn">sin verificar</span>
          </template>
          <span v-else class="od-sub">Sin número</span>
        </dd>
      </div>
      <div>
        <dt>Titular</dt>
        <dd>{{ organizer.holderName }} <span class="od-ok">titular del contrato</span></dd>
      </div>
      <div>
        <dt>Cuentas</dt>
        <dd>
          {{ organizer.accountCount }}
          {{ organizer.accountCount === 1 ? 'cuenta con acceso' : 'cuentas con acceso' }}
          <span class="od-sub">· el titular es una de ellas</span>
        </dd>
      </div>
      <div>
        <dt>Creado</dt>
        <dd>
          {{ createdDate }} <span class="od-sub">({{ createdRelative }})</span>
        </dd>
      </div>
    </dl>
  </section>
</template>

<style scoped src="./organizer-detail-hero.css" />
