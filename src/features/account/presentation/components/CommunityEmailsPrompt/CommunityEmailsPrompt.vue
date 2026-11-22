<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NModal } from 'naive-ui'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useSetCommunityEmails } from '../../../composables/mutations/use-set-community-emails'
import { useSnoozePrompt } from '../../../composables/mutations/use-snooze-prompt'
import ModalCloseButton from '@/shared/components/ModalCloseButton/ModalCloseButton.vue'
import { ILLUSTRATION_VIEW_BOX, ILLUSTRATIONS } from '@/shared/components/empty-state/illustrations'
import { LEGAL_PATHS } from '@/features/legal/routes'

const PROMPT_KEY = 'community_emails'

const HIDDEN_ROUTE_NAMES = new Set<string | symbol>([
  ROUTE_NAMES.CART_CHECKOUT,
  ROUTE_NAMES.CART_PAYMENT_METHOD,
  ROUTE_NAMES.CART_ORDER_RECEIVED,
  ROUTE_NAMES.PAYMENT_BOX,
  ROUTE_NAMES.PAYMENT_RETURN,
  ROUTE_NAMES.PAYMENT_CONFIRMED,
  ROUTE_NAMES.ACCOUNT_EMAIL_UNSUBSCRIBE,
])

const route = useRoute()
const authStore = useSessionStore()
const snoozePrompt = useSnoozePrompt()
// Without silent: a failure says so in a toast and the prompt stays, to try again.
const setCommunityEmails = useSetCommunityEmails()

const dismissed = ref(false)

const isRouteAllowed = computed(() => !HIDDEN_ROUTE_NAMES.has(route.name ?? ''))
// The lowest of the prompts: it shows only once the others are done or snoozed, and never to
// someone the api does not offer it to (minors).
const isPending = computed(
  () =>
    (authStore.currentUser?.communityEmailsAvailable ?? false) &&
    (authStore.currentUser?.pendingPrompts ?? [])[0] === PROMPT_KEY,
)
const isVisible = computed(() => !dismissed.value && isPending.value && isRouteAllowed.value)

async function activate() {
  if (setCommunityEmails.isPending.value) return
  try {
    await setCommunityEmails.mutateAsync(true)
    dismissed.value = true
  } catch {
    // The toast says it; the prompt stays.
  }
}

function later() {
  dismissed.value = true
  snoozePrompt.mutate(PROMPT_KEY)
}

function closeLocally() {
  dismissed.value = true
}

// The calendar greets the year about to start; in January, the one that just did.
const today = new Date()
const greetedYear = String(today.getFullYear() + (today.getMonth() === 0 ? 0 : 1))
const DRAWINGS = [
  ILLUSTRATIONS.pastel,
  ILLUSTRATIONS.arbolNavidad,
  ILLUSTRATIONS.calendarioAnio.replace('>2027<', `>${greetedYear}<`),
]
</script>

<template>
  <NModal
    :show="isVisible"
    preset="card"
    class="community-emails-prompt"
    style="width: 420px; max-width: calc(100vw - 32px)"
    :closable="false"
    :mask-closable="true"
    aria-labelledby="community-emails-prompt-title"
    @close="closeLocally"
    @mask-click="closeLocally"
    @esc="closeLocally"
  >
    <!-- Without a title the card draws no header, so the close button lives in the content. -->
    <div class="community-emails-prompt__close">
      <ModalCloseButton @close="closeLocally" />
    </div>

    <div class="community-emails-prompt__illustrations" aria-hidden="true">
      <!-- eslint-disable vue/no-v-html -->
      <svg
        v-for="(drawing, index) in DRAWINGS"
        :key="index"
        class="community-emails-prompt__illustration"
        xmlns="http://www.w3.org/2000/svg"
        :viewBox="ILLUSTRATION_VIEW_BOX"
        fill="none"
        focusable="false"
        v-html="drawing"
      />
      <!-- eslint-enable vue/no-v-html -->
    </div>

    <h2 id="community-emails-prompt-title" class="community-emails-prompt__title">
      Correos de fechas especiales
    </h2>
    <p class="community-emails-prompt__text">
      La carrera termina en la meta, pero la comunidad sigue. Únete y celebremos juntos los días que
      importan.
    </p>

    <template #footer>
      <div class="community-emails-prompt__actions">
        <NButton
          size="large"
          :disabled="snoozePrompt.isPending.value || setCommunityEmails.isPending.value"
          @click="later"
        >
          Ahora no
        </NButton>
        <NButton
          type="primary"
          size="large"
          :loading="setCommunityEmails.isPending.value"
          :disabled="setCommunityEmails.isPending.value"
          @click="activate"
        >
          Quiero ser parte
        </NButton>
      </div>
      <p class="community-emails-prompt__note">
        Lo desactivas cuando quieras.
        <RouterLink :to="`${LEGAL_PATHS.PRIVACY}#fechas-especiales`" target="_blank">
          Cómo usamos tus datos
        </RouterLink>
      </p>
    </template>
  </NModal>
</template>

<style scoped src="./community-emails-prompt.css"></style>
