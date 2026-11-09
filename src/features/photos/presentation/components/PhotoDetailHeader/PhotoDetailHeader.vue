<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import {
  ArrowBackOutline,
  CartOutline,
  ChevronBackOutline,
  ChevronForwardOutline,
  SnowOutline,
} from '@vicons/ionicons5'

const props = defineProps<{
  filename: string
  eventName: string
  position: number
  eventPhotoCount: number
  sold: boolean
  frozen: boolean
  mobile: boolean
}>()

defineEmits<{
  back: []
  previous: []
  next: []
}>()

function count(value: number): string {
  return value.toLocaleString('es-EC')
}

const isFirst = computed(() => props.position <= 1)
const isLast = computed(() => props.position >= props.eventPhotoCount)
</script>

<template>
  <header class="pd-head">
    <button
      type="button"
      class="tt-iconbtn"
      title="Volver a la galería"
      data-test="header-back"
      @click="$emit('back')"
    >
      <NIcon :component="ArrowBackOutline" :size="16" />
    </button>

    <div class="pd-head-t">
      <div class="ev-dcrumb" data-test="header-crumb">
        Eventos
        <NIcon :component="ChevronForwardOutline" :size="11" />
        {{ eventName }}
        <NIcon :component="ChevronForwardOutline" :size="11" />
        <span>Galería</span>
      </div>
      <h1>{{ filename }}</h1>
    </div>

    <div class="pd-head-r">
      <span v-if="sold" class="pd-tag green" data-test="header-sold-pill">
        <NIcon :component="CartOutline" :size="12" />
        Vendida
      </span>
      <span v-if="frozen" class="pd-tag grey" data-test="header-frozen-pill">
        <NIcon :component="SnowOutline" :size="12" />
        Congelado · sin cambios
      </span>
      <div v-if="!mobile" class="pd-steps">
        <button
          type="button"
          class="tt-iconbtn"
          title="Foto anterior"
          data-test="header-prev"
          :disabled="isFirst"
          @click="$emit('previous')"
        >
          <NIcon :component="ChevronBackOutline" :size="15" />
        </button>
        <span data-test="header-pager">
          Foto <b>{{ count(position) }}</b> de <b>{{ count(eventPhotoCount) }}</b>
        </span>
        <button
          type="button"
          class="tt-iconbtn"
          title="Foto siguiente"
          data-test="header-next"
          :disabled="isLast"
          @click="$emit('next')"
        >
          <NIcon :component="ChevronForwardOutline" :size="15" />
        </button>
      </div>
    </div>
  </header>
</template>

<style scoped src="./photo-detail-header.css" />
