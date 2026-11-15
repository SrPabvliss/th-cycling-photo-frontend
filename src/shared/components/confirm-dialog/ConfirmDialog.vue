<script setup lang="ts">
import { nextTick, ref, useId, watch } from 'vue'
import { NButton } from 'naive-ui'

import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import type { IFormProblem } from '@/shared/utils/form-problem'

// Asks before something that cannot be undone. The safe choice has the focus first; Escape and
// the backdrop keep things as they are.
const props = defineProps<{
  open: boolean
  title: string
  text: string
  confirmLabel: string
  keepLabel: string
  busy?: boolean
  /** Why the last try failed: said here, above the buttons, and the action can be tried again. */
  problem?: IFormProblem | null
}>()

const emit = defineEmits<{
  confirm: []
  keep: []
}>()

const panel = ref<HTMLElement | null>(null)
const keepButton = ref<{ $el: HTMLElement } | null>(null)
const titleId = useId()
const textId = useId()
let confirmed = false

useDialogFocus(
  panel,
  () => props.open,
  () => emit('keep'),
)

watch(
  () => props.open,
  async (open) => {
    confirmed = false
    if (!open) return
    // After the dialog focus helper has placed it on the first control.
    await nextTick()
    await nextTick()
    keepButton.value?.$el.focus()
  },
  { immediate: true },
)

watch(
  () => props.problem,
  (problem) => {
    if (problem) confirmed = false
  },
)

function confirm() {
  if (confirmed || props.busy) return
  confirmed = true
  emit('confirm')
}
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="confirm-dialog">
      <div class="confirm-dialog__scrim" @click="emit('keep')" />
      <section
        ref="panel"
        class="confirm-dialog__panel"
        role="alertdialog"
        aria-modal="true"
        :aria-labelledby="titleId"
        :aria-describedby="textId"
      >
        <h2 :id="titleId" class="confirm-dialog__title">{{ title }}</h2>
        <p :id="textId" class="confirm-dialog__text">{{ text }}</p>
        <FormAlert
          v-if="problem"
          :tone="problem.tone ?? 'bad'"
          :title="problem.title"
          :text="problem.text"
        />
        <div class="confirm-dialog__actions">
          <NButton
            type="error"
            size="large"
            block
            :loading="busy"
            :aria-busy="busy ? 'true' : undefined"
            @click="confirm"
          >
            {{ confirmLabel }}
          </NButton>
          <NButton ref="keepButton" size="large" block @click="emit('keep')">
            {{ keepLabel }}
          </NButton>
        </div>
      </section>
    </div>
  </Teleport>
</template>

<style scoped>
.confirm-dialog {
  position: fixed;
  inset: 0;
  /* Above the cart drawer (1550) and the photo viewer (1700): it asks about what is under it. */
  z-index: var(--tt-layer-dialog);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  font-family: var(--tt-font-sans);
}

.confirm-dialog__scrim {
  position: absolute;
  inset: 0;
  background: var(--tt-scrim);
}

.confirm-dialog__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 7);
  padding: var(--tt-space-5) var(--tt-space-4) var(--tt-space-6);
  border-radius: var(--tt-radius-l) var(--tt-radius-l) 0 0;
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-pop);
}

.confirm-dialog__title {
  margin: 0;
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.confirm-dialog__text {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.confirm-dialog__actions {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
  margin-block-start: var(--tt-space-2);
}

@media (min-width: 768px) {
  .confirm-dialog {
    align-items: center;
  }

  .confirm-dialog__panel {
    border-radius: var(--tt-radius-l);
  }
}
</style>
