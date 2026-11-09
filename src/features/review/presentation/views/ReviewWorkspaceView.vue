<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { useRouter } from 'vue-router'

import { useEventReviewWorkspace } from '../../composables/use-event-review-workspace'
import { useWorkspaceKeyboard } from '@/shared/workspace/composables/use-workspace-keyboard'
import { CARD_NAV_KEY } from '@/shared/workspace/composables/keys'
import WorkspaceShell from '@/shared/workspace/presentation/components/WorkspaceShell/WorkspaceShell.vue'
import WorkspaceHeader from '@/shared/workspace/presentation/components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '@/shared/workspace/presentation/components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import WorkspaceMobileBottomBar from '@/shared/workspace/presentation/components/WorkspaceMobileBottomBar/WorkspaceMobileBottomBar.vue'
import ReviewQueuePanel from '../components/ReviewQueuePanel/ReviewQueuePanel.vue'
import ReviewAttributesPanel from '../components/ReviewAttributesPanel/ReviewAttributesPanel.vue'
import WorkspaceShortcutCheatsheet from '@/shared/workspace/presentation/components/WorkspaceShortcutCheatsheet/WorkspaceShortcutCheatsheet.vue'
import { WORKSPACE_EVENTS } from '@/shared/workspace/constants/workspace-events'
import type { CardSection } from '@/shared/workspace/composables/use-workspace-card-navigation'

const SECTION_TO_COMPARE_VIEW: Partial<Record<CardSection, 'original' | 'compare' | 'retouched'>> =
  {
    bibs: 'original',
    helmet: 'compare',
    cyclist_clothes: 'retouched',
  }

const ws = useEventReviewWorkspace()
const router = useRouter()

provide(CARD_NAV_KEY, ws.cardNav)

const pendingPhotosCount = computed(() => ws.totalCount.value - ws.reviewedCount.value)

const photoPanelRef = ref<InstanceType<typeof WorkspacePhotoPanel>>()

const eventName = computed(() => ws.eventSlug.value)

function handleAddManual() {
  window.dispatchEvent(new CustomEvent(WORKSPACE_EVENTS.ADD_MANUAL))
}

useWorkspaceKeyboard({
  onSaveAdvance: () => ws.saveAndAdvance(),
  onSaveCard: () => {
    const active = document.activeElement as HTMLElement | null
    active?.dispatchEvent(new CustomEvent('review:save-card', { bubbles: true }))
  },
  onCancelEdit: () => {
    const active = document.activeElement as HTMLElement | null
    active?.blur()
  },
  onNextCard: () => ws.cardNav.next(),
  onPrevCard: () => ws.cardNav.prev(),
  onNextPhoto: () => ws.goNext(),
  onPrevPhoto: () => ws.goPrev(),
  onJumpSection: (section) => {
    const view = SECTION_TO_COMPARE_VIEW[section]
    if (view && photoPanelRef.value?.isCompareActive()) {
      photoPanelRef.value.setCompareView(view)
    }
  },
  onAddManual: handleAddManual,
  onShowCrop: () => window.dispatchEvent(new CustomEvent(WORKSPACE_EVENTS.SHOW_CROP)),
  onTogglePending: () => {
    ws.onlyPending.value = !ws.onlyPending.value
  },
  onDownload: () => photoPanelRef.value?.download(),
  onUpload: () => photoPanelRef.value?.upload(),
  onResetZoom: () => photoPanelRef.value?.resetZoom(),
  onToggleCompare: () => photoPanelRef.value?.toggleCompare(),
  onShowCheatsheet: () => {
    ws.showCheatsheet.value = !ws.showCheatsheet.value
  },
  onExit: () => router.back(),
})
</script>

<template>
  <div class="review-workspace">
    <WorkspaceHeader
      :event-name="eventName"
      :event-slug="ws.eventSlug.value"
      :reviewed-count="ws.reviewedCount.value"
      :total-count="ws.totalCount.value"
      :only-pending="ws.onlyPending.value"
      @update:only-pending="ws.onlyPending.value = $event"
      @show-cheatsheet="ws.showCheatsheet.value = true"
      @exit="router.back()"
    />

    <WorkspaceShell :mobile-sheet="ws.mobileSheet.value" @close-sheet="ws.closeSheet()">
      <template #queue>
        <ReviewQueuePanel
          :items="ws.queueItems.value"
          :current-slug="ws.currentSlug.value"
          :is-pending="ws.isQueuePending.value"
          @select="ws.selectSlug($event)"
        />
      </template>

      <template #photo>
        <div v-if="ws.isPhotoPending.value" class="review-workspace__loading">
          <NSpin />
        </div>
        <WorkspacePhotoPanel
          v-else-if="ws.photo.value"
          ref="photoPanelRef"
          :photo="ws.photo.value"
          :has-next="ws.hasNext.value"
          :has-prev="ws.hasPrev.value"
          @next="ws.goNext()"
          @prev="ws.goPrev()"
        />
      </template>

      <template #attrs>
        <ReviewAttributesPanel
          v-if="ws.photo.value"
          :photo="ws.photo.value"
          @save-and-advance="ws.saveAndAdvance()"
        />
      </template>
    </WorkspaceShell>

    <WorkspaceMobileBottomBar
      :open-sheet="ws.mobileSheet.value"
      :pending-count="pendingPhotosCount"
      :photo-index="ws.currentIndex.value"
      :photo-total="ws.queueItems.value.length"
      :attrs-count="ws.photo.value ? ws.photo.value.bibs.length : 0"
      @open="ws.openSheet($event)"
    />

    <WorkspaceShortcutCheatsheet
      :show="ws.showCheatsheet.value"
      @update:show="ws.showCheatsheet.value = $event"
    />
  </div>
</template>

<style src="@/shared/workspace/presentation/workspace-tokens.css" />
<style scoped src="./review-workspace-view.css" />
