import { nextTick, watch } from 'vue'

type Element = () => HTMLElement | null | undefined

/**
 * When a control that has the focus turns off or goes away, the focus moves to a neighbour that
 * still makes sense, instead of falling to the page. `isThere` says whether the control is still
 * usable; `from` is that control and `to` where the focus goes.
 */
export function useFocusHandOff(isThere: () => boolean, from: Element, to: Element): void {
  // Before the page changes: the control is still there to ask whether it had the focus.
  watch(isThere, (now, before) => {
    if (!before || now) return
    const control = from()
    if (!control || document.activeElement !== control) return
    void nextTick(() => to()?.focus())
  })
}
