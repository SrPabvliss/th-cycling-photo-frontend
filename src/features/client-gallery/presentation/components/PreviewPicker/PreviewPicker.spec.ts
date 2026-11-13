import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { ref } from 'vue'

import { usePhotoSelection } from '../../../composables/use-photo-selection'
import type { IPreviewData } from '../../../types/responses/preview-data.response'
import PreviewPicker from './PreviewPicker.vue'

const PREVIEW: IPreviewData = {
  token: 't',
  eventId: 'e1',
  eventTypeId: 1,
  organizerName: 'Titan Racing',
  eventName: 'Mama Rumi 2026',
  startDate: new Date(2026, 9, 4),
  endDate: new Date(2026, 9, 5),
  status: 'active',
  expiresAt: new Date(2026, 11, 1),
  photos: [
    { id: 'a', url: 'u/a' },
    { id: 'b', url: 'u/b' },
    { id: 'c', url: 'u/c' },
  ],
}

function mountPicker() {
  sessionStorage.clear()
  const selection = usePhotoSelection(ref('t'), ref(['a', 'b', 'c']))
  const wrapper = mount(PreviewPicker, { props: { preview: PREVIEW, selection } })
  return { wrapper, selection }
}

describe('PreviewPicker', () => {
  it('says whose photos these are and who shared them', () => {
    const { wrapper } = mountPicker()

    expect(wrapper.text()).toContain('Vista previa privada · 4 al 5 de octubre de 2026')
    expect(wrapper.get('h1').text()).toBe('Tus fotos de Mama Rumi 2026')
    expect(wrapper.text()).toContain(
      'Titan Racing te compartió estas fotos. Elige las que quieras comprar.',
    )
    expect(wrapper.text()).toContain('3 fotos')
    expect(wrapper.findAll('button[aria-label="Ver foto"]')).toHaveLength(3)
  })

  it('picks every photo, and then offers to take them all out', async () => {
    const { wrapper, selection } = mountPicker()

    await wrapper
      .findAll('button')
      .find((each) => each.text() === 'Elegir todas')!
      .trigger('click')

    expect(selection.selected.value).toEqual(['a', 'b', 'c'])
    expect(wrapper.findAll('button').some((each) => each.text() === 'Quitar todas')).toBe(true)
  })

  it('picks one photo from its box without opening it', async () => {
    const { wrapper, selection } = mountPicker()

    await wrapper.findAll('button[aria-pressed]')[1]!.trigger('click')

    expect(selection.selected.value).toEqual(['b'])
    expect(wrapper.emitted('open')).toBeUndefined()
  })

  it('asks to open a photo', async () => {
    const { wrapper } = mountPicker()

    await wrapper.findAll('button[aria-label="Ver foto"]')[2]!.trigger('click')

    expect(wrapper.emitted('open')).toEqual([['c']])
  })
})
