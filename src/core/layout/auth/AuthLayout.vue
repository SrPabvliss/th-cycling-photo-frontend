<script setup lang="ts">
import AuthSidePanel from './AuthSidePanel.vue'

defineProps<{
  mode: 'login' | 'register'
}>()
</script>

<template>
  <div class="auth-shell">
    <AuthSidePanel :mode="mode" />

    <section class="auth-form-side">
      <div class="auth-form-top">
        <RouterLink to="/">
          <svg
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M19 12H5M11 18l-6-6 6-6" />
          </svg>
          Volver al inicio
        </RouterLink>
        <span>ES · EC</span>
      </div>

      <div class="auth-form-card">
        <slot />
      </div>

      <footer class="auth-form-footer">
        <div>© 2026 Titan TV · Ecuador</div>
        <div><a href="mailto:hola@titantv.ec">hola@titantv.ec</a></div>
      </footer>
    </section>
  </div>
</template>

<style scoped src="./styles/auth-layout.css" />
