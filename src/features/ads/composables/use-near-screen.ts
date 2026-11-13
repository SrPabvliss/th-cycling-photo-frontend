import { onMounted, onScopeDispose, ref, type Ref } from 'vue'

/** How near the screen an ad starts downloading its banners. */
const NEAR_MARGIN = '200px'

/**
 * True once the element comes within 200 px of the screen, and from then on. Without
 * IntersectionObserver it counts as near at once. Never watches when `enabled` is false.
 */
export function useNearScreen(element: Ref<HTMLElement | null>, enabled: boolean): Ref<boolean> {
  const near = ref(false)
  let observer: IntersectionObserver | null = null

  onMounted(() => {
    if (!enabled || !element.value) return
    if (typeof IntersectionObserver === 'undefined') {
      near.value = true
      return
    }
    observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return
        near.value = true
        observer?.disconnect()
      },
      { rootMargin: NEAR_MARGIN },
    )
    observer.observe(element.value)
  })
  onScopeDispose(() => observer?.disconnect())

  return near
}
