import type { ComputedRef } from 'vue'
import type { IWorkspaceQueueItem } from './workspace-queue-item.types'

export interface IReviewQueueSource {
  items: ComputedRef<IWorkspaceQueueItem[]>
  totalCount: ComputedRef<number>
  isPending: ComputedRef<boolean>
  hasNextPage: ComputedRef<boolean>
  isFetchingNextPage: ComputedRef<boolean>
  fetchNextPage: () => void
  refetch: () => Promise<unknown>
}
