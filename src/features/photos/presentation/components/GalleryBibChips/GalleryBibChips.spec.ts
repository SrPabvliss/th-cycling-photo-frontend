import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GalleryBibChips from './GalleryBibChips.vue'

const READ_BIB = {
  digits: '100',
  source: 'ai' as const,
  confidence: 0.92,
  status: 'read' as const,
  corrected: false,
}

describe('GalleryBibChips', () => {
  it('says the photo is still being read while it waits in the queue', () => {
    const wrapper = mount(GalleryBibChips, { props: { bibs: [], status: 'pending' } })

    expect(wrapper.text()).toContain('Procesando')
    expect(wrapper.text()).not.toContain('Sin dorsal')
  })

  it('says the same while the AI is actually working on it', () => {
    const wrapper = mount(GalleryBibChips, { props: { bibs: [], status: 'processing' } })

    expect(wrapper.text()).toContain('Procesando')
  })

  it('only claims there is no bib once the photo came back processed', () => {
    const wrapper = mount(GalleryBibChips, { props: { bibs: [], status: 'processed' } })

    expect(wrapper.text()).toContain('Sin dorsal')
  })

  it('reports a failed read as failed, not as a photo without a bib', () => {
    const wrapper = mount(GalleryBibChips, { props: { bibs: [], status: 'failed' } })

    expect(wrapper.text()).not.toContain('Sin dorsal')
    expect(wrapper.text()).toContain('No se pudo leer')
  })

  it('shows the digits when the photo has a bib', () => {
    const wrapper = mount(GalleryBibChips, { props: { bibs: [READ_BIB], status: 'processed' } })

    expect(wrapper.text()).toContain('100')
  })
})
