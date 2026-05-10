import { describe, expect, it, vi } from 'vitest'
import { useCardNavigation } from './use-card-navigation'

function makeEl(): HTMLElement {
  const el = document.createElement('div')
  el.focus = vi.fn()
  el.scrollIntoView = vi.fn()
  return el
}

describe('useCardNavigation', () => {
  it('starts with no cards and -1 active index', () => {
    const nav = useCardNavigation()
    expect(nav.activeIndex.value).toBe(-1)
    expect(nav.getActiveSection()).toBeNull()
  })

  it('register adds a card', () => {
    const nav = useCardNavigation()
    nav.register({ id: 'b1', section: 'bibs', el: makeEl() })
    expect(nav.cards.value).toHaveLength(1)
  })

  it('next moves through registered cards in order', () => {
    const nav = useCardNavigation()
    const e1 = makeEl()
    const e2 = makeEl()
    nav.register({ id: 'b1', section: 'bibs', el: e1 })
    nav.register({ id: 'b2', section: 'bibs', el: e2 })
    nav.next()
    expect(nav.activeIndex.value).toBe(0)
    expect(e1.focus).toHaveBeenCalled()
    nav.next()
    expect(nav.activeIndex.value).toBe(1)
    expect(e2.focus).toHaveBeenCalled()
    nav.next()
    expect(nav.activeIndex.value).toBe(1)
  })

  it('prev moves backwards and clamps at 0', () => {
    const nav = useCardNavigation()
    nav.register({ id: 'b1', section: 'bibs', el: makeEl() })
    nav.register({ id: 'b2', section: 'bibs', el: makeEl() })
    nav.next()
    nav.next()
    nav.prev()
    expect(nav.activeIndex.value).toBe(0)
    nav.prev()
    expect(nav.activeIndex.value).toBe(0)
  })

  it('getActiveSection returns the section of the active card', () => {
    const nav = useCardNavigation()
    nav.register({ id: 'b1', section: 'bibs', el: makeEl() })
    nav.register({ id: 'c1', section: 'cyclist_clothes', el: makeEl() })
    nav.next()
    expect(nav.getActiveSection()).toBe('bibs')
    nav.next()
    expect(nav.getActiveSection()).toBe('cyclist_clothes')
  })

  it('unregister removes the card and adjusts active index if needed', () => {
    const nav = useCardNavigation()
    nav.register({ id: 'b1', section: 'bibs', el: makeEl() })
    nav.register({ id: 'b2', section: 'bibs', el: makeEl() })
    nav.next()
    nav.next()
    nav.unregister('b2')
    expect(nav.cards.value).toHaveLength(1)
    expect(nav.activeIndex.value).toBe(0)
  })
})
