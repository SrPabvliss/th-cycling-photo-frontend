<script setup lang="ts">
import { NButton, NIcon, NResult, NSkeleton } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { useMyPhonesQuery } from '../../../composables/queries/use-my-phones'
import { usePhoneSheet } from '@/features/account/composables/use-phone-sheet'
import PhoneRow from './PhoneRow/PhoneRow.vue'
import PhoneSheet from './PhoneSheet/PhoneSheet.vue'

const { data: phones, isPending, isError, refetch } = useMyPhonesQuery()

const {
  isSheetOpen,
  isAddMode,
  sheetForm,
  sheetTitle,
  showMakePrimary,
  canSubmitSheet,
  isSaving,
  openEditSheet,
  openAddSheet,
  submitSheet,
  confirmDelete,
} = usePhoneSheet()
</script>

<template>
  <div class="phone-list">
    <NSkeleton v-if="isPending" text :repeat="2" />

    <NResult
      v-else-if="isError"
      status="error"
      title="No pudimos cargar tus teléfonos"
      description="Intenta de nuevo en unos segundos."
    >
      <template #footer>
        <NButton @click="refetch()">Reintentar</NButton>
      </template>
    </NResult>

    <template v-else-if="phones">
      <div class="phone-list__rows">
        <PhoneRow v-for="phone in phones" :key="phone.id" :phone="phone" @edit="openEditSheet" />

        <NButton class="phone-list__add-trigger" quaternary @click="openAddSheet">
          <template #icon><NIcon :component="AddOutline" /></template>
          Agregar otro
        </NButton>
      </div>
    </template>

    <PhoneSheet
      v-model:show="isSheetOpen"
      v-model:phone-number="sheetForm.phoneNumber"
      v-model:label="sheetForm.label"
      v-model:is-valid="sheetForm.isValid"
      v-model:is-whatsapp="sheetForm.isWhatsapp"
      v-model:make-primary="sheetForm.makePrimary"
      :title="sheetTitle"
      :is-add-mode="isAddMode"
      :show-make-primary="showMakePrimary"
      :can-submit="canSubmitSheet"
      :is-saving="isSaving"
      @save="submitSheet"
      @delete="confirmDelete"
    />
  </div>
</template>

<style scoped src="./phone-list.css"></style>
