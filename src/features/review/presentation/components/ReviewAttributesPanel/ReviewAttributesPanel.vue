<script setup lang="ts">
import { computed, inject, ref } from 'vue'
import type { IPhotoDetail } from '@/features/photos/types/responses/photo-detail.response'
import ReviewBibCard from '../ReviewBibCard/ReviewBibCard.vue'
import ReviewSectionGroup from '../ReviewSectionGroup/ReviewSectionGroup.vue'
import AddBibForm from '../AddBibForm/AddBibForm.vue'
import WorkspaceCropLightbox from '@/features/workspace/presentation/components/WorkspaceCropLightbox/WorkspaceCropLightbox.vue'
import { CARD_NAV_KEY } from '@/features/workspace/composables/keys'
import {
  WORKSPACE_EVENTS,
  type IShowCropDetail,
} from '@/features/workspace/constants/workspace-events'
import { useWindowEvent } from '@/shared/composables/use-window-event'

const props = defineProps<{ photo: IPhotoDetail }>()
const emit = defineEmits<{ saveAndAdvance: [] }>()

const cardNav = inject(CARD_NAV_KEY)

const showAddBib = ref(false)
const helmetGroupRef = ref<{ startAdd: () => void } | null>(null)
const clothesGroupRef = ref<{ startAdd: () => void } | null>(null)
const bicycleGroupRef = ref<{ startAdd: () => void } | null>(null)

const helmetColors = computed(() => props.photo.colors.filter((c) => c.region === 'helmet'))
const clothesColors = computed(() =>
  props.photo.colors.filter((c) => c.region === 'cyclist_clothes'),
)
const bicycleColors = computed(() => props.photo.colors.filter((c) => c.region === 'bicycle'))

const correctedBibsCount = computed(() => props.photo.bibs.filter((b) => b.wasCorrected).length)
const manualBibsCount = computed(
  () => props.photo.bibs.filter((b) => b.source === 'reviewer').length,
)

const bibsSubtitle = computed(() => {
  const parts = [
    `${props.photo.bibs.length} placa${props.photo.bibs.length === 1 ? '' : 's'}`,
    `${correctedBibsCount.value} corregida${correctedBibsCount.value === 1 ? '' : 's'}`,
    `${manualBibsCount.value} manual${manualBibsCount.value === 1 ? '' : 'es'}`,
  ]
  return parts.join(' · ')
})

const colorsSubtitle = computed(
  () => `Por región y ciclista · ${props.photo.colors.length} en total`,
)

function onAddManual() {
  const section = cardNav?.getActiveSection() ?? null
  const colorGroups = {
    helmet: helmetGroupRef,
    cyclist_clothes: clothesGroupRef,
    bicycle: bicycleGroupRef,
  } as const
  const target = section && section !== 'bibs' ? colorGroups[section] : null
  if (target) target.value?.startAdd()
  else showAddBib.value = true
}

const lightboxSrc = ref<string | null>(null)
const lightboxAlt = ref<string>('')

function onShowCrop(event: Event) {
  const detail = (event as CustomEvent<IShowCropDetail | undefined>).detail
  if (detail?.src) {
    lightboxSrc.value = detail.src
    lightboxAlt.value = detail.alt ?? 'Crop'
    return
  }
  const idx = cardNav?.activeIndex.value ?? -1
  const cards = cardNav?.cards.value ?? []
  if (idx < 0 || idx >= cards.length) return
  const card = cards[idx]
  if (!card) return
  const img = card.el.querySelector<HTMLImageElement>('.rv-crop img')
  if (!img || !img.src) return
  lightboxSrc.value = img.src
  lightboxAlt.value = img.alt || 'Crop'
}

function closeLightbox() {
  lightboxSrc.value = null
}

useWindowEvent(WORKSPACE_EVENTS.ADD_MANUAL, onAddManual)
useWindowEvent(WORKSPACE_EVENTS.SHOW_CROP, onShowCrop)
</script>

<template>
  <aside class="rv-attrs">
    <div class="rv-attrs__hint-row">
      <span><span class="rv-kbd">↑</span><span class="rv-kbd">↓</span> tarjeta</span>
      <span><span class="rv-kbd">↵</span> editar / guardar</span>
      <span><span class="rv-kbd">Espacio</span> ver crop</span>
      <span><span class="rv-kbd">A</span> agregar</span>
      <span><span class="rv-kbd">⌘↵</span> guardar foto</span>
    </div>

    <div class="rv-attrs__body">
      <div>
        <div class="rv-attrs__section-header">
          <span class="rv-attrs__section-icon">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <rect x="4" y="6" width="16" height="12" rx="2" />
              <path d="M8 10h8" />
              <path d="M8 14h5" />
            </svg>
          </span>
          <div>
            <div class="rv-attrs__section-title">Placas detectadas</div>
            <div class="rv-attrs__section-subtitle">{{ bibsSubtitle }}</div>
          </div>
        </div>

        <div class="rv-attrs__list">
          <ReviewBibCard
            v-for="bib in photo.bibs"
            :key="bib.id"
            :bib="bib"
            :photo-id="photo.id"
            :photo-slug="photo.publicSlug"
          />
          <button v-if="!showAddBib" class="rv-attrs__add-dashed" @click="showAddBib = true">
            <svg
              width="14"
              height="14"
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
            Agregar placa manual
            <span class="rv-kbd">A</span>
          </button>
          <AddBibForm
            v-else
            :photo-id="photo.id"
            :photo-slug="photo.publicSlug"
            @done="showAddBib = false"
            @cancel="showAddBib = false"
          />
        </div>
      </div>

      <div class="rv-attrs__section-header rv-attrs__section-header--colors">
        <span class="rv-attrs__section-icon">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="1.7"
            stroke-linecap="round"
            stroke-linejoin="round"
          >
            <path d="M13 2 4 14h7l-1 8 9-12h-7l1-8Z" />
          </svg>
        </span>
        <div>
          <div class="rv-attrs__section-title">Colores</div>
          <div class="rv-attrs__section-subtitle">{{ colorsSubtitle }}</div>
        </div>
      </div>

      <ReviewSectionGroup
        ref="helmetGroupRef"
        region="helmet"
        :colors="helmetColors"
        :photo-id="photo.id"
        :photo-slug="photo.publicSlug"
        show-add
      />
      <ReviewSectionGroup
        ref="clothesGroupRef"
        region="cyclist_clothes"
        :colors="clothesColors"
        :photo-id="photo.id"
        :photo-slug="photo.publicSlug"
        show-add
      />
      <ReviewSectionGroup
        ref="bicycleGroupRef"
        region="bicycle"
        :colors="bicycleColors"
        :photo-id="photo.id"
        :photo-slug="photo.publicSlug"
        show-add
      />
    </div>

    <div class="rv-attrs__footer">
      <button class="rv-btn primary rv-attrs__save" @click="emit('saveAndAdvance')">
        Marcar revisada y avanzar
        <span class="rv-kbd rv-attrs__save-kbd">⌘↵</span>
      </button>
      <div class="rv-attrs__hint">
        Cada placa y color se guarda al editar. Esto solo marca la foto como revisada.
      </div>
    </div>

    <WorkspaceCropLightbox
      v-if="lightboxSrc"
      :src="lightboxSrc"
      :alt="lightboxAlt"
      @close="closeLightbox"
    />
  </aside>
</template>

<style scoped src="./review-attributes-panel.css" />
