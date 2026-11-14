<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { EmptyState } from '@/shared/components/empty-state'
import { problemCopy } from '@/shared/components/loading/problem-copy'

// Shown where a cart was on screen when the session expired: not an empty cart, the session.
// Signing in comes back to this same screen (login reads the redirect through safeRedirect).
// Words and drawing are those of a closed session; nothing about it is red.
const copy = problemCopy('expired', '')
const emit = defineEmits<{ leave: [] }>()

const route = useRoute()
const loginTarget = computed(() => ({
  path: ROUTE_PATHS.LOGIN,
  query: { redirect: route.fullPath },
}))
</script>

<template>
  <EmptyState illustration="sesionVencida" :title="copy.title" :text="copy.text">
    <template #actions>
      <RouterLink v-slot="{ href, navigate }" :to="loginTarget" custom>
        <NButton
          tag="a"
          :href="href"
          type="primary"
          size="large"
          block
          @click="(event: MouseEvent) => (emit('leave'), navigate(event))"
        >
          Iniciar sesión
        </NButton>
      </RouterLink>
    </template>
  </EmptyState>
</template>
