import { ref } from 'vue'

import { useReviewWorkspaceCore } from '@/features/workspace/composables/use-workspace-core'
import type { IReviewWorkspaceState } from '@/features/workspace/types/workspace-state.types'
import { useOperatorReviewQueueSource } from './queue-sources/use-operator-review-queue-source'

export function useOperatorReviewWorkspace(): IReviewWorkspaceState {
  const onlyPending = ref<boolean>(true)
  const eventSlug = ref<string | null>(null) // null = cross-event mine

  const source = useOperatorReviewQueueSource(eventSlug, onlyPending)
  return useReviewWorkspaceCore(source, { mode: 'flow', onlyPending })
}
