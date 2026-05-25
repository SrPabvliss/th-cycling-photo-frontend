<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useForm } from '@tanstack/vue-form'
import { NAlert, NFormItem, NInput, NButton, NCard, NIcon } from 'naive-ui'
import { MailOutline, LockClosedOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { getHomePath } from '@/core/auth/role-config'
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import AuthModeTabs from '../components/AuthModeTabs/AuthModeTabs.vue'
import { useAuth } from '../../composables/use-auth'
import { LOGIN_FORM_DEFAULTS, loginFormSchema } from '../../constants/login-form.schema'

const router = useRouter()
const route = useRoute()
const { login, isLoggingIn } = useAuth()

const redirectQuery = computed(() => (route.query.redirect as string | undefined) ?? null)
const showCheckoutNotice = computed(() => redirectQuery.value === '/checkout')

const form = useForm({
  defaultValues: LOGIN_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    try {
      const user = await login(value)
      router.push(redirectQuery.value ?? getHomePath(user.role))
    } catch {
      // Error toast is shown by error interceptor
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
          <h1 class="login-title">Bienvenido</h1>
          <p class="login-subtitle">Accede a tu cuenta o crea una nueva.</p>
        </div>

        <AuthModeTabs mode="login" :redirect="redirectQuery" />

        <NAlert v-if="showCheckoutNotice" type="info" :show-icon="true" style="margin-bottom: 16px">
          Inicia sesión para completar tu pedido.
        </NAlert>

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
              <NFormItem label="Correo electrónico" required v-bind="fieldStatus(field)">
                <NInput placeholder="correo@ejemplo.com" v-bind="fieldInput(field)">
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
              <NFormItem label="Contraseña" required v-bind="fieldStatus(field)">
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
                Iniciar sesión
              </NButton>
            </template>
          </form.Subscribe>
        </form>
      </NCard>
    </div>
  </PublicLayout>
</template>

<style scoped src="./styles/login-view.css" />
