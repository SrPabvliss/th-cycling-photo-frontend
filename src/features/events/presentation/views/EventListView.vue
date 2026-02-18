<script setup lang="ts">
import { NButton } from 'naive-ui'

import AppTopBar from '@/core/layout/AppTopBar.vue'
</script>

<template>
  <div>
    <AppTopBar title="Gestión de Eventos" subtitle="Listado general de competencias">
      <template #actions>
        <NButton type="primary"> + Nuevo Evento </NButton>
      </template>
    </AppTopBar>
    <div style="padding: 24px">
      <p>Event list will be implemented in a future ticket.</p>
    </div>
  </div>
</template>
