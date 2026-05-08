<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NFormItem, NIcon, NInput, NSelect } from 'naive-ui'
import {
  ChevronBack,
  ChevronForward,
  CheckmarkCircle,
  SendOutline,
  ImageOutline,
  ChatbubblesOutline,
  CardOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'

import { formatDate } from '@/shared/utils/date.utils'
import { getGalleryUrl } from '@/shared/utils/cdn.utils'
import { useParticipantCategoriesQuery } from '@/features/photo-categories/composables/queries/use-participant-categories'
import type { ICartGroup } from '../../../types/responses/cart.response'
import type { IEventFormData } from '../../../composables/use-checkout-stepper'

const props = defineProps<{
  group: ICartGroup
  form: IEventFormData
  isFirst: boolean
  isLast: boolean
  totalSteps: number
  isCheckingOut: boolean
}>()

const emit = defineEmits<{
  'update:form': [form: IEventFormData]
  prev: []
  next: []
  checkout: []
}>()

function updateForm(patch: Partial<IEventFormData>) {
  emit('update:form', { ...props.form, ...patch })
}

const { data: categories } = useParticipantCategoriesQuery(1)

const categoryOptions = computed(
  () => categories.value?.map((c) => ({ label: c.name, value: c.name })) ?? [],
)
</script>

<template>
  <div class="cf-grid" style="padding: 2rem 2.5rem">
    <!-- LEFT: Summary -->
    <div class="cf-summary">
      <p class="cf-section-label">Tu selección</p>

      <div class="cf-photos">
        <div v-for="photo in group.photos" :key="photo.id" class="cf-photo-tile">
          <img :src="getGalleryUrl(photo.publicSlug)" alt="" />
        </div>
      </div>

      <div class="cf-count-chip">
        <span class="cf-count-chip__label">Fotos seleccionadas</span>
        <span class="cf-count-chip__num">{{ group.photos.length }}</span>
      </div>

      <div class="cf-event-card">
        <div class="cf-event-row">
          <span class="cf-event-row__label">Evento</span>
          <span class="cf-event-row__value">{{ group.eventName }}</span>
        </div>
        <div class="cf-event-row">
          <span class="cf-event-row__label">Fecha</span>
          <span class="cf-event-row__value">{{ formatDate(group.eventDate) }}</span>
        </div>
        <div class="cf-event-row cf-event-row--last">
          <span class="cf-event-row__label">Fotógrafo</span>
          <span class="cf-event-row__value">Titan TV</span>
        </div>
      </div>

      <div class="cf-promises">
        <div class="cf-promise">
          <NIcon :component="ImageOutline" :size="14" color="#18a058" />
          <span>Alta resolución, sin marcas de agua</span>
        </div>
        <div class="cf-promise">
          <NIcon :component="ChatbubblesOutline" :size="14" color="#18a058" />
          <span>Contacto vía WhatsApp en menos de 24h</span>
        </div>
        <div class="cf-promise">
          <NIcon :component="CardOutline" :size="14" color="#18a058" />
          <span>Pago por transferencia o depósito</span>
        </div>
        <div class="cf-promise">
          <NIcon :component="CloudDownloadOutline" :size="14" color="#18a058" />
          <span>Entrega digital inmediata tras el pago</span>
        </div>
      </div>
    </div>

    <!-- RIGHT: Form -->
    <div class="cf-form-col">
      <div class="cf-form-heading">
        <h1 class="cf-form-title">Confirmar pedido</h1>
        <p class="cf-form-subtitle">Completa los datos para {{ group.eventName }}.</p>
      </div>

      <div class="cf-form-grid">
        <div class="cf-field">
          <NFormItem label="Categoría" required>
            <NSelect
              :value="form.categoryName"
              :options="categoryOptions"
              placeholder="Seleccionar categoría"
              filterable
              @update:value="(val: string | null) => updateForm({ categoryName: val })"
            />
          </NFormItem>
        </div>

        <div class="cf-field">
          <NFormItem label="Número de dorsal" required>
            <NInput
              :value="form.bibNumber"
              placeholder="Ej. 127"
              @update:value="(val: string) => updateForm({ bibNumber: val })"
            />
          </NFormItem>
        </div>

        <div class="cf-field cf-field--full">
          <NFormItem label="Observaciones (opcional)">
            <NInput
              :value="form.notes"
              type="textarea"
              @update:value="(val: string) => updateForm({ notes: val })"
              placeholder="¿Algún comentario adicional?"
              :rows="3"
              :maxlength="500"
              show-count
            />
          </NFormItem>
        </div>

        <div class="cf-field cf-field--full cf-cta">
          <div class="checkout-nav">
            <NButton v-if="!isFirst" size="large" @click="emit('prev')">
              <template #icon><NIcon :component="ChevronBack" /></template>
              Anterior
            </NButton>
            <div v-else />

            <NButton v-if="!isLast" type="primary" size="large" @click="emit('next')">
              Siguiente evento
              <template #icon><NIcon :component="ChevronForward" /></template>
            </NButton>
            <NButton
              v-else
              type="primary"
              size="large"
              :loading="isCheckingOut"
              @click="emit('checkout')"
            >
              <template #icon><NIcon :component="SendOutline" /></template>
              Confirmar {{ totalSteps > 1 ? `${totalSteps} pedidos` : 'pedido' }}
            </NButton>
          </div>

          <p class="cf-cta-note">
            <NIcon :component="CheckmarkCircle" :size="14" color="#18a058" />
            Te contactaremos por WhatsApp para coordinar el pago
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped src="./checkout-event-section.css" />
