<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { RouterLink } from 'vue-router'
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

import { useTenantProfile } from '@/features/tenant-profile/composables/queries/use-tenant-profile'
import { useEventConfigurationPreset } from '../../../composables/queries/use-event-configuration-preset'
import type { IEventConfigurationSelectionRequest } from '../../../types/requests/event-configuration.request'

const emit = defineEmits<{
  'update:configuration': [value: IEventConfigurationSelectionRequest]
  'update:ready': [ready: boolean]
}>()

const { data: preset, isPending } = useEventConfigurationPreset()

const isIncompleteProfile = computed(() => (preset.value?.missing.length ?? 0) > 0)
const incompleteProfileMessage = computed(() =>
  isIncompleteProfile.value
    ? 'Completa los datos de tu perfil de negocio para poder configurar el evento.'
    : '',
)

const publicName = ref('')
const watermarkStorageKey = ref('')
const whatsappNumber = ref('')
const selectedPayoutMethodIds = ref<string[]>([])

watch(
  preset,
  (value) => {
    if (!value) return
    publicName.value = value.publicName ?? ''
    watermarkStorageKey.value = value.watermarkStorageKey ?? ''
    whatsappNumber.value = value.whatsappNumber ?? ''
    selectedPayoutMethodIds.value = value.availablePayoutMethods
      .filter((method) => method.isActive)
      .map((method) => method.id)
  },
  { immediate: true },
)

const { data: tenantProfile } = useTenantProfile()
const profileWatermarkKey = computed(() => tenantProfile.value?.watermarkStorageKey ?? null)
const profileWatermarkUrl = computed(() => tenantProfile.value?.watermarkUrl ?? null)
const canApplyProfileWatermark = computed(
  () =>
    profileWatermarkKey.value !== null && profileWatermarkKey.value !== watermarkStorageKey.value,
)

function applyProfileWatermark() {
  if (profileWatermarkKey.value) watermarkStorageKey.value = profileWatermarkKey.value
}

const activePayoutMethods = computed(
  () => preset.value?.availablePayoutMethods.filter((method) => method.isActive) ?? [],
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

const configuration = computed<IEventConfigurationSelectionRequest>(() => ({
  publicName: publicName.value.trim() === '' ? null : publicName.value.trim(),
  watermarkStorageKey:
    watermarkStorageKey.value.trim() === '' ? null : watermarkStorageKey.value.trim(),
  whatsappNumber: whatsappNumber.value.trim() === '' ? null : whatsappNumber.value.trim(),
  payoutMethodIds: selectedPayoutMethodIds.value,
}))

watch(configuration, (value) => emit('update:configuration', value), { immediate: true })

watch(
  [isPending, isIncompleteProfile],
  ([pending, incomplete]) => emit('update:ready', !pending && !incomplete),
  { immediate: true },
)
</script>

<template>
  <div class="configuration-step">
    <NSpin
      v-if="isPending"
      size="large"
      style="display: flex; justify-content: center; padding: 40px"
    />

    <NResult
      v-else-if="isIncompleteProfile"
      status="warning"
      title="Tu perfil de organizador está incompleto"
      :description="incompleteProfileMessage ?? 'Completa tu perfil antes de crear un evento.'"
    >
      <template #footer>
        <RouterLink to="/mi-perfil">
          <NButton type="primary">Ir a mi perfil</NButton>
        </RouterLink>
      </template>
    </NResult>

    <NFlex v-else vertical :size="16">
      <NAlert type="info" :show-icon="true">
        Esta configuración se copia al evento. Los cambios que haga después en su perfil no
        afectarán a este evento.
      </NAlert>

      <NFormItem label="Nombre público">
        <NInput v-model:value="publicName" placeholder="Nombre público del organizador" />
      </NFormItem>

      <NFormItem label="Marca de agua">
        <div class="watermark-field">
          <NInput v-model:value="watermarkStorageKey" readonly placeholder="Sin marca de agua" />
          <img
            v-if="profileWatermarkUrl"
            :src="profileWatermarkUrl"
            alt="Marca de agua actual de tu perfil"
            class="watermark-field__preview"
          />
          <p v-else class="watermark-field__hint">
            Aún no has subido una marca de agua en tu perfil.
          </p>
          <NButton :disabled="!canApplyProfileWatermark" @click="applyProfileWatermark">
            Usar mi marca de agua actual
          </NButton>
        </div>
      </NFormItem>

      <NFormItem label="WhatsApp de contacto">
        <NInput v-model:value="whatsappNumber" placeholder="Número de WhatsApp" />
      </NFormItem>

      <div>
        <p class="configuration-step__label">Métodos de cobro</p>
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
            <span v-if="method.provider === 'payphone'"> · {{ method.receiverIdentifier }}</span>
            <span v-else> · {{ method.bankName }} · {{ method.accountNumber }}</span>
          </NCheckbox>
        </NFlex>
      </div>
    </NFlex>
  </div>
</template>

<style scoped src="./event-configuration-step.css" />
