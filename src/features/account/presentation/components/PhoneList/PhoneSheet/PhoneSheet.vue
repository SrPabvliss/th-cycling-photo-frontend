<script setup lang="ts">
import { NButton, NCheckbox, NInput, NModal, NPopconfirm, NSwitch } from 'naive-ui'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'

defineProps<{
  title: string
  isAddMode: boolean
  showMakePrimary: boolean
  canSubmit: boolean
  isSaving: boolean
}>()

const emit = defineEmits<{
  save: []
  delete: []
}>()

const show = defineModel<boolean>('show', { required: true })
const phoneNumber = defineModel<string>('phoneNumber', { required: true })
const label = defineModel<string>('label', { required: true })
const isValid = defineModel<boolean>('isValid', { required: true })
const isWhatsapp = defineModel<boolean>('isWhatsapp', { required: true })
const makePrimary = defineModel<boolean>('makePrimary', { required: true })
</script>

<template>
  <NModal
    v-model:show="show"
    preset="card"
    class="phone-list__sheet"
    style="width: 420px; max-width: calc(100vw - 32px)"
    :title="title"
  >
    <div class="phone-sheet__fields">
      <div class="tt-phone-input phone-sheet__phone-input">
        <IntlTelInput
          :options="PHONE_INPUT_OPTIONS"
          :value="phoneNumber"
          :input-props="{ placeholder: 'Ej. 99 123 4567' }"
          @change-number="(num: string) => (phoneNumber = num)"
          @change-validity="(valid: boolean) => (isValid = valid)"
        />
      </div>

      <NInput v-model:value="label" placeholder="Etiqueta (ej. Personal)" />

      <div class="phone-sheet__whatsapp-row">
        <span class="phone-sheet__whatsapp-label">WhatsApp</span>
        <NSwitch v-model:value="isWhatsapp" />
      </div>

      <NCheckbox v-if="showMakePrimary" v-model:checked="makePrimary"> Hacer principal </NCheckbox>
    </div>

    <template #footer>
      <div class="phone-sheet__footer">
        <NPopconfirm v-if="!isAddMode" @positive-click="emit('delete')">
          <template #trigger>
            <NButton text type="error" class="phone-sheet__delete-btn">Eliminar</NButton>
          </template>
          ¿Eliminar este teléfono?
        </NPopconfirm>

        <NButton
          type="primary"
          class="phone-sheet__save-btn"
          :loading="isSaving"
          :disabled="!canSubmit"
          @click="emit('save')"
        >
          Guardar
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./phone-sheet.css"></style>
