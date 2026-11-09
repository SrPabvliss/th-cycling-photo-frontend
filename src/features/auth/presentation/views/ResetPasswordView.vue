<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NFormItem, NInput, NButton, NCard, NIcon, NSpin } from 'naive-ui'
import { LockClosedOutline, AlertCircleOutline, ArrowBack } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { AUTH_ROUTE_NAMES, FORGOT_PASSWORD_PATH } from '../../routes'
import { useSessionStore } from '@/core/auth/stores/session.store'
import {
  useResetPasswordMutation,
  useValidateResetTokenMutation,
} from '../../composables/mutations/use-reset-password'
import {
  RESET_PASSWORD_FORM_DEFAULTS,
  resetPasswordFieldValidators,
  resetPasswordFormSchema,
} from '../../constants/reset-password-form.schema'

const router = useRouter()
const authStore = useSessionStore()

const token = ref('')
const isTokenChecked = ref(false)
const isTokenValid = ref(false)

const { mutateAsync: validateToken } = useValidateResetTokenMutation()
const { mutateAsync: resetPassword, isPending: isResetting } = useResetPasswordMutation()

onMounted(async () => {
  const hashParams = new URLSearchParams(window.location.hash.slice(1))
  token.value = hashParams.get('t') ?? ''
  window.history.replaceState(null, '', window.location.pathname)

  if (!token.value) {
    isTokenChecked.value = true
    return
  }

  try {
    isTokenValid.value = await validateToken(token.value)
  } catch {
    isTokenValid.value = false
  } finally {
    isTokenChecked.value = true
  }
})

const form = useForm({
  defaultValues: RESET_PASSWORD_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    try {
      await resetPassword({ token: token.value, password: value.password })
      authStore.clearSession()
      router.push({ name: AUTH_ROUTE_NAMES.LOGIN })
    } catch {}
  },
})
</script>

<template>
  <PublicLayout>
    <div v-if="isTokenChecked && (!token || !isTokenValid)" class="state-page">
      <div class="state-page__content">
        <div class="state-page__hero">
          <span class="state-page__code">EXP</span>
          <div class="state-page__icon state-page__icon--invalid">
            <NIcon :component="AlertCircleOutline" :size="56" color="#fff" />
          </div>
        </div>

        <h1 class="state-page__title">Enlace no válido</h1>
        <p class="state-page__description">
          Este enlace ya no es válido. Pudo haber expirado o haberse usado. Solicita uno nuevo.
        </p>

        <div class="state-page__actions">
          <NButton type="primary" size="large" @click="router.push(FORGOT_PASSWORD_PATH)">
            <template #icon><NIcon :component="ArrowBack" /></template>
            Solicitar nuevo enlace
          </NButton>
        </div>
      </div>

      <div class="state-page__mountain" />
    </div>

    <div v-else class="reset-password-page">
      <NCard class="reset-password-card">
        <div v-if="!isTokenChecked" class="reset-password-loading">
          <NSpin size="large" />
        </div>

        <template v-else>
          <div class="reset-password-header">
            <TitanLogo :size="56" />
            <h1 class="reset-password-title">Crea una nueva contraseña</h1>
            <p class="reset-password-subtitle">Elige una contraseña segura para tu cuenta.</p>
          </div>

          <form
            @submit="
              (e) => {
                e.preventDefault()
                e.stopPropagation()
                form.handleSubmit()
              }
            "
          >
            <form.Field
              name="password"
              :validators="{
                onBlur: resetPasswordFieldValidators.password,
                onSubmit: resetPasswordFieldValidators.password,
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Nueva contraseña" required v-bind="fieldStatus(field)">
                  <NInput
                    type="password"
                    show-password-on="click"
                    placeholder="Mínimo 8 caracteres"
                    v-bind="fieldInput(field)"
                  >
                    <template #prefix>
                      <NIcon :component="LockClosedOutline" color="#9CA3AF" />
                    </template>
                  </NInput>
                </NFormItem>
              </template>
            </form.Field>

            <form.Field
              name="confirmPassword"
              :validators="{
                onChangeListenTo: ['password'],
                onChange: ({ value, fieldApi }) =>
                  value !== fieldApi.form.getFieldValue('password')
                    ? 'Las contraseñas no coinciden'
                    : undefined,
                onSubmit: ({ value, fieldApi }) =>
                  resetPasswordFormSchema.safeParse({
                    password: fieldApi.form.getFieldValue('password'),
                    confirmPassword: value,
                  }).success
                    ? undefined
                    : 'Las contraseñas no coinciden',
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Confirmar contraseña" required v-bind="fieldStatus(field)">
                  <NInput
                    type="password"
                    show-password-on="click"
                    placeholder="Repite tu contraseña"
                    v-bind="fieldInput(field)"
                  >
                    <template #prefix>
                      <NIcon :component="LockClosedOutline" color="#9CA3AF" />
                    </template>
                  </NInput>
                </NFormItem>
              </template>
            </form.Field>

            <form.Subscribe>
              <template v-slot="{ canSubmit }">
                <NButton
                  type="primary"
                  block
                  size="large"
                  :loading="isResetting"
                  :disabled="!canSubmit || isResetting"
                  attr-type="submit"
                  class="reset-password-submit"
                >
                  Restablecer contraseña
                </NButton>
              </template>
            </form.Subscribe>
          </form>

          <p class="reset-password-back">
            <RouterLink :to="{ name: AUTH_ROUTE_NAMES.LOGIN }"
              >Volver al inicio de sesión</RouterLink
            >
          </p>
        </template>
      </NCard>
    </div>
  </PublicLayout>
</template>

<style
  src="@/features/client-gallery/presentation/components/OrderConfirmation/order-confirmation.css"
></style>
<style scoped src="./styles/reset-password-view.css" />
