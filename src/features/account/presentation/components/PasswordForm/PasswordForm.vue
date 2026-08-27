<script setup lang="ts">
import { useForm } from '@tanstack/vue-form'
import { NButton, NFormItem, NInput } from 'naive-ui'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useChangePassword } from '../../../composables/mutations/use-change-password'
import {
  PASSWORD_FORM_DEFAULTS,
  passwordFieldValidators as v,
} from '../../../constants/profile-form.schema'

const changePassword = useChangePassword()

const form = useForm({
  defaultValues: PASSWORD_FORM_DEFAULTS,
  onSubmit: ({ value }) => {
    changePassword.mutate(
      { currentPassword: value.currentPassword, newPassword: value.newPassword },
      { onSuccess: () => form.reset() },
    )
  },
})
</script>

<template>
  <form
    class="password-form"
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <div class="password-form__card">
      <form.Field
        name="currentPassword"
        :validators="{
          onMount: v.currentPassword,
          onChange: v.currentPassword,
          onBlur: v.currentPassword,
          onSubmit: v.currentPassword,
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="Contraseña actual" required v-bind="fieldStatus(field)">
            <NInput
              type="password"
              show-password-on="click"
              placeholder="Tu contraseña actual"
              v-bind="fieldInput(field)"
            />
          </NFormItem>
        </template>
      </form.Field>

      <form.Field
        name="newPassword"
        :validators="{
          onMount: v.newPassword,
          onChange: v.newPassword,
          onBlur: v.newPassword,
          onSubmit: v.newPassword,
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="Nueva contraseña" required v-bind="fieldStatus(field)">
            <NInput
              type="password"
              show-password-on="click"
              placeholder="Mínimo 8 caracteres"
              v-bind="fieldInput(field)"
            />
          </NFormItem>
        </template>
      </form.Field>

      <form.Field
        name="confirmNewPassword"
        :validators="{
          onMount: v.confirmNewPassword,
          onChangeListenTo: ['newPassword'],
          onChange: ({ value, fieldApi }) =>
            value !== fieldApi.form.getFieldValue('newPassword')
              ? 'Las contraseñas no coinciden'
              : undefined,
          onSubmit: ({ value, fieldApi }) =>
            !value
              ? 'Confirma la nueva contraseña'
              : value !== fieldApi.form.getFieldValue('newPassword')
                ? 'Las contraseñas no coinciden'
                : undefined,
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="Confirmar nueva contraseña" required v-bind="fieldStatus(field)">
            <NInput
              type="password"
              show-password-on="click"
              placeholder="Repite la nueva contraseña"
              v-bind="fieldInput(field)"
            />
          </NFormItem>
        </template>
      </form.Field>

      <div class="password-form__submit-bar">
        <form.Subscribe>
          <template v-slot="{ canSubmit }">
            <NButton
              type="primary"
              :loading="changePassword.isPending.value"
              :disabled="!canSubmit"
              attr-type="submit"
              class="password-form__submit"
            >
              Cambiar contraseña
            </NButton>
          </template>
        </form.Subscribe>
      </div>
    </div>
  </form>
</template>

<style scoped src="./password-form.css"></style>
