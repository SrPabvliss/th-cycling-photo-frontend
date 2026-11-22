<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'

import { problemKind, type ProblemKind } from '@/core/http/problem-kind'
import { EmptyState } from '@/shared/components/empty-state'
import { BusyNote, ErrorState } from '@/shared/components/loading'
import { failedStatus } from '@/shared/utils/form-problem'
import { useUnsubscribeCommunityEmails } from '../../composables/mutations/use-unsubscribe-community-emails'
import { ACCOUNT_ROUTE_NAMES } from '../../routes'

// The switch of the account lives in its own section of the profile.
const ACCOUNT_LINK = { name: ACCOUNT_ROUTE_NAMES.PROFILE, query: { seccion: 'comunidad' } }

// No answer, too many tries or a timeout say nothing about the link.
const NOT_ABOUT_THE_LINK = new Set([408, 429])

const route = useRoute()
const { mutateAsync: unsubscribe } = useUnsubscribeCommunityEmails()

const screen = ref<'working' | 'done' | 'useless' | 'unchecked'>('working')
const problem = ref<ProblemKind>('unknown')
const isRetrying = ref(false)

const raw = route.query.t
const token = typeof raw === 'string' ? raw.trim() : ''

// Only the api's refusal makes the link useless; a failure to reach it is said as such.
async function send() {
  try {
    await unsubscribe(token)
    screen.value = 'done'
  } catch (error) {
    const status = failedStatus(error)
    problem.value = problemKind(error)
    screen.value =
      status >= 400 && status < 500 && !NOT_ABOUT_THE_LINK.has(status) ? 'useless' : 'unchecked'
  }
}

async function retry() {
  if (isRetrying.value) return
  isRetrying.value = true
  try {
    await send()
  } finally {
    isRetrying.value = false
  }
}

// Once, when the page opens from the email.
onMounted(() => {
  if (!token) {
    screen.value = 'useless'
    return
  }
  void send()
})
</script>

<template>
  <div class="email-unsubscribe">
    <BusyNote
      v-if="screen === 'working'"
      text="Dándote de baja de los correos de fechas especiales"
    />

    <EmptyState
      v-else-if="screen === 'done'"
      illustration="correo"
      title="Listo, ya no recibirás correos de fechas especiales"
      text="Puedes volver a activarlos desde tu cuenta."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="ACCOUNT_LINK" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a mi cuenta
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>

    <EmptyState
      v-else-if="screen === 'useless'"
      illustration="enlaceExpirado"
      problem
      title="Este enlace ya no sirve"
      text="Puede que esté incompleto o que haya vencido. También puedes desactivar los correos de fechas especiales desde tu cuenta."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="ACCOUNT_LINK" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Ir a mi cuenta
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>

    <ErrorState
      v-else
      what="tu enlace"
      :kind="problem"
      stacked
      title="No pudimos darte de baja"
      text="Inténtalo de nuevo en unos segundos."
      :retrying="isRetrying"
      @retry="retry"
    />
  </div>
</template>

<style scoped>
.email-unsubscribe {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: stretch;
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 7);
  margin-inline: auto;
  padding: var(--tt-space-6) var(--tt-space-4);
}
</style>
