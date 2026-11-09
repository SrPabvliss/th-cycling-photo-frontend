<script setup lang="ts">
import { NButton, NCard, NCarousel, NIcon, NModal } from 'naive-ui'
import {
  ArchiveOutline,
  CardOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  CloudUploadOutline,
  ColorPaletteOutline,
  CreateOutline,
  EyeOutline,
  FolderOutline,
  PricetagsOutline,
  SearchOutline,
  StorefrontOutline,
  TrashOutline,
} from '@vicons/ionicons5'
import type { Component } from 'vue'

defineProps<{
  show: boolean
}>()

defineEmits<{
  'update:show': [value: boolean]
}>()

interface ISlide {
  icons: Component[]
  tone: 'blocked' | 'allowed'
  title: string
  description: string
  items: string[]
}

const slides: ISlide[] = [
  {
    icons: [CloudUploadOutline, TrashOutline, FolderOutline],
    tone: 'blocked',
    title: 'Las fotos quedan como están',
    description: 'El catálogo se cierra: ni entra material nuevo ni se reacomoda el que ya está.',
    items: ['Subir fotos', 'Eliminar fotos', 'Cambiarlas de categoría'],
  },
  {
    icons: [CreateOutline, PricetagsOutline, ArchiveOutline],
    tone: 'blocked',
    title: 'La ficha del evento se congela',
    description: 'Nada de lo que define al evento se puede modificar mientras dure.',
    items: [
      'Editar nombre, fechas y ubicación',
      'Cambiar precios, marca de agua y cupo',
      'Archivar, restaurar o eliminar el evento',
    ],
  },
  {
    icons: [StorefrontOutline, CardOutline],
    tone: 'allowed',
    title: 'La venta no se detiene',
    description: 'Para el comprador no cambia absolutamente nada.',
    items: [
      'La galería pública sigue abierta',
      'Las órdenes se reciben y se cobran',
      'Las entregas siguen su curso',
    ],
  },
  {
    icons: [ColorPaletteOutline, SearchOutline, EyeOutline],
    tone: 'allowed',
    title: 'La revisión sigue abierta',
    description:
      'Se puede seguir arreglando la clasificación, para que cada corredor se encuentre.',
    items: ['Corregir los dorsales leídos', 'Marcar fotos revisadas'],
  },
]

const TONE_LABEL = { blocked: 'No se puede', allowed: 'Sí se puede' } as const
</script>

<template>
  <NModal :show="show" @update:show="$emit('update:show', $event)">
    <NCard class="frozen-info" :bordered="false" role="dialog" aria-modal="true">
      <h2 class="frozen-info__title">Este evento está congelado</h2>
      <p class="frozen-info__subtitle">Esto es lo que cambia mientras dure.</p>

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

      <NButton block type="primary" @click="$emit('update:show', false)">Entendido</NButton>
    </NCard>
  </NModal>
</template>

<style scoped src="./frozen-info-modal.css"></style>
