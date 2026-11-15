<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { safeRedirect } from '@/core/navigation/safe-redirect'
import { useSendEmailVerification } from '@/features/account/composables/mutations/use-send-email-verification'
import AuthPage from '../components/AuthPage/AuthPage.vue'
import AuthTabs from '../components/AuthTabs/AuthTabs.vue'
import { useFormProblem } from '@/shared/composables/use-form-problem'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import RegisterForm, { type RegisterField } from '../components/RegisterForm/RegisterForm.vue'
import { useAuth } from '../../composables/use-auth'
import type { IRegisterFormData } from '../../constants/register-form.schema'
import { toRegisterRequest } from '../../mappers/register-form.mapper'
import { generalProblem } from '@/shared/utils/form-problem'

const EMAIL_TAKEN_KEY = 'auth.email_already_exists'

// Fields of the api and the field of the form that shows their message.
const FIELD_OF: Record<string, RegisterField> = {
  email: 'email',
  password: 'password',
  firstName: 'firstName',
  lastName: 'lastName',
  phoneNumber: 'phoneNumber',
  countryId: 'countryId',
  birthDate: 'birthDay',
  guardianConsent: 'guardianConsent',
  acceptedTerms: 'acceptedTerms',
}

const route = useRoute()
const router = useRouter()
const { register, isRegistering } = useAuth()
const sendCode = useSendEmailVerification({ silent: true })

const redirect = computed(() => safeRedirect(route.query.redirect))
const redirectQuery = computed(() => (redirect.value ? { redirect: redirect.value } : {}))

const serverErrors = ref<Partial<Record<RegisterField, string>>>({})
const emailTaken = ref(false)
const problem = useFormProblem()

function fieldErrors(error: unknown): Partial<Record<RegisterField, string>> {
  if (!isAxiosError(error) || error.response?.status !== 400) return {}
  const fields = (error.response.data as { error?: { fields?: Record<string, string[]> } })?.error
    ?.fields
  const found: Partial<Record<RegisterField, string>> = {}
  for (const [name, messages] of Object.entries(fields ?? {})) {
    const target = FIELD_OF[name]
    if (target && messages[0]) found[target] = messages[0]
  }
  return found
}

async function handleSubmit(formData: IRegisterFormData) {
  problem.value = null
  emailTaken.value = false
  serverErrors.value = {}
  try {
    await register(toRegisterRequest(formData))
  } catch (error) {
    const key = isAxiosError(error)
      ? (error.response?.data as { error?: { messageKey?: string } } | undefined)?.error?.messageKey
      : undefined
    if (isAxiosError(error) && error.response?.status === 409 && key === EMAIL_TAKEN_KEY) {
      emailTaken.value = true
      return
    }
    const byField = fieldErrors(error)
    if (Object.keys(byField).length > 0) serverErrors.value = byField
    else problem.value = generalProblem(error)
    return
  }

  // The account exists and the session is open: confirm the email right away. If the code
  // could not be sent, the confirmation screen offers to send it again.
  try {
    await sendCode.mutateAsync()
  } catch {
    // "Reenviar código" is there.
  }
  await router.replace({ path: `${ROUTE_PATHS.ACCOUNT}/verify-email`, query: redirectQuery.value })
}
</script>

<template>
  <AuthPage title="Crear cuenta" subtitle="Para comprar y guardar tus fotos de competencia.">
    <template #tabs>
      <AuthTabs current="register" :redirect="redirect" />
    </template>

    <RegisterForm
      :is-submitting="isRegistering"
      :server-errors="serverErrors"
      :email-taken="emailTaken"
      :login-to="{ path: ROUTE_PATHS.LOGIN, query: redirectQuery }"
      @submit="handleSubmit"
    >
      <template #problem>
        <FormAlert
          v-if="problem"
          :tone="problem.tone ?? 'bad'"
          :title="problem.title"
          :text="problem.text"
        />
      </template>
    </RegisterForm>
  </AuthPage>
</template>
