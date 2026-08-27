import { computed, type Ref } from 'vue'

import { usePhotoDetailBySlugQuery } from '@/features/photos/composables/queries/use-photo-detail-by-slug'
import type { IReviewQueueSource } from '@/shared/workspace/types/workspace-queue-source.types'
import type { IWorkspaceQueueItem } from '@/shared/workspace/types/workspace-queue-item.types'
import { toWorkspaceQueueItemFromPhotoDetail } from '../../mappers/photo-detail-to-workspace-item.mapper'

export function useSinglePhotoReviewQueueSource(photoSlug: Ref<string>): IReviewQueueSource {
  const photoQuery = usePhotoDetailBySlugQuery(photoSlug)

  const items = computed<IWorkspaceQueueItem[]>(() => {
    const detail = photoQuery.data.value
    if (!detail) return []
    return [toWorkspaceQueueItemFromPhotoDetail(detail)]
  })

  return {
    items,
    totalCount: computed(() => (photoQuery.data.value ? 1 : 0)),
    isPending: computed(() => photoQuery.isPending.value),
    hasNextPage: computed(() => false),
    isFetchingNextPage: computed(() => false),
    fetchNextPage: () => {},
    refetch: () => photoQuery.refetch(),
  }
}
