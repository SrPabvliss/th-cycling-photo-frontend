<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router'

import AuthLayout from '@/core/layout/auth/AuthLayout.vue'
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
  <AuthLayout mode="register">
    <!-- Header -->
    <div class="auth-eyebrow">Registro · Titan TV</div>

    <!-- Tabs -->
    <div class="auth-tabs" role="tablist">
      <RouterLink to="/login" class="auth-tab">Iniciar sesión</RouterLink>
      <RouterLink to="/register" class="auth-tab auth-tab--active">Crear cuenta</RouterLink>
    </div>

    <h1 class="auth-title">Crea tu<br />cuenta nueva.</h1>
    <p class="auth-sub">
      Regístrate para solicitar fotos de competencia y recibir alertas de nuevos eventos.
    </p>

    <RegisterForm :is-submitting="isRegistering" login-url="/login" @submit="handleSubmit" />
  </AuthLayout>
</template>

<style scoped src="./styles/login-view.css" />
