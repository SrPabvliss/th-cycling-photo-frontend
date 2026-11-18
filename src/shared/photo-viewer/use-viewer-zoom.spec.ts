import { afterEach, describe, expect, it } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'

import { useViewerZoom } from './use-viewer-zoom'

type Finger = [x: number, y: number]

// A 400 × 600 stage at the corner of the screen, with a photo that fills its width: 400 × 300.
const BOX = { left: 0, top: 0, width: 400, height: 600, imageWidth: 400, imageHeight: 300 }
const CENTRE: Finger = [200, 300]

function touch(type: string, fingers: Finger[], at = 0): Event {
  const event = new Event(type, { cancelable: true })
  Object.defineProperties(event, {
    touches: { value: fingers.map(([clientX, clientY]) => ({ clientX, clientY })) },
    timeStamp: { value: at },
  })
  return event
}

let scope: EffectScope | null = null
afterEach(() => {
  scope?.stop()
  scope = null
})

function setup() {
  const element = document.createElement('div')
  const button = document.createElement('button')
  element.append(button)
  document.body.append(element)
  scope = effectScope()
  const zoom = scope.run(() => useViewerZoom(ref(element), { measure: () => BOX }))!

  let clock = 1000
  function tap(at: Finger, target: HTMLElement = element) {
    clock += 100
    target.dispatchEvent(Object.assign(touch('touchstart', [at], clock), {}))
    const end = touch('touchend', [], clock + 50)
    target.dispatchEvent(end)
    return end
  }
  function doubleTap(at: Finger, target: HTMLElement = element) {
    tap(at, target)
    return tap(at, target)
  }
  function pinch(from: [Finger, Finger], to: [Finger, Finger]) {
    element.dispatchEvent(touch('touchstart', from))
    element.dispatchEvent(touch('touchmove', to))
    element.dispatchEvent(touch('touchend', []))
  }
  function drag(from: Finger, to: Finger) {
    element.dispatchEvent(touch('touchstart', [from], 0))
    element.dispatchEvent(touch('touchmove', [to], 400))
    element.dispatchEvent(touch('touchend', [], 800))
  }

  return { element, button, zoom, tap, doubleTap, pinch, drag }
}

describe('useViewerZoom', () => {
  it('starts at the size of the photo', () => {
    const { zoom } = setup()

    expect(zoom.scale.value).toBe(1)
    expect(zoom.isZoomed.value).toBe(false)
  })

  it('zooms in with a double tap and back out with another', () => {
    const { zoom, doubleTap } = setup()

    const second = doubleTap(CENTRE)
    expect(zoom.scale.value).toBe(2.5)
    expect(zoom.isZoomed.value).toBe(true)
    // The browser must not take the second tap for its own zoom, nor for a click.
    expect(second.defaultPrevented).toBe(true)

    doubleTap(CENTRE)
    expect(zoom.scale.value).toBe(1)
    expect([zoom.x.value, zoom.y.value]).toEqual([0, 0])
  })

  it('zooms into where the finger tapped', () => {
    const { zoom, doubleTap } = setup()
    // 100px to the right of the centre: that spot stays under the finger.
    doubleTap([300, 300])

    expect(zoom.x.value).toBe(-150)
    expect(zoom.y.value).toBe(0)
  })

  it('takes a single tap, or two far apart, for nothing', () => {
    const { zoom, tap } = setup()
    tap(CENTRE)
    tap([350, 500])

    expect(zoom.scale.value).toBe(1)
  })

  it('does not zoom when the arrows are pressed twice in a row', () => {
    const { zoom, button, doubleTap } = setup()
    doubleTap(CENTRE, button)

    expect(zoom.scale.value).toBe(1)
  })

  it('zooms with a pinch, as far as the fingers open', () => {
    const { zoom, pinch } = setup()
    pinch(
      [
        [150, 300],
        [250, 300],
      ],
      [
        [100, 300],
        [300, 300],
      ],
    )

    expect(zoom.scale.value).toBe(2)
    expect([zoom.x.value, zoom.y.value]).toEqual([0, 0])
  })

  it('keeps the pinch between the size of the photo and four times it', () => {
    const { zoom, pinch } = setup()
    pinch(
      [
        [190, 300],
        [210, 300],
      ],
      [
        [0, 300],
        [400, 300],
      ],
    )
    expect(zoom.scale.value).toBe(4)

    pinch(
      [
        [0, 300],
        [400, 300],
      ],
      [
        [195, 300],
        [205, 300],
      ],
    )
    expect(zoom.scale.value).toBe(1)
    expect(zoom.isZoomed.value).toBe(false)
  })

  it('keeps the page from zooming while the photo is pinched', () => {
    const { element } = setup()
    element.dispatchEvent(
      touch('touchstart', [
        [150, 300],
        [250, 300],
      ]),
    )
    const move = touch('touchmove', [
      [100, 300],
      [300, 300],
    ])
    element.dispatchEvent(move)

    expect(move.defaultPrevented).toBe(true)
  })

  it('moves the zoomed photo with one finger, no further than its edge', () => {
    const { zoom, doubleTap, drag } = setup()
    doubleTap(CENTRE)
    // At 2.5 the photo is 1000 × 750 in a 400 × 600 stage: 300 to each side, 75 up and down.

    drag([200, 300], [260, 320])
    expect([zoom.x.value, zoom.y.value]).toEqual([60, 20])

    drag([200, 300], [900, 900])
    expect([zoom.x.value, zoom.y.value]).toEqual([300, 75])
  })

  it('leaves a drag alone while the photo is at its size', () => {
    const { zoom, element } = setup()
    element.dispatchEvent(touch('touchstart', [[200, 300]]))
    const move = touch('touchmove', [[100, 300]], 300)
    element.dispatchEvent(move)

    expect(move.defaultPrevented).toBe(false)
    expect(zoom.x.value).toBe(0)
    expect(zoom.isGesturing.value).toBe(false)
  })

  it('zooms with a double click and goes back with reset', () => {
    const { zoom, element } = setup()
    element.dispatchEvent(new MouseEvent('dblclick', { clientX: 200, clientY: 300, bubbles: true }))
    expect(zoom.scale.value).toBe(2.5)

    zoom.reset()
    expect(zoom.scale.value).toBe(1)
  })
})
