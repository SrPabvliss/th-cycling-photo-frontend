<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NCard, NIcon, NInput } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import { PHOTO_ROUTE_NAMES } from '@/features/photos/routes'

const props = defineProps<{
  eventSlug: string
}>()

const router = useRouter()
const searchPlateNumber = ref('')

function handleQuickSearch() {
  const plate = searchPlateNumber.value.trim()
  if (!plate) return
  router.push({
    name: PHOTO_ROUTE_NAMES.GALLERY,
    params: { slug: props.eventSlug },
    query: { plateNumber: plate },
  })
}
</script>

<template>
  <NCard title="Buscar por dorsal" size="small">
    <template #header-extra>
      <span class="search-hint">Busca fotos por número de dorsal</span>
    </template>
    <form class="quick-search-form" @submit.prevent="handleQuickSearch">
      <NInput
        v-model:value="searchPlateNumber"
        placeholder="Ej. 42"
        type="text"
        clearable
        style="flex: 1"
        @keyup.enter="handleQuickSearch"
      >
        <template #prefix>
          <NIcon :component="SearchOutline" />
        </template>
      </NInput>
      <NButton type="primary" :disabled="!searchPlateNumber.trim()" attr-type="submit">
        Buscar
      </NButton>
    </form>
  </NCard>
</template>

<style scoped src="./event-quick-search.css" />
