<script setup lang="ts">
import { computed, ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { useRouter } from 'vue-router'
import { NAlert, NButton, NCard, NFormItem, NIcon, NInput, NTag } from 'naive-ui'
import { MailOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useChangeEmail } from '../../../composables/mutations/use-change-email'
import { ACCOUNT_ROUTE_NAMES } from '../../../routes'
import {
  EMAIL_FORM_DEFAULTS,
  emailFieldValidators as v,
} from '../../../constants/profile-form.schema'

const router = useRouter()
const authStore = useSessionStore()
const changeEmail = useChangeEmail()

const isChanging = ref(false)
const isVerified = computed(() => authStore.currentUser?.emailVerified === true)

const form = useForm({
  defaultValues: EMAIL_FORM_DEFAULTS,
  onSubmit: ({ value }) => {
    changeEmail.mutate(
      { newEmail: value.newEmail, currentPassword: value.currentPassword },
      {
        onSuccess: () => {
          form.reset()
          isChanging.value = false
          router.push({ name: ACCOUNT_ROUTE_NAMES.VERIFY_EMAIL })
        },
      },
    )
  },
})
</script>

<template>
  <NCard title="Correo" class="email-section">
    <div class="email-section__row">
      <div
        class="email-section__icon"
        :class="isVerified ? 'email-section__icon--on' : 'email-section__icon--off'"
      >
        <NIcon :component="MailOutline" :size="20" />
      </div>

      <div class="email-section__info">
        <div class="email-section__address-line">
          <span>{{ authStore.currentUser?.email }}</span>
          <NTag v-if="isVerified" size="small" :bordered="false" class="email-section__tag">
            Verificado
          </NTag>
        </div>
        <div class="email-section__meta">
          {{ isVerified ? 'Confirmaste este correo' : 'Todavía sin verificar' }}
        </div>
      </div>

      <RouterLink
        v-if="!isVerified"
        class="email-section__verify-link"
        :to="{ name: ACCOUNT_ROUTE_NAMES.VERIFY_EMAIL }"
      >
        Verificar ahora
      </RouterLink>
    </div>

    <div v-if="!isChanging" class="email-section__change-bar">
      <NButton secondary size="medium" @click="isChanging = true">Cambiar correo</NButton>
    </div>

    <form
      v-else
      class="email-section__form"
      @submit="
        (e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }
      "
    >
      <form.Field
        name="newEmail"
        :validators="{
          onMount: v.newEmail,
          onChange: v.newEmail,
          onBlur: v.newEmail,
          onSubmit: v.newEmail,
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="Correo nuevo" required v-bind="fieldStatus(field)">
            <NInput placeholder="tu@correo.com" v-bind="fieldInput(field)" />
          </NFormItem>
        </template>
      </form.Field>

      <NAlert type="warning" :show-icon="true" class="email-section__warning">
        El correo nuevo pasará a ser con el que inicias sesión, y el actual dejará de servir. El
        cambio ocurre recién cuando confirmes el código que enviaremos a la dirección nueva: hasta
        entonces sigues entrando con
        <strong>{{ authStore.currentUser?.email }}</strong
        >.
      </NAlert>

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

      <div class="email-section__submit-bar">
        <form.Subscribe>
          <template v-slot="{ canSubmit }">
            <NButton
              type="primary"
              :loading="changeEmail.isPending.value"
              :disabled="!canSubmit"
              attr-type="submit"
              class="email-section__submit"
            >
              Enviar código
            </NButton>
          </template>
        </form.Subscribe>

        <NButton quaternary size="small" @click="isChanging = false">Cancelar</NButton>
      </div>
    </form>
  </NCard>
</template>

<style scoped src="./email-section.css"></style>
