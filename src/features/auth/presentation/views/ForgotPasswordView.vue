<script setup lang="ts">
import { ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton } from 'naive-ui'

import { useFormProblem } from '@/shared/composables/use-form-problem'
import { EmptyState } from '@/shared/components/empty-state'
import { fieldErrorText, sendClientForm } from '@/shared/utils/form.utils'
import AuthPage from '../components/AuthPage/AuthPage.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { useForgotPasswordMutation } from '../../composables/mutations/use-forgot-password'
import {
  FORGOT_PASSWORD_FORM_DEFAULTS,
  forgotPasswordFormSchema,
} from '../../constants/forgot-password-form.schema'
import { AUTH_ROUTE_NAMES } from '../../routes'
import { generalProblem } from '@/shared/utils/form-problem'

const { mutateAsync: requestLink, isPending } = useForgotPasswordMutation()

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const sent = ref(false)
const problem = useFormProblem()

// Only an accepted request says the link is on its way. The api accepts an email with no
// account too, so the message never tells whether there is one.
const form = useForm({
  defaultValues: FORGOT_PASSWORD_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    problem.value = null
    try {
      await requestLink(value.email.trim())
      sent.value = true
    } catch (error) {
      problem.value = generalProblem(error)
    }
  },
})

async function send() {
  if (isPending.value || form.state.isSubmitting) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <div v-if="sent" class="forgot-password__done">
    <EmptyState
      illustration="correo"
      title="Revisa tu correo"
      text="Si hay una cuenta con ese correo, te llega un enlace para crear una contraseña nueva. Dura 30 minutos."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink class="forgot-password__link" :to="{ name: AUTH_ROUTE_NAMES.LOGIN }">
          Volver a iniciar sesión
        </RouterLink>
      </template>
    </EmptyState>
  </div>

  <AuthPage
    v-else
    title="Recuperar contraseña"
    subtitle="Escribe tu correo y te enviamos un enlace para crear una nueva."
  >
    <form ref="formRef" class="forgot-password__form" novalidate @submit.prevent="send">
      <FormAlert
        v-if="problem"
        :tone="problem.tone ?? 'bad'"
        :title="problem.title"
        :text="problem.text"
      />

      <form.Field name="email" :validators="{ onSubmit: forgotPasswordFormSchema.shape.email }">
        <template #default="{ field }">
          <FormField id="forgot-email" label="Correo" :error="fieldErrorText(field, submitted)">
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
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <NButton
        type="primary"
        size="large"
        block
        attr-type="submit"
        :loading="isPending"
        :disabled="isPending"
        :aria-busy="isPending ? 'true' : undefined"
      >
        Enviar enlace
      </NButton>

      <RouterLink class="forgot-password__link" :to="{ name: AUTH_ROUTE_NAMES.LOGIN }">
        Volver a iniciar sesión
      </RouterLink>
    </form>
  </AuthPage>
</template>

<style scoped>
.forgot-password__form {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
}

.forgot-password__done {
  flex: 1 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  inline-size: 100%;
  max-inline-size: calc(var(--tt-space-8) * 7);
  margin-inline: auto;
  padding: var(--tt-space-6) var(--tt-space-4);
}

.forgot-password__link {
  display: flex;
  align-items: center;
  justify-content: center;
  min-block-size: var(--tt-control-m);
  color: var(--tt-primary-ink);
  text-decoration: none;
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
}
</style>
