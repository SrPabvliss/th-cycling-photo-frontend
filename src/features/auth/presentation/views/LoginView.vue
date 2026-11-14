<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NButton, useMessage } from 'naive-ui'
import { isAxiosError } from 'axios'

import { getHomePath } from '@/core/auth/nav-config'
import { safeRedirect } from '@/core/navigation/safe-redirect'
import { useCartState } from '@/shared/cart'
import { fieldErrorText, sendClientForm } from '@/shared/utils/form.utils'
import AuthPage from '../components/AuthPage/AuthPage.vue'
import AuthTabs from '../components/AuthTabs/AuthTabs.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { useAuth } from '../../composables/use-auth'
import { LOGIN_FORM_DEFAULTS, loginFormSchema } from '../../constants/login-form.schema'
import { AUTH_ROUTE_NAMES } from '../../routes'
import { failedStatus, generalProblem, type IFormProblem } from '@/shared/utils/form-problem'

const CREDENTIALS_PROBLEM: IFormProblem = {
  title: 'Correo o contraseña incorrectos',
  text: 'Revisa los datos e intenta de nuevo.',
}
const DEACTIVATED_PROBLEM: IFormProblem = {
  title: 'Esta cuenta está desactivada',
  text: 'Escríbenos a info@titantv.com.ec para revisarla.',
}

// The api turns down a sign in with 422 and a key; a 401 means the same here.
function signInProblem(error: unknown): IFormProblem {
  const key = isAxiosError(error)
    ? (error.response?.data as { error?: { messageKey?: string } } | undefined)?.error?.messageKey
    : undefined
  if (key === 'auth.invalid_credentials' || failedStatus(error) === 401) return CREDENTIALS_PROBLEM
  if (key === 'auth.account_deactivated') return DEACTIVATED_PROBLEM
  return generalProblem(error)
}

const route = useRoute()
const router = useRouter()
const message = useMessage()
const { login, isLoggingIn } = useAuth()
const cart = useCartState()

// Only a route of this app: a link built elsewhere cannot send the buyer out of Titan TV.
const redirect = computed(() => safeRedirect(route.query.redirect))
const subtitle = computed(() =>
  redirect.value?.startsWith('/checkout/')
    ? 'Para continuar con tu pedido.'
    : 'Entra para ver y descargar tus fotos.',
)

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const problem = ref<IFormProblem | null>(null)

const form = useForm({
  defaultValues: LOGIN_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    problem.value = null
    // Counted before signing in: the account's cart is read again afterwards.
    const hadPhotos = cart.totalCount.value > 0
    try {
      const user = await login({ email: value.email.trim(), password: value.password })
      await router.replace(redirect.value ?? getHomePath(user.permissions))
      message.success(
        hadPhotos
          ? `Hola, ${user.firstName}. Tus fotos siguen en el carrito.`
          : `Hola, ${user.firstName}.`,
      )
    } catch (error) {
      problem.value = signInProblem(error)
    }
  },
})

async function send() {
  if (isLoggingIn.value) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <AuthPage title="Iniciar sesión" :subtitle="subtitle">
    <template #tabs>
      <AuthTabs current="login" :redirect="redirect" />
    </template>

    <form ref="formRef" class="login-form" novalidate @submit.prevent="send">
      <FormAlert v-if="problem" tone="bad" :title="problem.title" :text="problem.text" />

      <form.Field
        name="email"
        :validators="{ onBlur: loginFormSchema.shape.email, onSubmit: loginFormSchema.shape.email }"
      >
        <template #default="{ field }">
          <FormField id="login-email" label="Correo" :error="fieldErrorText(field, submitted)">
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="field.handleChange(($event.target as HTMLInputElement).value)"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field
        name="password"
        :validators="{
          onBlur: loginFormSchema.shape.password,
          onSubmit: loginFormSchema.shape.password,
        }"
      >
        <template #default="{ field }">
          <FormField
            id="login-password"
            label="Contraseña"
            :error="fieldErrorText(field, submitted)"
          >
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="password"
                autocomplete="current-password"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="field.handleChange(($event.target as HTMLInputElement).value)"
                @blur="field.handleBlur"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <RouterLink
        class="login-form__link tt-hit-area"
        :to="{ name: AUTH_ROUTE_NAMES.FORGOT_PASSWORD }"
      >
        ¿Olvidaste tu contraseña?
      </RouterLink>

      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        :loading="isLoggingIn"
        :disabled="isLoggingIn"
        :aria-busy="isLoggingIn ? 'true' : undefined"
      >
        Iniciar sesión
      </NButton>
    </form>
  </AuthPage>
</template>

<style scoped src="./styles/login-view.css" />
