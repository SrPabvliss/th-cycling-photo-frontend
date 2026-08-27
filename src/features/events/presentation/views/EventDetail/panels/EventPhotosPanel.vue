<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NEmpty, NIcon, NInput } from 'naive-ui'
import { SearchOutline } from '@vicons/ionicons5'

import { usePhotosGalleryQuery } from '@/shared/composables/use-photos-gallery'
import PhotoCard from '@/shared/components/PhotoCard/PhotoCard.vue'
import type { IEventDetail } from '@/shared/types/event.types'

const props = defineProps<{ event: IEventDetail }>()

const emit = defineEmits<{ search: [plate: string]; 'view-all': [] }>()

const RECENT_LIMIT = 4
const page = ref(1)
const status = ref(null)
const eventId = computed(() => props.event.id)

const { data: recentPhotos } = usePhotosGalleryQuery(eventId, page, status, RECENT_LIMIT)

const plate = ref('')

const isClosedForWork = computed(() => props.event.isFrozen || props.event.status === 'archived')

const hasPhotos = computed(() => (recentPhotos.value?.items.length ?? 0) > 0)

function submitSearch() {
  const value = plate.value.trim()
  if (!value) return
  emit('search', value)
}
</script>

<template>
  <section class="photos">
    <div class="photos__head">
      <h4>Fotos</h4>
      <NButton
        v-if="event.photoCount > 0"
        text
        type="primary"
        size="small"
        data-test="photos-view-all"
        @click="emit('view-all')"
      >
        Ver todas
      </NButton>
    </div>

    <form class="photos__search" @submit.prevent="submitSearch">
      <NInput
        v-model:value="plate"
        placeholder="Buscar por número de placa. Ej. 42"
        type="text"
        clearable
        class="photos__search-input"
      >
        <template #prefix>
          <NIcon :component="SearchOutline" />
        </template>
      </NInput>
      <NButton
        type="primary"
        attr-type="submit"
        :disabled="!plate.trim()"
        data-test="photos-search-submit"
      >
        Buscar
      </NButton>
    </form>

    <div v-if="hasPhotos" class="photos__grid" data-test="photos-grid">
      <PhotoCard v-for="photo in recentPhotos!.items" :key="photo.id" :photo="photo" />
    </div>
    <NEmpty
      v-else
      class="photos__empty"
      data-test="photos-empty"
      description="Todavía no hay fotos"
    >
      <template #extra>
        <span v-if="isClosedForWork">El evento no admite subidas en este estado.</span>
        <span v-else>Sube el primer lote para que el evento empiece a vender.</span>
      </template>
    </NEmpty>
  </section>
</template>

<style scoped src="./event-photos-panel.css" />
