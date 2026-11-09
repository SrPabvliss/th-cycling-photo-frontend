<script setup lang="ts">
import { computed } from 'vue'
import { NEmpty, NSkeleton } from 'naive-ui'
import type { IReviewQueueItem } from '../../../types/review-queue-item.type'
import ReviewQueueItem from '../ReviewQueueItem/ReviewQueueItem.vue'
import { pluralize } from '@/shared/utils/format.utils'

const props = defineProps<{
  items: IReviewQueueItem[]
  currentSlug: string | null
  isPending: boolean
}>()

const emit = defineEmits<{ select: [slug: string] }>()

const pendingCount = computed(() => props.items.filter((i) => !i.reviewedAt).length)
const reviewedCount = computed(() => props.items.filter((i) => i.reviewedAt).length)
</script>

<template>
  <aside class="rv-queue">
    <div class="rv-queue__header">
      <div class="rv-queue__title">Cola de revisión</div>
      <div class="rv-queue__subtitle mono">
        {{ pendingCount }} {{ pluralize(pendingCount, 'pendiente', 'pendientes') }} ·
        {{ reviewedCount }} {{ pluralize(reviewedCount, 'lista', 'listas') }}
      </div>
    </div>

    <div class="rv-queue__list rv-scroll-fade">
      <div v-if="isPending" class="rv-queue__skeleton">
        <NSkeleton text :repeat="6" />
      </div>
      <NEmpty
        v-else-if="items.length === 0"
        description="Sin fotos en la cola"
        size="small"
        style="padding: 24px"
      />
      <ReviewQueueItem
        v-else
        v-for="item in items"
        :key="item.id"
        :item="item"
        :is-active="item.publicSlug === currentSlug"
        @select="emit('select', $event)"
      />
    </div>
  </aside>
</template>

<style scoped src="./review-queue-panel.css" />
