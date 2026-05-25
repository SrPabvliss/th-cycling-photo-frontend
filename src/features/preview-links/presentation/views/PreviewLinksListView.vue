<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute } from 'vue-router'
import {
  NButton,
  NCard,
  NDataTable,
  NEmpty,
  NFlex,
  NIcon,
  NInput,
  NModal,
  NPagination,
  NResult,
  NTag,
  useMessage,
} from 'naive-ui'
import { CopyOutline, LogoWhatsapp } from '@vicons/ionicons5'
import type { DataTableColumns } from 'naive-ui'

import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { env } from '@/core/config/env'
import PageHeader from '@/shared/components/PageHeader.vue'
import { formatDate, formatRelativeTime } from '@/shared/utils/date.utils'
import { usePreviewLinksListQuery } from '../../composables/queries/use-preview-links-list'
import { openWhatsApp } from '@/shared/utils/whatsapp.utils'
import type {
  IPreviewLinkListItem,
  PreviewLinkStatus,
} from '../../types/responses/preview-link-list-item.response'

const route = useRoute()
const message = useMessage()

const eventId = computed(() => route.params.eventId as string)
const page = ref(1)

const { data: event } = useEventDetailQuery(eventId)
const {
  data: previewLinksData,
  isPending,
  isError,
  refetch,
} = usePreviewLinksListQuery(eventId, page)

const showWhatsAppModal = ref(false)
const whatsAppPhone = ref('')
const selectedLinkUrl = ref('')

const STATUS_CONFIG: Record<
  PreviewLinkStatus,
  { label: string; type: 'success' | 'warning' | 'info' }
> = {
  active: { label: 'Activo', type: 'success' },
  expired: { label: 'Expirado', type: 'warning' },
  converted: { label: 'Convertido', type: 'info' },
}

const columns: DataTableColumns<IPreviewLinkListItem> = [
  {
    title: 'Creado',
    key: 'createdAt',
    render: (row) => formatRelativeTime(row.createdAt),
    width: 150,
  },
  {
    title: 'Fotos',
    key: 'photoCount',
    width: 80,
    align: 'center',
  },
  {
    title: 'Estado',
    key: 'status',
    width: 120,
    render: (row) => {
      const config = STATUS_CONFIG[row.status]
      return h(NTag, { type: config.type, size: 'small', round: true }, () => config.label)
    },
  },
  {
    title: 'Visto',
    key: 'viewedAt',
    width: 100,
    render: (row) => (row.viewedAt ? 'Sí' : 'No'),
  },
  {
    title: 'Pedidos',
    key: 'orderCount',
    width: 80,
    align: 'center',
  },
  {
    title: 'Expira',
    key: 'expiresAt',
    width: 150,
    render: (row) => formatDate(row.expiresAt),
  },
  {
    title: 'Acciones',
    key: 'actions',
    width: 180,
    render: (row) => {
      return h(NFlex, { size: 4 }, () => [
        h(
          NButton,
          {
            size: 'small',
            onClick: () => copyLink(row.token),
          },
          { icon: () => h(NIcon, { component: CopyOutline }), default: () => 'Copiar' },
        ),
        h(
          NButton,
          {
            size: 'small',
            onClick: () => {
              selectedLinkUrl.value = buildPreviewUrl(row.token)
              showWhatsAppModal.value = true
            },
          },
          { icon: () => h(NIcon, { component: LogoWhatsapp }) },
        ),
      ])
    },
  },
]

function buildPreviewUrl(token: string): string {
  return `${env.VITE_APP_BASE_URL}/preview/${token}`
}

async function copyLink(token: string) {
  try {
    await navigator.clipboard.writeText(buildPreviewUrl(token))
    message.success('Enlace copiado')
  } catch {
    message.error('No se pudo copiar')
  }
}

function handleWhatsAppSend() {
  if (!whatsAppPhone.value.trim() || !selectedLinkUrl.value) return
  const msg = `¡Hola! Revisa las fotos del evento "${event.value?.name ?? ''}": ${selectedLinkUrl.value}`
  openWhatsApp(whatsAppPhone.value.trim(), msg)
  showWhatsAppModal.value = false
  whatsAppPhone.value = ''
}
</script>

<script lang="ts">
import { h } from 'vue'
</script>

<template>
  <div class="page-view">
    <div class="page-view__content" style="padding: 24px 32px">
      <PageHeader title="Preview Links" :back-to="'/events/' + eventId" />
      <div v-if="isError" class="error-container">
        <NResult
          status="error"
          title="Error al cargar preview links"
          description="No se pudieron obtener los preview links."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>
      </div>

      <template v-else>
        <NCard>
          <NDataTable
            :columns="columns"
            :data="previewLinksData?.items ?? []"
            :loading="isPending"
            :bordered="false"
          />

          <template v-if="previewLinksData && previewLinksData.items.length === 0 && !isPending">
            <NEmpty description="No hay preview links para este evento" style="padding: 48px 0" />
          </template>
        </NCard>

        <NFlex
          v-if="(previewLinksData?.pagination?.totalPages ?? 0) > 1"
          justify="end"
          style="margin-top: 16px"
        >
          <NPagination
            :page="page"
            :page-count="previewLinksData?.pagination?.totalPages ?? 0"
            @update:page="(p: number) => (page = p)"
          />
        </NFlex>
      </template>
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
        <p>Ingresa el número de teléfono (con código de país):</p>
        <NInput
          v-model:value="whatsAppPhone"
          placeholder="Ej. 593987654321"
          @keyup.enter="handleWhatsAppSend"
        />
      </NFlex>
    </NModal>
  </div>
</template>

<style scoped>
.error-container {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
