import { onScopeDispose, readonly, ref, watch, type Ref } from 'vue'

import { LOADING_MIN_VISIBLE_MS, LOADING_SHOW_DELAY_MS } from './loading.constants'

export interface IDelayedFlagOptions {
  /** How long the source has to stay true before the flag turns on. */
  delay?: number
  /** How long the flag stays on once it turned on. */
  min?: number
}

/**
 * A boolean that follows `source` without flickering: it turns on only if `source` is still true
 * after `delay`, and once on it does not turn off before `min` has passed.
 */
export function useDelayedFlag(
  source: Ref<boolean>,
  options: IDelayedFlagOptions = {},
): Readonly<Ref<boolean>> {
  const delay = options.delay ?? LOADING_SHOW_DELAY_MS
  const min = options.min ?? LOADING_MIN_VISIBLE_MS

  const flag = ref(false)
  let shownAt = 0
  let timer: ReturnType<typeof setTimeout> | undefined

  function clear(): void {
    clearTimeout(timer)
    timer = undefined
  }

  function show(): void {
    flag.value = true
    shownAt = Date.now()
  }

  function hide(): void {
    flag.value = false
  }

  watch(
    source,
    (active) => {
      clear()

      if (active) {
        if (!flag.value) timer = setTimeout(show, delay)
        return
      }

      if (!flag.value) return

      const remaining = min - (Date.now() - shownAt)
      if (remaining <= 0) hide()
      else timer = setTimeout(hide, remaining)
    },
    { immediate: true, flush: 'sync' },
  )

  onScopeDispose(clear)

  return readonly(flag)
}
