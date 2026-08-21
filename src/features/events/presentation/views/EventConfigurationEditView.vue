<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import {
  NAlert,
  NButton,
  NCheckbox,
  NEmpty,
  NFlex,
  NFormItem,
  NInput,
  NResult,
  NSpin,
} from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useEventDetailQuery } from '../../composables/queries/use-event-detail'
import { useEventConfiguration } from '../../composables/queries/use-event-configuration'
import { useUpdateEventConfiguration } from '../../composables/mutations/use-update-event-configuration'
import { EVENT_ROUTE_NAMES } from '../../routes'

const route = useRoute()
const router = useRouter()
const { has } = usePermissions()
const canUpdateEvent = computed(() => has(PERMISSIONS.EVENT_UPDATE))

const slug = computed(() => route.params.slug as string)

const { data: event, isPending: isLoadingEvent } = useEventDetailQuery(slug)
const eventId = computed(() => event.value?.id ?? '')

const { data: configuration, isPending: isLoadingConfiguration } = useEventConfiguration(eventId)

const publicName = ref('')
const watermarkStorageKey = ref('')
const whatsappNumber = ref('')
const selectedPayoutMethodIds = ref<string[]>([])

watch(
  configuration,
  (value) => {
    if (!value) return
    publicName.value = value.publicName ?? ''
    watermarkStorageKey.value = value.watermarkStorageKey ?? ''
    whatsappNumber.value = value.whatsappNumber ?? ''
    selectedPayoutMethodIds.value = value.payoutMethods
      .filter((method) => method.isActive)
      .map((method) => method.id)
  },
  { immediate: true },
)

const PROVIDER_LABELS: Record<string, string> = {
  payphone: 'Payphone',
  bank_transfer: 'Transferencia bancaria',
}

function togglePayoutMethod(id: string, checked: boolean) {
  selectedPayoutMethodIds.value = checked
    ? [...selectedPayoutMethodIds.value, id]
    : selectedPayoutMethodIds.value.filter((methodId) => methodId !== id)
}

const activePayoutMethods = computed(
  () => configuration.value?.payoutMethods.filter((method) => method.isActive) ?? [],
)

const { mutateAsync: updateConfiguration, isPending: isSaving } = useUpdateEventConfiguration(
  eventId.value,
)

async function handleSave() {
  await updateConfiguration({
    publicName: publicName.value.trim() === '' ? null : publicName.value.trim(),
    watermarkStorageKey:
      watermarkStorageKey.value.trim() === '' ? null : watermarkStorageKey.value.trim(),
    whatsappNumber: whatsappNumber.value.trim() === '' ? null : whatsappNumber.value.trim(),
    payoutMethodIds: selectedPayoutMethodIds.value,
  })
  router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug: slug.value } })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content event-form-view">
      <div class="event-form-container">
        <PageHeader title="Configuración del Evento" :back-to="'/events/' + slug" />

        <NSpin
          v-if="isLoadingEvent || isLoadingConfiguration"
          size="large"
          style="display: flex; justify-content: center; padding: 40px"
        />

        <NResult
          v-else-if="!canUpdateEvent"
          status="403"
          title="Sin permiso"
          description="No tienes permiso para editar la configuración de este evento."
        />

        <NResult
          v-else-if="configuration && !configuration.isEditable"
          status="warning"
          title="Configuración no editable"
          description="Este evento ya no permite editar su configuración."
        />

        <NFlex v-else-if="configuration" vertical :size="16">
          <NAlert type="info" :show-icon="true">
            Esta configuración se copia al evento. Los cambios que haga después en su perfil no
            afectarán a este evento.
          </NAlert>

          <NFormItem label="Nombre público">
            <NInput v-model:value="publicName" placeholder="Nombre público del organizador" />
          </NFormItem>

          <NFormItem label="Marca de agua">
            <NInput
              v-model:value="watermarkStorageKey"
              placeholder="Clave de almacenamiento de la marca de agua"
            />
          </NFormItem>

          <NFormItem label="WhatsApp de contacto">
            <NInput v-model:value="whatsappNumber" placeholder="Número de WhatsApp" />
          </NFormItem>

          <div>
            <p class="configuration-edit__label">Métodos de cobro</p>
            <NEmpty
              v-if="activePayoutMethods.length === 0"
              description="No tienes métodos de cobro activos"
            />
            <NFlex v-else vertical :size="8">
              <NCheckbox
                v-for="method in activePayoutMethods"
                :key="method.id"
                :checked="selectedPayoutMethodIds.includes(method.id)"
                @update:checked="(checked: boolean) => togglePayoutMethod(method.id, checked)"
              >
                {{ PROVIDER_LABELS[method.provider] ?? method.provider }}
                <span v-if="method.provider === 'payphone'">
                  · {{ method.receiverIdentifier }}
                </span>
                <span v-else> · {{ method.bankName }} · {{ method.accountNumber }}</span>
              </NCheckbox>
            </NFlex>
          </div>

          <div class="event-form-container__footer">
            <NFlex :size="10">
              <NButton @click="router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug } })">
                Cancelar
              </NButton>
              <NButton type="primary" :loading="isSaving" @click="handleSave">
                Guardar cambios
              </NButton>
            </NFlex>
          </div>
        </NFlex>
      </div>
    </div>
  </div>
</template>

<style scoped src="./event-form-view.css"></style>

<style scoped>
.configuration-edit__label {
  font-size: 14px;
  font-weight: 500;
  margin-bottom: 8px;
}
</style>
