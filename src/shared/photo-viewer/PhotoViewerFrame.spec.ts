import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'

import PhotoViewerFrame from './PhotoViewerFrame.vue'

const PHOTOS = [
  { id: 'a', src: 'u/a', alt: 'Foto A' },
  { id: 'b', src: 'u/b', alt: 'Foto B' },
  { id: 'c', src: 'u/c', alt: 'Foto C' },
]

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
})

async function mountFrame(photoId = 'b') {
  wrapper = mount(PhotoViewerFrame, {
    attachTo: document.body,
    props: { photos: PHOTOS, photoId, label: 'Foto ampliada' },
    slots: { badge: '<span class="badge">Placa</span>', footer: '<p class="footer">Pie</p>' },
  })
  await flushPromises()
  return new DOMWrapper(document.body)
}

const key = (name: string) =>
  document.dispatchEvent(new KeyboardEvent('keydown', { key: name, bubbles: true }))

describe('PhotoViewerFrame', () => {
  it('is a labelled dialog with the photo, its badge and its footer', async () => {
    const body = await mountFrame()

    expect(body.get('[role="dialog"]').attributes('aria-label')).toBe('Foto ampliada')
    expect(body.get('img').attributes('src')).toBe('u/b')
    expect(body.find('.badge').exists()).toBe(true)
    expect(body.find('.footer').exists()).toBe(true)
  })

  it('closes with Escape and with its button', async () => {
    const body = await mountFrame()

    key('Escape')
    await body.get('button[aria-label="Cerrar"]').trigger('click')

    expect(wrapper!.emitted('close')).toHaveLength(2)
  })

  it('moves with the arrow keys and its buttons, without wrapping around', async () => {
    const body = await mountFrame()

    key('ArrowRight')
    key('ArrowLeft')
    await flushPromises()
    expect(wrapper!.emitted('update:photoId')).toEqual([['c'], ['a']])

    await wrapper!.setProps({ photoId: 'a' })
    expect(body.get('button[aria-label="Foto anterior"]').attributes('disabled')).toBeDefined()
  })
})
