<script setup lang="ts">
import { computed, nextTick, onUnmounted, ref, watch } from 'vue'
import type { IColorAttribute } from '@/features/photos/types/responses/photo-detail.response'
import {
  asColorName,
  COLOR_PALETTE,
  COLOR_PALETTE_HEX,
  COLOR_PALETTE_LABELS,
  type ColorName,
} from '@/shared/constants/color-palette'
import type { ColorRegion } from '../../../types/color-region.type'
import { useApplyColorCorrection } from '../../../composables/mutations/use-apply-color-correction'
import { useAsyncSaveState } from '@/shared/composables/use-async-save-state'
import { useWorkspaceCropLightbox } from '@/features/workspace/composables/use-workspace-crop-lightbox'
import { useGridKeyboardNav } from '@/shared/composables/use-grid-keyboard-nav'
import { useWorkspaceCardRegistration } from '@/features/workspace/composables/use-workspace-card-registration'

const props = defineProps<{
  color: IColorAttribute
  region: ColorRegion
  cyclistLabel?: string
  photoId: string
  photoSlug: string
}>()

const applyColorCorrection = useApplyColorCorrection()
const lightbox = useWorkspaceCropLightbox()
const save = useAsyncSaveState()
const cardEl = ref<HTMLElement>()
useWorkspaceCardRegistration(props.color.id, props.region, cardEl)
const paletteGridEl = ref<HTMLElement>()
const palette = useGridKeyboardNav(paletteGridEl, 8)
const openPicker = ref<'primary' | 'secondary' | null>(null)

/** AI pipeline can in theory emit colors outside the palette; fall back to gris
 * for an unknown primary so the picker always shows something selectable. */
const FALLBACK_COLOR: ColorName = 'gris'

const remotePrimary = computed(() => asColorName(props.color.primaryColor) ?? FALLBACK_COLOR)
const remoteSecondary = computed(() => asColorName(props.color.secondaryColor))

const localPrimary = ref<ColorName>(remotePrimary.value)
const localSecondary = ref<ColorName | null>(remoteSecondary.value)

watch(
  () => [remotePrimary.value, remoteSecondary.value] as const,
  ([p, s]) => {
    localPrimary.value = p
    localSecondary.value = s
  },
)

const hasPending = computed(
  () =>
    localPrimary.value !== remotePrimary.value || localSecondary.value !== remoteSecondary.value,
)

onUnmounted(() => save.clearTimer())

const isManual = computed(() => props.color.source === 'reviewer')

const cardState = computed(() => {
  if (openPicker.value || hasPending.value) return 'editing'
  return save.status.value
})

async function commitChanges() {
  if (!hasPending.value) return
  const tasks: Array<Promise<unknown>> = []
  if (localPrimary.value !== remotePrimary.value) {
    tasks.push(
      applyColorCorrection.mutateAsync({
        photoId: props.photoId,
        colorId: props.color.id,
        field: 'primary_color',
        newValue: localPrimary.value,
        photoSlug: props.photoSlug,
      }),
    )
  }
  if (localSecondary.value !== remoteSecondary.value) {
    tasks.push(
      applyColorCorrection.mutateAsync({
        photoId: props.photoId,
        colorId: props.color.id,
        field: 'secondary_color',
        newValue: localSecondary.value,
        photoSlug: props.photoSlug,
      }),
    )
  }
  const result = await save.run(() => Promise.all(tasks))
  if (result !== undefined) openPicker.value = null
}

function cancelChanges() {
  localPrimary.value = remotePrimary.value
  localSecondary.value = remoteSecondary.value
  openPicker.value = null
  save.reset()
  cardEl.value?.focus()
}

function pickPrimary(value: ColorName) {
  localPrimary.value = value
  openPicker.value = 'secondary'
  nextTick(() => palette.focusActive())
}

function pickSecondary(value: ColorName | null) {
  localSecondary.value = value
  openPicker.value = null
  cardEl.value?.focus()
}

function togglePicker(side: 'primary' | 'secondary') {
  openPicker.value = openPicker.value === side ? null : side
  if (openPicker.value) {
    nextTick(() => palette.focusActive())
  }
}

function onCardKey(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey && !(e.metaKey || e.ctrlKey)) {
    // Picker open → let Enter reach the focused swatch's native click.
    if (openPicker.value) return
    e.preventDefault()
    e.stopPropagation()
    if (hasPending.value) {
      commitChanges()
    } else {
      togglePicker('primary')
    }
  } else if (e.key === 'Escape') {
    if (openPicker.value) {
      e.stopPropagation()
      openPicker.value = null
      cardEl.value?.focus()
    } else if (hasPending.value) {
      e.stopPropagation()
      cancelChanges()
    }
  }
}

function openCropLightbox() {
  lightbox.open(props.color.cropUrl, cyclistLabelComputed.value)
}

function getColorLabel(name: ColorName | null): string {
  if (!name) return 'ninguno'
  return COLOR_PALETTE_LABELS[name] ?? name
}

function getColorHex(name: ColorName | null): string {
  if (!name) return 'transparent'
  return COLOR_PALETTE_HEX[name] ?? '#fff'
}

const colorPaletteValues = COLOR_PALETTE
const cyclistLabelComputed = computed(() => props.cyclistLabel ?? 'Ciclista')
</script>

<template>
  <div
    ref="cardEl"
    class="rv-attr rv-color-card"
    :class="`is-${cardState}`"
    role="group"
    tabindex="0"
    :aria-label="`Colores ${cyclistLabelComputed}: primario ${getColorLabel(localPrimary)}, secundario ${getColorLabel(localSecondary)}`"
    @keydown="onCardKey"
  >
    <div class="rv-color-card__layout">
      <button
        type="button"
        class="rv-crop rv-color-card__crop"
        :title="color.cropUrl ? 'Ver crop ampliado (Espacio)' : 'Sin crop'"
        :disabled="!color.cropUrl"
        @click.stop="openCropLightbox"
      >
        <img v-if="color.cropUrl" :src="color.cropUrl" :alt="cyclistLabelComputed" />
        <span v-else class="rv-crop__placeholder">{{ region }}</span>
      </button>

      <div class="rv-color-card__main">
        <div class="rv-color-card__heading">
          <span class="rv-color-card__cyclist">{{ cyclistLabelComputed }}</span>
          <span v-if="isManual" class="rv-tag info">manual</span>
          <span
            v-if="!isManual && (color.primaryWasCorrected || color.secondaryWasCorrected)"
            class="rv-color-card__corrected"
          >
            <svg
              width="11"
              height="11"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M4 20h4l10-10-4-4L4 16v4Z" />
              <path d="m13.5 6.5 4 4" />
            </svg>
            corregido
          </span>
        </div>

        <div class="rv-color-card__pickers">
          <div>
            <div class="rv-color-card__picker-label">Primario</div>
            <button
              class="rv-btn rv-color-card__picker-btn"
              :data-active="openPicker === 'primary'"
              :data-pending="localPrimary !== remotePrimary"
              @click.stop="togglePicker('primary')"
            >
              <span class="rv-color-card__picker-value">
                <span
                  class="rv-sw"
                  :style="{ background: getColorHex(localPrimary), width: '16px', height: '16px' }"
                />
                <span>{{ getColorLabel(localPrimary) }}</span>
              </span>
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
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
          <div>
            <div class="rv-color-card__picker-label">Secundario</div>
            <button
              class="rv-btn rv-color-card__picker-btn"
              :data-active="openPicker === 'secondary'"
              :data-pending="localSecondary !== remoteSecondary"
              @click.stop="togglePicker('secondary')"
            >
              <span class="rv-color-card__picker-value">
                <template v-if="localSecondary">
                  <span
                    class="rv-sw"
                    :style="{
                      background: getColorHex(localSecondary),
                      width: '16px',
                      height: '16px',
                    }"
                  />
                  <span>{{ getColorLabel(localSecondary) }}</span>
                </template>
                <span v-else class="rv-color-card__picker-none">ninguno</span>
              </span>
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
                <path d="m6 9 6 6 6-6" />
              </svg>
            </button>
          </div>
        </div>

        <div v-if="openPicker" class="rv-card rv-color-card__palette-card">
          <div class="rv-color-card__palette-label">
            Elegir {{ openPicker === 'primary' ? 'primario' : 'secundario' }}
          </div>
          <div
            ref="paletteGridEl"
            class="rv-color-card__palette-grid"
            role="radiogroup"
            :aria-label="`Elegir color ${openPicker === 'primary' ? 'primario' : 'secundario'}`"
            @keydown="palette.onKey"
          >
            <button
              v-for="name in colorPaletteValues"
              :key="name"
              type="button"
              class="rv-color-card__palette-swatch"
              role="radio"
              :data-active="(openPicker === 'primary' ? localPrimary : localSecondary) === name"
              :aria-checked="(openPicker === 'primary' ? localPrimary : localSecondary) === name"
              :aria-label="getColorLabel(name)"
              :title="getColorLabel(name)"
              @click.stop="openPicker === 'primary' ? pickPrimary(name) : pickSecondary(name)"
            >
              <span class="rv-color-card__palette-dot" :style="{ background: getColorHex(name) }" />
            </button>
            <button
              v-if="openPicker === 'secondary'"
              type="button"
              class="rv-color-card__palette-swatch rv-color-card__palette-swatch--none"
              role="radio"
              :data-active="!localSecondary"
              :aria-checked="!localSecondary"
              aria-label="Sin color secundario"
              title="Ninguno"
              @click.stop="pickSecondary(null)"
            >
              <span class="rv-color-card__palette-dot rv-color-card__palette-dot--none" />
            </button>
          </div>
        </div>

        <div class="rv-color-card__meta" role="status" aria-live="polite">
          <span v-if="cardState === 'saved'" class="rv-color-card__saved">
            <svg
              width="12"
              height="12"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.7"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="m5 12 5 5L20 7" />
            </svg>
            Guardado
          </span>
          <span v-if="cardState === 'saving'" class="rv-color-card__dirty-hint"> Guardando… </span>
          <span
            v-if="cardState === 'error' && save.errorMessage.value"
            class="rv-color-card__error"
          >
            {{ save.errorMessage.value }}
          </span>
        </div>

        <div v-if="hasPending && !save.isSaving.value" class="rv-color-card__actions">
          <button class="rv-btn primary" @click.stop="commitChanges">
            Guardar
            <span
              class="rv-kbd"
              style="
                background: rgba(255, 255, 255, 0.18);
                color: #fff;
                border-color: rgba(255, 255, 255, 0.3);
              "
              >↵</span
            >
          </button>
          <button class="rv-btn ghost" @click.stop="cancelChanges">
            Cancelar
            <span class="rv-kbd">Esc</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./review-color-card.css" />
