import { computed, onBeforeUnmount, onMounted, ref, type Ref } from 'vue'
import { useRouter } from 'vue-router'

import { COMMERCIAL_PAGE_PATHS } from '@/shared/constants/commercial'
import type { PieceMessage } from '../pieces/piece-copy'
import { SPOTS_STARTED_AT } from '../utils/spot-rotation'
import { clockSlide, slideMessage, visibleSlide } from '../utils/visible-slide'

/** What the link of a house ad is called, after the message of the slide on screen. */
export const SPOT_LINK_LABEL: Record<PieceMessage, string> = {
  marca: 'Anúnciate en Titan',
  organizador: 'Titan cubre tu carrera',
}

/** How often the address and the name of the link catch up with the slide on screen. */
const REFRESH_MS = 1000

export interface ISpotDestinationOptions {
  /** The slides, in their order, inside the root. */
  slideSelector: string
  seed: () => number
  /** Reduced motion: the first slide stays, and so does its destination. */
  still: () => boolean
}

/**
 * Where a rotating house ad leads: brands to their page, organizers to theirs, after the slide
 * on screen. A click reads the animations as they are at that moment, so a paused one (hidden
 * tab, power saving) still leads where it shows; the address and name kept for a middle click
 * and for screen readers catch up every second.
 */
export function useSpotDestination(
  root: Ref<HTMLElement | null>,
  options: ISpotDestinationOptions,
) {
  const router = useRouter()

  function read(): number {
    if (options.still()) return 0
    const slides = root.value ? [...root.value.querySelectorAll(options.slideSelector)] : []
    return visibleSlide(slides, clockSlide(options.seed(), SPOTS_STARTED_AT, Date.now()))
  }

  const index = ref(read())
  const message = computed(() => slideMessage(index.value, options.seed()))
  const path = computed(() => COMMERCIAL_PAGE_PATHS[message.value])
  const href = computed(() => router.resolve(path.value).href)
  const label = computed(() => SPOT_LINK_LABEL[message.value])

  let timer: ReturnType<typeof setInterval> | undefined
  onMounted(() => {
    index.value = read()
    timer = setInterval(() => (index.value = read()), REFRESH_MS)
  })
  onBeforeUnmount(() => clearInterval(timer))

  /** Plain clicks navigate inside the app; with a modifier the browser opens a new tab. */
  function follow(event: MouseEvent) {
    if (event.defaultPrevented || event.button !== 0) return
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
    event.preventDefault()
    index.value = read()
    void router.push(path.value)
  }

  return { href, label, follow }
}
