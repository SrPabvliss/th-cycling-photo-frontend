<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'

type IAuthMode = 'login' | 'register'

const props = defineProps<{
  mode: IAuthMode
  redirect?: string | null
}>()

const router = useRouter()

const targetQuery = computed(() => (props.redirect ? { redirect: props.redirect } : {}))

function setMode(next: IAuthMode) {
  if (next === props.mode) return
  router.replace({ path: next === 'login' ? '/login' : '/register', query: targetQuery.value })
}
</script>

<template>
  <div class="auth-tabs" role="tablist">
    <button
      type="button"
      class="auth-tabs__tab"
      :class="{ 'auth-tabs__tab--active': mode === 'login' }"
      :aria-selected="mode === 'login'"
      role="tab"
      @click="setMode('login')"
    >
      Iniciar sesión
    </button>
    <button
      type="button"
      class="auth-tabs__tab"
      :class="{ 'auth-tabs__tab--active': mode === 'register' }"
      :aria-selected="mode === 'register'"
      role="tab"
      @click="setMode('register')"
    >
      Crear cuenta
    </button>
  </div>
</template>

<style scoped>
.auth-tabs {
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: #f3f4f6;
  border-radius: 10px;
  padding: 4px;
  margin-bottom: 20px;
}

.auth-tabs__tab {
  border: none;
  background: transparent;
  padding: 10px 12px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  border-radius: 8px;
  transition:
    background 0.15s,
    color 0.15s,
    box-shadow 0.15s;
}

.auth-tabs__tab:hover {
  color: #1a1f2c;
}

.auth-tabs__tab--active {
  background: #fff;
  color: #105080;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
}
</style>
