<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NModal } from 'naive-ui'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useSnoozePrompt } from '../../../composables/mutations/use-snooze-prompt'

const PROMPT_KEY = 'email_verification'

const HIDDEN_ROUTE_NAMES = new Set<string | symbol>([
  ROUTE_NAMES.CART_CHECKOUT,
  ROUTE_NAMES.PAYMENT_BOX,
  ROUTE_NAMES.PAYMENT_RETURN,
  ROUTE_NAMES.ACCOUNT_VERIFY_EMAIL,
])

const route = useRoute()
const router = useRouter()
const authStore = useSessionStore()
const snoozePrompt = useSnoozePrompt()

const dismissed = ref(false)

const isRouteAllowed = computed(() => !HIDDEN_ROUTE_NAMES.has(route.name ?? ''))
const isPending = computed(() => (authStore.currentUser?.pendingPrompts ?? [])[0] === PROMPT_KEY)
const isVisible = computed(() => !dismissed.value && isPending.value && isRouteAllowed.value)

function verifyNow() {
  dismissed.value = true
  router.push({ name: ROUTE_NAMES.ACCOUNT_VERIFY_EMAIL })
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
    title="¿Nos ayudas con tu correo?"
    class="verify-email-prompt"
    style="width: 420px; max-width: calc(100vw - 32px)"
    :closable="true"
    :mask-closable="true"
    @close="closeLocally"
  >
    <div class="verify-email-prompt__illustration" aria-hidden="true">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <circle cx="32" cy="32" r="32" fill="var(--tt-primary-light)" fill-opacity="0.16" />
        <rect
          x="14"
          y="21"
          width="36"
          height="24"
          rx="5"
          fill="var(--tt-surface)"
          stroke="var(--tt-primary)"
          stroke-width="2"
        />
        <path
          d="M16 24L32 36L48 24"
          stroke="var(--tt-primary)"
          stroke-width="2"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </svg>
    </div>

    <p class="verify-email-prompt__text">
      Confirmar tu correo nos ayuda a que las novedades de tus pedidos te lleguen sin problemas. Es
      cosa de un momento, y puedes hacerlo cuando te quede cómodo.
    </p>

    <template #footer>
      <div class="verify-email-prompt__actions">
        <NButton size="large" :disabled="snoozePrompt.isPending.value" @click="later">
          Más tarde
        </NButton>
        <NButton type="primary" size="large" @click="verifyNow"> Verificar ahora </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./verify-email-prompt.css"></style>
