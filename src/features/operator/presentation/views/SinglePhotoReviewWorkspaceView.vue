<script setup lang="ts">
import { computed, provide } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NSpin } from 'naive-ui'

import { useSinglePhotoReviewWorkspace } from '@/features/review/composables/use-single-photo-review-workspace'
import { CARD_NAV_KEY } from '@/features/workspace/composables/keys'
import { useWorkspaceKeyboard } from '@/features/workspace/composables/use-workspace-keyboard'
import WorkspaceHeader from '@/features/workspace/presentation/components/WorkspaceHeader/WorkspaceHeader.vue'
import WorkspaceShell from '@/features/workspace/presentation/components/WorkspaceShell/WorkspaceShell.vue'
import WorkspacePhotoPanel from '@/features/workspace/presentation/components/WorkspacePhotoPanel/WorkspacePhotoPanel.vue'
import WorkspaceShortcutCheatsheet from '@/features/workspace/presentation/components/WorkspaceShortcutCheatsheet/WorkspaceShortcutCheatsheet.vue'
import ReviewAttributesPanel from '@/features/review/presentation/components/ReviewAttributesPanel/ReviewAttributesPanel.vue'

const route = useRoute()
const router = useRouter()

const photoSlug = computed(() => route.params.photoSlug as string)
const workspace = useSinglePhotoReviewWorkspace(photoSlug)

provide(CARD_NAV_KEY, workspace.cardNav)

const eventName = computed(() => workspace.photo.value?.eventSlug ?? '')

function handleClose() {
  router.back()
}

const noop = () => {}

useWorkspaceKeyboard({
  onSaveAdvance: () => workspace.saveAndAdvance(),
  onSaveCard: noop,
  onCancelEdit: noop,
  onNextCard: noop,
  onPrevCard: noop,
  onNextPhoto: noop,
  onPrevPhoto: noop,
  onJumpSection: noop,
  onAddManual: noop,
  onShowCrop: noop,
  onTogglePending: noop,
  onDownload: noop,
  onUpload: noop,
  onResetZoom: noop,
  onToggleCompare: noop,
  onShowCheatsheet: () => {
    workspace.showCheatsheet.value = !workspace.showCheatsheet.value
  },
  onExit: handleClose,
})
</script>

<template>
  <div class="review-workspace single-photo-review">
    <WorkspaceHeader
      mode="single"
      :event-name="eventName"
      @show-cheatsheet="workspace.showCheatsheet.value = true"
      @exit="handleClose"
    />

    <WorkspaceShell
      :mobile-sheet="workspace.mobileSheet.value"
      mode="edit-one"
      @close-sheet="workspace.closeSheet()"
    >
      <template #photo>
        <div v-if="workspace.isPhotoPending.value" class="single-photo-review__loading">
          <NSpin />
        </div>
        <WorkspacePhotoPanel
          v-else-if="workspace.photo.value"
          :photo="workspace.photo.value"
          :has-next="false"
          :has-prev="false"
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

    <WorkspaceShortcutCheatsheet
      :show="workspace.showCheatsheet.value"
      @update:show="workspace.showCheatsheet.value = $event"
    />
  </div>
</template>

<style src="@/features/workspace/presentation/workspace-tokens.css" />
<style scoped src="./styles/single-photo-review-workspace-view.css" />
