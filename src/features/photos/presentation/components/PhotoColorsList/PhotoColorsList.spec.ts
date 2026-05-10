import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { IColorAttribute } from '@/features/photos/types/responses/photo-detail.response'
import PhotoColorsList from './PhotoColorsList.vue'

const buildColor = (overrides: Partial<IColorAttribute> = {}): IColorAttribute => ({
  id: 'c1',
  region: 'helmet',
  primaryColor: 'rojo',
  secondaryColor: null,
  confidence: 0.9,
  source: 'ai',
  cropUrl: 'https://signed/crop.jpg',
  primaryColorOriginal: 'rojo',
  primaryWasCorrected: false,
  secondaryColorOriginal: null,
  secondaryWasCorrected: false,
  ...overrides,
})

describe('PhotoColorsList', () => {
  it('groups items by region in canonical order helmet → clothes → bicycle', () => {
    const wrapper = mount(PhotoColorsList, {
      props: {
        colors: [
          buildColor({ id: 'c1', region: 'bicycle', primaryColor: 'negro' }),
          buildColor({ id: 'c2', region: 'helmet', primaryColor: 'rojo' }),
          buildColor({ id: 'c3', region: 'cyclist_clothes', primaryColor: 'azul' }),
        ],
      },
    })
    const groups = wrapper.findAll('.photo-colors-list__group-title')
    expect(groups).toHaveLength(3)
    expect(groups[0]!.text()).toBe('Casco')
    expect(groups[1]!.text()).toBe('Ropa')
    expect(groups[2]!.text()).toBe('Bicicleta')
  })

  it('omits regions without items', () => {
    const wrapper = mount(PhotoColorsList, {
      props: { colors: [buildColor({ region: 'helmet' })] },
    })
    const groups = wrapper.findAll('.photo-colors-list__group-title')
    expect(groups).toHaveLength(1)
    expect(groups[0]!.text()).toBe('Casco')
  })

  it('renders secondary color chip when present', () => {
    const wrapper = mount(PhotoColorsList, {
      props: {
        colors: [buildColor({ primaryColor: 'rojo', secondaryColor: 'blanco' })],
      },
    })
    expect(wrapper.text()).toContain('rojo')
    expect(wrapper.text()).toContain('blanco')
  })
})
