<script setup lang="ts">
import type { MobileSheet } from '../../../types/mobile-sheet.type'
import type { WorkspaceMode } from '../../../types/workspace-mode.types'

const props = withDefaults(
  defineProps<{
    mobileSheet: MobileSheet
    mode?: WorkspaceMode
  }>(),
  { mode: 'flow' },
)

const emit = defineEmits<{
  closeSheet: []
}>()
</script>

<template>
  <div
    class="workspace-shell"
    :class="{ 'workspace-shell--edit-one': props.mode === 'edit-one' }"
    :data-mobile-sheet="mobileSheet ?? 'none'"
  >
    <div v-if="mobileSheet" class="workspace-shell__scrim" @click="emit('closeSheet')" />
    <aside
      v-if="props.mode !== 'edit-one'"
      class="workspace-shell__queue"
      :data-open="mobileSheet === 'queue'"
    >
      <slot name="queue" />
    </aside>
    <section class="workspace-shell__photo">
      <slot name="photo" />
    </section>
    <aside class="workspace-shell__attrs" :data-open="mobileSheet === 'attrs'">
      <slot name="attrs" />
    </aside>
  </div>
</template>

<style scoped src="./workspace-shell.css" />
