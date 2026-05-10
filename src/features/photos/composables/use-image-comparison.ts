import { ref, computed, onMounted, onUnmounted, type Ref } from 'vue'

type ViewMode = 'slider' | 'original' | 'retouched'

export function useImageComparison(
  containerRef: Ref<HTMLElement | undefined>,
  originalImgRef: Ref<HTMLImageElement | undefined>,
) {
  const viewMode = ref<ViewMode>('slider')
  const sliderPosition = ref(50)
  const isDragging = ref(false)

  const imgWidth = ref('100%')
  const imgHeight = ref('100%')

  function syncImageSize() {
    if (!originalImgRef.value) return
    imgWidth.value = `${originalImgRef.value.clientWidth}px`
    imgHeight.value = `${originalImgRef.value.clientHeight}px`
  }

  const resizeObserver = new ResizeObserver(syncImageSize)

  onMounted(() => {
    if (originalImgRef.value) {
      resizeObserver.observe(originalImgRef.value)
    }
  })

  onUnmounted(() => {
    resizeObserver.disconnect()
  })

  function getPositionFromEvent(e: MouseEvent | TouchEvent): number {
    if (!containerRef.value) return 50
    const rect = containerRef.value.getBoundingClientRect()
    const clientX = 'touches' in e ? (e.touches[0]?.clientX ?? 0) : e.clientX
    return Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100))
  }

  function handleDragStart(e: MouseEvent | TouchEvent) {
    isDragging.value = true
    sliderPosition.value = getPositionFromEvent(e)
    e.preventDefault()
  }

  function handleDragMove(e: MouseEvent | TouchEvent) {
    if (!isDragging.value) return
    sliderPosition.value = getPositionFromEvent(e)
  }

  function handleDragEnd() {
    isDragging.value = false
  }

  const retouchedClipLeft = computed(() => {
    if (viewMode.value === 'original') return '100%'
    if (viewMode.value === 'retouched') return '0%'
    return `${sliderPosition.value}%`
  })

  const showDivider = computed(() => viewMode.value === 'slider')

  return {
    viewMode,
    sliderPosition,
    imgWidth,
    imgHeight,
    retouchedClipLeft,
    showDivider,
    syncImageSize,
    handleDragStart,
    handleDragMove,
    handleDragEnd,
  }
}
