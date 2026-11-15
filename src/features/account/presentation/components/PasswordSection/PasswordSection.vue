<script setup lang="ts">
import { nextTick, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton, useMessage } from 'naive-ui'
import { isAxiosError } from 'axios'
import { z } from 'zod'

import { useFormProblem } from '@/shared/composables/use-form-problem'
import PasswordRules from '@/shared/auth/PasswordRules.vue'
import { isAccountPassword, PASSWORD_RULE_MESSAGE } from '@/shared/auth/password-rule'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { fieldErrorText, focusFirstInvalid, sendClientForm } from '@/shared/utils/form.utils'
import { generalProblem } from '@/shared/utils/form-problem'
import { useChangePassword } from '../../../composables/mutations/use-change-password'
import { PASSWORD_FORM_DEFAULTS } from '../../../constants/profile-form.schema'

type Field = 'currentPassword' | 'newPassword'

// Messages the api gives, on the field they are about.
const FIELD_MESSAGES: Record<string, { field: Field; text: string }> = {
  'auth.current_password_invalid': {
    field: 'currentPassword',
    text: 'La contraseña actual no coincide.',
  },
  'auth.password_same_as_current': {
    field: 'newPassword',
    text: 'Usa una contraseña distinta a la actual.',
  },
}

const current = z.string().min(1, 'Escribe tu contraseña actual.')
const next = z.string().refine(isAccountPassword, PASSWORD_RULE_MESSAGE)

const message = useMessage()
const changePassword = useChangePassword({ silent: true })

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const problem = useFormProblem()
const serverErrors = ref<Partial<Record<Field, string>>>({})

const form = useForm({
  defaultValues: PASSWORD_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    problem.value = null
    serverErrors.value = {}
    try {
      await changePassword.mutateAsync({
        currentPassword: value.currentPassword,
        newPassword: value.newPassword,
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
    // Passwords never stay in memory longer than needed.
    form.reset()
    submitted.value = false
    message.success('Contraseña actualizada.')
  },
})

function validateRepeat({ value }: { value: string }) {
  if (!value) return 'Repite la contraseña nueva.'
  return value !== form.getFieldValue('newPassword') ? 'Las contraseñas no coinciden.' : undefined
}

function errorFor(name: Field | 'confirmNewPassword', field: Parameters<typeof fieldErrorText>[0]) {
  return (
    (name !== 'confirmNewPassword' && serverErrors.value[name]) ||
    fieldErrorText(field, submitted.value)
  )
}

function edit(
  name: Field | 'confirmNewPassword',
  field: { handleChange: (value: string) => void },
  event: Event,
) {
  if (name !== 'confirmNewPassword') delete serverErrors.value[name]
  field.handleChange((event.target as HTMLInputElement).value)
}

async function save() {
  if (changePassword.isPending.value) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <form ref="formRef" class="password-section" novalidate @submit.prevent="save">
    <form.Field name="currentPassword" :validators="{ onSubmit: current }">
      <template #default="{ field }">
        <FormField
          id="clave-actual"
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

    <form.Field name="newPassword" :validators="{ onSubmit: next }">
      <template #default="{ field }">
        <div class="password-section__new">
          <FormField
            id="clave-nueva"
            label="Nueva contraseña"
            :error="errorFor('newPassword', field)"
          >
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="password"
                autocomplete="new-password"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="edit('newPassword', field, $event)"
              />
            </template>
          </FormField>
          <PasswordRules :value="field.state.value" />
        </div>
      </template>
    </form.Field>

    <form.Field name="confirmNewPassword" :validators="{ onSubmit: validateRepeat }">
      <template #default="{ field }">
        <FormField
          id="clave-repite"
          label="Confirmar nueva contraseña"
          :error="errorFor('confirmNewPassword', field)"
        >
          <template #default="{ id, describedby, invalid }">
            <input
              :id="id"
              type="password"
              autocomplete="new-password"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value"
              @input="edit('confirmNewPassword', field, $event)"
            />
          </template>
        </FormField>
      </template>
    </form.Field>

    <FormAlert
      v-if="problem"
      :tone="problem.tone ?? 'bad'"
      :title="problem.title"
      :text="problem.text"
    />

    <NButton
      class="password-section__save"
      type="primary"
      size="large"
      attr-type="submit"
      :loading="changePassword.isPending.value"
      :disabled="changePassword.isPending.value"
      :aria-busy="changePassword.isPending.value ? 'true' : undefined"
    >
      Cambiar contraseña
    </NButton>
  </form>
</template>

<style scoped>
.password-section {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.password-section__new {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-2);
}

@media (min-width: 768px) {
  .password-section__save {
    align-self: flex-start;
  }
}
</style>
