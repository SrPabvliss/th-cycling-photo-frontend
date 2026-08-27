import { inject, onMounted, onUnmounted, type Ref } from 'vue'

import { CARD_NAV_KEY } from './keys'
import type { CardSection } from './use-workspace-card-navigation'

/** Wires a card root ref into cardNav: registers on mount, unregisters on unmount. */
export function useWorkspaceCardRegistration(
  id: string,
  section: CardSection,
  cardEl: Ref<HTMLElement | undefined>,
) {
  const cardNav = inject(CARD_NAV_KEY)!

  onMounted(() => {
    if (cardEl.value) cardNav.register({ id, section, el: cardEl.value })
  })
  onUnmounted(() => cardNav.unregister(id))
}
