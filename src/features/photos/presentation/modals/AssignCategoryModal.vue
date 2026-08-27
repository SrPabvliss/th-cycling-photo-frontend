<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NIcon, NModal } from 'naive-ui'
import { AlertOutline, CheckmarkOutline, PricetagOutline } from '@vicons/ionicons5'

import type { IGalleryFacets } from '@/features/photos/types/responses/gallery-facets.response'

const props = defineProps<{
  show: boolean
  count: number
  phrase: string
  wholeSet: boolean
  categories: IGalleryFacets['categories']
}>()

const emit = defineEmits<{
  assign: [categoryId: number | null]
  close: []
}>()

const NO_CATEGORY = Symbol('no-category')

const picked = ref<number | typeof NO_CATEGORY | null>(null)

watch(
  () => props.show,
  (show) => {
    if (show) picked.value = null
  },
)

function fmt(n: number): string {
  return n.toLocaleString('es-EC')
}

const subtitle = computed(
  () => `${fmt(props.count)} ${props.count === 1 ? 'foto' : 'fotos'} · una foto solo puede estar en una categoría`,
)

const hasPicked = computed(() => picked.value !== null)

function close() {
  emit('close')
}

function confirm() {
  if (!hasPicked.value) return
  emit('assign', picked.value === NO_CATEGORY ? null : (picked.value as number))
}

function select(value: number | typeof NO_CATEGORY) {
  picked.value = value
}
</script>

<template>
  <NModal :show="show" preset="card" style="width: 560px" @update:show="close">
    <template #header>
      <div class="acm-head">
        <b>Asignar categoría</b>
        <span data-test="assign-subtitle">{{ subtitle }}</span>
      </div>
    </template>

    <div class="acm-body">
      <div v-if="wholeSet" class="tt-notice amber" data-test="whole-set-notice">
        <NIcon :component="AlertOutline" :size="17" />
        <div>
          <b>Vas a cambiar {{ fmt(count) }} fotos de una vez.</b>
          <span>
            Es la selección completa del filtro: todas las {{ phrase }} del evento, no solo las
            que ves en pantalla. Deshacerlo es foto por foto.
          </span>
        </div>
      </div>

      <ul class="tt-picker-list" role="radiogroup">
        <li
          class="tt-picker-row"
          :class="{ on: picked === NO_CATEGORY }"
          role="radio"
          tabindex="0"
          :aria-checked="picked === NO_CATEGORY"
          data-test="category-row-null"
          @click="select(NO_CATEGORY)"
          @keydown.enter.space.prevent="select(NO_CATEGORY)"
        >
          Sin categoría (quitar)
          <NIcon
            v-if="picked === NO_CATEGORY"
            :component="CheckmarkOutline"
            :size="14"
            data-test="picked-check-null"
          />
        </li>
        <li
          v-for="category in categories"
          :key="category.id"
          class="tt-picker-row"
          :class="{ on: picked === category.id }"
          role="radio"
          tabindex="0"
          :aria-checked="picked === category.id"
          :data-test="`category-row-${category.id}`"
          @click="select(category.id)"
          @keydown.enter.space.prevent="select(category.id)"
        >
          <span class="tt-picker-txt">
            <b>{{ category.name }}</b>
            <span>{{ fmt(category.count) }} fotos hoy</span>
          </span>
          <NIcon
            v-if="picked === category.id"
            :component="CheckmarkOutline"
            :size="14"
            :data-test="`picked-check-${category.id}`"
          />
        </li>
      </ul>
      <p class="tt-picker-note">
        Las categorías se crean y se renombran en el detalle del evento.
      </p>
    </div>

    <template #footer>
      <div class="acm-footer">
        <NButton data-test="assign-cancel" @click="close">Cancelar</NButton>
        <NButton
          type="primary"
          :disabled="!hasPicked"
          data-test="assign-confirm"
          @click="confirm"
        >
          <template #icon>
            <NIcon :component="PricetagOutline" :size="14" data-test="assign-confirm-icon" />
          </template>
          Asignar a {{ fmt(count) }} fotos
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./assign-category-modal.css" />
