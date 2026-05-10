<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { NSpin } from 'naive-ui'
import { useRouter } from 'vue-router'

import { EVENT_ROUTE_NAMES } from '@/features/events/routes'
import { useReviewWorkspace } from '../../composables/use-review-workspace'
import { useKeyboardShortcuts } from '../../composables/use-keyboard-shortcuts'
import { CARD_NAV_KEY } from '../../composables/keys'
import WorkspaceShell from '../components/WorkspaceShell/WorkspaceShell.vue'
import WorkspaceHeader from '../components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '../components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import MobileBottomBar from '../components/MobileBottomBar/MobileBottomBar.vue'
import ReviewQueuePanel from '../components/ReviewQueuePanel/ReviewQueuePanel.vue'
import ReviewAttributesPanel from '../components/ReviewAttributesPanel/ReviewAttributesPanel.vue'
import ShortcutCheatsheet from '../components/ShortcutCheatsheet/ShortcutCheatsheet.vue'
import { REVIEW_EVENTS } from '../../constants/review-events'
import type { CardSection } from '../../composables/use-card-navigation'

const SECTION_TO_COMPARE_VIEW: Partial<Record<CardSection, 'original' | 'compare' | 'retouched'>> =
  {
    bibs: 'original',
    helmet: 'compare',
    cyclist_clothes: 'retouched',
  }

const ws = useReviewWorkspace()
const router = useRouter()

provide(CARD_NAV_KEY, ws.cardNav)

const pendingPhotosCount = computed(() => ws.totalCount.value - ws.reviewedCount.value)

const photoPanelRef = ref<InstanceType<typeof WorkspacePhotoPanel>>()

const eventName = computed(() => ws.eventSlug.value)

function handleAddManual() {
  window.dispatchEvent(new CustomEvent(REVIEW_EVENTS.ADD_MANUAL))
}

useKeyboardShortcuts({
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
  onShowCrop: () => window.dispatchEvent(new CustomEvent(REVIEW_EVENTS.SHOW_CROP)),
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
  onExit: () => {
    router.push({
      name: EVENT_ROUTE_NAMES.DETAIL,
      params: { slug: ws.eventSlug.value },
    })
  },
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

    <MobileBottomBar
      :open-sheet="ws.mobileSheet.value"
      :pending-count="pendingPhotosCount"
      :photo-index="ws.currentIndex.value"
      :photo-total="ws.queueItems.value.length"
      :attrs-count="ws.photo.value ? ws.photo.value.bibs.length + ws.photo.value.colors.length : 0"
      @open="ws.openSheet($event)"
    />

    <ShortcutCheatsheet
      :show="ws.showCheatsheet.value"
      @update:show="ws.showCheatsheet.value = $event"
    />
  </div>
</template>

<style src="../review-tokens.css" />
<style scoped src="./review-workspace-view.css" />
