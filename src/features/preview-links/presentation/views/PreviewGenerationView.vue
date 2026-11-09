<script setup lang="ts">
import { computed, ref } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import {
  NButton,
  NCard,
  NFlex,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NModal,
  useMessage,
} from 'naive-ui'
import {
  CheckmarkCircle,
  CopyOutline,
  InformationCircleOutline,
  LinkOutline,
  LogoWhatsapp,
} from '@vicons/ionicons5'

import { usePhotoSelectionStore } from '@/shared/stores/photo-selection.store'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { useCreatePreviewLink } from '../../composables/mutations/use-create-preview-link'
import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import PageHeader from '@/shared/components/PageHeader/PageHeader.vue'
import type { IPreviewLinkCreated } from '../../types/responses/preview-link-created.response'
import { pluralize } from '@/shared/utils/format.utils'
import { formatDateTime } from '@/shared/utils/date.utils'

const route = useRoute()
const router = useRouter()
const message = useMessage()
const selectionStore = usePhotoSelectionStore()

const slug = computed(() => route.params.slug as string)
// The route carries the slug; the preview-links API is keyed by the event UUID.
const { data: event } = useEventDetailQuery(slug)
const eventId = computed(() => event.value?.id ?? '')

const expiresInDays = ref(7)
const createdLink = ref<IPreviewLinkCreated | null>(null)
const showWhatsAppModal = ref(false)
const whatsAppPhone = ref('')

const { mutateAsync: createPreviewLink, isPending: isCreating } = useCreatePreviewLink(eventId)

const selectedPhotos = computed(() => selectionStore.selectedArray)

// Redirect to gallery if no photos selected (e.g., page reload)
if (selectionStore.selectedCount === 0) {
  router.replace({
    name: ROUTE_NAMES.PHOTOS_GALLERY,
    params: { slug: slug.value },
  })
}

// The gallery hands the selection over to this screen. Keep it only when going
// back to this event's gallery without having generated the link, so the
// selection can be adjusted; anywhere else it would leak into other screens.
onBeforeRouteLeave((to) => {
  const backToSameGallery = to.name === ROUTE_NAMES.PHOTOS_GALLERY && to.params.slug === slug.value
  if (createdLink.value || !backToSameGallery) selectionStore.exitSelectionMode()
})

const expirationOptions = [
  { label: '1 día', value: 1 },
  { label: '2 días', value: 2 },
  { label: '7 días', value: 7 },
]

async function handleGenerate() {
  if (selectedPhotos.value.length === 0 || !eventId.value) return

  try {
    createdLink.value = await createPreviewLink({
      photoIds: selectedPhotos.value.map((p) => p.id),
      expiresInDays: expiresInDays.value,
    })
  } catch {
    // Error toast is shown by the error interceptor
  }
}

async function handleCopyLink() {
  if (!createdLink.value) return
  try {
    await navigator.clipboard.writeText(createdLink.value.previewUrl)
    message.success('Enlace copiado al portapapeles')
  } catch {
    message.error('No se pudo copiar el enlace')
  }
}

function handleWhatsAppClick() {
  showWhatsAppModal.value = true
}

function handleWhatsAppSend() {
  if (!createdLink.value || !whatsAppPhone.value.trim()) return
  openWhatsApp(whatsAppPhone.value.trim(), createdLink.value.shareTemplate)
  showWhatsAppModal.value = false
  whatsAppPhone.value = ''
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content preview-gen-content">
      <PageHeader
        title="Generar Preview"
        :subtitle="`${selectionStore.selectedCount} ${pluralize(selectionStore.selectedCount, 'foto seleccionada', 'fotos seleccionadas')}`"
        back-to=""
      />

      <div class="preview-gen-layout">
        <!-- Left: Selected photos grid -->
        <NCard title="Fotos Seleccionadas" size="small">
          <NGrid :cols="3" :x-gap="10" :y-gap="10">
            <NGridItem v-for="photo in selectedPhotos" :key="photo.id">
              <div class="preview-photo">
                <img
                  :src="photo.thumbnailUrl"
                  alt="Preview"
                  class="preview-photo__img"
                  loading="lazy"
                />
              </div>
            </NGridItem>
          </NGrid>
        </NCard>

        <!-- Right: Config sidebar (sticky) -->
        <NFlex vertical :size="16" class="preview-sidebar">
          <NCard title="Enlace de Preview" size="small">
            <NFlex vertical :size="16">
              <!-- Status -->
              <NFlex v-if="!createdLink" align="center" :size="8">
                <div class="status-dot status-dot--pending" />
                <span class="status-text">Enlace no generado aún</span>
              </NFlex>
              <NFlex v-else align="center" :size="8">
                <NIcon :component="CheckmarkCircle" :size="18" color="#18a058" />
                <span class="status-text status-text--success">Enlace generado</span>
              </NFlex>

              <!-- Expiration -->
              <div v-if="!createdLink">
                <p class="config-label">Expiración</p>
                <NFlex :size="8">
                  <NButton
                    v-for="opt in expirationOptions"
                    :key="opt.value"
                    :type="expiresInDays === opt.value ? 'primary' : 'default'"
                    size="small"
                    @click="expiresInDays = opt.value"
                  >
                    {{ opt.label }}
                  </NButton>
                </NFlex>
              </div>

              <!-- Generate button -->
              <NButton
                v-if="!createdLink"
                type="primary"
                block
                size="large"
                :loading="isCreating"
                :disabled="!eventId"
                @click="handleGenerate"
              >
                <template #icon><NIcon :component="LinkOutline" /></template>
                Generar Enlace Compartible
              </NButton>

              <!-- Result: link + actions -->
              <template v-if="createdLink">
                <div class="link-display">
                  <code class="link-url">{{ createdLink.previewUrl }}</code>
                </div>
                <p class="status-text" data-test="preview-expires-at">
                  Vence el {{ formatDateTime(createdLink.expiresAt) }}
                </p>
                <NFlex :size="8">
                  <NButton type="primary" block @click="handleCopyLink">
                    <template #icon><NIcon :component="CopyOutline" /></template>
                    Copiar Enlace
                  </NButton>
                </NFlex>
                <NButton block @click="handleWhatsAppClick">
                  <template #icon><NIcon :component="LogoWhatsapp" /></template>
                  Enviar por WhatsApp
                </NButton>
              </template>
            </NFlex>
          </NCard>

          <!-- Auto-applied settings info -->
          <div class="auto-settings">
            <NFlex :size="8" align="start">
              <NIcon :component="InformationCircleOutline" :size="18" color="#2080f0" />
              <div>
                <p class="auto-settings__title">Configuración automática</p>
                <ul class="auto-settings__list">
                  <li>Marca de agua en todas las fotos</li>
                  <li>Calidad reducida para preview</li>
                  <li>El cliente puede ver pero no descargar</li>
                </ul>
              </div>
            </NFlex>
          </div>
        </NFlex>
      </div>
    </div>

    <!-- WhatsApp phone modal -->
    <NModal
      v-model:show="showWhatsAppModal"
      preset="dialog"
      title="Enviar por WhatsApp"
      positive-text="Enviar"
      negative-text="Cancelar"
      @positive-click="handleWhatsAppSend"
    >
      <NFlex vertical :size="12" style="padding-top: 8px">
        <p>Ingresa el número de teléfono del ciclista (con código de país):</p>
        <NInput
          v-model:value="whatsAppPhone"
          placeholder="Ej. 593987654321"
          @keyup.enter="handleWhatsAppSend"
        />
      </NFlex>
    </NModal>
  </div>
</template>

<style scoped src="./preview-generation-view.css" />
