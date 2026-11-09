import type { ComputedRef, Ref } from 'vue'
import type { IWorkspacePhotoDetail } from './workspace-photo.types'
import type { ICardNavigation } from '../composables/use-workspace-card-navigation'
import type { MobileSheet } from './mobile-sheet.type'
import type { WorkspaceMode } from './workspace-mode.types'
import type { IWorkspaceQueueItem } from './workspace-queue-item.types'

export interface IReviewWorkspaceState<TPhoto = IWorkspacePhotoDetail> {
  queueItems: ComputedRef<IWorkspaceQueueItem[]>
  totalCount: ComputedRef<number>
  reviewedCount: ComputedRef<number>
  isQueuePending: ComputedRef<boolean>

  photo: ComputedRef<TPhoto | null>
  isPhotoPending: ComputedRef<boolean>

  currentSlug: Ref<string | null>
  currentIndex: ComputedRef<number>
  hasNext: ComputedRef<boolean>
  hasPrev: ComputedRef<boolean>
  goNext: () => void
  goPrev: () => void
  selectSlug: (slug: string) => void

  cardNav: ICardNavigation
  mobileSheet: Ref<MobileSheet>
  openSheet: (s: MobileSheet) => void
  closeSheet: () => void
  showCheatsheet: Ref<boolean>

  onlyPending: Ref<boolean>
  saveAndAdvance: () => void

  mode: WorkspaceMode
}
