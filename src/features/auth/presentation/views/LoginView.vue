<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NFormItem, NInput, NButton, NCard, NCheckbox, NIcon } from 'naive-ui'
import { MailOutline, LockClosedOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { EVENTS_PATH } from '@/features/events/routes'
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { useAuth } from '../../composables/use-auth'
import { LOGIN_FORM_DEFAULTS, loginFormSchema } from '../../constants/login-form.schema'

const router = useRouter()
const route = useRoute()
const { login, isLoggingIn } = useAuth()

const rememberMe = ref(false)

const form = useForm({
  defaultValues: LOGIN_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    try {
      await login(value)
      const redirect = (route.query.redirect as string) || EVENTS_PATH
      router.push(redirect)
    } catch {
      // Error toast is shown by error interceptor
      // Form preserves email field value
    }
  },
})
</script>

<template>
  <PublicLayout>
    <div class="login-page">
      <NCard class="login-card">
        <div class="login-header">
          <TitanLogo :size="56" />
          <h1 class="login-title">Bienvenido de nuevo</h1>
          <p class="login-subtitle">Acceso interno para administradores y clasificadores.</p>
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
              onBlur: loginFormSchema.shape.email,
              onSubmit: loginFormSchema.shape.email,
            }"
          >
            <template v-slot="{ field }">
              <NFormItem label="Correo electronico" required v-bind="fieldStatus(field)">
                <NInput placeholder="correo@titantv.com" v-bind="fieldInput(field)">
                  <template #prefix>
                    <NIcon :component="MailOutline" color="#9CA3AF" />
                  </template>
                </NInput>
              </NFormItem>
            </template>
          </form.Field>

          <form.Field
            name="password"
            :validators="{
              onBlur: loginFormSchema.shape.password,
              onSubmit: loginFormSchema.shape.password,
            }"
          >
            <template v-slot="{ field }">
              <NFormItem required v-bind="fieldStatus(field)">
                <template #label>
                  <div class="login-password-label">
                    <span>Contrasena</span>
                    <a href="#" class="login-forgot" @click.prevent>Olvidaste tu contrasena?</a>
                  </div>
                </template>
                <NInput
                  type="password"
                  show-password-on="click"
                  placeholder="••••••••"
                  :value="field.state.value"
                  @update:value="field.handleChange"
                  @blur="field.handleBlur"
                  @keydown.enter="form.handleSubmit()"
                >
                  <template #prefix>
                    <NIcon :component="LockClosedOutline" color="#9CA3AF" />
                  </template>
                </NInput>
              </NFormItem>
            </template>
          </form.Field>

          <NCheckbox v-model:checked="rememberMe" class="login-remember">
            Recordarme por 30 dias
          </NCheckbox>

          <form.Subscribe>
            <template v-slot="{ canSubmit }">
              <NButton
                type="primary"
                block
                size="large"
                :loading="isLoggingIn"
                :disabled="!canSubmit"
                attr-type="submit"
                class="login-submit"
              >
                Iniciar sesion
              </NButton>
            </template>
          </form.Subscribe>
        </form>

        <p class="login-create-account">
          ¿No tienes cuenta?
          <RouterLink to="/register">Crear cuenta</RouterLink>
        </p>
      </NCard>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/login-view.css" />
