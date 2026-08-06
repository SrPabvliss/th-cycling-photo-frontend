<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NFormItem, NInput, NButton, NCard, NIcon } from 'naive-ui'
import { MailOutline, ArrowBack, CheckmarkCircle } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { AUTH_ROUTE_NAMES } from '../../routes'
import { useForgotPasswordMutation } from '../../composables/mutations/use-forgot-password'
import {
  FORGOT_PASSWORD_FORM_DEFAULTS,
  forgotPasswordFormSchema,
} from '../../constants/forgot-password-form.schema'

const router = useRouter()
const { mutateAsync, isPending } = useForgotPasswordMutation()

const isSubmitted = ref(false)

const form = useForm({
  defaultValues: FORGOT_PASSWORD_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    try {
      await mutateAsync(value.email)
    } catch {
    } finally {
      isSubmitted.value = true
    }
  },
})
</script>

<template>
  <PublicLayout>
    <div v-if="isSubmitted" class="state-page">
      <div class="state-page__content">
        <div class="state-page__hero">
          <span class="state-page__code">OK</span>
          <div class="state-page__icon state-page__icon--success">
            <NIcon :component="CheckmarkCircle" :size="64" color="#fff" />
          </div>
        </div>

        <h1 class="state-page__title">Revisa tu correo</h1>
        <p class="state-page__description">
          Si el correo está registrado, te enviamos un enlace para restablecer tu contraseña. Revisa
          tu bandeja de entrada y la carpeta de spam.
        </p>

        <div class="state-page__actions">
          <NButton
            type="primary"
            size="large"
            @click="router.push({ name: AUTH_ROUTE_NAMES.LOGIN })"
          >
            <template #icon><NIcon :component="ArrowBack" /></template>
            Volver al inicio de sesión
          </NButton>
        </div>
      </div>
      <div class="state-page__mountain" />
    </div>

    <div v-else class="forgot-password-page">
      <NCard class="forgot-password-card">
        <div class="forgot-password-header">
          <TitanLogo :size="56" />
          <h1 class="forgot-password-title">Recupera tu contraseña</h1>
          <p class="forgot-password-subtitle">
            Ingresa tu correo y te enviaremos un enlace para restablecerla.
          </p>
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
            name="email"
            :validators="{
              onBlur: forgotPasswordFormSchema.shape.email,
              onSubmit: forgotPasswordFormSchema.shape.email,
            }"
          >
            <template v-slot="{ field }">
              <NFormItem label="Correo electrónico" required v-bind="fieldStatus(field)">
                <NInput placeholder="correo@ejemplo.com" v-bind="fieldInput(field)">
                  <template #prefix>
                    <NIcon :component="MailOutline" color="#9CA3AF" />
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
                :loading="isPending"
                :disabled="!canSubmit || isPending"
                attr-type="submit"
                class="forgot-password-submit"
              >
                Enviar enlace
              </NButton>
            </template>
          </form.Subscribe>
        </form>

        <p class="forgot-password-back">
          <RouterLink :to="{ name: AUTH_ROUTE_NAMES.LOGIN }">Volver al inicio de sesión</RouterLink>
        </p>
      </NCard>
    </div>
  </PublicLayout>
</template>

<style
  src="@/features/client-gallery/presentation/components/OrderConfirmation/order-confirmation.css"
></style>
<style scoped src="./styles/forgot-password-view.css" />
