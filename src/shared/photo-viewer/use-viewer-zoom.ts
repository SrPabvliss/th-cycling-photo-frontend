import { computed, onScopeDispose, ref, watch, type ComputedRef, type Ref } from 'vue'

const MAX_SCALE = 4
/** What a double tap (or a double click) zooms to. */
const DOUBLE_TAP_SCALE = 2.5
const DOUBLE_TAP_WITHIN_MS = 300
const DOUBLE_TAP_WITHIN_PX = 30
/** A finger that moved less than this, for less than this, tapped. */
const TAP_MOVE_PX = 10
const TAP_WITHIN_MS = 250
/** How fast a trackpad pinch (a wheel with ctrl) zooms. */
const WHEEL_ZOOM_RATE = 0.01

/** Where the stage is on screen and how big the photo is drawn in it, before any zoom. */
export interface IZoomBox {
  left: number
  top: number
  width: number
  height: number
  imageWidth: number
  imageHeight: number
}

export interface IViewerZoomOptions {
  /** Read from the stage and its photo when missing. */
  measure?: () => IZoomBox | null
}

export interface IViewerZoom {
  /** 1 at rest, up to 4. */
  scale: Ref<number>
  /** How far the zoomed photo is moved from the centre of the stage, in pixels. */
  x: Ref<number>
  y: Ref<number>
  isZoomed: ComputedRef<boolean>
  /** A pinch or a drag is going on: the photo follows the fingers with no easing. */
  isGesturing: Ref<boolean>
  reset(): void
}

interface IPoint {
  x: number
  y: number
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))
const isOnControl = (target: EventTarget | null) =>
  target instanceof Element && target.closest('button, a') !== null

/**
 * Zoom of the photo itself, not of the page: pinch with two fingers, double tap to zoom in and
 * out, and drag to move around while zoomed in. With a mouse: double click, drag, and the trackpad
 * pinch. The photo never leaves the stage further than its own edge.
 *
 * It only moves the photo it is given through `scale`, `x` and `y`; changing photo is the swipe's
 * job, which steps aside while `isZoomed`.
 */
export function useViewerZoom(
  stage: Ref<HTMLElement | null>,
  options: IViewerZoomOptions = {},
): IViewerZoom {
  const scale = ref(1)
  const x = ref(0)
  const y = ref(0)
  const isGesturing = ref(false)
  const isZoomed = computed(() => scale.value > 1)

  function measureStage(): IZoomBox | null {
    const element = stage.value
    if (!element) return null
    const rect = element.getBoundingClientRect()
    const image = element.querySelector('img')
    return {
      left: rect.left,
      top: rect.top,
      width: rect.width,
      height: rect.height,
      imageWidth: image?.clientWidth ?? rect.width,
      imageHeight: image?.clientHeight ?? rect.height,
    }
  }
  const measure = options.measure ?? measureStage

  /** A point of the screen, counted from the centre of the stage. */
  function fromCentre(clientX: number, clientY: number): IPoint {
    const box = measure()
    if (!box) return { x: 0, y: 0 }
    return { x: clientX - (box.left + box.width / 2), y: clientY - (box.top + box.height / 2) }
  }

  /** Moves the photo, stopping where its edge would come into the stage. */
  function moveTo(nextX: number, nextY: number) {
    const box = measure()
    const maxX = box ? Math.max(0, (box.imageWidth * scale.value - box.width) / 2) : 0
    const maxY = box ? Math.max(0, (box.imageHeight * scale.value - box.height) / 2) : 0
    x.value = clamp(nextX, -maxX, maxX)
    y.value = clamp(nextY, -maxY, maxY)
  }

  /**
   * Zooms so that the spot of the photo that was under `from` ends up under `to`: the same point
   * for a double tap, the moving middle of the two fingers for a pinch.
   */
  function zoomAt(spot: IPoint, nextScale: number, to: IPoint) {
    scale.value = clamp(nextScale, 1, MAX_SCALE)
    if (scale.value === 1) {
      x.value = 0
      y.value = 0
      return
    }
    moveTo(to.x - spot.x * scale.value, to.y - spot.y * scale.value)
  }

  /** The spot of the photo, in its own unzoomed pixels, that is under a point of the stage. */
  const spotUnder = (point: IPoint): IPoint => ({
    x: (point.x - x.value) / scale.value,
    y: (point.y - y.value) / scale.value,
  })

  function toggleAt(point: IPoint) {
    if (isZoomed.value) return reset()
    zoomAt(spotUnder(point), DOUBLE_TAP_SCALE, point)
  }

  function reset() {
    scale.value = 1
    x.value = 0
    y.value = 0
    isGesturing.value = false
  }

  // --- Touch ---
  let pinch: { spot: IPoint; distance: number; scale: number } | null = null
  let pan: IPoint | null = null
  let tap: (IPoint & { at: number; moved: boolean }) | null = null
  let lastTap: (IPoint & { at: number }) | null = null

  const middle = (touches: TouchList): IPoint =>
    fromCentre(
      (touches[0]!.clientX + touches[1]!.clientX) / 2,
      (touches[0]!.clientY + touches[1]!.clientY) / 2,
    )
  const spread = (touches: TouchList) =>
    Math.hypot(touches[0]!.clientX - touches[1]!.clientX, touches[0]!.clientY - touches[1]!.clientY)

  function onTouchStart(event: TouchEvent) {
    if (isOnControl(event.target)) return
    const first = event.touches[0]

    if (event.touches.length === 2) {
      pinch = {
        spot: spotUnder(middle(event.touches)),
        distance: spread(event.touches) || 1,
        scale: scale.value,
      }
      pan = null
      tap = null
      return
    }

    if (event.touches.length === 1 && first) {
      tap = { x: first.clientX, y: first.clientY, at: event.timeStamp, moved: false }
      pan = isZoomed.value ? { x: first.clientX, y: first.clientY } : null
    }
  }

  function onTouchMove(event: TouchEvent) {
    const first = event.touches[0]

    if (pinch && event.touches.length >= 2) {
      // Ours, not the browser's: the page itself must not zoom.
      event.preventDefault()
      isGesturing.value = true
      const ratio = spread(event.touches) / pinch.distance
      zoomAt(pinch.spot, pinch.scale * ratio, middle(event.touches))
      return
    }

    if (!first || event.touches.length !== 1) return
    if (tap && Math.hypot(first.clientX - tap.x, first.clientY - tap.y) > TAP_MOVE_PX) {
      tap.moved = true
    }

    if (pan && isZoomed.value) {
      event.preventDefault()
      isGesturing.value = true
      moveTo(x.value + first.clientX - pan.x, y.value + first.clientY - pan.y)
      pan = { x: first.clientX, y: first.clientY }
    }
  }

  function onTouchEnd(event: TouchEvent) {
    const remaining = event.touches[0]

    // One finger of a pinch lifted: the other one goes on moving the photo.
    if (remaining) {
      pinch = null
      pan = isZoomed.value ? { x: remaining.clientX, y: remaining.clientY } : null
      return
    }

    const wasTap = tap !== null && !tap.moved && event.timeStamp - tap.at <= TAP_WITHIN_MS
    const tapped = tap
    pinch = null
    pan = null
    tap = null
    isGesturing.value = false

    if (!wasTap || !tapped) {
      lastTap = null
      return
    }

    const isSecond =
      lastTap !== null &&
      tapped.at - lastTap.at <= DOUBLE_TAP_WITHIN_MS &&
      Math.hypot(tapped.x - lastTap.x, tapped.y - lastTap.y) <= DOUBLE_TAP_WITHIN_PX
    if (!isSecond) {
      lastTap = { x: tapped.x, y: tapped.y, at: tapped.at }
      return
    }

    lastTap = null
    // Otherwise the browser reads the second tap as its own double-tap zoom, and as a click.
    event.preventDefault()
    toggleAt(fromCentre(tapped.x, tapped.y))
  }

  function onTouchCancel() {
    pinch = null
    pan = null
    tap = null
    isGesturing.value = false
  }

  // --- Mouse and trackpad ---
  let grab: IPoint | null = null

  function onDoubleClick(event: MouseEvent) {
    if (isOnControl(event.target)) return
    toggleAt(fromCentre(event.clientX, event.clientY))
  }

  function onMouseDown(event: MouseEvent) {
    if (!isZoomed.value || event.button !== 0 || isOnControl(event.target)) return
    event.preventDefault()
    grab = { x: event.clientX, y: event.clientY }
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
  }

  function onMouseMove(event: MouseEvent) {
    if (!grab) return
    isGesturing.value = true
    moveTo(x.value + event.clientX - grab.x, y.value + event.clientY - grab.y)
    grab = { x: event.clientX, y: event.clientY }
  }

  function onMouseUp() {
    grab = null
    isGesturing.value = false
    window.removeEventListener('mousemove', onMouseMove)
    window.removeEventListener('mouseup', onMouseUp)
  }

  // A pinch on a trackpad reaches the page as a wheel with ctrl held.
  function onWheel(event: WheelEvent) {
    if (!event.ctrlKey) return
    event.preventDefault()
    const point = fromCentre(event.clientX, event.clientY)
    zoomAt(spotUnder(point), scale.value * Math.exp(-event.deltaY * WHEEL_ZOOM_RATE), point)
  }

  // Safari's own pinch, which `touch-action` does not always hold back.
  const onGestureStart = (event: Event) => event.preventDefault()

  function listen(element: HTMLElement) {
    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: false })
    element.addEventListener('touchend', onTouchEnd, { passive: false })
    element.addEventListener('touchcancel', onTouchCancel)
    element.addEventListener('dblclick', onDoubleClick)
    element.addEventListener('mousedown', onMouseDown)
    element.addEventListener('wheel', onWheel, { passive: false })
    element.addEventListener('gesturestart', onGestureStart)
  }

  function unlisten(element: HTMLElement) {
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('touchend', onTouchEnd)
    element.removeEventListener('touchcancel', onTouchCancel)
    element.removeEventListener('dblclick', onDoubleClick)
    element.removeEventListener('mousedown', onMouseDown)
    element.removeEventListener('wheel', onWheel)
    element.removeEventListener('gesturestart', onGestureStart)
  }

  watch(
    stage,
    (element, previous) => {
      if (previous) unlisten(previous)
      if (element) listen(element)
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    if (stage.value) unlisten(stage.value)
    onMouseUp()
  })

  return { scale, x, y, isZoomed, isGesturing, reset }
}
