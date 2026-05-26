<script setup lang="ts">
import { computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { NAlert, NCard } from 'naive-ui'

import { getHomePath } from '@/core/auth/role-config'
import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import AuthModeTabs from '../components/AuthModeTabs/AuthModeTabs.vue'
import { useAuth } from '../../composables/use-auth'
import { toRegisterRequest } from '../../mappers/register-form.mapper'
import type { IRegisterFormData } from '../../constants/register-form.schema'
import RegisterForm from '../components/RegisterForm/RegisterForm.vue'

const router = useRouter()
const route = useRoute()
const { register, isRegistering } = useAuth()

const redirectQuery = computed(() => (route.query.redirect as string | undefined) ?? null)
const showCheckoutNotice = computed(() => redirectQuery.value === '/checkout')

async function handleSubmit(formData: IRegisterFormData) {
  try {
    const user = await register(toRegisterRequest(formData))
    router.push(redirectQuery.value ?? getHomePath(user.role))
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

        <AuthModeTabs mode="register" :redirect="redirectQuery" />

        <NAlert v-if="showCheckoutNotice" type="info" :show-icon="true" style="margin-bottom: 16px">
          Crea tu cuenta para completar tu pedido.
        </NAlert>

        <RegisterForm :is-submitting="isRegistering" @submit="handleSubmit" />
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
  gap: 4px;
  margin-bottom: 28px;
}

.register-title {
  /* Compensate for transparent padding inside the helmet PNG. */
  margin: -8px 0 0;
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
