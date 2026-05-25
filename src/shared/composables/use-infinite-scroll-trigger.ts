import { onBeforeUnmount, ref, watch, type Ref } from 'vue'

interface IOptions {
  isBusy: Ref<boolean>
  canLoadMore: Ref<boolean>
  rootMargin?: string
  threshold?: number
}

/**
 * Attach the returned ref to a sentinel element placed at the end of the
 * scrollable list. The callback fires when the sentinel intersects the
 * viewport AND the consumer is neither busy nor out of pages.
 */
export function useInfiniteScrollTrigger(
  callback: () => void,
  options: IOptions,
): Ref<HTMLElement | null> {
  const sentinel = ref<HTMLElement | null>(null)
  let observer: IntersectionObserver | null = null

  function disconnect() {
    if (observer) {
      observer.disconnect()
      observer = null
    }
  }

  function connect(el: HTMLElement) {
    disconnect()
    observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0]
        if (!entry?.isIntersecting) return
        if (options.isBusy.value) return
        if (!options.canLoadMore.value) return
        callback()
      },
      {
        rootMargin: options.rootMargin ?? '200px',
        threshold: options.threshold ?? 0,
      },
    )
    observer.observe(el)
  }

  watch(
    sentinel,
    (el) => {
      if (el) connect(el)
      else disconnect()
    },
    { immediate: true, flush: 'post' },
  )

  onBeforeUnmount(disconnect)

  return sentinel
}
