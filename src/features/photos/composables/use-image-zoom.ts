import { ref, watch, type Ref } from 'vue'

const MIN_SCALE = 1
const MAX_SCALE = 5
const ZOOM_STEP = 0.15

export function useImageZoom(containerRef: Ref<HTMLElement | undefined>, photoId: Ref<string>) {
  const scale = ref(1)
  const translateX = ref(0)
  const translateY = ref(0)
  const isPanning = ref(false)

  let lastMouseX = 0
  let lastMouseY = 0

  function handleWheel(e: WheelEvent) {
    e.preventDefault()

    const container = containerRef.value
    if (!container) return

    const rect = container.getBoundingClientRect()

    // Cursor position relative to container center (≈ image center / transform-origin)
    const cx = e.clientX - (rect.left + rect.width / 2)
    const cy = e.clientY - (rect.top + rect.height / 2)

    const oldScale = scale.value
    const delta = e.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP
    const newScale = Math.min(MAX_SCALE, Math.max(MIN_SCALE, oldScale + delta))

    if (newScale === oldScale) return

    // Keep the point under cursor fixed:
    // tx_new = cx - (cx - tx_old) * (newScale / oldScale)
    const ratio = newScale / oldScale
    translateX.value = cx - (cx - translateX.value) * ratio
    translateY.value = cy - (cy - translateY.value) * ratio

    scale.value = newScale

    if (newScale <= 1) {
      translateX.value = 0
      translateY.value = 0
    }
  }

  function handleMouseDown(e: MouseEvent) {
    if (scale.value <= 1) return
    isPanning.value = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    e.preventDefault()
  }

  function handleMouseMove(e: MouseEvent) {
    if (!isPanning.value) return
    translateX.value += e.clientX - lastMouseX
    translateY.value += e.clientY - lastMouseY
    lastMouseX = e.clientX
    lastMouseY = e.clientY
  }

  function handleMouseUp() {
    isPanning.value = false
  }

  function resetZoom() {
    scale.value = 1
    translateX.value = 0
    translateY.value = 0
  }

  watch(photoId, resetZoom)

  return {
    scale,
    translateX,
    translateY,
    isPanning,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetZoom,
  }
}
