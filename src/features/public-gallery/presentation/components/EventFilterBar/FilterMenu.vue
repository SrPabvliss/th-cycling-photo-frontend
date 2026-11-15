<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue'
import { useEventListener, useMediaQuery } from '@vueuse/core'

import { useDialogFocus } from '@/shared/composables/use-dialog-focus'
import { useFocusHandOff } from '@/shared/composables/use-focus-hand-off'
import { eventsCountText } from '../../../utils/event-filters'

// The one container of the three filter menus: a sheet from the bottom on a phone, a menu under
// its button from 768 on, as the account menu. It mounts once when it opens and stays the same
// node while choices, months or counts change: nothing animates again, moves or loses the focus.
const props = defineProps<{
  open: boolean
  /** The button that opened it: the menu goes under it on desktop. */
  anchor: HTMLElement | null
  /** The row of buttons: the menu never goes past its right edge. */
  bounds: HTMLElement | null
  label: string
  /** The month grid needs more room than a list. */
  wide?: boolean
  canClear: boolean
  /** Events the list has with the current filters; null while unknown. */
  total: number | null
}>()

const emit = defineEmits<{
  close: []
  clear: []
}>()

// Media queries cannot read custom properties: desktop starts at 768, as in the rest of the app.
const isDesktop = useMediaQuery('(min-width: 768px)')

const panel = ref<HTMLElement | null>(null)
// "Borrar" turns off once there is nothing to clear: the focus goes to the main button.
const clearButton = ref<HTMLButtonElement | null>(null)
const doneButton = ref<HTMLButtonElement | null>(null)
useFocusHandOff(
  () => props.canClear,
  () => clearButton.value,
  () => doneButton.value,
)
const place = ref({ top: 0, left: 0 })

const close = () => emit('close')

// On a phone the keyboard would cover the sheet: the focus goes to the sheet, not to its search.
useDialogFocus(panel, () => props.open, close, {
  initialFocus: () => (isDesktop.value ? null : panel.value),
})

function measure() {
  if (!props.open || !props.anchor || !panel.value) return
  const anchor = props.anchor.getBoundingClientRect()
  const limit = props.bounds?.getBoundingClientRect() ?? { left: 0, right: window.innerWidth }
  const width = panel.value.offsetWidth
  place.value = {
    top: anchor.bottom,
    left: Math.max(limit.left, Math.min(anchor.left, limit.right - width)),
  }
}

watch(
  () => props.open,
  async (open) => {
    if (!open) return
    await nextTick()
    measure()
  },
  { immediate: true },
)
useEventListener(window, 'resize', measure)

const position = computed(() => ({
  '--filter-menu-top': `${place.value.top}px`,
  '--filter-menu-left': `${place.value.left}px`,
}))

const doneText = computed(() =>
  isDesktop.value || props.total === null ? 'Listo' : `Ver ${eventsCountText(props.total)}`,
)
</script>

<template>
  <Teleport to="body">
    <div v-if="open" class="filter-menu" :class="{ 'filter-menu--wide': wide }" :style="position">
      <button
        type="button"
        class="filter-menu__scrim"
        aria-label="Cerrar"
        tabindex="-1"
        @click="close"
      />

      <div ref="panel" class="filter-menu__panel" role="menu" :aria-label="label" tabindex="-1">
        <p class="filter-menu__title" aria-hidden="true">{{ label }}</p>

        <slot />

        <div class="filter-menu__foot">
          <button
            ref="clearButton"
            type="button"
            class="filter-menu__clear"
            :disabled="!canClear"
            @click="emit('clear')"
          >
            Borrar
          </button>
          <button ref="doneButton" type="button" class="filter-menu__done" @click="close">
            {{ doneText }}
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
/* Phone: a sheet from the bottom over a scrim. */
.filter-menu {
  /* Widths of the desktop menu: a list, and the month grid. Candidates for awana tokens. */
  --filter-menu-width: calc(var(--tt-sidebar-width) + var(--tt-space-8));
  --filter-menu-width-wide: calc(var(--tt-ilu-inline) * 2);

  position: fixed;
  inset: 0;
  z-index: var(--tt-layer-menu);
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  font-family: var(--tt-font-sans);
}

.filter-menu__scrim {
  position: absolute;
  inset: 0;
  inline-size: 100%;
  padding: 0;
  border: 0;
  background: var(--tt-scrim);
  cursor: default;
  animation: filter-menu-fade var(--tt-motion-enter) var(--tt-easing-standard);
}

.filter-menu__panel {
  position: relative;
  display: flex;
  flex-direction: column;
  max-block-size: var(--tt-sheet-max-height);
  padding: var(--tt-space-2) var(--tt-space-3) calc(var(--tt-space-3) + env(safe-area-inset-bottom));
  border-radius: var(--tt-radius-xl) var(--tt-radius-xl) 0 0;
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  box-shadow: var(--tt-shadow-sheet);
  outline: none;
  animation: filter-menu-up var(--tt-motion-sheet) var(--tt-easing-standard);
}

.filter-menu__panel::before {
  content: '';
  flex: none;
  align-self: center;
  inline-size: var(--tt-sheet-handle-width);
  block-size: var(--tt-sheet-handle-height);
  margin-block-end: var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-line);
}

.filter-menu__title {
  margin: 0;
  padding: var(--tt-space-1) var(--tt-space-2) var(--tt-space-2);
  font-size: var(--tt-type-heading-m-size);
  line-height: var(--tt-type-heading-m-line);
  font-weight: var(--tt-type-heading-m-weight);
}

.filter-menu__foot {
  display: flex;
  flex: none;
  align-items: center;
  gap: var(--tt-space-2);
  margin-block-start: var(--tt-space-2);
  padding-block-start: var(--tt-space-2);
  border-block-start: thin solid var(--tt-line-subtle);
}

.filter-menu__clear,
.filter-menu__done {
  border: 0;
  font-family: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  line-height: var(--tt-type-body-s-medium-line);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.filter-menu__clear {
  min-block-size: var(--tt-control-m);
  padding-inline: var(--tt-space-2);
  border-radius: var(--tt-radius-m);
  background: none;
  color: var(--tt-primary-ink);
}

.filter-menu__clear:disabled {
  color: var(--tt-ink-muted);
  opacity: 0.5;
  cursor: default;
}

.filter-menu__done {
  margin-inline-start: auto;
  min-block-size: var(--tt-control-m);
  padding-inline: var(--tt-space-4);
  border-radius: var(--tt-radius-m);
  background: var(--tt-primary);
  color: var(--tt-on-primary);
}

.filter-menu__done:hover {
  background: var(--tt-primary-hover);
}

@keyframes filter-menu-up {
  from {
    transform: translateY(100%);
  }
}

@keyframes filter-menu-fade {
  from {
    opacity: 0;
  }
}

@keyframes filter-menu-drop {
  from {
    opacity: 0;
    transform: translateY(calc(var(--tt-space-1) * -1));
  }
}

/* Desktop: a menu under its button, inside the row's right edge. */
@media (min-width: 768px) {
  .filter-menu {
    display: block;
  }

  .filter-menu__scrim {
    background: transparent;
    animation: none;
  }

  .filter-menu__panel {
    position: absolute;
    inset-block-start: calc(var(--filter-menu-top) + var(--tt-space-2));
    inset-inline-start: var(--filter-menu-left);
    inline-size: var(--filter-menu-width);
    max-block-size: none;
    padding: var(--tt-space-2);
    border-radius: var(--tt-radius-l);
    box-shadow: var(--tt-shadow-pop);
    animation: filter-menu-drop var(--tt-motion-fast) var(--tt-easing-standard);
  }

  .filter-menu--wide .filter-menu__panel {
    inline-size: var(--filter-menu-width-wide);
  }

  .filter-menu__panel::before,
  .filter-menu__title {
    display: none;
  }
}

@media (prefers-reduced-motion: reduce) {
  .filter-menu__panel,
  .filter-menu__scrim {
    animation: none;
  }
}
</style>
