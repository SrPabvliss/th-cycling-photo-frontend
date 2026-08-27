import { computed, ref, type Ref } from 'vue'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useSetPhotoQuotaDefault } from './mutations/use-set-photo-quota-default'
import { useOrganizerDetailQuery } from './queries/use-organizer-detail'
import { useOrganizerEventsQuery } from './queries/use-organizer-events'

export function useOrganizerDetailView(organizerId: Ref<string>) {
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

  const { has } = usePermissions()
  const { mutate: setQuota } = useSetPhotoQuotaDefault()

  function refetch() {
    refetchDetail()
    refetchEvents()
  }

  function updateQuota(value: number | null) {
    if (!organizer.value) return
    setQuota({ id: organizer.value.id, photoQuota: value })
  }

  return {
    organizer,
    events: computed(() => eventsPage.value?.items ?? []),
    isPending: computed(() => isDetailPending.value || isEventsPending.value),
    isError: computed(() => isDetailError.value || isEventsError.value),
    canEditQuota: computed(() => has(PERMISSIONS.TENANT_QUOTA_SET)),
    page,
    refetch,
    updateQuota,
  }
}
