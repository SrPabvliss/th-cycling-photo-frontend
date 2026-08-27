<script setup lang="ts">
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { NButton, NFlex, NResult, NSpin } from 'naive-ui'

import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { useEventDetailQuery } from '@/shared/composables/use-event-detail'
import { useEventConfiguration } from '../../../../composables/queries/use-event-configuration'
import { useEventConfigurationPreset } from '../../../../composables/queries/use-event-configuration-preset'
import { useUpdateEventConfiguration } from '../../../../composables/mutations/use-update-event-configuration'
import { useConfigurationItems } from '../../../../composables/use-configuration-items'
import { EVENT_ROUTE_NAMES } from '../../../../routes'
import FrozenBlockedPanel from '../../../components/FrozenBlockedPanel/FrozenBlockedPanel.vue'
import BankTransferBody from '../../../components/EventConfigItems/BankTransferBody.vue'
import ConfigItemRow from '../../../components/EventConfigItems/ConfigItemRow.vue'
import PayphoneBody from '../../../components/EventConfigItems/PayphoneBody.vue'
import PublicNameBody from '../../../components/EventConfigItems/PublicNameBody.vue'
import WatermarkBody from '../../../components/EventConfigItems/WatermarkBody.vue'
import WhatsAppBody from '../../../components/EventConfigItems/WhatsAppBody.vue'

const props = defineProps<{
  slug: string
}>()

const router = useRouter()
const { has } = usePermissions()
const canUpdateEvent = computed(() => has(PERMISSIONS.EVENT_UPDATE))

const slug = computed(() => props.slug)

const { data: event, isPending: isLoadingEvent } = useEventDetailQuery(slug)
const eventId = computed(() => event.value?.id ?? '')

const { data: configuration, isPending: isLoadingConfiguration } = useEventConfiguration(eventId)
const { data: preset, isPending: isLoadingPreset } = useEventConfigurationPreset()

const {
  items,
  drafts,
  isComplete,
  canSave,
  readyCount,
  totalCount,
  toggle,
  setUseProfile,
  setSaveToProfile,
  setPayoutRemoved,
  patchDraft,
  toSelection,
  reseed,
} = useConfigurationItems(preset, configuration)

const isLoading = computed(
  () => isLoadingEvent.value || isLoadingConfiguration.value || isLoadingPreset.value,
)

const isBlocked = computed(() => event.value?.isFrozen || event.value?.status === 'archived')

const blockedMessage = computed(() =>
  event.value?.isFrozen
    ? 'Este evento está congelado, así que su configuración no se puede editar.'
    : 'Este evento está archivado, así que su configuración no se puede editar.',
)

const { mutateAsync: updateConfiguration, isPending: isSaving } =
  useUpdateEventConfiguration(eventId)

async function handleSave() {
  if (!configuration.value) return
  await updateConfiguration(toSelection())
  reseed()
}
</script>

<template>
  <div class="event-configuration-section">
    <NSpin v-if="isLoading" size="large" class="event-configuration-section__loading" />

    <NResult
      v-else-if="!canUpdateEvent"
      status="403"
      title="Sin permiso"
      description="No tienes permiso para editar la configuración de este evento."
    />

    <FrozenBlockedPanel v-else-if="isBlocked" :message="blockedMessage">
      <NButton type="primary" @click="router.push('/events/' + slug)">Volver al evento</NButton>
    </FrozenBlockedPanel>

    <NResult
      v-else-if="configuration && !configuration.isEditable"
      status="warning"
      title="Configuración no editable"
      description="Este evento ya no permite editar su configuración."
    />

    <template v-else-if="configuration && preset">
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
            :show-save-to-profile="false"
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
            :show-save-to-profile="false"
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
            :show-save-to-profile="false"
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
            :show-save-to-profile="false"
            :removable="item.isRemovable"
            :is-removed="item.isRemoved"
            :remove-disabled-reason="item.removeDisabledReason"
            :draft="drafts.payphone"
            @update:use-profile="setUseProfile('payphone', $event)"
            @update:save-to-profile="setSaveToProfile('payphone', $event)"
            @update:removed="setPayoutRemoved('payphone', $event)"
            @update:draft="patchDraft('payphone', $event)"
          />
          <BankTransferBody
            v-else
            :has-profile-value="item.hasProfileValue"
            :profile-label="item.profileLabel"
            :use-profile="item.useProfile"
            :save-to-profile="item.saveToProfile"
            :show-save-to-profile="false"
            :removable="item.isRemovable"
            :is-removed="item.isRemoved"
            :remove-disabled-reason="item.removeDisabledReason"
            :draft="drafts.bankTransfer"
            @update:use-profile="setUseProfile('bankTransfer', $event)"
            @update:save-to-profile="setSaveToProfile('bankTransfer', $event)"
            @update:removed="setPayoutRemoved('bankTransfer', $event)"
            @update:draft="patchDraft('bankTransfer', $event)"
          />
        </ConfigItemRow>
      </div>

      <div class="event-configuration-section__footer">
        <span class="ce-count" :class="{ ok: isComplete }" data-test="ready-count">
          {{ readyCount }}/{{ totalCount }}
        </span>
        <NFlex :size="10">
          <NButton @click="router.push({ name: EVENT_ROUTE_NAMES.DETAIL, params: { slug } })">
            Cancelar
          </NButton>
          <NButton type="primary" :disabled="!canSave" :loading="isSaving" @click="handleSave">
            Guardar cambios
          </NButton>
        </NFlex>
      </div>
    </template>
  </div>
</template>

<style scoped src="./event-configuration-section.css" />
