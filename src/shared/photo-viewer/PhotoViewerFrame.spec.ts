import { afterEach, describe, expect, it, vi } from 'vitest'
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

type Finger = [x: number, y: number]
function touch(type: string, fingers: Finger[], at: number, lifted: Finger[] = []) {
  const event = new Event(type, { bubbles: true, cancelable: true })
  const points = (list: Finger[]) => list.map(([clientX, clientY]) => ({ clientX, clientY }))
  Object.defineProperties(event, {
    touches: { value: points(fingers) },
    changedTouches: { value: points(lifted.length > 0 ? lifted : fingers) },
    timeStamp: { value: at },
  })
  return event
}

/** One finger across the photo, the way a phone gallery is swiped. */
function swipe(from: Finger, to: Finger) {
  const stage = document.body.querySelector('.photo-viewer__stage')!
  stage.dispatchEvent(touch('touchstart', [from], 0))
  stage.dispatchEvent(touch('touchmove', [to], 300))
  stage.dispatchEvent(touch('touchend', [], 600, [to]))
}

function doubleTap(at: Finger) {
  const stage = document.body.querySelector('.photo-viewer__stage')!
  for (const start of [1000, 1150]) {
    stage.dispatchEvent(touch('touchstart', [at], start))
    stage.dispatchEvent(touch('touchend', [], start + 50, [at]))
  }
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

  it('keeps the focus on the other arrow when the one used reaches the end', async () => {
    const body = await mountFrame()
    const previous = body.get('button[aria-label="Foto anterior"]')
    ;(previous.element as HTMLButtonElement).focus()

    await previous.trigger('click')
    await wrapper!.setProps({ photoId: 'a' })
    await flushPromises()

    expect(document.activeElement?.getAttribute('aria-label')).toBe('Foto siguiente')
  })

  it('moves to the next and the previous photo by swiping', async () => {
    await mountFrame()

    swipe([300, 200], [100, 200])
    swipe([100, 200], [300, 200])

    expect(wrapper!.emitted('update:photoId')).toEqual([['c'], ['a']])
  })

  it('asks for the next page when swiped past the last loaded photo, and moves on', async () => {
    const fetchNextPage = vi.fn(async () => {
      await wrapper!.setProps({ photos: [...PHOTOS, { id: 'd', src: 'u/d', alt: 'Foto D' }] })
    })
    wrapper = mount(PhotoViewerFrame, {
      attachTo: document.body,
      props: { photos: PHOTOS, photoId: 'c', label: 'Foto', hasNextPage: true, fetchNextPage },
    })
    await flushPromises()

    swipe([300, 200], [100, 200])
    await flushPromises()

    expect(fetchNextPage).toHaveBeenCalledOnce()
    expect(wrapper.emitted('update:photoId')).toEqual([['d']])
  })

  it('zooms into the photo with a double tap, and then a swipe moves around it', async () => {
    const body = await mountFrame()

    doubleTap([200, 200])
    await flushPromises()
    expect(body.get('img').attributes('style')).toContain('scale(2.5)')

    swipe([300, 200], [100, 200])
    expect(wrapper!.emitted('update:photoId')).toBeUndefined()
  })

  it('shows every photo at its own size: the zoom does not carry over', async () => {
    const body = await mountFrame()
    doubleTap([200, 200])
    await flushPromises()

    await wrapper!.setProps({ photoId: 'c' })

    expect(body.get('img').attributes('style') ?? '').not.toContain('scale')
  })
})
