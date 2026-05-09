import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import AttributeCropImage from './AttributeCropImage.vue'

describe('AttributeCropImage', () => {
  it('renders an <img> when cropUrl is provided', () => {
    const wrapper = mount(AttributeCropImage, {
      props: { cropUrl: 'https://signed/crop.jpg', alt: 'Placa 20' },
    })
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toBe('https://signed/crop.jpg')
    expect(img.attributes('alt')).toBe('Placa 20')
  })

  it('renders fallback when cropUrl is null', () => {
    const wrapper = mount(AttributeCropImage, {
      props: { cropUrl: null, alt: 'Placa 20' },
    })
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Crop no disponible')
  })

  it('falls back when image fails to load', async () => {
    const wrapper = mount(AttributeCropImage, {
      props: { cropUrl: 'https://signed/crop.jpg', alt: 'Placa 20' },
    })
    await wrapper.find('img').trigger('error')
    expect(wrapper.find('img').exists()).toBe(false)
    expect(wrapper.text()).toContain('Crop no disponible')
  })
})
