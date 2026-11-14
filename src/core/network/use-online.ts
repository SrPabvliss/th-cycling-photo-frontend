import { onlineManager } from '@tanstack/vue-query'
import { readonly, ref, type Ref } from 'vue'

// Whether the device has network. One source of truth: vue-query's onlineManager, which pauses
// queries without network and resumes them when it comes back. The screen only follows it, so
// the strip and the queries can never disagree.
const online = ref(true)
let started = false

/**
 * Seeds vue-query with the device's state and starts following it. vue-query alone starts as
 * online and only hears the `online`/`offline` events: a page opened without network would never
 * hear that it came back.
 */
export function startOnlineState(): void {
  if (started) return
  started = true
  onlineManager.setOnline(typeof navigator === 'undefined' ? true : navigator.onLine)
  online.value = onlineManager.isOnline()
  onlineManager.subscribe((isOnline) => {
    online.value = isOnline
  })
}

export function useOnline(): Readonly<Ref<boolean>> {
  startOnlineState()
  return readonly(online)
}
