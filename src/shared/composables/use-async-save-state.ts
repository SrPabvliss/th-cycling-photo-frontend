import { computed, ref } from 'vue'

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error'

/** idle → saving → saved → idle (or → error) lifecycle for imperative submits. */
export function useAsyncSaveState(savedResetMs = 2000) {
  const status = ref<SaveStatus>('idle')
  const errorMessage = ref<string | null>(null)
  let savedResetTimer: number | null = null

  function clearTimer() {
    if (savedResetTimer) {
      window.clearTimeout(savedResetTimer)
      savedResetTimer = null
    }
  }

  async function run<T>(action: () => Promise<T>): Promise<T | undefined> {
    status.value = 'saving'
    errorMessage.value = null
    try {
      const result = await action()
      status.value = 'saved'
      clearTimer()
      savedResetTimer = window.setTimeout(() => {
        if (status.value === 'saved') status.value = 'idle'
      }, savedResetMs)
      return result
    } catch (err) {
      status.value = 'error'
      errorMessage.value = (err as Error).message ?? 'Error al guardar'
      return undefined
    }
  }

  function setError(msg: string) {
    status.value = 'error'
    errorMessage.value = msg
  }

  function reset() {
    clearTimer()
    status.value = 'idle'
    errorMessage.value = null
  }

  const isSaving = computed(() => status.value === 'saving')

  return { status, errorMessage, isSaving, run, setError, reset, clearTimer }
}
