import { defineStore } from 'pinia'
import { computed, ref } from 'vue'
import { v4 as uuidv4 } from 'uuid'

import type { ICartGroup } from '../types/responses/cart.response'

const SESSION_ID_KEY = 'titan_cart_session_id'

function getOrCreateSessionId(): string {
  let id = localStorage.getItem(SESSION_ID_KEY)
  if (!id) {
    id = uuidv4()
    localStorage.setItem(SESSION_ID_KEY, id)
  }
  return id
}

export const useCartStore = defineStore('cart', () => {
  const sessionId = ref(getOrCreateSessionId())
  const groups = ref<ICartGroup[]>([])

  const totalCount = computed(() => groups.value.reduce((sum, g) => sum + g.photos.length, 0))
  const eventCount = computed(() => groups.value.length)

  function setGroups(data: ICartGroup[]) {
    groups.value = data
  }

  function isInCart(photoId: string): boolean {
    return groups.value.some((g) => g.photos.some((p) => p.id === photoId))
  }

  function clear() {
    groups.value = []
  }

  return {
    sessionId,
    groups,
    totalCount,
    eventCount,
    setGroups,
    isInCart,
    clear,
  }
})
