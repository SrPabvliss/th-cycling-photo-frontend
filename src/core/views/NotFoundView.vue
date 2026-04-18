<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon } from 'naive-ui'
import { ArrowBack, CameraOutline } from '@vicons/ionicons5'

import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import ErrorPageLayout from './components/ErrorPageLayout.vue'

const router = useRouter()
const route = useRoute()
</script>

<template>
  <ErrorPageLayout
    code="404"
    title="Fuera del camino."
    description="Hasta los dioses mas poderosos a veces pierden el camino en la montaña. La pagina que buscas no existe o fue movida."
    :error-info="`Codigo de error: 404_NOT_FOUND | Ruta: ${route.fullPath}`"
  >
    <template #icon>
      <TitanLogo :size="80" />
    </template>
    <template #actions>
      <NButton type="primary" size="large" @click="router.push('/')">
        <template #icon>
          <NIcon :component="ArrowBack" />
        </template>
        Volver al inicio
      </NButton>
      <NButton size="large" @click="router.push('/')">
        <template #icon>
          <NIcon :component="CameraOutline" />
        </template>
        Buscar tus fotos
      </NButton>
    </template>
  </ErrorPageLayout>
</template>
