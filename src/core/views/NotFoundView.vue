<script setup lang="ts">
import { NButton } from 'naive-ui'

import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import ErrorPageLayout from './components/ErrorPageLayout.vue'
</script>

<template>
  <ErrorPageLayout
    illustration="fueraDelCamino"
    title="Te saliste del camino"
    description="Esta página no existe o cambió de lugar."
  >
    <template #actions>
      <RouterLink v-slot="{ navigate }" :to="ROUTE_PATHS.LANDING" custom>
        <NButton type="primary" size="large" block @click="navigate">Ir al inicio</NButton>
      </RouterLink>
      <RouterLink v-slot="{ navigate }" :to="ROUTE_PATHS.PUBLIC_GALLERY" custom>
        <NButton text class="tt-hit-area" type="primary" size="large" @click="navigate"
          >Ver eventos</NButton
        >
      </RouterLink>
    </template>
  </ErrorPageLayout>
</template>
