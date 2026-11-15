import { computed, onScopeDispose, ref, type ComputedRef, type Ref } from 'vue'

const TICK_MS = 1000

export interface IResendCooldown {
  remaining: Readonly<Ref<number>>
  canResend: ComputedRef<boolean>
  /** Starts the wait; `from` shortens it when part of it already went by. */
  start(from?: number): void
}

/** The wait between two codes (the api allows one every 60 seconds), counted down by second. */
export function useResendCooldown(seconds = 60): IResendCooldown {
  const remaining = ref(0)
  let timer: ReturnType<typeof setInterval> | undefined

  function stop() {
    clearInterval(timer)
    timer = undefined
  }

  function start(from = seconds) {
    stop()
    remaining.value = Math.max(0, Math.min(seconds, Math.ceil(from)))
    if (remaining.value === 0) return
    timer = setInterval(() => {
      remaining.value = Math.max(0, remaining.value - 1)
      if (remaining.value === 0) stop()
    }, TICK_MS)
  }

  onScopeDispose(stop)

  return { remaining, canResend: computed(() => remaining.value === 0), start }
}
