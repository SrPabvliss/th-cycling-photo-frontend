import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { h, defineComponent, provide } from 'vue'

vi.mock('../../../composables/mutations/use-apply-bib-correction', () => ({
  useApplyBibCorrection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ changed: true }),
    isPending: { value: false },
  }),
}))

import { CARD_NAV_KEY } from '@/features/workspace/composables/keys'
import { useWorkspaceCardNavigation } from '@/features/workspace/composables/use-workspace-card-navigation'
import ReviewBibCard from './ReviewBibCard.vue'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'

const baseBib: IBibAttribute = {
  id: 'b-1',
  digits: '42',
  digitsOriginal: '42',
  wasCorrected: false,
  correctedAt: null,
  status: 'read',
  confidence: 0.9,
  source: 'ai',
  cropUrl: 'https://cdn/x.jpg',
}

function mountWithProviders(bib: IBibAttribute) {
  const Comp = defineComponent({
    setup() {
      provide(CARD_NAV_KEY, useWorkspaceCardNavigation())
      return () => h(ReviewBibCard, { bib, photoId: 'p-1', photoSlug: 'slug-1' })
    },
  })
  return mount(Comp)
}

describe('ReviewBibCard', () => {
  it('renders digits', () => {
    const w = mountWithProviders(baseBib)
    expect(w.text()).toContain('42')
  })

  it('renders confidence tag for ai source', () => {
    const w = mountWithProviders(baseBib)
    expect(w.text()).toMatch(/Alta|Media|Baja/)
  })

  it('renders manual tag for reviewer source', () => {
    const w = mountWithProviders({ ...baseBib, source: 'reviewer', confidence: null })
    expect(w.text()).toContain('manual')
  })

  it('renders "Corregido" indicator when wasCorrected is true', () => {
    const w = mountWithProviders({
      ...baseBib,
      wasCorrected: true,
      digits: '42',
      digitsOriginal: '24',
    })
    expect(w.text()).toContain('Corregido')
  })

  it('starts in idle state by default', () => {
    const w = mountWithProviders(baseBib)
    expect(w.html()).toContain('is-idle')
  })
})
