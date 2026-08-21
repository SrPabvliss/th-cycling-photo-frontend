<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NFlex, NIcon, NSwitch, NTag, useDialog, useMessage } from 'naive-ui'
import {
  ArrowBack,
  CreateOutline,
  CloudUploadOutline,
  SettingsOutline,
  SnowOutline,
} from '@vicons/ionicons5'

import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { EVENT_ROUTE_NAMES } from '../../../routes'
import { EVENT_STATUS_CONFIG } from '../../../constants/status-config'
import { useEventConfiguration } from '../../../composables/queries/use-event-configuration'
import { useSetEventFreeze } from '../../../composables/mutations/use-set-event-freeze'
import type { IEventDetail } from '../../../types/responses/event-detail.response'

const props = defineProps<{
  event: IEventDetail
  eventSlug: string
}>()

const router = useRouter()
const dialog = useDialog()
const message = useMessage()
const { has } = usePermissions()
const canUpdateEvent = computed(() => has(PERMISSIONS.EVENT_UPDATE))
const canFreezeEvent = computed(() => has(PERMISSIONS.EVENT_FREEZE))

const eventId = computed(() => (canUpdateEvent.value ? props.event.id : ''))
const { data: configuration } = useEventConfiguration(eventId)

const isFrozen = computed(() => props.event.isFrozen)

const canEditConfiguration = computed(
  () => canUpdateEvent.value && !!configuration.value?.isEditable,
)

const { mutateAsync: setFreeze, isPending: isFreezing } = useSetEventFreeze(props.event.id)

const FREEZE_CONTENT = [
  'El tenant no podrá editar el evento ni subir o eliminar fotos.',
  'Seguirá gestionando sus órdenes con normalidad y la galería pública seguirá vendiendo.',
  'Las fotos pendientes de retoque se entregarán sin retocar.',
].join(' ')

function handleFreezeToggle(frozen: boolean) {
  if (frozen) {
    dialog.warning({
      title: 'Congelar evento',
      content: FREEZE_CONTENT,
      positiveText: 'Congelar evento',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        await setFreeze(true)
        message.success('Evento congelado')
      },
    })
    return
  }

  dialog.info({
    title: 'Descongelar evento',
    content: 'Descongelar evento. El tenant recuperará la edición completa.',
    positiveText: 'Descongelar evento',
    negativeText: 'Cancelar',
    onPositiveClick: async () => {
      await setFreeze(false)
      message.success('Evento descongelado')
    },
  })
}
</script>

<template>
  <NFlex justify="space-between" align="start" :size="16" wrap style="margin-bottom: 32px">
    <NFlex align="start" :size="12">
      <button class="event-header__back" @click="router.push('/events')">
        <NIcon :component="ArrowBack" :size="20" />
      </button>
      <div>
        <NFlex align="center" :size="12" style="margin-bottom: 4px">
          <h1 class="event-header__title">{{ event.name }}</h1>
          <NTag :type="EVENT_STATUS_CONFIG[event.status].type" size="small" round>
            {{ EVENT_STATUS_CONFIG[event.status].label }}
          </NTag>
          <NTag v-if="isFrozen" type="info" size="small" round>
            <template #icon><NIcon :component="SnowOutline" /></template>
            Congelado
          </NTag>
        </NFlex>
        <p class="event-header__subtitle">
          <span v-if="event.startDate.getTime() === event.endDate.getTime()">
            {{ formatDate(event.startDate) }}
          </span>
          <span v-else> {{ formatDate(event.startDate) }} – {{ formatDate(event.endDate) }} </span>
          · Actualizado {{ formatRelativeTime(event.updatedAt) }}
        </p>
      </div>
    </NFlex>
    <NFlex :size="10" align="center">
      <NFlex v-if="canFreezeEvent" align="center" :size="8">
        <span class="event-header__subtitle">Congelar</span>
        <NSwitch :value="isFrozen" :loading="isFreezing" @update:value="handleFreezeToggle" />
      </NFlex>
      <NButton
        v-if="canEditConfiguration"
        :disabled="isFrozen"
        @click="
          router.push({ name: EVENT_ROUTE_NAMES.CONFIGURATION_EDIT, params: { slug: eventSlug } })
        "
      >
        <template #icon><NIcon :component="SettingsOutline" /></template>
        Configuración
      </NButton>
      <NButton
        :disabled="isFrozen"
        @click="router.push({ name: EVENT_ROUTE_NAMES.EDIT, params: { slug: eventSlug } })"
      >
        <template #icon><NIcon :component="CreateOutline" /></template>
        Editar evento
      </NButton>
      <NButton
        type="primary"
        :disabled="isFrozen"
        @click="router.push({ name: PHOTO_ROUTE_NAMES.UPLOAD, params: { slug: eventSlug } })"
      >
        <template #icon><NIcon :component="CloudUploadOutline" /></template>
        Subir fotos
      </NButton>
    </NFlex>
  </NFlex>
</template>

<style scoped src="./event-detail-header.css"></style>
