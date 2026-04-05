<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'
import { NCard } from 'naive-ui'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { EVENTS_PATH } from '@/features/events/routes'
import { useAuth } from '../../composables/use-auth'
import { toRegisterRequest } from '../../mappers/register-form.mapper'
import type { IRegisterFormData } from '../../constants/register-form.schema'
import RegisterForm from '../components/RegisterForm/RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const { register, isRegistering } = useAuth()

async function handleSubmit(formData: IRegisterFormData) {
  try {
    await register(toRegisterRequest(formData))
    const redirect = (route.query.redirect as string) || EVENTS_PATH
    router.push(redirect)
  } catch {
    // Error toast shown by interceptor
  }
}
</script>

<template>
  <PublicLayout>
    <div class="register-page">
      <NCard class="register-card">
        <div class="register-header">
          <TitanLogo :size="56" />
          <h1 class="register-title">Crear cuenta</h1>
          <p class="register-subtitle">Regístrate para solicitar tus fotos de competencia.</p>
        </div>

        <RegisterForm :is-submitting="isRegistering" login-url="/login" @submit="handleSubmit" />
      </NCard>
    </div>
  </PublicLayout>
</template>

<style scoped>
.register-page {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 140px);
  padding: 40px 32px;
  background: #f8f9fa;
}

.register-card {
  width: 100%;
  max-width: 520px;
}

.register-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin-bottom: 28px;
}

.register-title {
  margin: 8px 0 0;
  font-size: 26px;
  font-weight: 700;
  color: #1a1f2c;
}

.register-subtitle {
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
}
</style>
