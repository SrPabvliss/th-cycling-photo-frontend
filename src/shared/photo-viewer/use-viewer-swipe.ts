import { onScopeDispose, ref, watch, type Ref } from 'vue'

/** How far a finger has to travel before the gesture is read as horizontal or vertical. */
const DECIDE_AFTER_PX = 8
/** A drag this long changes the photo, whatever its speed. */
const COMMIT_DISTANCE_PX = 80
/** On a narrow screen the distance is a share of the width instead. */
const COMMIT_SHARE = 0.2
/** A short, quick drag (a flick) changes the photo too. */
const FLICK_DISTANCE_PX = 30
const FLICK_WITHIN_MS = 250
/** How much the photo follows the finger when there is nothing on that side. */
const EDGE_RESISTANCE = 0.3

export interface IViewerSwipeOptions {
  canPrevious: () => boolean
  canNext: () => boolean
  onPrevious: () => void
  onNext: () => void
  /** The page is zoomed in: one finger pans the zoomed photo, it does not change it. */
  isZoomed?: () => boolean
}

export interface IViewerSwipe {
  /** Horizontal pixels the photo is dragged by right now; 0 at rest. */
  offset: Ref<number>
  isDragging: Ref<boolean>
}

interface IPoint {
  x: number
  y: number
}

const isPageZoomed = () => (window.visualViewport?.scale ?? 1) > 1.01

/**
 * Dragging the photo sideways with one finger moves to the next or the previous one, the way any
 * phone gallery does. The photo follows the finger and, let go short of the mark, goes back.
 *
 * Two fingers are left to the browser (pinch to zoom), and so is a vertical drag. While the page
 * is zoomed in a drag pans the photo instead: zooming out comes first, then swiping.
 */
export function useViewerSwipe(
  target: Ref<HTMLElement | null>,
  options: IViewerSwipeOptions,
): IViewerSwipe {
  const offset = ref(0)
  const isDragging = ref(false)
  const isZoomed = options.isZoomed ?? isPageZoomed

  let start: (IPoint & { at: number }) | null = null
  let axis: 'horizontal' | 'vertical' | null = null

  function reset() {
    start = null
    axis = null
    offset.value = 0
    isDragging.value = false
  }

  function onTouchStart(event: TouchEvent) {
    const touch = event.touches[0]
    if (event.touches.length !== 1 || !touch || isZoomed()) return reset()
    start = { x: touch.clientX, y: touch.clientY, at: event.timeStamp }
    axis = null
  }

  function onTouchMove(event: TouchEvent) {
    if (!start) return
    const touch = event.touches[0]
    // A second finger turns it into a pinch: the drag is dropped.
    if (event.touches.length !== 1 || !touch) return reset()

    const dx = touch.clientX - start.x
    const dy = touch.clientY - start.y
    if (!axis) {
      if (Math.abs(dx) < DECIDE_AFTER_PX && Math.abs(dy) < DECIDE_AFTER_PX) return
      axis = Math.abs(dx) > Math.abs(dy) ? 'horizontal' : 'vertical'
    }
    if (axis !== 'horizontal') return

    const hasPhotoThatWay = dx < 0 ? options.canNext() : options.canPrevious()
    isDragging.value = true
    offset.value = hasPhotoThatWay ? dx : dx * EDGE_RESISTANCE
  }

  function onTouchEnd(event: TouchEvent) {
    if (!start || axis !== 'horizontal') return reset()

    const touch = event.changedTouches[0]
    const dx = touch ? touch.clientX - start.x : 0
    const width = target.value?.clientWidth || window.innerWidth
    const distance = Math.abs(dx)
    const isFlick = distance >= FLICK_DISTANCE_PX && event.timeStamp - start.at <= FLICK_WITHIN_MS
    const isFarEnough = distance >= Math.min(COMMIT_DISTANCE_PX, width * COMMIT_SHARE)
    reset()

    if (!isFlick && !isFarEnough) return
    if (dx < 0 && options.canNext()) options.onNext()
    else if (dx > 0 && options.canPrevious()) options.onPrevious()
  }

  function listen(element: HTMLElement) {
    element.addEventListener('touchstart', onTouchStart, { passive: true })
    element.addEventListener('touchmove', onTouchMove, { passive: true })
    element.addEventListener('touchend', onTouchEnd)
    element.addEventListener('touchcancel', reset)
  }

  function unlisten(element: HTMLElement) {
    element.removeEventListener('touchstart', onTouchStart)
    element.removeEventListener('touchmove', onTouchMove)
    element.removeEventListener('touchend', onTouchEnd)
    element.removeEventListener('touchcancel', reset)
  }

  watch(
    target,
    (element, previous) => {
      if (previous) unlisten(previous)
      if (element) listen(element)
    },
    { immediate: true },
  )
  onScopeDispose(() => {
    if (target.value) unlisten(target.value)
  })

  return { offset, isDragging }
}
