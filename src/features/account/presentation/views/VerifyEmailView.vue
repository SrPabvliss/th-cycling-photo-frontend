<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { NAlert, NButton, NInput } from 'naive-ui'
import { useIntervalFn } from '@vueuse/core'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { ACCOUNT_ROUTE_NAMES } from '../../routes'
import { useConfirmEmailVerification } from '../../composables/mutations/use-confirm-email-verification'
import { useResendEmailVerification } from '../../composables/mutations/use-resend-email-verification'
import { useSendEmailVerification } from '../../composables/mutations/use-send-email-verification'
import { useEmailVerificationStatusQuery } from '../../composables/queries/use-email-verification-status'

const CODE_LENGTH = 6
const RESEND_COOLDOWN_SECONDS = 60
const CONTACT_EMAIL = 'info@titantv.com.ec'

const router = useRouter()

const {
  data: status,
  isPending: isStatusLoading,
  isError: isStatusError,
  refetch: refetchStatus,
} = useEmailVerificationStatusQuery()

const sendVerification = useSendEmailVerification()
const resendVerification = useResendEmailVerification()
const confirmVerification = useConfirmEmailVerification()

const code = ref('')
const confirmed = ref(false)
const exhausted = ref(false)
const exhaustedForChangeEmail = ref(false)
const justResent = ref(false)
const now = ref(Date.now())
const cooldownUntil = ref<number | null>(null)

const { pause: stopClock } = useIntervalFn(() => {
  now.value = Date.now()
}, 1000)
onUnmounted(stopClock)

const isPending = computed(() => status.value?.pending ?? false)
const isChangeEmail = computed(() => status.value?.purpose === 'change_email')

const expiresAtMs = computed(() =>
  status.value?.expiresAt ? new Date(status.value.expiresAt).getTime() : null,
)

const secondsUntilExpiry = computed(() => {
  if (expiresAtMs.value === null) return 0
  return Math.max(0, Math.floor((expiresAtMs.value - now.value) / 1000))
})

const expiryLabel = computed(() => {
  const minutes = Math.floor(secondsUntilExpiry.value / 60)
  const seconds = secondsUntilExpiry.value % 60
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
})

const cooldownSeconds = computed(() => {
  if (!cooldownUntil.value) return 0
  return Math.max(0, Math.ceil((cooldownUntil.value - now.value) / 1000))
})
const canResend = computed(() => cooldownSeconds.value === 0)

const screen = computed<
  'loading' | 'error' | 'offer' | 'form' | 'expired' | 'exhausted' | 'success'
>(() => {
  if (confirmed.value) return 'success'
  if (exhausted.value) return 'exhausted'
  if (isStatusLoading.value) return 'loading'
  if (isStatusError.value) return 'error'
  if (status.value?.expired) return 'expired'
  if (isPending.value) return 'form'
  return 'offer'
})

const canConfirm = computed(
  () => code.value.length === CODE_LENGTH && !confirmVerification.isPending.value,
)

function startCooldown() {
  cooldownUntil.value = Date.now() + RESEND_COOLDOWN_SECONDS * 1000
}

function resetTransientState() {
  exhausted.value = false
  exhaustedForChangeEmail.value = false
  justResent.value = false
  code.value = ''
  confirmVerification.reset()
}

function onCodeInput(value: string) {
  code.value = value.replace(/\D/g, '').slice(0, CODE_LENGTH)
}

function handleSend() {
  sendVerification.mutate(undefined, {
    onSuccess: () => {
      resetTransientState()
      startCooldown()
    },
  })
}

function handleResend() {
  resendVerification.mutate(undefined, {
    onSuccess: () => {
      resetTransientState()
      justResent.value = true
      startCooldown()
    },
  })
}

function handleConfirm() {
  const wasChangeEmail = isChangeEmail.value
  confirmVerification.mutate(
    { code: code.value },
    {
      onSuccess: () => {
        confirmed.value = true
      },
      onError: async () => {
        const result = await refetchStatus()
        // Burnt means the backend consumed the code: nothing pending AND nothing expired waiting.
        if (result.data?.pending === false && result.data?.expired === false) {
          exhausted.value = true
          exhaustedForChangeEmail.value = wasChangeEmail
        }
      },
    },
  )
}

function goToProfile() {
  router.push({ name: ACCOUNT_ROUTE_NAMES.PROFILE })
}
</script>

<template>
  <PublicLayout>
    <div class="verify-email-view">
      <div class="verify-email-view__card">
        <div
          class="verify-email-view__illustration"
          :class="{ 'is-success': screen === 'success' }"
        >
          <svg
            viewBox="0 0 96 96"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            aria-hidden="true"
          >
            <circle cx="48" cy="48" r="48" fill="var(--tt-primary-light)" fill-opacity="0.16" />
            <rect
              x="18"
              y="30"
              width="60"
              height="42"
              rx="8"
              fill="var(--tt-surface)"
              stroke="var(--tt-primary)"
              stroke-width="2.5"
            />
            <path
              d="M20 34L48 55L76 34"
              stroke="var(--tt-primary)"
              stroke-width="2.5"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <template v-if="screen === 'success'">
              <circle cx="74" cy="26" r="16" fill="var(--tt-success)" />
              <path
                d="M67 26L72 31L81 21"
                stroke="white"
                stroke-width="3"
                stroke-linecap="round"
                stroke-linejoin="round"
                fill="none"
              />
            </template>
          </svg>
        </div>

        <template v-if="screen === 'loading'">
          <p class="verify-email-view__hint">Cargando el estado de tu verificación…</p>
        </template>

        <template v-else-if="screen === 'error'">
          <h1 class="verify-email-view__title">No pudimos cargar esto</h1>
          <p class="verify-email-view__hint">Intenta de nuevo en unos segundos.</p>
          <NButton
            type="primary"
            size="large"
            class="verify-email-view__action"
            @click="refetchStatus()"
          >
            Reintentar
          </NButton>
        </template>

        <template v-else-if="screen === 'offer'">
          <h1 class="verify-email-view__title">Verifiquemos tu correo</h1>
          <p class="verify-email-view__hint">
            Ayúdanos a darte un mejor servicio: confirma tu dirección y te avisamos de tus compras
            sin sorpresas. Te enviamos un código a tu correo registrado.
          </p>
          <NButton
            type="primary"
            size="large"
            class="verify-email-view__action"
            :loading="sendVerification.isPending.value"
            @click="handleSend"
          >
            Enviar código
          </NButton>
        </template>

        <template v-else-if="screen === 'form' || screen === 'expired'">
          <h1 class="verify-email-view__title">Revisa tu correo</h1>
          <p class="verify-email-view__target">
            Te enviamos un código a
            <strong>{{ status?.maskedTargetEmail }}</strong>
          </p>
          <NAlert
            v-if="isChangeEmail"
            type="warning"
            :show-icon="true"
            class="verify-email-view__warning"
          >
            Al confirmar este código, esa dirección pasa a ser con la que inicias sesión y la
            anterior deja de servir. Hasta entonces sigues entrando con la de siempre.
          </NAlert>

          <template v-if="screen === 'expired'">
            <p class="verify-email-view__hint is-warning">El código venció.</p>
            <NButton
              type="primary"
              size="large"
              class="verify-email-view__action"
              :loading="resendVerification.isPending.value"
              @click="handleResend"
            >
              Reenviar código
            </NButton>
          </template>

          <template v-else>
            <NInput
              class="verify-email-view__code-input"
              :value="code"
              maxlength="6"
              placeholder="000000"
              :input-props="{
                inputmode: 'numeric',
                autocomplete: 'one-time-code',
                pattern: '[0-9]*',
              }"
              @update:value="onCodeInput"
            />
            <p class="verify-email-view__hint">Vence en {{ expiryLabel }}</p>
            <p v-if="justResent" class="verify-email-view__notice">
              Te enviamos un código nuevo: el anterior ya no sirve, usa el del correo más reciente.
            </p>

            <NButton
              type="primary"
              size="large"
              class="verify-email-view__action"
              :disabled="!canConfirm"
              :loading="confirmVerification.isPending.value"
              @click="handleConfirm"
            >
              Confirmar código
            </NButton>

            <p
              v-if="isChangeEmail && confirmVerification.isError.value"
              class="verify-email-view__escape"
            >
              <a href="#" @click.prevent="goToProfile">Volver al perfil</a> para intentar con otra
              dirección.
            </p>

            <NButton
              size="large"
              class="verify-email-view__action"
              :disabled="!canResend"
              :loading="resendVerification.isPending.value"
              @click="handleResend"
            >
              {{ canResend ? 'Reenviar código' : `Reenviar en ${cooldownSeconds}s` }}
            </NButton>
          </template>

          <p class="verify-email-view__support">
            ¿No te llega?
            <a :href="`mailto:${CONTACT_EMAIL}`">Escríbenos</a>
          </p>
        </template>

        <template v-else-if="screen === 'exhausted'">
          <h1 class="verify-email-view__title">Se agotaron los intentos</h1>
          <p v-if="exhaustedForChangeEmail" class="verify-email-view__hint">
            Vuelve al perfil para pedir de nuevo el cambio de correo.
          </p>
          <p v-else class="verify-email-view__hint">
            Pide un código nuevo para volver a intentarlo.
          </p>

          <NButton
            v-if="exhaustedForChangeEmail"
            type="primary"
            size="large"
            class="verify-email-view__action"
            @click="goToProfile"
          >
            Volver al perfil
          </NButton>
          <NButton
            v-else
            type="primary"
            size="large"
            class="verify-email-view__action"
            :loading="sendVerification.isPending.value"
            @click="handleSend"
          >
            Pedir código nuevo
          </NButton>

          <p class="verify-email-view__support">
            ¿No te llega?
            <a :href="`mailto:${CONTACT_EMAIL}`">Escríbenos</a>
          </p>
        </template>

        <template v-else-if="screen === 'success'">
          <h1 class="verify-email-view__title">Listo, verificamos tu correo</h1>
          <p class="verify-email-view__hint">
            Gracias por confirmarlo. Ya puedes volver a tu perfil.
          </p>
          <NButton
            type="primary"
            size="large"
            class="verify-email-view__action"
            @click="goToProfile"
          >
            Volver al perfil
          </NButton>
        </template>
      </div>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/verify-email-view.css"></style>
