import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'
import PhotoBibsGrid from './PhotoBibsGrid.vue'

const buildBib = (overrides: Partial<IBibAttribute> = {}): IBibAttribute => ({
  id: 'b1',
  digits: '20',
  status: 'read',
  confidence: 0.9,
  source: 'ai',
  cropUrl: 'https://signed/crop.jpg',
  digitsOriginal: '20',
  wasCorrected: false,
  correctedAt: null,
  correctedByName: null,
  ...overrides,
})

describe('PhotoBibsGrid', () => {
  it('renders one card per bib', () => {
    const wrapper = mount(PhotoBibsGrid, {
      props: {
        bibs: [buildBib({ id: 'b1', digits: '20' }), buildBib({ id: 'b2', digits: '47' })],
      },
    })
    expect(wrapper.findAll('.photo-bibs-grid__card')).toHaveLength(2)
    expect(wrapper.text()).toContain('20')
    expect(wrapper.text()).toContain('47')
  })

  it('shows manual badge for reviewer-source bibs', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ source: 'reviewer' })] } })
    expect(wrapper.text()).toContain('manual')
  })

  it('does not show manual badge for ai-source bibs', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ source: 'ai' })] } })
    expect(wrapper.text()).not.toContain('manual')
  })

  it('renders "Alta" confidence tag when confidence ≥ 0.85', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ confidence: 0.92 })] } })
    expect(wrapper.text()).toContain('Alta')
  })

  it('renders "Media" confidence tag when 0.5 ≤ confidence < 0.85', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ confidence: 0.6 })] } })
    expect(wrapper.text()).toContain('Media')
  })

  it('renders "Baja" confidence tag when confidence < 0.5', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ confidence: 0.3 })] } })
    expect(wrapper.text()).toContain('Baja')
  })

  it('renders "Baja" when confidence is null', () => {
    const wrapper = mount(PhotoBibsGrid, { props: { bibs: [buildBib({ confidence: null })] } })
    expect(wrapper.text()).toContain('Baja')
  })
})
