<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { ChevronBack } from '@vicons/ionicons5'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useSetPhotoQuotaDefault } from '../../../composables/mutations/use-set-photo-quota-default'
import { useOrganizerDetailQuery } from '../../../composables/queries/use-organizer-detail'
import { useOrganizerEventsQuery } from '../../../composables/queries/use-organizer-events'
import OrganizerDetailBody from './OrganizerDetailBody.vue'

const route = useRoute()
const router = useRouter()

const organizerId = computed(() => route.params.id as string)
const page = ref(1)

const {
  data: organizer,
  isPending: isDetailPending,
  isError: isDetailError,
  refetch: refetchDetail,
} = useOrganizerDetailQuery(organizerId)

const {
  data: eventsPage,
  isPending: isEventsPending,
  isError: isEventsError,
  refetch: refetchEvents,
} = useOrganizerEventsQuery(organizerId, page)

const events = computed(() => eventsPage.value?.items ?? [])
const isPending = computed(() => isDetailPending.value || isEventsPending.value)
const isError = computed(() => isDetailError.value || isEventsError.value)

const { has } = usePermissions()
const canEditQuota = computed(() => has(PERMISSIONS.TENANT_QUOTA_SET))
const { mutate: setQuota } = useSetPhotoQuotaDefault()

function goBack() {
  router.back()
}

function refetch() {
  refetchDetail()
  refetchEvents()
}

function handleUpdateQuota(value: number | null) {
  if (!organizer.value) return
  setQuota({ id: organizer.value.id, photoQuota: value })
}
</script>

<template>
  <div class="odp">
    <header class="odp-head">
      <button type="button" class="odp-back" @click="goBack">
        <NIcon :component="ChevronBack" :size="18" />
      </button>
      <span>Organizador</span>
    </header>

    <div class="odp-scroll">
      <div v-if="isPending" class="odp-loading">
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
    </div>
  </div>
</template>

<style scoped src="./organizer-detail-page.css" />
