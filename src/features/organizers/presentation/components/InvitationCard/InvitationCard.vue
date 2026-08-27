<script setup lang="ts">
import { computed } from 'vue'
import { NIcon } from 'naive-ui'
import { differenceInCalendarDays } from 'date-fns'
import {
  AlertCircle,
  BanOutline,
  CheckmarkCircle,
  DocumentOutline,
  RefreshOutline,
  SendOutline,
} from '@vicons/ionicons5'

import { formatDate, formatRelativeTime, parseDateOnly } from '@/shared/utils/date.utils'
import type { IInvitationCard } from '../../../types/responses/organizer-list.response'

const props = defineProps<{
  invitation: IInvitationCard
  canIssue?: boolean
  canRevoke?: boolean
}>()

const emit = defineEmits<{
  resend: [invitation: IInvitationCard]
  revoke: [invitation: IInvitationCard]
  reissue: [invitation: IInvitationCard]
}>()

const allowIssue = computed(() => props.canIssue !== false)
const allowRevoke = computed(() => props.canRevoke !== false)
const daysSinceIssued = computed(() =>
  Math.max(0, differenceInCalendarDays(new Date(), props.invitation.issuedAt)),
)

const isRenewal = computed(
  () =>
    props.invitation.renewalOfOrganizerId !== null &&
    props.invitation.renewalOfOrganizerName !== null,
)

const photosPerEventLabel = computed(() =>
  props.invitation.photosPerEvent == null
    ? 'Sin límite'
    : props.invitation.photosPerEvent.toLocaleString('de-DE'),
)

const validUntilLabel = computed(() => formatDate(parseDateOnly(props.invitation.validUntil)))

const issuedRelative = computed(() => formatRelativeTime(props.invitation.issuedAt))

function handleResend() {
  emit('resend', props.invitation)
}

function handleRevoke() {
  emit('revoke', props.invitation)
}

function handleReissue() {
  emit('reissue', props.invitation)
}
</script>

<template>
  <article class="ic-card" :class="{ 'ic-card--off': invitation.state === 'revoked' }">
    <div class="ic-card__top">
      <div class="ic-id">
        <span class="ic-ava"><NIcon :component="DocumentOutline" :size="18" /></span>
        <div class="ic-id__txt">
          <div class="ic-id__name">
            <span class="ic-noname">{{ invitation.holderName }}</span>
            <i class="ic-propuesto">nombre propuesto</i>
          </div>
          <div class="ic-id__holder">
            <span class="ic-ellip">{{ invitation.holderName }}</span>
            <i>·</i>
            <span
              class="ic-mailbit"
              :class="{ 'ic-mailbit--warn': !invitation.holderEmailVerified }"
            >
              <NIcon
                :component="invitation.holderEmailVerified ? CheckmarkCircle : AlertCircle"
                :size="12"
              />
              <span class="ic-ellip">{{ invitation.holderEmail }}</span>
            </span>
          </div>
        </div>
      </div>
      <span v-if="invitation.state === 'revoked'" class="ic-tag ic-tag--rev">
        <NIcon :component="BanOutline" :size="12" />Revocada
      </span>
      <span v-else-if="invitation.state === 'expired'" class="ic-tag ic-tag--exp"
        >Invitación vencida</span
      >
      <span v-else class="ic-tag ic-tag--pend">
        <NIcon :component="SendOutline" :size="12" />Pendiente · {{ daysSinceIssued }}
        {{ daysSinceIssued === 1 ? 'día' : 'días' }}
      </span>
    </div>

    <div v-if="isRenewal" class="ic-renewal">
      Renovación · {{ invitation.renewalOfOrganizerName }}
    </div>

    <div class="ic-name">{{ invitation.commercialName }}</div>

    <div class="ic-offer">
      <div>
        <span>Eventos</span>
        <b>{{ invitation.eventsTotal }}</b>
      </div>
      <div>
        <span>Fotos por evento</span>
        <b>{{ photosPerEventLabel }}</b>
      </div>
      <div>
        <span>{{ invitation.state === 'expired' ? 'Venció' : 'Vence' }}</span>
        <b :class="{ 'ic-tone--red': invitation.state === 'expired' }">{{ validUntilLabel }}</b>
      </div>
    </div>

    <div class="ic-foot">
      <span class="ic-issued">
        <NIcon :component="SendOutline" :size="13" />
        Emitida {{ issuedRelative
        }}<template v-if="invitation.issuedByName"> por {{ invitation.issuedByName }}</template>
      </span>
      <div class="ic-acts">
        <template v-if="invitation.state === 'pending'">
          <button v-if="allowIssue" type="button" class="ic-ghost" @click="handleResend">
            <NIcon :component="RefreshOutline" :size="12" />Reenviar
          </button>
          <button
            v-if="allowRevoke"
            type="button"
            class="ic-ghost ic-ghost--danger"
            @click="handleRevoke"
          >
            Revocar
          </button>
          <span v-if="!allowIssue && !allowRevoke" class="ic-noact">Sin acciones</span>
        </template>
        <button
          v-else-if="invitation.state === 'expired' && allowIssue"
          type="button"
          class="ic-solid"
          @click="handleReissue"
        >
          Emitir de nuevo
        </button>
        <span v-else class="ic-noact">Sin acciones</span>
      </div>
    </div>
  </article>
</template>

<style scoped src="./invitation-card.css" />
