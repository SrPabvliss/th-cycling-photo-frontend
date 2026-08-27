<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NModal, NSpin } from 'naive-ui'
import {
  CloseCircleOutline,
  ImagesOutline,
  SendOutline,
  ChatbubblesOutline,
  CardOutline,
  CloudDownloadOutline,
} from '@vicons/ionicons5'

import PublicLayout from '@/core/layout/public/PublicLayout.vue'
import TitanLogo from '@/core/layout/public/TitanLogo.vue'
import { useAuth } from '@/features/auth/composables/use-auth'
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
import PreviewNotFound from '@/shared/components/PreviewNotFound/PreviewNotFound.vue'
import { pluralize } from '@/shared/utils/format.utils'

type ViewStep = 'gallery' | 'contact' | 'confirmation'

const route = useRoute()
const router = useRouter()
const token = computed(() => route.params.token as string)

const { isAuthenticated, login, isLoggingIn } = useAuth()
const { data: preview, isPending, isExpired, isNotFound, isConverted } = usePreviewGallery(token)
const { mutateAsync: createOrder, isPending: isSubmitting } = useCreateOrder(token.value)

const previewPhotos = computed(() => preview.value?.photos)
const {
  selectedIds,
  selectedCount,
  selectedPhotos,
  allSelected,
  selectAll,
  clearSelection,
  toggleSelect,
  removeFromSelection,
} = usePhotoSelection(previewPhotos)

function toggleSelectAll() {
  if (allSelected.value) {
    clearSelection()
  } else {
    selectAll()
  }
}

const step = ref<ViewStep>('gallery')
const submittedPhotoCount = ref(0)
const showLoginModal = ref(false)

// --- Login modal state ---
const loginEmail = ref('')
const loginPassword = ref('')
const loginError = ref('')

function goToContact() {
  if (selectedCount.value === 0) return

  if (!isAuthenticated.value) {
    showLoginModal.value = true
    return
  }

  step.value = 'contact'
}

async function handleModalLogin() {
  loginError.value = ''
  try {
    await login({ email: loginEmail.value, password: loginPassword.value })
    showLoginModal.value = false
    step.value = 'contact'
  } catch {
    loginError.value = 'Credenciales incorrectas'
  }
}

function goToRegister() {
  showLoginModal.value = false
  router.push({ path: '/register', query: { redirect: route.fullPath } })
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
              <template v-if="preview.startDate.getTime() === preview.endDate.getTime()">
                {{ formatDate(preview.startDate) }}
              </template>
              <template v-else>
                {{ formatDate(preview.startDate) }} – {{ formatDate(preview.endDate) }}
              </template>
              · {{ preview.photos.length }} fotos disponibles
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

            <NButton
              v-if="preview.photos.length > 0"
              text
              type="primary"
              size="small"
              class="cg-select-all"
              @click="toggleSelectAll"
            >
              {{ allSelected ? 'Deseleccionar todas' : 'Seleccionar todas' }}
            </NButton>

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
                  ? `${selectedCount} ${pluralize(selectedCount, 'foto seleccionada', 'fotos seleccionadas')}`
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
          :start-date="preview.startDate"
          :end-date="preview.endDate"
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

    <!-- Login Modal -->
    <NModal v-model:show="showLoginModal" preset="card" style="max-width: 400px">
      <template #header>
        <div
          style="display: flex; flex-direction: column; align-items: center; gap: 8px; width: 100%"
        >
          <TitanLogo :size="40" />
          <span style="font-size: 18px; font-weight: 700">Inicia sesión para continuar</span>
        </div>
      </template>

      <form
        @submit.prevent="handleModalLogin"
        style="display: flex; flex-direction: column; gap: 12px"
      >
        <input
          v-model="loginEmail"
          type="email"
          placeholder="Correo electrónico"
          required
          style="
            padding: 10px 12px;
            border: 1px solid #e0e0e6;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
          "
        />
        <input
          v-model="loginPassword"
          type="password"
          placeholder="Contraseña"
          required
          style="
            padding: 10px 12px;
            border: 1px solid #e0e0e6;
            border-radius: 6px;
            font-size: 14px;
            outline: none;
          "
        />
        <p v-if="loginError" style="color: #d03050; font-size: 13px; margin: 0">
          {{ loginError }}
        </p>
        <NButton type="primary" block :loading="isLoggingIn" attr-type="submit">
          Iniciar sesión
        </NButton>
      </form>

      <p style="text-align: center; font-size: 13px; color: #6b7280; margin: 12px 0 0">
        ¿No tienes cuenta?
        <a
          href="#"
          style="color: #105080; font-weight: 500; text-decoration: none"
          @click.prevent="goToRegister"
        >
          Crear cuenta
        </a>
      </p>
    </NModal>
  </PublicLayout>
</template>

<style scoped src="./client-gallery-view.css" />
