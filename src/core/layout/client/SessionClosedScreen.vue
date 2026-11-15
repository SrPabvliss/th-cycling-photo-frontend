<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { NButton } from 'naive-ui'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import ErrorPageLayout from '@/core/views/components/ErrorPageLayout.vue'
import { problemCopy } from '@/shared/components/loading/problem-copy'

// In place of a screen that needs a session, once it closed with the screen up. Signing in comes
// back to the same screen, query included (login reads the redirect through safeRedirect).
const copy = problemCopy('expired', '')
const route = useRoute()
const loginTarget = computed(() => ({
  path: ROUTE_PATHS.LOGIN,
  query: { redirect: route.fullPath },
}))
</script>

<template>
  <ErrorPageLayout illustration="sesionVencida" :title="copy.title" :description="copy.text">
    <template #actions>
      <RouterLink v-slot="{ href, navigate }" :to="loginTarget" custom>
        <NButton tag="a" :href="href" type="primary" size="large" block @click="navigate">
          Iniciar sesión
        </NButton>
      </RouterLink>
    </template>
  </ErrorPageLayout>
</template>
