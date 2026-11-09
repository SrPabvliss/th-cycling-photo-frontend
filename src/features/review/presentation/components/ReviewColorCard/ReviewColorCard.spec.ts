import { describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, provide } from 'vue'

vi.mock('../../../composables/mutations/use-apply-color-correction', () => ({
  useApplyColorCorrection: () => ({
    mutateAsync: vi.fn().mockResolvedValue({ changed: true }),
    isPending: { value: false },
  }),
}))

vi.mock('../../../composables/mutations/use-delete-photo-color', () => ({
  useDeletePhotoColor: () => ({
    mutateAsync: vi.fn(),
    isPending: { value: false },
  }),
}))

import { NDialogProvider } from 'naive-ui'
import { CARD_NAV_KEY } from '@/shared/workspace/composables/keys'
import { useWorkspaceCardNavigation } from '@/shared/workspace/composables/use-workspace-card-navigation'
import ReviewColorCard from './ReviewColorCard.vue'
import type { IColorAttribute } from '@/shared/types/photo-detail.types'

const baseColor: IColorAttribute = {
  id: 'c-1',
  region: 'helmet',
  primaryColor: 'rojo',
  primaryColorOriginal: 'rojo',
  primaryWasCorrected: false,
  secondaryColor: null,
  secondaryColorOriginal: null,
  secondaryWasCorrected: false,
  confidence: 0.8,
  source: 'ai',
  cropUrl: null,
}

function mountWithProviders(color: IColorAttribute) {
  const Comp = defineComponent({
    setup() {
      provide(CARD_NAV_KEY, useWorkspaceCardNavigation())
      return () =>
        h(NDialogProvider, null, () =>
          h(ReviewColorCard, {
            color,
            region: 'helmet',
            photoId: 'p-1',
            photoSlug: 'slug-1',
          }),
        )
    },
  })
  return mount(Comp)
}

describe('ReviewColorCard', () => {
  it('renders primary color label in trigger', () => {
    const w = mountWithProviders(baseColor)
    expect(w.text()).toContain('Rojo')
  })

  it('renders manual tag for reviewer source', () => {
    const w = mountWithProviders({ ...baseColor, source: 'reviewer', confidence: null })
    expect(w.text()).toContain('manual')
  })

  it('renders "corregido" indicator on primaryWasCorrected', () => {
    const w = mountWithProviders({
      ...baseColor,
      primaryWasCorrected: true,
      primaryColorOriginal: 'azul',
    })
    expect(w.text()).toContain('corregido')
  })

  it('renders secondary picker even when secondaryColor is null', () => {
    const w = mountWithProviders(baseColor)
    expect(w.text()).toContain('Secundario')
  })
})
