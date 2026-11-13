import { nextTick, onScopeDispose, watch, type Ref } from 'vue'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/**
 * What every modal layer needs from the keyboard and the page behind it: the focus goes in when
 * it opens and stays in while Tab is pressed, Escape asks to close, the page behind does not
 * scroll, and on closing the focus goes back to whatever opened it.
 */
export function useDialogFocus(
  panel: Ref<HTMLElement | null>,
  isOpen: () => boolean,
  onEscape: () => void,
): void {
  let opener: HTMLElement | null = null
  let previousOverflow = ''
  let isActive = false

  const focusable = () =>
    Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? []).filter(
      (element) => !element.hasAttribute('hidden'),
    )

  function onKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      event.preventDefault()
      onEscape()
      return
    }
    if (event.key !== 'Tab') return

    const items = focusable()
    if (items.length === 0) return void event.preventDefault()

    const first = items[0]!
    const last = items[items.length - 1]!
    const current = document.activeElement
    const isOutside = !panel.value?.contains(current)

    if (event.shiftKey && (current === first || isOutside)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (current === last || isOutside)) {
      event.preventDefault()
      first.focus()
    }
  }

  function activate() {
    if (isActive) return
    isActive = true
    opener = document.activeElement instanceof HTMLElement ? document.activeElement : null
    previousOverflow = document.documentElement.style.overflow
    document.documentElement.style.overflow = 'hidden'
    document.addEventListener('keydown', onKeydown)
  }

  function release() {
    if (!isActive) return
    isActive = false
    document.documentElement.style.overflow = previousOverflow
    document.removeEventListener('keydown', onKeydown)
  }

  watch(
    isOpen,
    async (open) => {
      if (open) {
        activate()
        await nextTick()
        ;(focusable()[0] ?? panel.value)?.focus()
        return
      }

      const wasActive = isActive
      release()
      if (wasActive && opener?.isConnected) opener.focus()
      opener = null
    },
    { immediate: true },
  )

  onScopeDispose(release)
}
