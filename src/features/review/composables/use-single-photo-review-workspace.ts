import { type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { useReviewWorkspaceCore } from '@/features/workspace/composables/use-workspace-core'
import type { IReviewWorkspaceState } from '@/features/workspace/types/workspace-state.types'
import { useSinglePhotoReviewQueueSource } from './queue-sources/use-single-photo-review-queue-source'

export function useSinglePhotoReviewWorkspace(photoSlug: Ref<string>): IReviewWorkspaceState {
  const router = useRouter()
  const source = useSinglePhotoReviewQueueSource(photoSlug)

  return useReviewWorkspaceCore(source, {
    initialSlug: photoSlug.value,
    mode: 'edit-one',
    onCloseAfterSave: () => router.back(),
  })
}
