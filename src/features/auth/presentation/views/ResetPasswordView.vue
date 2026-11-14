<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton } from 'naive-ui'

import { problemKind, type ProblemKind } from '@/core/http/problem-kind'
import { useSessionStore } from '@/core/auth/stores/session.store'
import PasswordRules from '@/shared/auth/PasswordRules.vue'
import { EmptyState } from '@/shared/components/empty-state'
import { ErrorState } from '@/shared/components/loading'
import { BusyNote } from '@/shared/components/loading'
import { fieldErrorText, sendClientForm } from '@/shared/utils/form.utils'
import AuthPage from '../components/AuthPage/AuthPage.vue'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import {
  useResetPasswordMutation,
  useValidateResetTokenMutation,
} from '../../composables/mutations/use-reset-password'
import {
  RESET_PASSWORD_FORM_DEFAULTS,
  resetPasswordFieldValidators,
} from '../../constants/reset-password-form.schema'
import { AUTH_ROUTE_NAMES, FORGOT_PASSWORD_PATH } from '../../routes'
import { failedStatus, generalProblem, type IFormProblem } from '@/shared/utils/form-problem'

const session = useSessionStore()
const { mutateAsync: validateToken } = useValidateResetTokenMutation()
const { mutateAsync: resetPassword, isPending: isSaving } = useResetPasswordMutation()

const token = ref('')
const screen = ref<'checking' | 'form' | 'useless' | 'unchecked' | 'done'>('checking')
const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const problem = ref<IFormProblem | null>(null)

// The token travels in the fragment (never sent to a server) and leaves the address at once.
onMounted(async () => {
  token.value = new URLSearchParams(window.location.hash.slice(1)).get('t') ?? ''
  window.history.replaceState(window.history.state, '', window.location.pathname)
  if (!token.value) {
    screen.value = 'useless'
    return
  }
  await checkLink()
})

const checkProblem = ref<ProblemKind>('unknown')

// Only the api's answer makes the link useless; no answer, or its failure, is said as such.
async function checkLink() {
  screen.value = 'checking'
  try {
    screen.value = (await validateToken(token.value)) ? 'form' : 'useless'
  } catch (error) {
    const status = failedStatus(error)
    checkProblem.value = problemKind(error)
    screen.value = status === 0 || status >= 500 ? 'unchecked' : 'useless'
  }
}

function validateRepeat({ value }: { value: string }) {
  if (!value) return 'Repite tu contraseña.'
  return value !== form.getFieldValue('password') ? 'Las contraseñas no coinciden.' : undefined
}

const form = useForm({
  defaultValues: RESET_PASSWORD_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    problem.value = null
    try {
      await resetPassword({ token: token.value, password: value.password })
      // Whoever was signed in here (maybe another account) is signed out.
      session.clearSession()
      screen.value = 'done'
    } catch (error) {
      const status = failedStatus(error)
      if (status === 422 || status === 400) screen.value = 'useless'
      else problem.value = generalProblem(error)
    }
  },
})

async function save() {
  if (isSaving.value) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <div v-if="screen === 'checking'" class="reset-password__center">
    <BusyNote text="Comprobando tu enlace" />
  </div>

  <div v-else-if="screen === 'useless'" class="reset-password__center">
    <EmptyState
      illustration="enlaceExpirado"
      title="Este enlace ya no sirve"
      text="Los enlaces para cambiar la contraseña duran 30 minutos y se usan una sola vez."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="FORGOT_PASSWORD_PATH" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Pedir otro enlace
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>
  </div>

  <div v-else-if="screen === 'unchecked'" class="reset-password__center">
    <ErrorState
      what="tu enlace"
      :kind="checkProblem"
      stacked
      title="No pudimos revisar tu enlace"
      text="El enlace sigue guardado aquí."
      @retry="checkLink"
    />
  </div>

  <div v-else-if="screen === 'done'" class="reset-password__center">
    <EmptyState
      illustration="correo"
      title="Contraseña actualizada"
      text="Ya puedes iniciar sesión con tu contraseña nueva."
      :heading-level="1"
    >
      <template #actions>
        <RouterLink v-slot="{ href, navigate }" :to="{ name: AUTH_ROUTE_NAMES.LOGIN }" custom>
          <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
            Iniciar sesión
          </NButton>
        </RouterLink>
      </template>
    </EmptyState>
  </div>

  <AuthPage v-else title="Crea una contraseña nueva">
    <form ref="formRef" class="reset-password__form" novalidate @submit.prevent="save">
      <FormAlert
        v-if="problem"
        :tone="problem.tone ?? 'bad'"
        :title="problem.title"
        :text="problem.text"
      />

      <form.Field name="password" :validators="{ onSubmit: resetPasswordFieldValidators.password }">
        <template #default="{ field }">
          <div class="reset-password__password">
            <FormField
              id="reset-password"
              label="Contraseña nueva"
              :error="fieldErrorText(field, submitted)"
            >
              <template #default="{ id, describedby, invalid }">
                <input
                  :id="id"
                  type="password"
                  autocomplete="new-password"
                  :aria-describedby="describedby"
                  :aria-invalid="invalid"
                  :value="field.state.value"
                  @input="field.handleChange(($event.target as HTMLInputElement).value)"
                />
              </template>
            </FormField>
            <PasswordRules :value="field.state.value" />
          </div>
        </template>
      </form.Field>

      <form.Field name="confirmPassword" :validators="{ onSubmit: validateRepeat }">
        <template #default="{ field }">
          <FormField
            id="reset-password2"
            label="Repite la contraseña"
            :error="fieldErrorText(field, submitted)"
          >
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="password"
                autocomplete="new-password"
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
        :loading="isSaving"
        :disabled="isSaving"
        :aria-busy="isSaving ? 'true' : undefined"
      >
        Guardar contraseña
      </NButton>
    </form>
  </AuthPage>
</template>

<style scoped>
.reset-password__center {
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

.reset-password__form,
.reset-password__password {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
}

.reset-password__password {
  gap: var(--tt-space-2);
}
</style>
