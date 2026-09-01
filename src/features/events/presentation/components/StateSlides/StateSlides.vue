<script setup lang="ts">
import { NCarousel, NIcon } from 'naive-ui'
import { ChevronBackOutline, ChevronForwardOutline } from '@vicons/ionicons5'

import type { IStateSlide } from './state-slide.types'

defineProps<{ slides: IStateSlide[] }>()

const TONE_LABEL = { blocked: 'No se puede', allowed: 'Sí se puede' } as const
</script>

<template>
  <NCarousel show-arrow class="frozen-info__carousel">
    <div v-for="slide in slides" :key="slide.title" class="frozen-slide">
      <div class="frozen-slide__icons">
        <span
          v-for="(icon, index) in slide.icons"
          :key="index"
          :class="['frozen-slide__icon', `frozen-slide__icon--${slide.tone}`]"
          :style="{ zIndex: slide.icons.length - index }"
        >
          <NIcon :component="icon" :size="24" />
        </span>
      </div>

      <span :class="['frozen-slide__tone', `frozen-slide__tone--${slide.tone}`]">
        {{ TONE_LABEL[slide.tone] }}
      </span>
      <h3 class="frozen-slide__title">{{ slide.title }}</h3>
      <p class="frozen-slide__text">{{ slide.description }}</p>

      <ul class="frozen-slide__items">
        <li v-for="item in slide.items" :key="item" class="frozen-slide__item">
          <span :class="['frozen-slide__mark', `frozen-slide__mark--${slide.tone}`]" />
          {{ item }}
        </li>
      </ul>
    </div>

    <template #arrow="{ prev, next }">
      <button class="frozen-arrow frozen-arrow--prev" aria-label="Anterior" @click="prev">
        <NIcon :component="ChevronBackOutline" :size="18" />
      </button>
      <button class="frozen-arrow frozen-arrow--next" aria-label="Siguiente" @click="next">
        <NIcon :component="ChevronForwardOutline" :size="18" />
      </button>
    </template>

    <template #dots="{ total, currentIndex, to }">
      <div class="frozen-dots">
        <button
          v-for="index of total"
          :key="index"
          :class="[
            'frozen-dots__dot',
            {
              'frozen-dots__dot--active': currentIndex === index - 1,
              'frozen-dots__dot--allowed': slides[index - 1]?.tone === 'allowed',
            },
          ]"
          :aria-label="slides[index - 1]?.title"
          @click="to(index - 1)"
        />
      </div>
    </template>
  </NCarousel>
</template>

<style scoped src="./state-slides.css" />
