import { onScopeDispose, watch, type Ref } from 'vue'
import { useDocumentVisibility } from '@vueuse/core'

/**
 * Runs `run` every `everyMs` while `active` is true and the tab is visible; stops as soon as either
 * stops being so, and when the screen is left.
 */
export function useVisiblePolling(
  active: Readonly<Ref<boolean>>,
  everyMs: number,
  run: () => unknown,
) {
  const visibility = useDocumentVisibility()
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  watch(
    [active, visibility],
    ([isActive, visible]) => {
      stop()
      if (isActive && visible === 'visible') timer = setInterval(() => void run(), everyMs)
    },
    { immediate: true },
  )

  onScopeDispose(stop)
}
