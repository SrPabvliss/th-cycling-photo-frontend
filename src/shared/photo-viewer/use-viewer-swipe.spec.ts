import { afterEach, describe, expect, it, vi } from 'vitest'
import { effectScope, ref, type EffectScope } from 'vue'

import { useViewerSwipe } from './use-viewer-swipe'

type Finger = [x: number, y: number]

function touch(type: string, fingers: Finger[], at = 0, lifted: Finger[] = []): Event {
  const event = new Event(type)
  const points = (list: Finger[]) => list.map(([clientX, clientY]) => ({ clientX, clientY }))
  Object.defineProperties(event, {
    touches: { value: points(fingers) },
    changedTouches: { value: points(lifted.length > 0 ? lifted : fingers) },
    timeStamp: { value: at },
  })
  return event
}

let scope: EffectScope | null = null
afterEach(() => {
  scope?.stop()
  scope = null
})

function setup(options: { canPrevious?: boolean; canNext?: boolean; zoomed?: boolean } = {}) {
  const element = document.createElement('div')
  Object.defineProperty(element, 'clientWidth', { value: 1000 })
  const onPrevious = vi.fn()
  const onNext = vi.fn()
  scope = effectScope()
  const swipe = scope.run(() =>
    useViewerSwipe(ref(element), {
      canPrevious: () => options.canPrevious ?? true,
      canNext: () => options.canNext ?? true,
      onPrevious,
      onNext,
      isZoomed: () => options.zoomed ?? false,
    }),
  )!

  /** One finger from `from` to `to`, lifted after `ms`. */
  function drag(from: Finger, to: Finger, ms = 600) {
    element.dispatchEvent(touch('touchstart', [from]))
    element.dispatchEvent(touch('touchmove', [to], ms / 2))
    element.dispatchEvent(touch('touchend', [], ms, [to]))
  }

  return { element, swipe, onPrevious, onNext, drag }
}

describe('useViewerSwipe', () => {
  it('goes to the next photo when dragged to the left', () => {
    const { drag, onNext, onPrevious } = setup()
    drag([300, 200], [150, 205])

    expect(onNext).toHaveBeenCalledOnce()
    expect(onPrevious).not.toHaveBeenCalled()
  })

  it('goes to the previous photo when dragged to the right', () => {
    const { drag, onNext, onPrevious } = setup()
    drag([100, 200], [260, 190])

    expect(onPrevious).toHaveBeenCalledOnce()
    expect(onNext).not.toHaveBeenCalled()
  })

  it('makes the photo follow the finger, and lets it go back after a short drag', () => {
    const { element, swipe, onNext } = setup()
    element.dispatchEvent(touch('touchstart', [[300, 200]]))
    element.dispatchEvent(touch('touchmove', [[260, 200]], 300))

    expect(swipe.offset.value).toBe(-40)
    expect(swipe.isDragging.value).toBe(true)

    element.dispatchEvent(touch('touchend', [], 600, [[260, 200]]))
    expect(swipe.offset.value).toBe(0)
    expect(swipe.isDragging.value).toBe(false)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('takes a short drag when it is quick', () => {
    const { drag, onNext } = setup()
    drag([300, 200], [260, 200], 120)

    expect(onNext).toHaveBeenCalledOnce()
  })

  it('leaves a vertical drag alone', () => {
    const { drag, swipe, onNext, onPrevious } = setup()
    drag([300, 100], [320, 400])

    expect(swipe.offset.value).toBe(0)
    expect(onNext).not.toHaveBeenCalled()
    expect(onPrevious).not.toHaveBeenCalled()
  })

  it('does not move past the last photo, and resists the drag', () => {
    const { element, swipe, onNext } = setup({ canNext: false })
    element.dispatchEvent(touch('touchstart', [[300, 200]]))
    element.dispatchEvent(touch('touchmove', [[100, 200]], 300))
    expect(swipe.offset.value).toBe(-60)

    element.dispatchEvent(touch('touchend', [], 600, [[100, 200]]))
    expect(onNext).not.toHaveBeenCalled()
  })

  it('leaves two fingers to the pinch', () => {
    const { element, swipe, onNext } = setup()
    element.dispatchEvent(touch('touchstart', [[300, 200]]))
    element.dispatchEvent(
      touch(
        'touchmove',
        [
          [150, 200],
          [400, 200],
        ],
        300,
      ),
    )
    element.dispatchEvent(touch('touchend', [], 600, [[150, 200]]))

    expect(swipe.offset.value).toBe(0)
    expect(onNext).not.toHaveBeenCalled()
  })

  it('does not change the photo while the page is zoomed in', () => {
    const { drag, onNext } = setup({ zoomed: true })
    drag([300, 200], [100, 200])

    expect(onNext).not.toHaveBeenCalled()
  })
})
