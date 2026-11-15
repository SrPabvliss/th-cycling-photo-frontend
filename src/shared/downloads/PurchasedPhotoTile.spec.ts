import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PurchasedPhotoTile from './PurchasedPhotoTile.vue'

const props = (overrides = {}) => ({
  thumbnailUrl: 'https://cdn/thumb/p1.jpg',
  filename: 'mama-rumi-0123.jpg',
  canDownload: true,
  busy: false,
  ...overrides,
})

describe('PurchasedPhotoTile', () => {
  it('shows the thumbnail, lazily', () => {
    const image = mount(PurchasedPhotoTile, { props: props() }).get('img')

    expect(image.attributes('src')).toBe('https://cdn/thumb/p1.jpg')
    expect(image.attributes('alt')).toBe('Foto comprada')
    expect(image.attributes('loading')).toBe('lazy')
  })

  it('draws a placeholder with the file name without a thumbnail', () => {
    const wrapper = mount(PurchasedPhotoTile, { props: props({ thumbnailUrl: null }) })

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('mama-rumi-0123.jpg')
  })

  it('switches to the placeholder when the thumbnail fails', async () => {
    const wrapper = mount(PurchasedPhotoTile, { props: props() })

    await wrapper.get('img').trigger('error')

    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('mama-rumi-0123.jpg')
  })

  it('offers the download, busy while it runs', async () => {
    const wrapper = mount(PurchasedPhotoTile, { props: props() })

    const button = wrapper.get('button[aria-label="Descargar foto"]')
    await button.trigger('click')
    expect(wrapper.emitted('download')).toHaveLength(1)

    const busy = mount(PurchasedPhotoTile, { props: props({ busy: true }) })
    expect(busy.get('button[aria-label="Descargar foto"]').attributes('aria-busy')).toBe('true')
  })

  it('has no download without permission', () => {
    const wrapper = mount(PurchasedPhotoTile, { props: props({ canDownload: false }) })

    expect(wrapper.find('button').exists()).toBe(false)
  })
})
