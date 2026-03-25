<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import { NButton, NIcon, NSpin } from 'naive-ui'
import {
  CloseCircleOutline,
  ImagesOutline,
  SendOutline,
  ChatbubblesOutline,
  CardOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import { usePreviewGallery } from '../../composables/queries/use-preview-gallery'
import { useCreateOrder } from '../../composables/mutations/use-create-order'
import { usePhotoSelection } from '../../composables/use-photo-selection'
import { toCreateOrderRequest } from '../../mappers/create-order.mapper'
import { formatDate } from '@/shared/utils/date.utils'
import type { IContactFormData } from '../../constants/contact-form.schema'
import GalleryCarousel from '../components/GalleryCarousel/GalleryCarousel.vue'
import ContactForm from '../components/ContactForm/ContactForm.vue'
import OrderConfirmation from '../components/OrderConfirmation/OrderConfirmation.vue'
import PreviewExpired from '../components/PreviewExpired/PreviewExpired.vue'
import PreviewAlreadyOrdered from '../components/PreviewAlreadyOrdered/PreviewAlreadyOrdered.vue'
import PreviewNotFound from '../components/PreviewNotFound/PreviewNotFound.vue'

type ViewStep = 'gallery' | 'contact' | 'confirmation'

const route = useRoute()
const token = computed(() => route.params.token as string)

const { data: preview, isPending, isExpired, isNotFound, isConverted } = usePreviewGallery(token)
const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder(token.value)

const previewPhotos = computed(() => preview.value?.photos)
const { selectedIds, selectedCount, selectedPhotos, toggleSelect, removeFromSelection } =
  usePhotoSelection(previewPhotos)

const step = ref<ViewStep>('gallery')
const submittedPhotoCount = ref(0)

function goToContact() {
  if (selectedCount.value === 0) return
  step.value = 'contact'
}

function goBackToGallery() {
  step.value = 'gallery'
}

async function handleSubmit(formData: IContactFormData) {
  submittedPhotoCount.value = selectedCount.value
  await createOrder(toCreateOrderRequest(formData, selectedIds.value))
  step.value = 'confirmation'
}
</script>

<template>
  <PublicLayout>
    <!-- Full-width state pages -->
    <div v-if="isPending" class="cg-center">
      <NSpin size="large" />
      <p class="cg-muted">Cargando tus fotos...</p>
    </div>

    <PreviewExpired v-else-if="isExpired" />

    <PreviewNotFound v-else-if="isNotFound" />

    <PreviewAlreadyOrdered v-else-if="isConverted" :event-name="preview?.eventName ?? ''" />

    <!-- Active preview -->
    <template v-else-if="preview">
      <!-- Step 1: Gallery (full viewport) -->
      <div v-if="step === 'gallery'" class="cg-gallery">
        <!-- Left: viewer -->
        <div class="cg-viewer-col">
          <div class="cg-event-header">
            <p class="cg-event-meta">
              {{ formatDate(preview.eventDate) }} · {{ preview.photos.length }} fotos disponibles
            </p>
            <h1 class="cg-event-title">Tus fotos de {{ preview.eventName }}</h1>
            <p class="cg-event-sub">
              Selecciona las fotos que quieres adquirir. Las originales se entregan sin marca de
              agua.
            </p>
          </div>

          <GalleryCarousel
            :photos="preview.photos"
            :selected-ids="selectedIds"
            @toggle-select="toggleSelect"
          />
        </div>

        <!-- Right: panel -->
        <aside class="cg-panel">
          <!-- Selection -->
          <div class="cg-panel__section">
            <div class="cg-panel__row">
              <span class="cg-panel__label">Tu selección</span>
              <span class="cg-panel__badge">{{ selectedCount }}</span>
            </div>

            <div v-if="selectedPhotos.length > 0" class="cg-sel-grid">
              <div v-for="photo in selectedPhotos" :key="photo.id" class="cg-sel-slot">
                <img :src="photo.url" alt="" />
                <button class="cg-sel-rm" @click="removeFromSelection(photo.id)">
                  <NIcon :component="CloseCircleOutline" :size="10" />
                </button>
              </div>
            </div>

            <div v-else class="cg-sel-empty">
              <NIcon :component="ImagesOutline" :size="22" color="#9ca3af" />
              <span>Ninguna foto seleccionada</span>
            </div>
          </div>

          <!-- CTA -->
          <div class="cg-panel__cta">
            <NButton
              type="primary"
              size="large"
              block
              :disabled="selectedCount === 0"
              @click="goToContact"
            >
              <template #icon><NIcon :component="SendOutline" /></template>
              Solicitar fotos seleccionadas
            </NButton>
            <p class="cg-panel__cta-sub">
              {{
                selectedCount > 0
                  ? `${selectedCount} foto${selectedCount !== 1 ? 's' : ''} seleccionada${selectedCount !== 1 ? 's' : ''}`
                  : 'Selecciona al menos una foto'
              }}
            </p>
          </div>

          <!-- Steps -->
          <div class="cg-panel__section cg-panel__steps">
            <span class="cg-panel__label">¿Qué sigue?</span>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="ChatbubblesOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Te contactamos</p>
                <p class="cg-step__desc">Vía WhatsApp para confirmar tu pedido</p>
              </div>
            </div>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="CardOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Coordinas el pago</p>
                <p class="cg-step__desc">Transferencia o depósito bancario</p>
              </div>
            </div>
            <div class="cg-step">
              <span class="cg-step__icon">
                <NIcon :component="CloudDownloadOutline" :size="16" />
              </span>
              <div>
                <p class="cg-step__title">Recibes tus fotos</p>
                <p class="cg-step__desc">Enlace de descarga en alta resolución</p>
              </div>
            </div>
          </div>

          <!-- Watermark note -->
          <div class="cg-panel__note">
            <p>
              Estas fotos incluyen marca de agua.
              <strong>Las originales se entregan en alta resolución y sin marca de agua</strong>
              tras confirmar la compra.
            </p>
          </div>
        </aside>
      </div>

      <!-- Step 2: Contact -->
      <template v-if="step === 'contact'">
        <ContactForm
          :token="token"
          :event-name="preview.eventName"
          :event-date="preview.eventDate"
          :selected-photos="selectedPhotos"
          :photo-count="selectedCount"
          :is-submitting="isSubmitting"
          @submit="handleSubmit"
          @back="goBackToGallery"
        />
      </template>

      <!-- Step 3: Confirmation -->
      <OrderConfirmation
        v-if="step === 'confirmation'"
        :event-name="preview.eventName"
        :photo-count="submittedPhotoCount"
      />
    </template>
  </PublicLayout>
</template>

<style scoped src="./client-gallery-view.css" />
