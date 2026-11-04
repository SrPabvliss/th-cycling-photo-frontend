<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NDrawer, NDrawerContent, NResult, NSpin } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useSetPhotoQuotaDefault } from '../../../composables/mutations/use-set-photo-quota-default'
import { useOrganizerDetailQuery } from '../../../composables/queries/use-organizer-detail'
import { useOrganizerEventsQuery } from '../../../composables/queries/use-organizer-events'
import OrganizerDetailBody from './OrganizerDetailBody.vue'

const props = defineProps<{
  show: boolean
  organizerId: string | null
}>()

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const id = computed(() => props.organizerId ?? '')
const page = ref(1)

const {
  data: organizer,
  isPending: isDetailPending,
  isError: isDetailError,
  refetch: refetchDetail,
} = useOrganizerDetailQuery(id)

const {
  data: eventsPage,
  isPending: isEventsPending,
  isError: isEventsError,
  refetch: refetchEvents,
} = useOrganizerEventsQuery(id, page)

const events = computed(() => eventsPage.value?.items ?? [])
const isPending = computed(() => isDetailPending.value || isEventsPending.value)
const isError = computed(() => isDetailError.value || isEventsError.value)

const { has } = usePermissions()
const canEditQuota = computed(() => has(PERMISSIONS.TENANT_QUOTA_SET))
const { mutate: setQuota } = useSetPhotoQuotaDefault()

function refetch() {
  refetchDetail()
  refetchEvents()
}

function handleUpdateQuota(value: number | null) {
  if (!organizer.value) return
  setQuota({ id: organizer.value.id, photoQuota: value })
}

function close() {
  emit('update:show', false)
}
</script>

<template>
  <NDrawer :show="show" :width="560" placement="right" @update:show="close">
    <NDrawerContent title="Organizador" closable class="odd-content">
      <div v-if="isPending" class="odd-loading">
        <NSpin size="large" />
      </div>

      <NResult v-else-if="isError" status="error" title="Error al cargar el organizador">
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <OrganizerDetailBody
        v-else-if="organizer"
        :organizer="organizer"
        :events="events"
        :can-edit-quota="canEditQuota"
        @update-quota="handleUpdateQuota"
      />
    </NDrawerContent>
  </NDrawer>
</template>

<style scoped src="./organizer-detail-drawer.css" />
