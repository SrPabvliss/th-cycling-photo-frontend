<script setup lang="ts">
import { computed } from 'vue'
import type { IColorAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { type ColorRegion, COLOR_REGION_LABELS } from '@/shared/types/photo-enums'
import AttributeCropImage from '../AttributeCropImage/AttributeCropImage.vue'
import './photo-colors-list.css'

const REGION_ORDER: ColorRegion[] = ['helmet', 'cyclist_clothes', 'bicycle']

const props = defineProps<{ colors: IColorAttribute[] }>()

const grouped = computed(() =>
  REGION_ORDER.flatMap((region) => {
    const items = props.colors.filter((c) => c.region === region)
    return items.length > 0 ? [{ region, items }] : []
  }),
)
</script>

<template>
  <div class="photo-colors-list">
    <section v-for="group in grouped" :key="group.region" class="photo-colors-list__group">
      <h3 class="photo-colors-list__group-title">{{ COLOR_REGION_LABELS[group.region] }}</h3>
      <div class="photo-colors-list__items">
        <div v-for="color in group.items" :key="color.id" class="photo-colors-list__item">
          <AttributeCropImage
            class="photo-colors-list__crop"
            :crop-url="color.cropUrl"
            :alt="`Color ${color.region}`"
          />
          <div class="photo-colors-list__chips">
            <span class="photo-colors-list__chip">{{ color.primaryColor }}</span>
            <span
              v-if="color.secondaryColor"
              class="photo-colors-list__chip photo-colors-list__chip--secondary"
            >
              {{ color.secondaryColor }}
            </span>
            <span v-if="color.source === 'reviewer'" class="photo-colors-list__manual">manual</span>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
