<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NForm, NFormItem, NInput, NButton, NCard, NAvatar } from 'naive-ui'
import type { FormInst } from 'naive-ui'

import { PRIMARY } from '@/core/theme/titan-tv-theme'
import { useAuth } from '../../composables/use-auth'
import type { ILoginRequest } from '../../types/requests/login.request'

const router = useRouter()
const route = useRoute()
const { login, isLoggingIn } = useAuth()

const formRef = ref<FormInst | null>(null)
const form = ref<ILoginRequest>({
  email: '',
  password: '',
})

const rules = {
  email: [
    { required: true, message: 'El email es requerido' },
    { type: 'email' as const, message: 'Ingresa un email valido' },
  ],
  password: [{ required: true, message: 'La contrasena es requerida' }],
}

async function handleSubmit(e: Event) {
  e.preventDefault()

  try {
    await formRef.value?.validate()
  } catch {
    return
  }

  try {
    await login(form.value)
    const redirect = (route.query.redirect as string) || '/'
    router.push(redirect)
  } catch {
    // Error toast is shown by error interceptor
  }
}
</script>

<template>
  <div class="login-page">
    <NCard class="login-card">
      <div class="login-header">
        <NAvatar
          :size="48"
          :color="PRIMARY"
          style="font-weight: 700; font-size: 20px; border-radius: 12px"
        >
          T
        </NAvatar>
        <h1 class="login-title">TITAN TV</h1>
        <p class="login-subtitle">Inicia sesion para continuar</p>
      </div>

      <NForm ref="formRef" :model="form" :rules="rules" @submit="handleSubmit">
        <NFormItem label="Email" path="email">
          <NInput v-model:value="form.email" placeholder="correo@ejemplo.com" />
        </NFormItem>

        <NFormItem label="Contrasena" path="password">
          <NInput
            v-model:value="form.password"
            type="password"
            show-password-on="click"
            placeholder="Tu contrasena"
            @keydown.enter="handleSubmit"
          />
        </NFormItem>

        <NButton
          type="primary"
          block
          :loading="isLoggingIn"
          attr-type="submit"
          @click="handleSubmit"
        >
          Iniciar sesion
        </NButton>
      </NForm>
    </NCard>
  </div>
</template>

<style scoped>
.login-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  background-color: var(--tt-background, #f5f5f5);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.login-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
}

.login-title {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
  color: var(--tt-text-primary, #333);
}

.login-subtitle {
  margin: 0;
  font-size: 14px;
  color: var(--tt-text-secondary, #666);
}
</style>
