import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import { BRAND_SCREEN_GROUPS } from '../../../constants/brand-screens'
import ScreenCarousel from './ScreenCarousel.vue'

let reducedMotion = false
function setMedia() {
  window.matchMedia = vi.fn((query: string) => ({
    matches: reducedMotion && query.includes('reduce'),
    media: query,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    addListener: vi.fn(),
    removeListener: vi.fn(),
    onchange: null,
    dispatchEvent: vi.fn(),
  })) as unknown as typeof window.matchMedia
}

let hidden = false
const mountCarousel = () => mount(ScreenCarousel, { props: { groups: BRAND_SCREEN_GROUPS } })
const shownNames = (wrapper: ReturnType<typeof mountCarousel>) =>
  wrapper
    .findAll('.screen-carousel__group')
    .filter((group) => group.attributes('aria-hidden') !== 'true')
    .flatMap((group) => group.findAll('h3').map((name) => name.text()))
const marks = (wrapper: ReturnType<typeof mountCarousel>) =>
  wrapper.findAll('.screen-carousel__mark')

describe('ScreenCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    reducedMotion = false
    hidden = false
    setMedia()
    Object.defineProperty(document, 'hidden', { configurable: true, get: () => hidden })
  })
  afterEach(() => vi.useRealTimers())

  it('shows the first three screens, each with its name and phrase', () => {
    const wrapper = mountCarousel()

    expect(shownNames(wrapper)).toEqual(['Galería', 'Búsqueda por placa', 'Eventos'])
    const first = wrapper.find('.screen-carousel__screen')
    expect(first.find('p').text()).toBe('Entre sus fotos, del tamaño de una foto.')
    expect(first.find('[data-test="phone"]').attributes('aria-hidden')).toBe('true')
  })

  it('keeps the three groups in place, the hidden ones away from readers and the keyboard', () => {
    const groups = mountCarousel().findAll('.screen-carousel__group')

    expect(groups).toHaveLength(3)
    expect(groups.map((group) => group.attributes('aria-hidden'))).toEqual([
      undefined,
      'true',
      'true',
    ])
    expect(groups[1]!.attributes('inert')).toBeDefined()
    expect(groups[0]!.attributes('inert')).toBeUndefined()
  })

  it('stacks the three groups in one cell, so the section is as tall as the tallest one', () => {
    const css = readFileSync(
      resolve(
        process.cwd(),
        'src/features/commercial-pages/presentation/components/ScreenCarousel/ScreenCarousel.vue',
      ),
      'utf8',
    )

    expect(css).toMatch(/\.screen-carousel__group \{[^}]*grid-area: 1 \/ 1;/)
    expect(css).toMatch(/\.screen-carousel__group--hidden \{[^}]*visibility: hidden;/)
  })

  it('moves with the arrows, around the end', async () => {
    const wrapper = mountCarousel()
    const next = wrapper.get('button[aria-label="Siguientes"]')
    const previous = wrapper.get('button[aria-label="Anteriores"]')

    await next.trigger('click')
    expect(shownNames(wrapper)).toEqual(['Foto ampliada', 'Inicio', 'Carrito'])
    await previous.trigger('click')
    await previous.trigger('click')
    expect(shownNames(wrapper)).toEqual(['Confirmar pedido', 'Descarga', 'Mis fotos'])
    await next.trigger('click')
    expect(shownNames(wrapper)).toEqual(['Galería', 'Búsqueda por placa', 'Eventos'])
  })

  it('has one mark per group, a button that says which screens it shows', async () => {
    const wrapper = mountCarousel()

    expect(wrapper.get('[role="group"]').attributes('aria-label')).toBe('Más pantallas')
    expect(marks(wrapper).map((mark) => mark.attributes('aria-label'))).toEqual([
      'Ver Galería, Búsqueda por placa, Eventos',
      'Ver Foto ampliada, Inicio, Carrito',
      'Ver Confirmar pedido, Descarga, Mis fotos',
    ])
    expect(marks(wrapper).map((mark) => mark.attributes('aria-pressed'))).toEqual([
      'true',
      'false',
      'false',
    ])

    await marks(wrapper)[2]!.trigger('click')
    expect(shownNames(wrapper)).toEqual(['Confirmar pedido', 'Descarga', 'Mis fotos'])
    expect(marks(wrapper)[2]!.attributes('aria-pressed')).toBe('true')
  })

  it('moves on its own every 5 seconds', async () => {
    const wrapper = mountCarousel()

    await vi.advanceTimersByTimeAsync(5000)
    expect(shownNames(wrapper)).toEqual(['Foto ampliada', 'Inicio', 'Carrito'])
    await vi.advanceTimersByTimeAsync(5000)
    expect(shownNames(wrapper)).toEqual(['Confirmar pedido', 'Descarga', 'Mis fotos'])
  })

  it('stops moving on its own once someone touches an arrow', async () => {
    const wrapper = mountCarousel()

    await wrapper.get('button[aria-label="Siguientes"]').trigger('click')
    await vi.advanceTimersByTimeAsync(15000)

    expect(shownNames(wrapper)).toEqual(['Foto ampliada', 'Inicio', 'Carrito'])
  })

  it('stops moving on its own once someone touches a mark', async () => {
    const wrapper = mountCarousel()

    await marks(wrapper)[0]!.trigger('click')
    await vi.advanceTimersByTimeAsync(15000)

    expect(shownNames(wrapper)).toEqual(['Galería', 'Búsqueda por placa', 'Eventos'])
  })

  it('does not move while the tab is hidden', async () => {
    hidden = true
    const wrapper = mountCarousel()

    await vi.advanceTimersByTimeAsync(15000)
    expect(shownNames(wrapper)).toEqual(['Galería', 'Búsqueda por placa', 'Eventos'])
  })

  it('does not move on its own with reduced motion', async () => {
    reducedMotion = true
    setMedia()
    const wrapper = mountCarousel()

    await vi.advanceTimersByTimeAsync(15000)
    expect(shownNames(wrapper)).toEqual(['Galería', 'Búsqueda por placa', 'Eventos'])
  })

  it('stops its clock when it leaves the page', async () => {
    const wrapper = mountCarousel()
    wrapper.unmount()

    expect(vi.getTimerCount()).toBe(0)
  })
})
