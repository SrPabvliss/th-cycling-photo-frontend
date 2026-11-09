import { reactive, ref } from 'vue'

import type { ProfilePendingSection } from './use-profile-completeness'

const HIGHLIGHT_DURATION_MS = 1600

export function useProfileBlockNavigation() {
  const elements = new Map<ProfilePendingSection, HTMLElement>()
  const registeredSections = reactive(new Set<ProfilePendingSection>())
  const highlighted = ref<ProfilePendingSection | null>(null)
  let highlightTimer: ReturnType<typeof setTimeout> | undefined

  function registerSection(section: ProfilePendingSection, el: Element | null) {
    if (el instanceof HTMLElement) {
      elements.set(section, el)
      registeredSections.add(section)
    } else {
      elements.delete(section)
      registeredSections.delete(section)
    }
  }

  function scrollToSection(section: ProfilePendingSection) {
    const el = elements.get(section)
    if (!el) return

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    el.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'center' })

    highlighted.value = section
    if (highlightTimer) clearTimeout(highlightTimer)
    highlightTimer = setTimeout(() => {
      highlighted.value = null
    }, HIGHLIGHT_DURATION_MS)
  }

  return { registerSection, registeredSections, scrollToSection, highlighted }
}
