<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CartOutline, TrashOutline } from '@vicons/ionicons5'

import { formatRelativeTime } from '@/shared/utils/date.utils'
import type { IPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import GalleryBibChips from '../GalleryBibChips/GalleryBibChips.vue'

const props = defineProps<{
  photo: IPhotoListItem
  dense: 'comfortable' | 'compact'
  selected?: boolean
  anySelected?: boolean
  deletable?: boolean
}>()

const emit = defineEmits<{
  open: [slug: string]
  toggle: [id: string]
  delete: [id: string]
}>()

function handleClick() {
  if (props.anySelected) {
    emit('toggle', props.photo.id)
  } else {
    emit('open', props.photo.publicSlug)
  }
}
</script>

<template>
  <figure
    class="gp-card"
    :class="{ sel: selected, nobib: photo.bibs.length === 0, picking: anySelected }"
    @click="handleClick"
  >
    <div class="gp-thumb">
      <img :src="photo.thumbnailUrl" :alt="photo.filename" loading="lazy" decoding="async" />
      <button
        type="button"
        class="gp-pick"
        title="Seleccionar"
        @click.stop="emit('toggle', photo.id)"
      >
        <span class="gp-chk" :class="{ on: selected }">
          <svg v-if="selected" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path
              d="M2 6L5 9L10 3"
              stroke="white"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </svg>
        </span>
      </button>
      <span v-if="photo.sold" class="gp-sold">
        <NIcon :component="CartOutline" :size="12" />
        Vendida
      </span>
      <button
        v-if="deletable"
        type="button"
        class="gp-del"
        title="Eliminar foto"
        @click.stop="emit('delete', photo.id)"
      >
        <NIcon :component="TrashOutline" :size="14" />
      </button>
      <div class="gp-bibbar">
        <GalleryBibChips :bibs="photo.bibs" :status="photo.status" large />
      </div>
    </div>
    <figcaption>
      <span class="gp-cat" :class="{ none: !photo.photoCategoryName }">
        {{ photo.photoCategoryName || 'Sin categoría' }}
      </span>
      <i>{{ formatRelativeTime(photo.uploadedAt) }}</i>
      <em v-if="dense === 'comfortable'">{{ photo.filename }}</em>
    </figcaption>
  </figure>
</template>

<style scoped src="./gallery-photo-card.css" />
