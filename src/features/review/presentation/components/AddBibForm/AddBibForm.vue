<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useAddPhotoBib } from '../../../composables/mutations/use-add-photo-bib'

const props = defineProps<{ photoId: string; photoSlug: string }>()
const emit = defineEmits<{ done: []; cancel: [] }>()

const digits = ref('')
const error = ref<string | null>(null)
const inputEl = ref<HTMLInputElement>()
const addBib = useAddPhotoBib()

onMounted(() => inputEl.value?.focus())

function cancel() {
  error.value = null
  emit('cancel')
}

function submit() {
  if (!/^[0-9]{1,6}$/.test(digits.value)) {
    error.value = 'Dígitos solo (0–9), 1 a 6 caracteres.'
    return
  }
  addBib.mutate(
    {
      photoId: props.photoId,
      photoSlug: props.photoSlug,
      digits: digits.value,
    },
    { onSuccess: () => emit('done') },
  )
}

function onKey(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    e.stopPropagation()
    cancel()
  } else if (e.key === 'Enter') {
    e.preventDefault()
    e.stopPropagation()
    submit()
  }
}
</script>

<template>
  <div class="rv-card rv-add-bib">
    <div class="rv-add-bib__head">
      <span class="rv-add-bib__label">Agregar placa manual</span>
      <span class="rv-add-bib__hint">
        <span class="rv-kbd">↵</span> guardar · <span class="rv-kbd">Esc</span> cancelar
      </span>
    </div>
    <div class="rv-add-bib__row">
      <input
        ref="inputEl"
        v-model="digits"
        class="rv-input mono rv-add-bib__input"
        placeholder="Ej. 42"
        inputmode="numeric"
        maxlength="6"
        :class="{ 'is-error': error }"
        @keydown="onKey"
      />
      <button class="rv-btn primary" :disabled="addBib.isPending.value" @click="submit">
        Guardar
      </button>
      <button class="rv-btn ghost" @click="cancel">Cancelar</button>
    </div>
    <p v-if="error" class="rv-add-bib__error">{{ error }}</p>
  </div>
</template>

<style scoped src="./add-bib-form.css" />
