<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NModal } from 'naive-ui'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useSnoozePrompt } from '../../../composables/mutations/use-snooze-prompt'

const PROMPT_KEY = 'personal_profile'

const HIDDEN_ROUTE_NAMES = new Set<string | symbol>([
  ROUTE_NAMES.CART_CHECKOUT,
  ROUTE_NAMES.PAYMENT_BOX,
  ROUTE_NAMES.PAYMENT_RETURN,
  ROUTE_NAMES.ACCOUNT_PROFILE,
])

const route = useRoute()
const router = useRouter()
const authStore = useSessionStore()
const snoozePrompt = useSnoozePrompt()

const dismissed = ref(false)

const isRouteAllowed = computed(() => !HIDDEN_ROUTE_NAMES.has(route.name ?? ''))
const isPending = computed(() => (authStore.currentUser?.pendingPrompts ?? [])[0] === PROMPT_KEY)
const isVisible = computed(() => !dismissed.value && isPending.value && isRouteAllowed.value)

function completeNow() {
  dismissed.value = true
  router.push({ name: ROUTE_NAMES.ACCOUNT_PROFILE })
}

function later() {
  dismissed.value = true
  snoozePrompt.mutate(PROMPT_KEY)
}

function closeLocally() {
  dismissed.value = true
}
</script>

<template>
  <NModal
    :show="isVisible"
    preset="card"
    title="Completa tu perfil"
    class="personal-profile-prompt"
    style="width: 420px; max-width: calc(100vw - 32px)"
    :closable="true"
    :mask-closable="true"
    @close="closeLocally"
  >
    <div class="personal-profile-prompt__illustration" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="var(--tt-primary-light)" fill-opacity="0.16" />
        <circle
          cx="32"
          cy="26"
          r="10"
          fill="var(--tt-surface)"
          stroke="var(--tt-primary)"
          stroke-width="2"
        />
        <path
          d="M14 50C14 40.6112 22.268 33 32 33C41.732 33 50 40.6112 50 50"
          fill="var(--tt-surface)"
          stroke="var(--tt-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <p class="personal-profile-prompt__text">
      Nos falta saber de dónde eres y algunos datos tuyos. Toma menos de un minuto.
    </p>

    <template #footer>
      <div class="personal-profile-prompt__actions">
        <NButton size="large" :disabled="snoozePrompt.isPending.value" @click="later">
          Más tarde
        </NButton>
        <NButton type="primary" size="large" @click="completeNow"> Completar ahora </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./personal-profile-prompt.css"></style>
