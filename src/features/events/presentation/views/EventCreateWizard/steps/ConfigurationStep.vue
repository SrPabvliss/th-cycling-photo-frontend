<script setup lang="ts">
import { watch } from 'vue'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { ShieldOutline } from '@vicons/ionicons5'

import { useEventConfigurationPreset } from '../../../../composables/queries/use-event-configuration-preset'
import { useConfigurationItems } from '../../../../composables/use-configuration-items'
import type { IEventConfigurationSelectionRequest } from '../../../../types/requests/event-configuration.request'
import BankTransferBody from '../../../components/EventConfigItems/BankTransferBody.vue'
import ConfigItemRow from '../../../components/EventConfigItems/ConfigItemRow.vue'
import PayphoneBody from '../../../components/EventConfigItems/PayphoneBody.vue'
import PublicNameBody from '../../../components/EventConfigItems/PublicNameBody.vue'
import WatermarkBody from '../../../components/EventConfigItems/WatermarkBody.vue'
import WhatsAppBody from '../../../components/EventConfigItems/WhatsAppBody.vue'

const emit = defineEmits<{
  'update:can-continue': [boolean]
  'update:selection': [IEventConfigurationSelectionRequest]
}>()

const { data: preset, isPending, isError, refetch } = useEventConfigurationPreset()

const configuration = useConfigurationItems(preset)
const {
  items,
  drafts,
  readyCount,
  isComplete,
  totalCount,
  toggle,
  setUseProfile,
  setSaveToProfile,
  patchDraft,
  toSelection,
} = configuration

watch(isComplete, (complete) => emit('update:can-continue', complete), { immediate: true })

watch(
  [items, drafts],
  () => {
    if (isComplete.value) emit('update:selection', toSelection())
  },
  { deep: true, immediate: true },
)

defineExpose(configuration)
</script>

<template>
  <div class="configuration-step">
    <NSpin v-if="isPending" size="large" class="configuration-step__loading" />

    <NResult
      v-else-if="isError"
      status="error"
      title="No pudimos cargar tu configuración"
      description="Intenta de nuevo en unos segundos."
    >
      <template #footer>
        <NButton @click="refetch()">Reintentar</NButton>
      </template>
    </NResult>

    <template v-else>
      <div class="ce-sechead">
        <div>
          <h2>Configuración del evento</h2>
          <p>
            Cinco datos que el comprador verá y usará para pagarte. Puedes reusar los de tu perfil o
            poner otros solo para este evento.
          </p>
        </div>
        <span class="ce-count" :class="{ ok: isComplete }" data-test="ready-count">
          {{ readyCount }}/{{ totalCount }}
        </span>
      </div>

      <p class="ce-frozen">
        <NIcon :component="ShieldOutline" :size="14" />
        Esta configuración se copia dentro del evento al crearlo. Cambiarla después en tu perfil no
        afecta a este evento.
      </p>

      <div class="ce-items">
        <ConfigItemRow
          v-for="item in items"
          :key="item.id"
          :label="item.label"
          :icon="item.icon"
          :state="item.state"
          :summary="item.summary"
          :open="item.isOpen"
          @toggle="toggle(item.id)"
        >
          <PublicNameBody
            v-if="item.id === 'publicName'"
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :draft="drafts.publicName"
            @update:use-profile="setUseProfile('publicName', $event)"
            @update:save-to-profile="setSaveToProfile('publicName', $event)"
            @update:draft="patchDraft('publicName', $event)"
          />
          <WatermarkBody
            v-else-if="item.id === 'watermark'"
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :draft="drafts.watermark"
            @update:use-profile="setUseProfile('watermark', $event)"
            @update:save-to-profile="setSaveToProfile('watermark', $event)"
            @update:draft="patchDraft('watermark', $event)"
          />
          <WhatsAppBody
            v-else-if="item.id === 'whatsapp'"
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :draft="drafts.whatsapp"
            @update:use-profile="setUseProfile('whatsapp', $event)"
            @update:save-to-profile="setSaveToProfile('whatsapp', $event)"
            @update:draft="patchDraft('whatsapp', $event)"
          />
          <PayphoneBody
            v-else-if="item.id === 'payphone'"
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :draft="drafts.payphone"
            @update:use-profile="setUseProfile('payphone', $event)"
            @update:save-to-profile="setSaveToProfile('payphone', $event)"
            @update:draft="patchDraft('payphone', $event)"
          />
          <BankTransferBody
            v-else
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :draft="drafts.bankTransfer"
            @update:use-profile="setUseProfile('bankTransfer', $event)"
            @update:save-to-profile="setSaveToProfile('bankTransfer', $event)"
            @update:draft="patchDraft('bankTransfer', $event)"
          />
        </ConfigItemRow>
      </div>
    </template>
  </div>
</template>

<style scoped src="./configuration-step.css" />
