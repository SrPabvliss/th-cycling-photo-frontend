<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NButton } from 'naive-ui'
import { isAxiosError } from 'axios'
import { z } from 'zod'

import { useSessionStore } from '@/core/auth/stores/session.store'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { fieldErrorText, focusFirstInvalid, sendClientForm } from '@/shared/utils/form.utils'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useChangeEmail } from '../../../composables/mutations/use-change-email'
import { useSendEmailVerification } from '../../../composables/mutations/use-send-email-verification'
import { EMAIL_FORM_DEFAULTS } from '../../../constants/profile-form.schema'
import { ACCOUNT_ROUTE_NAMES } from '../../../routes'

type Field = 'newEmail' | 'currentPassword'

const EMAIL_MESSAGE = 'Escribe un correo válido, como tu@correo.com.'
const FIELD_MESSAGES: Record<string, { field: Field; text: string }> = {
  'auth.current_password_invalid': { field: 'currentPassword', text: 'La contraseña no coincide.' },
  'auth.email_change_same_as_current': { field: 'newEmail', text: 'Ese ya es tu correo.' },
  'auth.email_change_target_taken': {
    field: 'newEmail',
    text: 'Ya hay una cuenta con ese correo.',
  },
}

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const changeEmail = useChangeEmail({ silent: true })
const sendCode = useSendEmailVerification({ silent: true })

const email = computed(() => session.currentUser?.email ?? '')
const isVerified = computed(() => session.currentUser?.emailVerified === true)

const editing = ref(false)
const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const problem = ref<IFormProblem | null>(null)
const serverErrors = ref<Partial<Record<Field, string>>>({})

const newEmail = z.string().trim().min(1, EMAIL_MESSAGE).email(EMAIL_MESSAGE)
const currentPassword = z.string().min(1, 'Escribe tu contraseña actual.')

function validateEmail({ value }: { value: string }) {
  const parsed = newEmail.safeParse(value)
  if (!parsed.success) return parsed.error.issues[0]?.message
  return value.trim().toLowerCase() === email.value.toLowerCase()
    ? 'Ese ya es tu correo.'
    : undefined
}

// Confirming comes back to this section of the profile.
const back = computed(() => route.fullPath)
const goConfirm = () =>
  router.push({ name: ACCOUNT_ROUTE_NAMES.VERIFY_EMAIL, query: { redirect: back.value } })

const form = useForm({
  defaultValues: EMAIL_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    problem.value = null
    serverErrors.value = {}
    try {
      await changeEmail.mutateAsync({
        newEmail: value.newEmail.trim(),
        currentPassword: value.currentPassword,
      })
    } catch (error) {
      const key = isAxiosError(error)
        ? (error.response?.data as { error?: { messageKey?: string } } | undefined)?.error
            ?.messageKey
        : undefined
      const onField = key ? FIELD_MESSAGES[key] : undefined
      if (onField) {
        serverErrors.value = { [onField.field]: onField.text }
        await nextTick()
        focusFirstInvalid(formRef.value)
      } else problem.value = generalProblem(error)
      return
    }
    form.reset()
    editing.value = false
    await goConfirm()
  },
})

function errorFor(name: Field, field: Parameters<typeof fieldErrorText>[0]) {
  return serverErrors.value[name] ?? fieldErrorText(field, submitted.value)
}

function edit(name: Field, field: { handleChange: (value: string) => void }, event: Event) {
  delete serverErrors.value[name]
  field.handleChange((event.target as HTMLInputElement).value)
}

// The code is sent from here; if it cannot be, the confirmation screen offers to send it.
async function confirmEmail() {
  try {
    await sendCode.mutateAsync()
  } catch {
    // "Enviar código" is there.
  }
  await goConfirm()
}

function cancel() {
  form.reset()
  submitted.value = false
  serverErrors.value = {}
  problem.value = null
  editing.value = false
}

async function save() {
  if (changeEmail.isPending.value) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <div class="email-settings">
    <form
      v-if="editing"
      ref="formRef"
      class="email-settings__form"
      novalidate
      @submit.prevent="save"
    >
      <p class="email-settings__text">
        Hoy entras con <strong>{{ email }}</strong
        >. Te enviamos un código al correo nuevo para confirmarlo.
      </p>

      <form.Field name="newEmail" :validators="{ onSubmit: validateEmail }">
        <template #default="{ field }">
          <FormField id="correo-nuevo" label="Correo nuevo" :error="errorFor('newEmail', field)">
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="edit('newEmail', field, $event)"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="currentPassword" :validators="{ onSubmit: currentPassword }">
        <template #default="{ field }">
          <FormField
            id="correo-clave"
            label="Contraseña actual"
            :error="errorFor('currentPassword', field)"
          >
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="password"
                autocomplete="current-password"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="edit('currentPassword', field, $event)"
              />
            </template>
          </FormField>
        </template>
      </form.Field>

      <FormAlert v-if="problem" tone="bad" :title="problem.title" :text="problem.text" />

      <div class="email-settings__actions">
        <NButton
          type="primary"
          attr-type="submit"
          :loading="changeEmail.isPending.value"
          :disabled="changeEmail.isPending.value"
          :aria-busy="changeEmail.isPending.value ? 'true' : undefined"
        >
          Cambiar correo
        </NButton>
        <NButton @click="cancel">Cancelar</NButton>
      </div>
    </form>

    <template v-else>
      <div class="email-settings__current">
        <span>{{ email }}</span>
        <span class="email-settings__muted">
          {{ isVerified ? 'Confirmaste este correo' : 'Todavía sin verificar' }}
        </span>
      </div>
      <div class="email-settings__actions">
        <NButton
          v-if="!isVerified"
          type="primary"
          :loading="sendCode.isPending.value"
          :disabled="sendCode.isPending.value"
          @click="confirmEmail"
        >
          Confirmar mi correo
        </NButton>
        <NButton @click="editing = true">Cambiar correo</NButton>
      </div>
    </template>
  </div>
</template>

<style scoped>
.email-settings,
.email-settings__form {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.email-settings__current {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-1) / 2);
  overflow-wrap: anywhere;
}

.email-settings__muted,
.email-settings__text {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.email-settings__text strong {
  color: var(--tt-ink);
}

.email-settings__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tt-space-2);
}
</style>
