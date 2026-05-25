<script setup lang="ts">
import { computed } from 'vue'
import type { IColorAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { type ColorRegion, COLOR_REGION_LABELS } from '@/shared/types/photo-enums'
import {
  asColorName,
  COLOR_PALETTE_HEX,
  COLOR_PALETTE_LABELS,
} from '@/shared/constants/color-palette'
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

function colorHex(name: string | null): string {
  const safe = asColorName(name)
  return safe ? COLOR_PALETTE_HEX[safe] : 'transparent'
}

function colorLabel(name: string | null): string {
  const safe = asColorName(name)
  if (!safe) return name ?? '—'
  return COLOR_PALETTE_LABELS[safe] ?? name ?? '—'
}

function isUnknown(name: string | null): boolean {
  return name !== null && asColorName(name) === null
}
</script>

<template>
  <div class="photo-colors-list">
    <section v-for="group in grouped" :key="group.region" class="photo-colors-list__group">
      <h4 class="photo-colors-list__group-title">{{ COLOR_REGION_LABELS[group.region] }}</h4>
      <div class="photo-colors-list__items">
        <article
          v-for="color in group.items"
          :key="color.id"
          class="photo-color-card"
          :class="{ 'photo-color-card--manual': color.source === 'reviewer' }"
        >
          <AttributeCropImage
            class="photo-color-card__crop"
            :crop-url="color.cropUrl"
            :alt="`Color ${color.region}`"
          />
          <div class="photo-color-card__body">
            <div class="photo-color-card__row">
              <span class="photo-color-card__row-label">Primario</span>
              <span class="photo-color-card__chip">
                <span
                  class="photo-color-card__swatch"
                  :style="{ background: colorHex(color.primaryColor) }"
                />
                <span class="photo-color-card__chip-label">{{
                  colorLabel(color.primaryColor)
                }}</span>
                <span v-if="isUnknown(color.primaryColor)" class="photo-color-card__chip-warn"
                  >?</span
                >
              </span>
            </div>

            <div class="photo-color-card__row">
              <span class="photo-color-card__row-label">Secundario</span>
              <span v-if="color.secondaryColor" class="photo-color-card__chip">
                <span
                  class="photo-color-card__swatch"
                  :style="{ background: colorHex(color.secondaryColor) }"
                />
                <span class="photo-color-card__chip-label">{{
                  colorLabel(color.secondaryColor)
                }}</span>
                <span v-if="isUnknown(color.secondaryColor)" class="photo-color-card__chip-warn"
                  >?</span
                >
              </span>
              <span v-else class="photo-color-card__chip photo-color-card__chip--none">
                ninguno
              </span>
            </div>

            <div v-if="color.source === 'reviewer'" class="photo-color-card__tags">
              <span class="photo-color-card__tag">manual</span>
            </div>
          </div>
        </article>
      </div>
    </section>
  </div>
</template>
