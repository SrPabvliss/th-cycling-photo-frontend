import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import PreviewTile from './PreviewTile.vue'

const photo = { id: 'p1', url: 'https://cdn/wm/p1.jpg' }

describe('PreviewTile', () => {
  it('opens the photo from its picture and picks it from its box', async () => {
    const wrapper = mount(PreviewTile, { props: { photo, selected: false } })

    await wrapper.get('button[aria-label="Ver foto"]').trigger('click')
    expect(wrapper.emitted('open')).toEqual([['p1']])

    const box = wrapper.get('button[aria-pressed]')
    expect(box.attributes('aria-label')).toBe('Elegir foto')
    expect(box.attributes('aria-pressed')).toBe('false')
    await box.trigger('click')
    expect(wrapper.emitted('toggle')).toEqual([['p1']])
    expect(wrapper.emitted('open')).toHaveLength(1)
  })

  it('says a chosen photo can be taken out', () => {
    const box = mount(PreviewTile, { props: { photo, selected: true } }).get('button[aria-pressed]')

    expect(box.attributes('aria-label')).toBe('Quitar foto')
    expect(box.attributes('aria-pressed')).toBe('true')
  })
})
