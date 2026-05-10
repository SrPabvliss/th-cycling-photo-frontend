import { onBeforeUnmount, onMounted } from 'vue'

/** Lifecycle-bound `window.addEventListener` — adds on mount, removes on unmount. */
export function useWindowEvent<K extends keyof WindowEventMap>(
  type: K,
  handler: (event: WindowEventMap[K]) => void,
): void
export function useWindowEvent(type: string, handler: EventListener): void
export function useWindowEvent(type: string, handler: EventListener) {
  onMounted(() => window.addEventListener(type, handler))
  onBeforeUnmount(() => window.removeEventListener(type, handler))
}
