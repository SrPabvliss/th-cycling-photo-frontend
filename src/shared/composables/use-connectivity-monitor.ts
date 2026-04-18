import { ref, readonly, onUnmounted } from 'vue'

import { env } from '@/core/config/env'

const HEARTBEAT_ONLINE_INTERVAL = 30_000 // 30s when online
const HEARTBEAT_OFFLINE_INTERVAL = 5_000 // 5s when offline (check more often)
const DEBOUNCE_MS = 2_000 // Avoid rapid toggle between online/offline

export function useConnectivityMonitor() {
  const isOnline = ref(navigator.onLine)
  let heartbeatTimer: ReturnType<typeof setTimeout> | null = null
  let debounceTimer: ReturnType<typeof setTimeout> | null = null

  // --- Layer 1: navigator.onLine events (fast but unreliable for `true`) ---

  function onOnline() {
    debouncedUpdate(true)
  }

  function onOffline() {
    // navigator.onLine = false is reliable — apply immediately
    updateStatus(false)
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  // --- Layer 2: Heartbeat HEAD request to API ---

  async function checkHeartbeat() {
    try {
      await fetch(`${env.VITE_API_BASE_URL}/events`, {
        method: 'HEAD',
        cache: 'no-store',
      })
      debouncedUpdate(true)
    } catch {
      debouncedUpdate(false)
    }
    scheduleHeartbeat()
  }

  function scheduleHeartbeat() {
    if (heartbeatTimer) clearTimeout(heartbeatTimer)
    const interval = isOnline.value ? HEARTBEAT_ONLINE_INTERVAL : HEARTBEAT_OFFLINE_INTERVAL
    heartbeatTimer = setTimeout(checkHeartbeat, interval)
  }

  // --- Layer 3: Debounce to avoid rapid toggles ---

  function debouncedUpdate(online: boolean) {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => updateStatus(online), DEBOUNCE_MS)
  }

  function updateStatus(online: boolean) {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
      debounceTimer = null
    }
    if (isOnline.value !== online) {
      isOnline.value = online
    }
  }

  // Start heartbeat
  scheduleHeartbeat()

  // --- Cleanup ---

  function destroy() {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
    if (heartbeatTimer) clearTimeout(heartbeatTimer)
    if (debounceTimer) clearTimeout(debounceTimer)
  }

  onUnmounted(destroy)

  return {
    isOnline: readonly(isOnline),
    destroy,
  }
}
