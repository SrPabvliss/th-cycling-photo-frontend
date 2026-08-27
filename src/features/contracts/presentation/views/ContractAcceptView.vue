<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isAxiosError } from 'axios'
import { NAlert, NButton, NCard, NCheckbox, NResult, NSpin } from 'naive-ui'

import PageHeader from '@/shared/components/PageHeader.vue'
import { message } from '@/core/ui/discrete-api'
import { formatDate } from '@/shared/utils/date.utils'
import { ACCOUNT_ROUTE_NAMES } from '@/features/account/routes'
import { EVENTS_PATH } from '@/features/events/routes'
import { LEGAL_PATHS } from '@/features/legal/routes'
import { useContractByToken } from '../../composables/queries/use-contract-by-token'
import { useAcceptContract } from '../../composables/mutations/use-accept-contract'
import { pluralize } from '@/shared/utils/format.utils'

const BLOCKED_MESSAGES: Record<string, string> = {
  'contract.not_yours':
    'Este contrato es para otra cuenta. Inicia sesión con la cuenta a la que se lo enviamos.',
  'contract.email_not_verified': 'Antes de aceptar necesitamos que verifiques tu correo.',
  'contract.revoked': 'Este contrato fue cancelado.',
  'contract.already_accepted': 'Ya aceptaste este contrato.',
}

const route = useRoute()
const router = useRouter()
const token = computed(() => route.params.token as string)

const { data: offer, isPending, isError, refetch } = useContractByToken(token)
const { mutate: acceptContract, isPending: isAccepting } = useAcceptContract()

const hasAccepted = ref(false)

function eventsLabel(eventsTotal: number): string {
  return `${eventsTotal} ${pluralize(eventsTotal, 'evento', 'eventos')}`
}

function photosLabel(eventsTotal: number, photosPerEvent: number | null): string {
  if (photosPerEvent == null) return 'Sin límite de fotos por evento'
  const suffix = eventsTotal === 1 ? 'en ese evento' : 'por evento'
  return `hasta ${photosPerEvent} fotos ${suffix}`
}

function blockedMessage(reason: string): string {
  if (reason === 'contract.expired') {
    const validUntil = offer.value?.validUntil
    const dateLabel = validUntil ? formatDate(validUntil) : ''
    return `Este contrato venció el ${dateLabel}. Escríbenos para emitir uno nuevo.`
  }
  return BLOCKED_MESSAGES[reason] ?? 'Este contrato no está disponible.'
}

function readErrorMessage(caught: unknown, fallback: string): string {
  if (!isAxiosError(caught)) return fallback
  return caught.response?.data?.error?.message ?? fallback
}

function goToVerifyEmail() {
  router.push({ name: ACCOUNT_ROUTE_NAMES.VERIFY_EMAIL })
}

function handleAccept() {
  acceptContract(token.value, {
    onSuccess: () => {
      router.push(EVENTS_PATH)
    },
    onError: (caught) => {
      message.error(readErrorMessage(caught, 'No pudimos registrar tu aceptación.'))
    },
  })
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content contract-accept-content">
      <PageHeader title="Contrato de servicio" subtitle="Revisa las condiciones antes de aceptar" />

      <div v-if="isPending" class="contract-accept-loading">
        <NSpin size="large" />
      </div>

      <NResult
        v-else-if="isError"
        status="error"
        title="Error al cargar el contrato"
        description="No pudimos obtener este contrato."
      >
        <template #footer>
          <NButton @click="refetch()">Reintentar</NButton>
        </template>
      </NResult>

      <template v-else-if="offer">
        <NCard v-if="offer.blockedReason" title="Este contrato no se puede aceptar">
          <NAlert type="warning" :show-icon="true">
            {{ blockedMessage(offer.blockedReason) }}
          </NAlert>

          <div class="contract-accept-blocked__actions">
            <NButton
              v-if="offer.blockedReason === 'contract.email_not_verified'"
              type="primary"
              @click="goToVerifyEmail"
            >
              Verificar mi correo
            </NButton>
            <RouterLink
              v-else-if="offer.blockedReason === 'contract.already_accepted'"
              :to="EVENTS_PATH"
            >
              <NButton type="primary">Ir al panel</NButton>
            </RouterLink>
          </div>
        </NCard>

        <NCard v-else :title="offer.commercialName ?? 'Contrato de servicio'">
          <p class="contract-accept-card__subtitle">
            Estas son las condiciones del contrato de servicio que te ofrecemos.
          </p>

          <div class="contract-accept-facts">
            <div class="contract-accept-fact">
              <span class="contract-accept-fact__label">Nombre comercial</span>
              <span class="contract-accept-fact__value">{{ offer.commercialName }}</span>
            </div>
            <div class="contract-accept-fact">
              <span class="contract-accept-fact__label">Eventos incluidos</span>
              <span class="contract-accept-fact__value">
                {{ eventsLabel(offer.eventsTotal ?? 0) }}
              </span>
            </div>
            <div class="contract-accept-fact">
              <span class="contract-accept-fact__label">Fotos por evento</span>
              <span class="contract-accept-fact__value">
                {{ photosLabel(offer.eventsTotal ?? 0, offer.photosPerEvent) }}
              </span>
            </div>
            <div class="contract-accept-fact">
              <span class="contract-accept-fact__label">Vigente hasta</span>
              <span class="contract-accept-fact__value">
                {{ offer.validUntil ? formatDate(offer.validUntil) : '—' }}
              </span>
            </div>
            <div class="contract-accept-fact">
              <span class="contract-accept-fact__label">Términos del Organizador</span>
              <span class="contract-accept-fact__value">Versión {{ offer.termsVersion }}</span>
            </div>
          </div>

          <NCheckbox v-model:checked="hasAccepted" class="contract-accept-consent">
            He leído y acepto los
            <RouterLink :to="LEGAL_PATHS.TENANT_TERMS" target="_blank">
              Términos del Organizador
            </RouterLink>
          </NCheckbox>

          <div class="contract-accept-actions">
            <NButton
              type="primary"
              size="large"
              :disabled="!hasAccepted"
              :loading="isAccepting"
              @click="handleAccept"
            >
              Aceptar contrato
            </NButton>
          </div>
        </NCard>
      </template>
    </div>
  </div>
</template>

<style scoped src="./contract-accept-view.css" />
