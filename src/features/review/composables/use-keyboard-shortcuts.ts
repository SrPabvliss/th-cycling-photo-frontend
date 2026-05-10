import { onMounted, onUnmounted } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { CardSection } from './use-card-navigation'

export interface ShortcutHandlers {
  onSaveAdvance: () => void
  onSaveCard: () => void
  onCancelEdit: () => void
  onNextCard: () => void
  onPrevCard: () => void
  onNextPhoto: () => void
  onPrevPhoto: () => void
  /** 1/2/3 only fire in compare mode (Original / Comparar / Retocada). */
  onJumpSection: (section: CardSection) => void
  onAddManual: () => void
  onShowCrop: () => void
  onTogglePending: () => void
  onDownload: () => void
  onUpload: () => void
  onResetZoom: () => void
  onToggleCompare: () => void
  onShowCheatsheet: () => void
  onExit: () => void
}

export function useKeyboardShortcuts(handlers: ShortcutHandlers) {
  const isMobile = useMediaQuery('(max-width: 880px)')

  function isInInput(target: EventTarget | null): boolean {
    if (!target) return false
    const el = target as HTMLElement
    return el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable === true
  }

  function onKey(e: KeyboardEvent) {
    const inInput = isInInput(e.target)

    if (e.key === '?' && !inInput) {
      e.preventDefault()
      return handlers.onShowCheatsheet()
    }

    if (inInput) {
      if (e.key === 'Escape') return handlers.onCancelEdit()
      // Cmd+Enter is global save+advance; from an input only plain Enter saves.
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault()
        return handlers.onSaveCard()
      }
      return
    }

    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault()
      return handlers.onSaveAdvance()
    }

    if (e.key === ' ') {
      e.preventDefault()
      return handlers.onShowCrop()
    }

    // Plain Esc closes pickers/lightbox/pending edits; only Cmd+Esc exits.
    if ((e.metaKey || e.ctrlKey) && e.key === 'Escape') {
      e.preventDefault()
      return handlers.onExit()
    }

    const mapping: Record<string, () => void> = {
      ArrowUp: handlers.onPrevCard,
      ArrowDown: handlers.onNextCard,
      ArrowRight: handlers.onNextPhoto,
      ArrowLeft: handlers.onPrevPhoto,
      '1': () => handlers.onJumpSection('bibs'),
      '2': () => handlers.onJumpSection('helmet'),
      '3': () => handlers.onJumpSection('cyclist_clothes'),
      a: handlers.onAddManual,
      A: handlers.onAddManual,
      f: handlers.onTogglePending,
      F: handlers.onTogglePending,
      d: handlers.onDownload,
      D: handlers.onDownload,
      u: handlers.onUpload,
      U: handlers.onUpload,
      z: handlers.onResetZoom,
      Z: handlers.onResetZoom,
      c: handlers.onToggleCompare,
      C: handlers.onToggleCompare,
    }
    mapping[e.key]?.()
  }

  onMounted(() => {
    if (!isMobile.value) {
      window.addEventListener('keydown', onKey)
    }
  })

  onUnmounted(() => {
    window.removeEventListener('keydown', onKey)
  })
}
