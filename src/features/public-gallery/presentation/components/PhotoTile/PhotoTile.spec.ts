import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PhotoTile from './PhotoTile.vue'

const photo = { id: 'p1', publicSlug: 'abc', width: 3, height: 4 }

const mountTile = (props: { selected?: boolean; busy?: boolean; plate?: string | null } = {}) =>
  mount(PhotoTile, { props: { photo, selected: false, busy: false, ...props } })

type Wrapper = ReturnType<typeof mountTile>
const openButton = (wrapper: Wrapper) => wrapper.get('.photo-tile__open')
const toggleButton = (wrapper: Wrapper) => wrapper.get('.photo-tile__toggle')

describe('PhotoTile', () => {
  it('has two separate controls: one opens the photo, one puts it in the cart', () => {
    const wrapper = mountTile()

    expect(wrapper.findAll('button')).toHaveLength(2)
    expect(openButton(wrapper).attributes('aria-label')).toBe('Ver foto')
    expect(toggleButton(wrapper).attributes('aria-label')).toBe('Agregar al carrito')
    expect(toggleButton(wrapper).attributes('aria-pressed')).toBe('false')
  })

  it('says it is in the cart, and offers to take it out, when selected', () => {
    const wrapper = mountTile({ selected: true })

    expect(toggleButton(wrapper).attributes('aria-pressed')).toBe('true')
    expect(toggleButton(wrapper).attributes('aria-label')).toBe('Quitar del carrito')
    expect(wrapper.classes()).toContain('photo-tile--selected')
  })

  it('asks to toggle, and not to open, from the checkbox', async () => {
    const wrapper = mountTile()

    await toggleButton(wrapper).trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([['p1']])
    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('asks to open, and not to toggle, from the photo', async () => {
    const wrapper = mountTile()

    await openButton(wrapper).trigger('click')

    expect(wrapper.emitted('open')).toEqual([['p1']])
    expect(wrapper.emitted('toggle')).toBeUndefined()
  })

  it('shows the plate only when it comes from a plate search', () => {
    expect(mountTile().find('.photo-tile__plate').exists()).toBe(false)
    expect(mountTile({ plate: null }).find('.photo-tile__plate').exists()).toBe(false)

    const searched = mountTile({ plate: '127' })
    expect(searched.get('.photo-tile__plate').text()).toBe('#127')
    expect(openButton(searched).attributes('aria-label')).toBe('Ver foto, placa 127')
  })

  it('describes the image by the plate when there is one', () => {
    expect(mountTile().get('img').attributes('alt')).toBe('Foto del evento')
    expect(mountTile({ plate: '127' }).get('img').attributes('alt')).toBe('Foto de la placa 127')
  })

  it('loads the watermarked image lazily', () => {
    const image = mountTile().get('img')

    expect(image.attributes('src')).toBe('http://localhost/cdn/gallery/abc.jpg')
    expect(image.attributes('loading')).toBe('lazy')
  })

  it('says a change is on its way without blocking the next tap', async () => {
    const wrapper = mountTile({ busy: true })

    expect(toggleButton(wrapper).attributes('aria-busy')).toBe('true')
    expect(toggleButton(wrapper).attributes('disabled')).toBeUndefined()

    await toggleButton(wrapper).trigger('click')
    expect(wrapper.emitted('toggle')).toHaveLength(1)
  })
})
