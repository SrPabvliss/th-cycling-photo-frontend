<script setup lang="ts">
import { ref } from 'vue'
import ColorPalettePicker from '../ColorPalettePicker/ColorPalettePicker.vue'
import { useAddPhotoColor } from '../../../composables/mutations/use-add-photo-color'
import { REGION_LABELS_LOWER } from '../../../constants/region-labels'
import type { ColorRegion } from '../../../types/color-region.type'
import type { ColorName } from '@/shared/constants/color-palette'

const props = defineProps<{ photoId: string; photoSlug: string; region: ColorRegion }>()
const emit = defineEmits<{ done: []; cancel: [] }>()

const primary = ref<ColorName | null>(null)
const secondary = ref<ColorName | null>(null)
const error = ref<string | null>(null)
const addColor = useAddPhotoColor()

function cancel() {
  error.value = null
  emit('cancel')
}

function submit() {
  if (!primary.value) {
    error.value = 'Selecciona un color primario.'
    return
  }
  addColor.mutate(
    {
      photoId: props.photoId,
      photoSlug: props.photoSlug,
      region: props.region,
      primaryColor: primary.value,
      secondaryColor: secondary.value,
    },
    { onSuccess: () => emit('done') },
  )
}
</script>

<template>
  <div class="rv-card rv-add-color">
    <div class="rv-add-color__head">
      <span class="rv-add-color__label">Agregar {{ REGION_LABELS_LOWER[region] }} manual</span>
      <span class="rv-add-color__hint"> <span class="rv-kbd">Esc</span> cancelar </span>
    </div>
    <div class="rv-add-color__row">
      <ColorPalettePicker :value="primary" label="Primario" @update:value="primary = $event" />
      <ColorPalettePicker
        :value="secondary"
        allow-none
        label="Secundario"
        @update:value="secondary = $event"
      />
      <button class="rv-btn primary" :disabled="addColor.isPending.value" @click="submit">
        Guardar
      </button>
      <button class="rv-btn ghost" @click="cancel">Cancelar</button>
    </div>
    <p v-if="error" class="rv-add-color__error">{{ error }}</p>
  </div>
</template>

<style scoped src="./add-color-form.css" />
