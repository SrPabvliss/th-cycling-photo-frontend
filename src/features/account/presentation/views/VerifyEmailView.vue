<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'

import { problemKind } from '@/core/http/problem-kind'
import { safeRedirect } from '@/core/navigation/safe-redirect'
import AuthPage from '@/features/auth/presentation/components/AuthPage/AuthPage.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { EmptyState } from '@/shared/components/empty-state'
import { BusyNote, ErrorState, useLoadPhase } from '@/shared/components/loading'
import { useConfirmEmailVerification } from '../../composables/mutations/use-confirm-email-verification'
import { useResendEmailVerification } from '../../composables/mutations/use-resend-email-verification'
import { useSendEmailVerification } from '../../composables/mutations/use-send-email-verification'
import { useEmailVerificationStatusQuery } from '../../composables/queries/use-email-verification-status'
import { useResendCooldown } from '../../composables/use-resend-cooldown'
import { ACCOUNT_ROUTE_NAMES } from '../../routes'
import CodeInput from '../components/CodeInput/CodeInput.vue'

// The api's numbers: a code lasts 15 minutes and a new one can be asked for every 60 seconds.
const CODE_LIFETIME_MINUTES = 15
const RESEND_EVERY_SECONDS = 60
const CODE_LENGTH = 6
const CONTACT_EMAIL = 'info@titantv.com.ec'
const SECOND = 1000

interface IAlert {
  tone: 'bad' | 'warn' | 'info'
  title: string
  text?: string
}

const NETWORK_ALERT: IAlert = {
  tone: 'warn',
  title: 'No se pudo completar',
  text: 'Parece un problema de conexión. Nada se perdió: intenta de nuevo.',
}
const TOO_MANY_ALERT: IAlert = {
  tone: 'warn',
  title: 'Demasiados intentos. Espera unos minutos antes de pedir otro código.',
}
const RESENT_ALERT: IAlert = {
  tone: 'info',
  title: 'Te enviamos un código nuevo',
  text: 'El anterior ya no sirve: usa el del correo más reciente.',
}

const route = useRoute()
const router = useRouter()

const returnPath = computed(() => safeRedirect(route.query.redirect))
const isReturningToContract = computed(() => returnPath.value?.startsWith('/contracts/') ?? false)

const {
  data: status,
  isPending: isStatusLoading,
  isError: isStatusError,
  error: statusError,
  isFetching: isStatusFetching,
  refetch: refetchStatus,
} = useEmailVerificationStatusQuery()
// Without network a status that did not load waits for it: the error state says so.
const { isWaitingForNetwork: isStatusWaiting } = useLoadPhase(() =>
  isStatusLoading.value ? 'pending' : isStatusError.value ? 'error' : 'success',
)
const sendCode = useSendEmailVerification({ silent: true })
const resendCode = useResendEmailVerification({ silent: true })
const confirmCode = useConfirmEmailVerification({ silent: true })
const cooldown = useResendCooldown(RESEND_EVERY_SECONDS)

const code = ref('')
const codeInput = ref<InstanceType<typeof CodeInput> | null>(null)
const alert = ref<IAlert | null>(null)
const wrongCode = ref(false)
const confirmed = ref(false)
const exhausted = ref(false)
const isChangeEmail = computed(() => status.value?.purpose === 'change_email')

const screen = computed(() => {
  if (confirmed.value) return 'confirmed'
  if (exhausted.value) return 'exhausted'
  if (isStatusWaiting.value) return 'error'
  if (isStatusLoading.value) return 'loading'
  if (isStatusError.value && !status.value) return 'error'
  if (status.value?.expired) return 'expired'
  if (status.value?.pending) return 'code'
  return 'offer'
})

// A code sent less than a minute ago (right after signing up, say) cannot be sent again yet.
function waitAfterLastCode() {
  const expiresAt = status.value?.expiresAt ? new Date(status.value.expiresAt).getTime() : null
  if (!status.value?.pending || expiresAt === null) return
  const sentAt = expiresAt - CODE_LIFETIME_MINUTES * 60 * SECOND
  const left = RESEND_EVERY_SECONDS - (Date.now() - sentAt) / SECOND
  if (left > 0) cooldown.start(left)
}
onMounted(waitAfterLastCode)
watch(() => status.value?.expiresAt, waitAfterLastCode)

const messageKeyOf = (error: unknown) =>
  isAxiosError(error)
    ? (error.response?.data as { error?: { messageKey?: string; message?: string } } | undefined)
        ?.error
    : undefined
const statusOf = (error: unknown) => (isAxiosError(error) ? (error.response?.status ?? 0) : -1)

function startOver() {
  code.value = ''
  codeInput.value?.focusFirst()
}

async function confirm() {
  if (code.value.length !== CODE_LENGTH || confirmCode.isPending.value) return
  alert.value = null
  wrongCode.value = false
  try {
    await confirmCode.mutateAsync({ code: code.value })
    confirmed.value = true
  } catch (error) {
    const body = messageKeyOf(error)
    const key = body?.messageKey
    if (key === 'auth.email_verification_no_attempts_left') {
      exhausted.value = true
      return
    }
    if (
      key === 'auth.email_verification_expired' ||
      key === 'auth.email_verification_not_pending'
    ) {
      await refetchStatus()
      return
    }
    if (key === 'auth.email_verification_invalid') {
      const { data } = await refetchStatus()
      const left = data?.attemptsRemaining
      if (left === 0) {
        exhausted.value = true
        return
      }
      wrongCode.value = true
      const tries =
        left == null ? '' : left === 1 ? ' Te queda 1 intento.' : ` Te quedan ${left} intentos.`
      alert.value = {
        tone: 'bad',
        title: 'Código incorrecto',
        text: `Revisa el correo e intenta de nuevo.${tries}`,
      }
      startOver()
      return
    }
    const failed = statusOf(error)
    alert.value =
      failed === 0 || failed >= 500 || !body?.message
        ? NETWORK_ALERT
        : { tone: 'bad', title: 'No se pudo completar', text: body.message }
  }
}

async function requestCode(kind: 'send' | 'resend') {
  if (!cooldown.canResend.value) return
  alert.value = null
  wrongCode.value = false
  try {
    await (kind === 'send' ? sendCode : resendCode).mutateAsync()
    exhausted.value = false
    code.value = ''
    cooldown.start()
    if (kind === 'resend') alert.value = RESENT_ALERT
    await refetchStatus()
  } catch (error) {
    alert.value = statusOf(error) === 429 ? TOO_MANY_ALERT : NETWORK_ALERT
  }
}

function continueAfter() {
  router.push(returnPath.value ?? '/')
}
</script>

<template>
  <div v-if="screen === 'loading'" class="verify-email__center">
    <BusyNote text="Cargando" />
  </div>

  <div v-else-if="screen === 'error'" class="verify-email__center">
    <ErrorState
      what="el estado de tu correo"
      :kind="problemKind(statusError)"
      stacked
      :retrying="isStatusFetching"
      @retry="refetchStatus()"
    />
  </div>

  <div v-else-if="screen === 'confirmed'" class="verify-email__center">
    <EmptyState
      illustration="correo"
      title="Correo confirmado"
      :text="
        isReturningToContract
          ? 'Ya puedes volver a tu contrato para aceptarlo.'
          : 'Tu cuenta está lista.'
      "
      :heading-level="1"
    >
      <template #actions>
        <NButton type="primary" size="large" block @click="continueAfter">
          {{ isReturningToContract ? 'Volver al contrato' : 'Continuar' }}
        </NButton>
      </template>
    </EmptyState>
  </div>

  <div v-else-if="screen === 'exhausted'" class="verify-email__center">
    <EmptyState
      illustration="enlaceExpirado"
      title="Se agotaron los intentos"
      :text="
        isChangeEmail
          ? 'Vuelve a tu perfil para pedir de nuevo el cambio de correo.'
          : 'Pide un código nuevo para volver a intentarlo.'
      "
      :heading-level="1"
    >
      <template #actions>
        <RouterLink
          v-if="isChangeEmail"
          v-slot="{ href, navigate }"
          :to="{ name: ACCOUNT_ROUTE_NAMES.PROFILE }"
          custom
        >
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Volver al perfil
          </NButton>
        </RouterLink>
        <NButton
          v-else
          type="primary"
          size="large"
          block
          :loading="sendCode.isPending.value"
          :disabled="sendCode.isPending.value"
          @click="requestCode('send')"
        >
          Pedir código nuevo
        </NButton>
        <FormAlert v-if="alert" :tone="alert.tone" :title="alert.title" :text="alert.text" />
      </template>
    </EmptyState>
  </div>

  <div v-else-if="screen === 'expired'" class="verify-email__center">
    <EmptyState
      illustration="enlaceExpirado"
      title="El código venció"
      :text="`Los códigos duran ${CODE_LIFETIME_MINUTES} minutos. Pide uno nuevo y usa el del correo más reciente.`"
      :heading-level="1"
    >
      <template #actions>
        <NButton
          type="primary"
          size="large"
          block
          :loading="resendCode.isPending.value"
          :disabled="resendCode.isPending.value || !cooldown.canResend.value"
          @click="requestCode('resend')"
        >
          {{
            cooldown.canResend.value
              ? 'Reenviar código'
              : `Reenviar en ${cooldown.remaining.value} s`
          }}
        </NButton>
        <FormAlert v-if="alert" :tone="alert.tone" :title="alert.title" :text="alert.text" />
      </template>
    </EmptyState>
  </div>

  <AuthPage v-else-if="screen === 'offer'" title="Verifiquemos tu correo">
    <p class="verify-email__text">
      Confirma tu dirección y ahí te avisamos de tus compras y tus facturas.
    </p>
    <FormAlert v-if="alert" :tone="alert.tone" :title="alert.title" :text="alert.text" />
    <NButton
      type="primary"
      size="large"
      block
      :loading="sendCode.isPending.value"
      :disabled="sendCode.isPending.value"
      @click="requestCode('send')"
    >
      Enviar código
    </NButton>
    <RouterLink class="verify-email__link verify-email__later" to="/">Ahora no</RouterLink>
  </AuthPage>

  <AuthPage v-else title="Revisa tu correo">
    <p class="verify-email__text">
      Te enviamos un código de 6 dígitos a
      <strong class="verify-email__target">{{ status?.maskedTargetEmail }}</strong
      >.
    </p>

    <FormAlert
      v-if="isChangeEmail"
      tone="info"
      title="Estás cambiando tu correo"
      text="Al confirmar este código, esa dirección pasa a ser con la que inicias sesión."
    />

    <form class="verify-email__form" novalidate @submit.prevent="confirm">
      <CodeInput ref="codeInput" v-model="code" :invalid="wrongCode" @complete="confirm" />
      <FormAlert v-if="alert" :tone="alert.tone" :title="alert.title" :text="alert.text" />
      <p class="verify-email__note">El código vence en {{ CODE_LIFETIME_MINUTES }} minutos.</p>
      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        :loading="confirmCode.isPending.value"
        :disabled="code.length !== CODE_LENGTH || confirmCode.isPending.value"
        :aria-busy="confirmCode.isPending.value ? 'true' : undefined"
      >
        Confirmar código
      </NButton>
      <button
        type="button"
        class="verify-email__link"
        :disabled="!cooldown.canResend.value || resendCode.isPending.value"
        @click="requestCode('resend')"
      >
        {{
          cooldown.canResend.value ? 'Reenviar código' : `Reenviar en ${cooldown.remaining.value} s`
        }}
      </button>
    </form>

    <p class="verify-email__note">
      ¿No te llega? Escríbenos a <span class="verify-email__contact">{{ CONTACT_EMAIL }}</span>
    </p>
  </AuthPage>
</template>

<style scoped src="./styles/verify-email-view.css"></style>
