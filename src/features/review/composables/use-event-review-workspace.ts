import { computed, ref, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { useReviewWorkspaceCore } from '@/shared/workspace/composables/use-workspace-core'
import type { IReviewWorkspaceState } from '@/shared/workspace/types/workspace-state.types'
import { useEventReviewQueueSource } from './queue-sources/use-event-review-queue-source'

type EventReviewWorkspace = IReviewWorkspaceState & {
  eventSlug: ComputedRef<string>
}

export function useEventReviewWorkspace(): EventReviewWorkspace {
  const route = useRoute()
  const router = useRouter()

  const eventSlug = computed(() => route.params.eventSlug as string)
  const onlyPending = ref<boolean>(true)
  const initialSlug = (route.query.photo as string | undefined) ?? null

  const source = useEventReviewQueueSource(eventSlug, onlyPending)
  const core = useReviewWorkspaceCore(source, {
    initialSlug,
    mode: 'flow',
    onlyPending,
    onCurrentSlugChange: (slug) => {
      if (!slug) return
      router.replace({
        name: route.name as string,
        params: route.params,
        query: { ...route.query, photo: slug },
      })
    },
  })

  return { ...core, eventSlug }
}
