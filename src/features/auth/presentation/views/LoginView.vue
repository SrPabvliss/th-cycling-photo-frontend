<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NIcon } from 'naive-ui'
import { MailOutline, LockClosedOutline } from '@vicons/ionicons5'

import { getFieldErrors } from '@/shared/utils/form.utils'
import { getHomePath } from '@/core/auth/role-config'
import AuthLayout from '@/core/layout/auth/AuthLayout.vue'
import { useAuth } from '../../composables/use-auth'
import { LOGIN_FORM_DEFAULTS, loginFormSchema } from '../../constants/login-form.schema'

const router = useRouter()
const route = useRoute()
const { login, isLoggingIn } = useAuth()

const rememberMe = ref(false)
const showPassword = ref(false)

const form = useForm({
  defaultValues: LOGIN_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    try {
      const user = await login(value)
      const redirect = route.query.redirect as string | undefined
      router.push(redirect ?? getHomePath(user.role))
    } catch {
      // Error toast is shown by error interceptor
    }
  },
})
</script>

<template>
  <AuthLayout mode="login">
    <!-- Header -->
    <div class="auth-eyebrow">Acceso · Titan TV</div>

    <!-- Tabs -->
    <div class="auth-tabs" role="tablist">
      <RouterLink to="/login" class="auth-tab auth-tab--active">Iniciar sesión</RouterLink>
      <RouterLink to="/register" class="auth-tab">Crear cuenta</RouterLink>
    </div>

    <h1 class="auth-title">Bienvenido<br />de vuelta.</h1>
    <p class="auth-sub">
      Accede a tu archivo de fotos, gestiona tus pedidos y recibe alertas de nuevas galerías.
    </p>
    <div style="min-height: 14px" />

    <!-- Form -->
    <form
      @submit="
        (e) => {
          e.preventDefault()
          e.stopPropagation()
          form.handleSubmit()
        }
      "
    >
      <!-- Email -->
      <form.Field
        name="email"
        :validators="{ onBlur: loginFormSchema.shape.email, onSubmit: loginFormSchema.shape.email }"
      >
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label" :for="field.name">
              Correo electrónico <span class="auth-req">*</span>
            </label>
            <div class="auth-input-wrap">
              <span class="auth-field-icon">
                <NIcon :component="MailOutline" :size="16" />
              </span>
              <input
                :id="field.name"
                type="email"
                class="auth-input auth-input--icon"
                placeholder="correo@ejemplo.com"
                :value="field.state.value"
                @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
                @blur="field.handleBlur"
              />
            </div>
            <div v-if="field.state.meta.errors.length" class="auth-field-error">
              {{ getFieldErrors(field.state.meta.errors) }}
            </div>
          </div>
        </template>
      </form.Field>

      <!-- Password -->
      <form.Field
        name="password"
        :validators="{
          onBlur: loginFormSchema.shape.password,
          onSubmit: loginFormSchema.shape.password,
        }"
      >
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label auth-label--row" :for="field.name">
              <span>Contraseña <span class="auth-req">*</span></span>
              <a href="#" class="auth-label-link" @click.prevent>¿Olvidaste tu contraseña?</a>
            </label>
            <div class="auth-input-wrap">
              <span class="auth-field-icon">
                <NIcon :component="LockClosedOutline" :size="16" />
              </span>
              <input
                :id="field.name"
                :type="showPassword ? 'text' : 'password'"
                class="auth-input auth-input--icon auth-input--pass"
                placeholder="Mínimo 8 caracteres"
                :value="field.state.value"
                @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
                @blur="field.handleBlur"
                @keydown.enter="form.handleSubmit()"
              />
              <button
                type="button"
                class="auth-pass-toggle"
                :style="showPassword ? 'color: var(--titan-blue)' : ''"
                @click="showPassword = !showPassword"
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                >
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                  <circle cx="12" cy="12" r="3" />
                </svg>
              </button>
            </div>
            <div v-if="field.state.meta.errors.length" class="auth-field-error">
              {{ getFieldErrors(field.state.meta.errors) }}
            </div>
          </div>
        </template>
      </form.Field>

      <!-- Remember me -->
      <label class="auth-checkbox-row">
        <input v-model="rememberMe" type="checkbox" />
        <span>Recordarme por 30 días en este dispositivo</span>
      </label>

      <!-- Submit -->
      <form.Subscribe>
        <template v-slot="{ canSubmit }">
          <button type="submit" class="auth-btn-cta" :disabled="!canSubmit || isLoggingIn">
            <span v-if="isLoggingIn">Ingresando…</span>
            <template v-else>
              Iniciar sesión
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </template>
          </button>
        </template>
      </form.Subscribe>
    </form>

    <div class="auth-switch-row">
      ¿No tienes cuenta? <RouterLink to="/register">Crear cuenta</RouterLink>
    </div>
  </AuthLayout>
</template>

<style scoped src="./styles/login-view.css" />
