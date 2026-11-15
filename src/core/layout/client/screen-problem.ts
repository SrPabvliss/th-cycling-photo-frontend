import { computed, onBeforeUnmount, ref, watch, type Ref } from 'vue'

// How many problems (a failed load, a link that expired, a page that does not exist) the client
// screen shows right now. While there is one, no house ad goes with it: an ad next to an error
// reads as if it were the answer.
const problems = ref(0)

/** The client screen is showing a problem. */
export const hasScreenProblem = computed(() => problems.value > 0)

/** Only a problem in the screen itself counts: not the panel, not a drawer floating over it. */
const SCREEN = '.client-layout__main'

/**
 * Counts `element` as a problem on screen while it is mounted inside the client screen and
 * `active` holds.
 */
export function useScreenProblem(
  element: Ref<HTMLElement | null>,
  active: () => boolean = () => true,
) {
  let counted = false

  function set(value: boolean) {
    if (value === counted) return
    counted = value
    problems.value += value ? 1 : -1
  }

  watch(
    [element, active],
    ([node, isActive]) => set(!!node && isActive && !!node.closest(SCREEN)),
    { immediate: true, flush: 'post' },
  )
  onBeforeUnmount(() => set(false))
}
