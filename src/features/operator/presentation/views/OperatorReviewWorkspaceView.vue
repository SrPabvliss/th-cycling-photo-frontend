<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

import { useOperatorReviewWorkspace } from '@/features/review/composables/use-operator-review-workspace'
import { useWorkspaceKeyboard } from '@/features/workspace/composables/use-workspace-keyboard'
import { CARD_NAV_KEY } from '@/features/workspace/composables/keys'
import { OPERATOR_ROUTE_NAMES } from '../../routes'
import WorkspaceShell from '@/features/workspace/presentation/components/WorkspaceShell/WorkspaceShell.vue'
import WorkspaceHeader from '@/features/workspace/presentation/components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '@/features/workspace/presentation/components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import WorkspaceMobileBottomBar from '@/features/workspace/presentation/components/WorkspaceMobileBottomBar/WorkspaceMobileBottomBar.vue'
import WorkspaceShortcutCheatsheet from '@/features/workspace/presentation/components/WorkspaceShortcutCheatsheet/WorkspaceShortcutCheatsheet.vue'
import ReviewQueuePanel from '@/features/review/presentation/components/ReviewQueuePanel/ReviewQueuePanel.vue'
import ReviewAttributesPanel from '@/features/review/presentation/components/ReviewAttributesPanel/ReviewAttributesPanel.vue'

const router = useRouter()
const workspace = useOperatorReviewWorkspace()

provide(CARD_NAV_KEY, workspace.cardNav)

const photoPanelRef = ref<InstanceType<typeof WorkspacePhotoPanel>>()
const pendingPhotosCount = computed(
  () => workspace.totalCount.value - workspace.reviewedCount.value,
)
const dashboardRoute = { name: OPERATOR_ROUTE_NAMES.DASHBOARD }

const noop = () => {}

useWorkspaceKeyboard({
  onSaveAdvance: () => workspace.saveAndAdvance(),
  onSaveCard: noop,
  onCancelEdit: noop,
  onNextCard: noop,
  onPrevCard: noop,
  onNextPhoto: () => workspace.goNext(),
  onPrevPhoto: () => workspace.goPrev(),
  onJumpSection: noop,
  onAddManual: noop,
  onShowCrop: noop,
  onTogglePending: () => {
    workspace.onlyPending.value = !workspace.onlyPending.value
  },
  onDownload: noop,
  onUpload: noop,
  onResetZoom: noop,
  onToggleCompare: noop,
  onShowCheatsheet: () => {
    workspace.showCheatsheet.value = !workspace.showCheatsheet.value
  },
  onExit: () => router.push({ name: OPERATOR_ROUTE_NAMES.DASHBOARD }),
})
</script>

<template>
  <div class="review-workspace">
    <WorkspaceHeader
      event-name="Mis fotos pendientes"
      :reviewed-count="workspace.reviewedCount.value"
      :total-count="workspace.totalCount.value"
      :only-pending="workspace.onlyPending.value"
      @update:only-pending="workspace.onlyPending.value = $event"
      @show-cheatsheet="workspace.showCheatsheet.value = true"
      @exit="router.push(dashboardRoute)"
    />

    <WorkspaceShell
      :mobile-sheet="workspace.mobileSheet.value"
      @close-sheet="workspace.closeSheet()"
    >
      <template #queue>
        <ReviewQueuePanel
          :items="workspace.queueItems.value"
          :current-slug="workspace.currentSlug.value"
          :is-pending="workspace.isQueuePending.value"
          @select="workspace.selectSlug($event)"
        />
      </template>

      <template #photo>
        <div v-if="workspace.isPhotoPending.value" class="review-workspace__loading">
          <NSpin />
        </div>
        <WorkspacePhotoPanel
          v-else-if="workspace.photo.value"
          ref="photoPanelRef"
          :photo="workspace.photo.value"
          :has-next="workspace.hasNext.value"
          :has-prev="workspace.hasPrev.value"
          @next="workspace.goNext()"
          @prev="workspace.goPrev()"
        />
      </template>

      <template #attrs>
        <ReviewAttributesPanel
          v-if="workspace.photo.value"
          :photo="workspace.photo.value"
          @save-and-advance="workspace.saveAndAdvance()"
        />
      </template>
    </WorkspaceShell>

    <WorkspaceMobileBottomBar
      :open-sheet="workspace.mobileSheet.value"
      :pending-count="pendingPhotosCount"
      :photo-index="workspace.currentIndex.value"
      :photo-total="workspace.queueItems.value.length"
      :attrs-count="
        workspace.photo.value
          ? workspace.photo.value.bibs.length + workspace.photo.value.colors.length
          : 0
      "
      @open="workspace.openSheet($event)"
    />

    <WorkspaceShortcutCheatsheet
      :show="workspace.showCheatsheet.value"
      @update:show="workspace.showCheatsheet.value = $event"
    />
  </div>
</template>

<style src="@/features/workspace/presentation/workspace-tokens.css" />
<style scoped src="@/features/review/presentation/views/review-workspace-view.css" />
