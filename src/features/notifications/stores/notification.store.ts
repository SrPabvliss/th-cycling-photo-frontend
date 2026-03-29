import { defineStore } from 'pinia'
import { ref } from 'vue'

/**
 * Pinia store for the notification badge count.
 * Updated instantly by WebSocket events for fast UI feedback.
 * Synced with backend on API fetch.
 */
export const useNotificationStore = defineStore('notifications', () => {
  const unreadCount = ref(0)

  function setUnreadCount(count: number) {
    unreadCount.value = count
  }

  function incrementUnread() {
    unreadCount.value++
  }

  function decrementUnread() {
    if (unreadCount.value > 0) unreadCount.value--
  }

  function resetUnread() {
    unreadCount.value = 0
  }

  return {
    unreadCount,
    setUnreadCount,
    incrementUnread,
    decrementUnread,
    resetUnread,
  }
})
