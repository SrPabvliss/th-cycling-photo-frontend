<script setup lang="ts">
import { computed, ref } from 'vue'
import type { IColorAttribute } from '@/features/photos/types/responses/photo-detail.response'
import ReviewColorCard from '../ReviewColorCard/ReviewColorCard.vue'
import AddColorForm from '../AddColorForm/AddColorForm.vue'
import { REGION_LABELS } from '../../../constants/region-labels'
import type { ColorRegion } from '../../../types/color-region.type'

const props = defineProps<{
  region: ColorRegion
  colors: IColorAttribute[]
  photoId: string
  photoSlug: string
  showAdd?: boolean
}>()

const label = computed(() => REGION_LABELS[props.region])

const cyclistLabel = (idx: number) => `Ciclista ${idx + 1}`

const cyclistCountText = computed(() =>
  props.colors.length === 1 ? '1 ciclista' : `${props.colors.length} ciclistas`,
)

const isAdding = ref(false)

function startAdd() {
  isAdding.value = true
}
function closeAdd() {
  isAdding.value = false
}

defineExpose({ startAdd })
</script>

<template>
  <div class="rv-section-group">
    <div class="rv-section-group__header">
      <span class="rv-section-group__icon">
        <svg
          v-if="region === 'helmet'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M4 14a8 8 0 0 1 16 0v3H4Z" />
          <path d="M4 17h16" />
          <path d="M9 14V9" />
        </svg>
        <svg
          v-else-if="region === 'bicycle'"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <circle cx="6" cy="16" r="3.5" />
          <circle cx="18" cy="16" r="3.5" />
          <path d="M6 16 12 6h4" />
          <path d="m9 16 5-7 4 7" />
        </svg>
        <svg
          v-else
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M8 4 4 7l2 3 2-1v10h8V9l2 1 2-3-4-3-3 2h-2L8 4Z" />
        </svg>
      </span>
      <div class="rv-section-group__title">
        <div class="rv-section-group__label">{{ label }}</div>
        <div class="rv-section-group__count">{{ cyclistCountText }}</div>
      </div>
      <button v-if="showAdd && !isAdding" class="rv-btn" @click="startAdd">
        <svg
          width="13"
          height="13"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.7"
          stroke-linecap="round"
          stroke-linejoin="round"
        >
          <path d="M12 5v14" />
          <path d="M5 12h14" />
        </svg>
        Agregar color
      </button>
    </div>
    <div class="rv-section-group__list">
      <ReviewColorCard
        v-for="(color, idx) in colors"
        :key="color.id"
        :color="color"
        :region="region"
        :cyclist-label="cyclistLabel(idx)"
        :photo-id="photoId"
        :photo-slug="photoSlug"
      />
      <AddColorForm
        v-if="isAdding"
        :photo-id="photoId"
        :photo-slug="photoSlug"
        :region="region"
        @done="closeAdd"
        @cancel="closeAdd"
      />
    </div>
  </div>
</template>

<style scoped src="./review-section-group.css" />
