<script setup lang="ts">
import { computed, provide, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

import { useOperatorRetouchWorkspace } from '../../composables/workspaces/use-operator-retouch-workspace'
import { useEventRetouchWorkspace } from '../../composables/workspaces/use-event-retouch-workspace'
import { useWorkspaceKeyboard } from '@/features/workspace/composables/use-workspace-keyboard'
import { CARD_NAV_KEY } from '@/features/workspace/composables/keys'
import { WORKSPACE_EVENTS } from '@/features/workspace/constants/workspace-events'
import type { CardSection } from '@/features/workspace/composables/use-workspace-card-navigation'
import WorkspaceShell from '@/features/workspace/presentation/components/WorkspaceShell/WorkspaceShell.vue'
import WorkspaceHeader from '@/features/workspace/presentation/components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspacePhotoPanel from '@/features/workspace/presentation/components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import WorkspaceMobileBottomBar from '@/features/workspace/presentation/components/WorkspaceMobileBottomBar/WorkspaceMobileBottomBar.vue'
import WorkspaceShortcutCheatsheet from '@/features/workspace/presentation/components/WorkspaceShortcutCheatsheet/WorkspaceShortcutCheatsheet.vue'
import ReviewQueuePanel from '@/features/review/presentation/components/ReviewQueuePanel/ReviewQueuePanel.vue'
import ReviewAttributesPanel from '@/features/review/presentation/components/ReviewAttributesPanel/ReviewAttributesPanel.vue'
import RetouchOrderTransitionModal from '../components/RetouchOrderTransitionModal/RetouchOrderTransitionModal.vue'
import RetouchEmptyState from '../components/RetouchEmptyState/RetouchEmptyState.vue'
import { OPERATOR_ROUTE_NAMES } from '@/features/operator/routes'
import { RETOUCH_ROUTE_NAMES } from '../../constants/retouch-routes'

const SECTION_TO_COMPARE_VIEW: Partial<Record<CardSection, 'original' | 'compare' | 'retouched'>> =
  {
    bibs: 'original',
    helmet: 'compare',
    cyclist_clothes: 'retouched',
  }

const route = useRoute()
const router = useRouter()

const eventSlug = computed(() => (route.params.eventSlug as string | undefined) ?? null)
const initialOrderId = (route.query.orderId as string | undefined) ?? undefined

const ws = eventSlug.value
  ? useEventRetouchWorkspace(
      computed(() => eventSlug.value as string),
      { initialOrderId },
    )
  : useOperatorRetouchWorkspace({ initialOrderId })

provide(CARD_NAV_KEY, ws.review.cardNav)

const photoPanelRef = ref<InstanceType<typeof WorkspacePhotoPanel>>()
const showCheatsheet = ref(false)

function handleAddManual() {
  window.dispatchEvent(new CustomEvent(WORKSPACE_EVENTS.ADD_MANUAL))
}

const exitToQueue = () =>
  router.push({
    name: eventSlug.value ? RETOUCH_ROUTE_NAMES.EVENT_QUEUE : RETOUCH_ROUTE_NAMES.OPERATOR_QUEUE,
    params: eventSlug.value ? { eventSlug: eventSlug.value } : undefined,
  })

useWorkspaceKeyboard({
  onSaveAdvance: () => ws.review.goNext(),
  onSaveCard: () => {
    const active = document.activeElement as HTMLElement | null
    active?.dispatchEvent(new CustomEvent('review:save-card', { bubbles: true }))
  },
  onCancelEdit: () => {
    const active = document.activeElement as HTMLElement | null
    active?.blur()
  },
  onNextCard: () => ws.review.cardNav.next(),
  onPrevCard: () => ws.review.cardNav.prev(),
  onNextPhoto: () => ws.review.goNext(),
  onPrevPhoto: () => ws.review.goPrev(),
  onJumpSection: (section) => {
    const view = SECTION_TO_COMPARE_VIEW[section]
    if (view && photoPanelRef.value?.isCompareActive()) {
      photoPanelRef.value.setCompareView(view)
    }
  },
  onAddManual: handleAddManual,
  onShowCrop: () => window.dispatchEvent(new CustomEvent(WORKSPACE_EVENTS.SHOW_CROP)),
  onTogglePending: () => {
    ws.detailScope.value = ws.detailScope.value === 'pending' ? 'all' : 'pending'
  },
  onDownload: () => photoPanelRef.value?.download(),
  onUpload: () => photoPanelRef.value?.upload(),
  onResetZoom: () => photoPanelRef.value?.resetZoom(),
  onToggleCompare: () => photoPanelRef.value?.toggleCompare(),
  onToggleMode: () => ws.toggleMode(),
  onShowCheatsheet: () => (showCheatsheet.value = !showCheatsheet.value),
  onExit: exitToQueue,
})

const showAttrs = computed(() => ws.workspaceMode.value === 'review')
const photo = computed(() => ws.review.photo.value)

const handleContinueOrder = () => {
  ws.advanceToNextOrder()
}

const handleExitFromModal = () => {
  ws.acknowledgeOrderCompleted()
  exitToQueue()
}
</script>

<template>
  <div class="retouch-workspace">
    <WorkspaceHeader
      mode="retouch"
      :event-name="ws.orderMeta.value?.eventName ?? ''"
      :retouch-mode="ws.workspaceMode.value"
      :retouch-scope="ws.detailScope.value"
      :order-meta="ws.orderMeta.value"
      @update:retouch-mode="ws.workspaceMode.value = $event"
      @update:retouch-scope="ws.detailScope.value = $event"
      @show-cheatsheet="showCheatsheet = true"
      @exit="exitToQueue"
    />

    <RetouchEmptyState
      v-if="!ws.orderId.value && !ws.isOrdersPending.value"
      @go-dashboard="router.push({ name: OPERATOR_ROUTE_NAMES.DASHBOARD })"
    />

    <WorkspaceShell
      v-else
      mode="retouch"
      :show-attrs="showAttrs"
      :mobile-sheet="ws.review.mobileSheet.value"
      @close-sheet="ws.review.closeSheet()"
    >
      <template #queue>
        <ReviewQueuePanel
          :items="ws.review.queueItems.value"
          :current-slug="ws.review.currentSlug.value"
          :is-pending="ws.review.isQueuePending.value"
          @select="ws.review.selectSlug($event)"
        />
      </template>

      <template #photo>
        <div v-if="ws.review.isPhotoPending.value" class="retouch-workspace__loading">
          <NSpin />
        </div>
        <WorkspacePhotoPanel
          v-else-if="photo"
          ref="photoPanelRef"
          :photo="photo"
          :has-next="ws.review.hasNext.value"
          :has-prev="ws.review.hasPrev.value"
          @next="ws.review.goNext()"
          @prev="ws.review.goPrev()"
        />
      </template>

      <template #attrs>
        <ReviewAttributesPanel
          v-if="showAttrs && photo"
          :photo="photo"
          @save-and-advance="ws.review.goNext()"
        />
      </template>
    </WorkspaceShell>

    <WorkspaceMobileBottomBar
      v-if="ws.orderId.value"
      :open-sheet="ws.review.mobileSheet.value"
      :pending-count="ws.review.queueItems.value.length"
      :photo-index="ws.review.currentIndex.value"
      :photo-total="ws.review.queueItems.value.length"
      :attrs-count="0"
      @open="ws.review.openSheet($event)"
    />

    <RetouchOrderTransitionModal
      :show="ws.orderCompleted.value"
      :completed-order-id="ws.completedSnapshot.value?.orderId ?? ''"
      :completed-photos-count="ws.completedSnapshot.value?.retouchedCount ?? 0"
      :next-order-id="ws.nextOrder.value?.orderId ?? null"
      @continue="handleContinueOrder"
      @exit="handleExitFromModal"
    />

    <WorkspaceShortcutCheatsheet :show="showCheatsheet" @update:show="showCheatsheet = $event" />
  </div>
</template>

<style src="@/features/workspace/presentation/workspace-tokens.css" />
<style scoped src="./styles/operator-retouch-workspace-view.css" />
