<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NIcon, NModal } from 'naive-ui'
import { WarningOutline } from '@vicons/ionicons5'

import { formatDate, parseDateOnly } from '@/shared/utils/date.utils'
import { useResendContract } from '../../composables/mutations/use-resend-contract'
import type { IInvitationCard } from '../../types/responses/organizer-list.response'
import type { IContractIssued } from '../../types/responses/contract-issued.response'
import { formatNumber } from '@/shared/utils/format.utils'

const props = withDefaults(
  defineProps<{
    show?: boolean
    invitation: IInvitationCard
  }>(),
  { show: true },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
  resent: [result: IContractIssued]
}>()

const { mutate, isPending } = useResendContract()

const offerLabel = computed(() => {
  const per =
    props.invitation.photosPerEvent == null
      ? 'Sin límite'
      : formatNumber(props.invitation.photosPerEvent)
  return `${props.invitation.eventsTotal} eventos · ${per} fotos por evento`
})

const validUntilLabel = computed(() => formatDate(parseDateOnly(props.invitation.validUntil)))

function submit() {
  mutate(props.invitation.id, {
    onSuccess: (result) => {
      emit('resent', { id: props.invitation.id, url: result.url })
      emit('update:show', false)
    },
  })
}
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v: boolean) => emit('update:show', v)"
    preset="card"
    title="Reenviar invitación"
    style="width: 460px"
  >
    <template #header-extra>{{ invitation.commercialName }} · {{ invitation.holderName }}</template>

    <div class="rcm-body">
      <div class="rcm-notice">
        <NIcon :component="WarningOutline" :size="16" />
        <div>
          <b>Se generará un enlace nuevo y el anterior quedará inservible.</b>
          <span>Si el titular ya tenía el enlace, tendrá que usar el nuevo para aceptar.</span>
        </div>
      </div>

      <div
        v-if="!invitation.holderEmailVerified"
        class="rcm-notice rcm-notice--red"
        data-test="unverified-warning"
      >
        <NIcon :component="WarningOutline" :size="16" />
        <div>
          <b>El titular no ha verificado su correo.</b>
          <span
            >No podrá aceptar el contrato aunque reenvíes el enlace, hasta que lo verifique.</span
          >
        </div>
      </div>

      <dl class="rcm-dl">
        <div>
          <dt>Se envía a</dt>
          <dd>{{ invitation.holderEmail }}</dd>
        </div>
        <div>
          <dt>Oferta</dt>
          <dd>{{ offerLabel }}</dd>
        </div>
        <div>
          <dt>Vence</dt>
          <dd>{{ validUntilLabel }} <span class="rcm-sub">(no cambia)</span></dd>
        </div>
      </dl>
    </div>

    <template #footer>
      <div class="rcm-footer">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" :loading="isPending" data-test="confirm-resend" @click="submit">
          Reenviar y anular el anterior
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./resend-confirm-modal.css" />
