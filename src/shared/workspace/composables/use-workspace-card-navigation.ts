import { ref } from 'vue'

export type CardSection = 'bibs' | 'helmet' | 'cyclist_clothes' | 'bicycle'

export interface CardRef {
  id: string
  section: CardSection
  el: HTMLElement
}

/** Mount/register order isn't reliable across photo changes — sort by DOM. */
function sortByDocumentPosition(items: CardRef[]): CardRef[] {
  return items.slice().sort((a, b) => {
    if (!a.el || !b.el) return 0
    if (a.el === b.el) return 0
    const cmp = a.el.compareDocumentPosition(b.el)
    if (cmp === 0 || cmp & Node.DOCUMENT_POSITION_DISCONNECTED) return 0
    if (cmp & Node.DOCUMENT_POSITION_FOLLOWING) return -1
    if (cmp & Node.DOCUMENT_POSITION_PRECEDING) return 1
    return 0
  })
}

export function useWorkspaceCardNavigation() {
  const cards = ref<CardRef[]>([])
  const activeIndex = ref<number>(-1)

  function reorder() {
    cards.value = sortByDocumentPosition(cards.value)
  }

  function register(card: CardRef) {
    const existing = cards.value.findIndex((c) => c.id === card.id)
    if (existing >= 0) {
      cards.value.splice(existing, 1)
    }
    cards.value.push(card)
    reorder()
  }

  function unregister(id: string) {
    const idx = cards.value.findIndex((c) => c.id === id)
    if (idx === -1) return
    cards.value.splice(idx, 1)
    if (activeIndex.value >= cards.value.length) {
      activeIndex.value = cards.value.length === 0 ? -1 : cards.value.length - 1
    }
  }

  function reset() {
    cards.value = []
    activeIndex.value = -1
  }

  function focusActive() {
    const card = cards.value[activeIndex.value]
    if (!card) return
    card.el.focus()
    card.el.scrollIntoView({ block: 'nearest' })
  }

  function next() {
    if (cards.value.length === 0) return
    reorder()
    if (activeIndex.value === -1) {
      activeIndex.value = 0
    } else if (activeIndex.value < cards.value.length - 1) {
      activeIndex.value++
    }
    focusActive()
  }

  function prev() {
    if (cards.value.length === 0) return
    reorder()
    if (activeIndex.value === -1) {
      activeIndex.value = 0
    } else if (activeIndex.value > 0) {
      activeIndex.value--
    }
    focusActive()
  }

  function getActiveSection(): CardSection | null {
    return cards.value[activeIndex.value]?.section ?? null
  }

  return {
    cards,
    activeIndex,
    register,
    unregister,
    reset,
    next,
    prev,
    getActiveSection,
  }
}

export type ICardNavigation = ReturnType<typeof useWorkspaceCardNavigation>
/** @deprecated use ICardNavigation */
export type UseCardNavigationReturn = ICardNavigation
