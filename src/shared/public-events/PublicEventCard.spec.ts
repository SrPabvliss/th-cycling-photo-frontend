import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { createMemoryHistory, createRouter } from 'vue-router'

import PublicEventCard from './PublicEventCard.vue'
import PublicEventCardSkeleton from './PublicEventCardSkeleton.vue'
import type { IPublicEventListItem } from './public-event.types'

const Stub = { render: () => null }

function event(overrides: Partial<IPublicEventListItem> = {}): IPublicEventListItem {
  return {
    slug: 'mama-rumi-2026',
    name: 'Mama Rumi 2026',
    startDate: '2026-10-04',
    endDate: '2026-10-05',
    placeLabel: 'Baños, Tungurahua',
    photoCount: 1240,
    ownerName: 'Titan TV',
    coverUrl: 'http://localhost/cdn/assets/cover-sm/cover-abc.jpg',
    eventTypeId: 3,
    eventTypeName: 'Downhill',
    ...overrides,
  }
}

async function mountCard(overrides: Partial<IPublicEventListItem> = {}) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push('/')
  return mount(PublicEventCard, {
    props: { event: event(overrides) },
    global: { plugins: [router] },
  })
}

describe('PublicEventCard', () => {
  it('links to the gallery of the event', async () => {
    const wrapper = await mountCard()

    expect(wrapper.element.tagName).toBe('A')
    expect(wrapper.attributes('href')).toBe('/gallery/mama-rumi-2026')
  })

  it('names the link with the event, the place and the date', async () => {
    const wrapper = await mountCard()

    expect(wrapper.attributes('aria-label')).toBe(
      'Mama Rumi 2026, Baños, Tungurahua, 4 al 5 de octubre de 2026',
    )
  })

  it('counts the photos the way people write numbers in Ecuador', async () => {
    expect((await mountCard()).get('.event-card__count').text()).toBe('1.240 fotos')
    expect((await mountCard({ photoCount: 1 })).get('.event-card__count').text()).toBe('1 foto')
  })

  it('says the photos are coming when there are none yet', async () => {
    const wrapper = await mountCard({ photoCount: 0 })

    expect(wrapper.get('.event-card__count').text()).toBe('Próximamente')
    expect(wrapper.get('.event-card__count').classes()).toContain('event-card__count--soon')
  })

  it('shows the date block, the name and the place', async () => {
    const wrapper = await mountCard()

    expect(wrapper.get('.event-card__day').text()).toBe('4–5')
    expect(wrapper.get('.event-card__month').text()).toBe('oct')
    expect(wrapper.get('.event-card__name').text()).toBe('Mama Rumi 2026')
    expect(wrapper.get('.event-card__place').text()).toBe('Baños, Tungurahua')
  })

  it('leaves the place out, with no comma and no "undefined", when the event has none', async () => {
    const wrapper = await mountCard({ placeLabel: null })

    expect(wrapper.find('.event-card__place').exists()).toBe(false)
    expect(wrapper.attributes('aria-label')).toBe('Mama Rumi 2026, 4 al 5 de octubre de 2026')
    expect(wrapper.text()).not.toContain('undefined')
    expect(wrapper.text()).not.toContain('null')
  })

  it('draws the cover as decoration', async () => {
    const cover = (await mountCard()).get('img')

    expect(cover.attributes('src')).toBe('http://localhost/cdn/assets/cover-sm/cover-abc.jpg')
    expect(cover.attributes('alt')).toBe('')
  })

  it('has no image, only the reserved space, without a cover', async () => {
    const wrapper = await mountCard({ coverUrl: null })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.find('.event-card__cover').exists()).toBe(true)
  })

  it('falls back to the reserved space when the cover fails to load', async () => {
    const wrapper = await mountCard()

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
  })

  it('holds a name of eighty characters whole in the markup', async () => {
    const name = 'Campeonato Nacional de Downhill Urbano de la Sierra Centro del Ecuador 2026 Fin.'
    const wrapper = await mountCard({ name })

    expect(name).toHaveLength(80)
    expect(wrapper.get('.event-card__name').text()).toBe(name)
  })
})

describe('PublicEventCardSkeleton', () => {
  it('is hidden from assistive technology and shares the frame of the card', () => {
    const wrapper = mount(PublicEventCardSkeleton)

    expect(wrapper.attributes('aria-hidden')).toBe('true')
    expect(wrapper.classes()).toContain('event-card')
    expect(wrapper.find('.event-card__cover').exists()).toBe(true)
  })
})
