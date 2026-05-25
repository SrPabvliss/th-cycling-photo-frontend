<script setup lang="ts">
import { computed, onUnmounted, ref } from 'vue'
import { NIcon, useDialog } from 'naive-ui'
import { TrashOutline } from '@vicons/ionicons5'
import type { IBibAttribute } from '@/features/photos/types/responses/photo-detail.response'
import { useApplyBibCorrection } from '../../../composables/mutations/use-apply-bib-correction'
import { useDeletePhotoBib } from '../../../composables/mutations/use-delete-photo-bib'
import { useAsyncSaveState } from '@/shared/composables/use-async-save-state'
import { useBibConfidence } from '../../../composables/use-bib-confidence'
import { useWorkspaceCropLightbox } from '@/features/workspace/composables/use-workspace-crop-lightbox'
import { useWorkspaceCardRegistration } from '@/features/workspace/composables/use-workspace-card-registration'

const props = defineProps<{
  bib: IBibAttribute
  photoId: string
  photoSlug: string
}>()

const applyBibCorrection = useApplyBibCorrection()
const deleteBib = useDeletePhotoBib()
const dialog = useDialog()
const lightbox = useWorkspaceCropLightbox()
const save = useAsyncSaveState()
const cardEl = ref<HTMLElement>()
useWorkspaceCardRegistration(props.bib.id, 'bibs', cardEl)

const isEditing = ref(false)
const editValue = ref(props.bib.digits)
const inputEl = ref<HTMLInputElement>()

onUnmounted(() => save.clearTimer())

const isManual = computed(() => props.bib.source === 'reviewer')
const cardState = computed(() => (isEditing.value ? 'editing' : save.status.value))

const {
  level: confidenceLevel,
  label: confidenceLabel,
  pct: confidencePct,
} = useBibConfidence(computed(() => props.bib.confidence))

function startEdit() {
  isEditing.value = true
  editValue.value = props.bib.digits
  setTimeout(() => inputEl.value?.focus(), 0)
}

function cancelEdit() {
  isEditing.value = false
  editValue.value = props.bib.digits
}

async function commitEdit() {
  const newValue = editValue.value
  if (newValue === props.bib.digits) {
    isEditing.value = false
    return
  }
  if (!/^[0-9]{1,6}$/.test(newValue)) {
    save.setError('Solo dígitos (0–9), 1 a 6 caracteres.')
    return
  }
  const result = await save.run(() =>
    applyBibCorrection.mutateAsync({
      photoId: props.photoId,
      bibId: props.bib.id,
      newValue,
      photoSlug: props.photoSlug,
    }),
  )
  if (result !== undefined) isEditing.value = false
}

function openCropLightbox() {
  lightbox.open(props.bib.cropUrl, `Placa ${props.bib.digits}`)
}

function confirmDelete() {
  dialog.warning({
    title: 'Eliminar placa',
    content: `¿Eliminar la placa "${props.bib.digits}"? Esta acción puede deshacerse contactando soporte.`,
    positiveText: 'Eliminar',
    negativeText: 'Cancelar',
    positiveButtonProps: { type: 'error' },
    onPositiveClick: () => {
      deleteBib.mutate({
        photoId: props.photoId,
        bibId: props.bib.id,
        photoSlug: props.photoSlug,
      })
    },
  })
}

function onInputKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    cancelEdit()
  } else if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault()
    e.stopPropagation()
    commitEdit()
  }
}

const errorMessage = save.errorMessage
</script>

<template>
  <div
    ref="cardEl"
    class="rv-attr rv-bib-card"
    :class="`is-${cardState}`"
    role="button"
    tabindex="0"
    :aria-label="`Editar placa ${bib.digits}`"
    @click="startEdit"
    @keydown.enter.prevent.stop="startEdit"
  >
    <div class="rv-bib-card__layout">
      <button
        type="button"
        class="rv-crop rv-bib-card__crop"
        :title="bib.cropUrl ? 'Ver crop ampliado (Espacio)' : 'Sin crop'"
        :disabled="!bib.cropUrl"
        @click.stop="openCropLightbox"
      >
        <img v-if="bib.cropUrl" :src="bib.cropUrl" :alt="`Placa ${bib.digits}`" />
        <span v-else class="rv-crop__placeholder">bib</span>
      </button>

      <div class="rv-bib-card__main">
        <div class="rv-bib-card__heading">
          <span class="rv-bib-card__heading-label">
            {{ isManual ? 'Placa manual' : 'Placa detectada' }}
          </span>
          <span v-if="!isManual" class="rv-tag" :class="confidenceLevel">
            {{ confidenceLabel }} · <span class="mono">{{ confidencePct }}</span>
          </span>
          <span v-if="isManual" class="rv-tag info">manual</span>
          <button
            type="button"
            class="rv-bib-card__delete"
            :disabled="deleteBib.isPending.value"
            title="Eliminar placa"
            @click.stop="confirmDelete"
          >
            <NIcon :component="TrashOutline" :size="16" />
          </button>
        </div>

        <input
          v-if="isEditing"
          ref="inputEl"
          v-model="editValue"
          class="rv-input mono is-editing rv-bib-card__input"
          @click.stop
          @keydown="onInputKey"
        />
        <input v-else :value="bib.digits" readonly class="rv-input mono rv-bib-card__input" />

        <div class="rv-bib-card__meta" role="status" aria-live="polite">
          <template v-if="!isManual">
            <span v-if="bib.wasCorrected" class="rv-bib-card__corrected">
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
                <path d="M4 20h4l10-10-4-4L4 16v4Z" />
                <path d="m13.5 6.5 4 4" />
              </svg>
              Corregido · IA leyó
              <span class="mono rv-bib-card__pill">{{ bib.digitsOriginal }}</span>
            </span>
            <span v-else class="rv-bib-card__ai-read">
              IA leyó
              <span class="mono rv-bib-card__pill">{{ bib.digitsOriginal || '—' }}</span>
            </span>
          </template>
          <span v-if="cardState === 'saved'" class="rv-bib-card__saved">
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
          <span v-if="cardState === 'saving'" class="rv-bib-card__dirty-hint"> Guardando… </span>
          <span v-if="cardState === 'error' && errorMessage" class="rv-bib-card__error">
            {{ errorMessage }}
          </span>
        </div>

        <div v-if="isEditing" class="rv-bib-card__actions">
          <button class="rv-btn primary" @click.stop="commitEdit">
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
          <button class="rv-btn ghost" @click.stop="cancelEdit">
            Cancelar
            <span class="rv-kbd">Esc</span>
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./review-bib-card.css" />
