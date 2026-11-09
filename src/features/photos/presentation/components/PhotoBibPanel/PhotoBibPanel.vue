<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { CheckmarkOutline, ChevronForwardOutline, WarningOutline } from '@vicons/ionicons5'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { formatDate } from '@/shared/utils/date.utils'
import AttributeCropImage from '../AttributeCropImage/AttributeCropImage.vue'

const props = defineProps<{
  bibs: IBibAttribute[]
  frozen: boolean
}>()

const emit = defineEmits<{
  'open-workshop': []
}>()

function isFromPerson(bib: IBibAttribute): boolean {
  return bib.wasCorrected || bib.source === 'reviewer'
}

function isDoubtful(bib: IBibAttribute): boolean {
  return bib.status === 'abstained' && bib.source === 'ai' && !bib.wasCorrected
}

function toneFor(bib: IBibAttribute): string {
  if (isFromPerson(bib)) return 'ok'
  if (isDoubtful(bib)) return 'dud'
  return ''
}

function pctOf(confidence: number | null): number | null {
  return confidence === null ? null : Math.round(confidence * 100)
}

function provenanceFor(bib: IBibAttribute): string {
  if (bib.wasCorrected) return 'Corregido por una persona'
  if (bib.source === 'reviewer') return 'Escrito por una persona'
  const pct = pctOf(bib.confidence)
  if (isDoubtful(bib)) return pct === null ? 'Confianza' : `Confianza ${pct}%`
  return pct === null ? 'Leído por la IA' : `Leído por la IA · ${pct}%`
}

function correctionLineFor(bib: IBibAttribute): string {
  const pct = pctOf(bib.confidence)
  const whenPart = bib.correctedAt ? ` el ${formatDate(bib.correctedAt)}` : ''
  const segments = [
    `La IA leyó ${bib.digitsOriginal}`,
    pct === null ? null : `${pct}%`,
    `lo corrigió ${bib.correctedByName ?? 'una persona'}${whenPart}`,
  ]
  return segments.filter((segment): segment is string => segment !== null).join(' · ')
}

function writtenLineFor(bib: IBibAttribute): string {
  const whenPart = bib.correctedAt ? ` · ${formatDate(bib.correctedAt)}` : ''
  return `${bib.correctedByName ?? 'una persona'}${whenPart}`
}

const hasBibs = computed(() => props.bibs.length > 0)
const title = computed(() => (props.bibs.length > 1 ? `Dorsales · ${props.bibs.length}` : 'Dorsal'))
const hasDoubtful = computed(() => props.bibs.some(isDoubtful))

function onEntryClick() {
  if (props.frozen) return
  emit('open-workshop')
}
</script>

<template>
  <section class="pd-card" :class="{ red: !hasBibs }">
    <div class="pd-card-h">
      <h4>{{ title }}</h4>
      <span v-if="hasBibs && hasDoubtful" class="pd-mini amber">Revisar</span>
    </div>

    <template v-if="!hasBibs">
      <div class="pd-nobib">
        <span class="pd-nobib-b">Sin dorsal</span>
        <p>
          Nadie llega a esta foto. El comprador la busca escribiendo su número y esta foto no
          tiene ninguno: está en la galería, pero fuera de todas las búsquedas.
        </p>
      </div>
      <button
        class="tt-btn tt-btn-solid wide"
        type="button"
        data-test="bib-primary-btn"
        :disabled="frozen"
        @click="onEntryClick"
      >
        {{ frozen ? 'Congelado · sin cambios' : 'Escribir el dorsal a mano' }}
      </button>
      <p v-if="!frozen" class="pd-note">
        Se abre el taller de dorsales, a pantalla completa, con esta foto ya cargada.
      </p>
    </template>

    <template v-else>
      <div class="pd-bibs">
        <div v-for="bib in bibs" :key="bib.id" class="pd-bib" :class="toneFor(bib)">
          <AttributeCropImage :crop-url="bib.cropUrl" :alt="`Recorte del dorsal ${bib.digits}`" />
          <div class="pd-bib-t">
            <div class="pd-bib-n">
              <s v-if="bib.wasCorrected">{{ bib.digitsOriginal }}</s>
              <NIcon v-if="bib.wasCorrected" :component="ChevronForwardOutline" :size="13" />
              <b>{{ bib.digits }}</b>
            </div>
            <span class="pd-lect" :class="toneFor(bib)">
              <NIcon
                v-if="isFromPerson(bib)"
                :component="CheckmarkOutline"
                :size="11"
                data-test="bib-person-icon"
              />
              <NIcon
                v-else-if="isDoubtful(bib)"
                :component="WarningOutline"
                :size="11"
                data-test="bib-doubtful-icon"
              />
              {{ provenanceFor(bib) }}
            </span>
            <em v-if="bib.wasCorrected">{{ correctionLineFor(bib) }}</em>
            <em v-else-if="bib.source === 'reviewer'">{{ writtenLineFor(bib) }}</em>
          </div>
        </div>
      </div>
      <p v-if="hasDoubtful" class="pd-note">
        La IA leyó algo pero no se fía. Compara el recorte con el número: si no coinciden,
        corrígelo.
      </p>
      <button
        class="tt-btn tt-btn-ghost wide"
        type="button"
        data-test="bib-footer-btn"
        :disabled="frozen"
        @click="onEntryClick"
      >
        {{ frozen ? 'Congelado · sin cambios' : 'Corregir en el taller de dorsales' }}
      </button>
    </template>
  </section>
</template>

<style scoped src="./photo-bib-panel.css" />
