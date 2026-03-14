import { onMounted, onUnmounted } from 'vue'

const IGNORED_TAGS = new Set(['INPUT', 'TEXTAREA', 'SELECT'])

export function useKeyboardNavigation(
  goNext: () => void,
  goPrev: () => void,
  onClassifyAndAdvance?: () => void,
) {
  function handleKeyDown(e: KeyboardEvent) {
    const target = e.target as HTMLElement
    if (IGNORED_TAGS.has(target.tagName)) return

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault()
      goNext()
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault()
      goPrev()
    } else if ((e.key === 'Enter' || e.key === 'c') && onClassifyAndAdvance) {
      e.preventDefault()
      onClassifyAndAdvance()
    }
  }

  onMounted(() => window.addEventListener('keydown', handleKeyDown))
  onUnmounted(() => window.removeEventListener('keydown', handleKeyDown))
}
