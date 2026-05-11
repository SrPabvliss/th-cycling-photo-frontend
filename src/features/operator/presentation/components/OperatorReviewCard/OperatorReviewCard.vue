<script setup lang="ts">
import { computed } from 'vue'
import { NIcon, NTag } from 'naive-ui'
import { AlertCircleOutline, CheckmarkCircle } from '@vicons/ionicons5'

import type { IOperatorReviewQueueItem } from '../../../types/responses/operator-review-queue-item.response'

const props = defineProps<{ item: IOperatorReviewQueueItem }>()

defineEmits<{ click: [item: IOperatorReviewQueueItem] }>()

const isReviewed = computed(() => props.item.reviewedAt !== null)
const hasNoBibs = computed(() => props.item.bibsCount === 0)
</script>

<template>
  <article class="review-card" @click="$emit('click', item)">
    <div class="review-card__cover">
      <img
        v-if="item.thumbnailUrl"
        :src="item.thumbnailUrl"
        :alt="item.filename"
        class="review-card__image"
        loading="lazy"
        decoding="async"
        @load="($event.target as HTMLImageElement).dataset.loaded = 'true'"
      />
      <div v-else class="review-card__placeholder" />

      <div class="review-card__badge">
        <NTag v-if="isReviewed" type="success" size="small" round>Revisada</NTag>
        <NTag v-else-if="hasNoBibs" type="warning" size="small" round>
          <template #icon><NIcon :component="AlertCircleOutline" /></template>
          sin placa
        </NTag>
        <NTag v-else size="small" round>Pendiente</NTag>
      </div>

      <div v-if="isReviewed" class="review-card__check">
        <NIcon :component="CheckmarkCircle" :size="20" color="#18a058" />
      </div>
    </div>

    <div class="review-card__body">
      <p class="review-card__filename">{{ item.filename }}</p>
      <div class="review-card__meta">
        <span class="review-card__meta-item">
          {{ item.bibsCount }} {{ item.bibsCount === 1 ? 'placa' : 'placas' }}
        </span>
        <span class="review-card__meta-sep">·</span>
        <span class="review-card__meta-item">{{ item.colorsCount }} colores</span>
      </div>
    </div>
  </article>
</template>

<style scoped src="./operator-review-card.css" />
