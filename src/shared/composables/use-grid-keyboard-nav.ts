import type { Ref } from 'vue'

/** Arrow-key nav across a button grid; stops propagation to outer key handlers. */
export function useGridKeyboardNav(gridRef: Ref<HTMLElement | undefined>, cols = 8) {
  function focusActive() {
    const grid = gridRef.value
    if (!grid) return
    const active = grid.querySelector<HTMLElement>('[data-active="true"]')
    const target = active ?? grid.querySelector<HTMLElement>('button')
    target?.focus()
  }

  const ARROW_DELTAS: Record<string, number> = {
    ArrowRight: 1,
    ArrowLeft: -1,
    ArrowDown: cols,
    ArrowUp: -cols,
  }

  function onKey(e: KeyboardEvent) {
    const delta = ARROW_DELTAS[e.key]
    if (delta === undefined) return
    const grid = gridRef.value
    if (!grid) return
    const buttons = Array.from(grid.querySelectorAll<HTMLElement>('button'))
    const idx = buttons.indexOf(document.activeElement as HTMLElement)
    if (idx < 0) return
    const next = Math.max(0, Math.min(buttons.length - 1, idx + delta))
    e.preventDefault()
    e.stopPropagation()
    buttons[next]?.focus()
  }

  return { focusActive, onKey }
}
