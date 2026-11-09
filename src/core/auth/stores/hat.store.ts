import { defineStore } from 'pinia'
import { ref } from 'vue'

export type Hat = 'shopping' | 'operating'

const storageKey = (userId: string) => `titan_active_hat:${userId}`

export const useHatStore = defineStore('hat', () => {
  const activeHat = ref<Hat>('shopping')
  const currentUserId = ref<string | null>(null)

  function setHat(hat: Hat) {
    activeHat.value = hat
    if (currentUserId.value) localStorage.setItem(storageKey(currentUserId.value), hat)
  }

  function initFor(userId: string, shopping: boolean, operating: boolean) {
    currentUserId.value = userId

    if (!operating) return setHat('shopping')
    if (!shopping) return setHat('operating')

    const remembered = localStorage.getItem(storageKey(userId))
    setHat(remembered === 'shopping' ? 'shopping' : 'operating')
  }

  function reset() {
    currentUserId.value = null
    activeHat.value = 'shopping'
  }

  return { activeHat, setHat, initFor, reset }
})
