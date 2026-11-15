import { defineStore } from 'pinia'
import { computed, ref, watch } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'

export interface ICheckoutDraft {
  billingAccountId: string
  /** The buyer ticked the electronic invoice consent box on the confirm screen. */
  consentChecked: boolean
}

/**
 * What the buyer chose on "Confirmar pedido", carried to "Método de pago". In memory only: the
 * invoice consent is a legal one and counts only when it comes from the box, never from an
 * address someone else could build or from storage another session left behind. A reload or a
 * direct link finds no draft and goes back to the confirm screen.
 */
export const useCheckoutDraftStore = defineStore('checkout-draft', () => {
  const session = useSessionStore()
  const drafts = ref<Record<string, ICheckoutDraft>>({})

  function keep(eventId: string, draft: ICheckoutDraft) {
    drafts.value = { ...drafts.value, [eventId]: { ...draft } }
  }

  function draftFor(eventId: string): ICheckoutDraft | null {
    return drafts.value[eventId] ?? null
  }

  function forget(eventId: string) {
    const rest = { ...drafts.value }
    delete rest[eventId]
    drafts.value = rest
  }

  // Signing out, or in as someone else, drops every draft. A refreshed token is the same buyer.
  const owner = computed(() => (session.isAuthenticated ? (session.currentUser?.id ?? '') : null))
  watch(owner, () => (drafts.value = {}))

  return { keep, draftFor, forget }
})
