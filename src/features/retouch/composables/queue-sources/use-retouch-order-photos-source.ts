import { computed, ref, type Ref } from 'vue'

import type { IReviewQueueSource } from '@/features/workspace/types/workspace-queue-source.types'
import type { IWorkspaceQueueItem } from '@/features/workspace/types/workspace-queue-item.types'
import {
  useOperatorRetouchOrderDetailQuery,
  type TRetouchDetailScope,
} from '../queries/use-operator-retouch-order-detail'
import { toWorkspaceQueueItemFromRetouchPhoto } from '../../mappers/retouch-photo-to-workspace-item.mapper'

export function useRetouchOrderPhotosSource(
  orderId: Ref<string | null>,
  scope: Ref<TRetouchDetailScope> = ref('pending'),
): IReviewQueueSource {
  const detailQuery = useOperatorRetouchOrderDetailQuery(orderId, scope)

  const items = computed<IWorkspaceQueueItem[]>(() =>
    (detailQuery.data.value?.photos ?? []).map(toWorkspaceQueueItemFromRetouchPhoto),
  )

  return {
    items,
    totalCount: computed(() => items.value.length),
    isPending: computed(() => detailQuery.isPending.value),
    hasNextPage: computed(() => false),
    isFetchingNextPage: computed(() => false),
    fetchNextPage: () => {},
    refetch: () => detailQuery.refetch(),
  }
}
