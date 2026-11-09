<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, NCheckbox, NModal } from 'naive-ui'

import { LEGAL_PATHS } from '@/features/legal/routes'
import { useRecordConsentsMutation } from '../../../composables/mutations/use-record-consents'
import { CONSENT_TYPE } from '../../../constants/consent.constants'
import { useSessionStore } from '@/core/auth/stores/session.store'

const authStore = useSessionStore()
const { mutateAsync: recordConsents, isPending } = useRecordConsentsMutation()

const dismissed = ref(false)
const accepted = ref(false)

const isVisible = computed(
  () =>
    !dismissed.value &&
    (authStore.currentUser?.pendingConsents ?? []).includes(CONSENT_TYPE.TERMS_PRIVACY),
)

async function confirm() {
  await recordConsents([CONSENT_TYPE.TERMS_PRIVACY])
  accepted.value = false
}

function dismiss() {
  dismissed.value = true
}
</script>

<template>
  <NModal
    :show="isVisible"
    preset="card"
    title="Actualizamos nuestras políticas"
    class="consent-modal"
    style="width: 460px; max-width: calc(100vw - 32px)"
    :closable="true"
    :mask-closable="false"
    @close="dismiss"
  >
    <p class="consent-modal__text">
      Publicamos nuestra Política de Privacidad y nuestros Términos y Condiciones. Ahí explicamos
      qué datos tratamos, con quién los compartimos y cómo usamos WhatsApp para gestionar tus
      pedidos.
    </p>

    <p class="consent-modal__links">
      <RouterLink :to="LEGAL_PATHS.PRIVACY" target="_blank">Política de Privacidad</RouterLink>
      <RouterLink :to="LEGAL_PATHS.TERMS" target="_blank">Términos y Condiciones</RouterLink>
    </p>

    <NCheckbox v-model:checked="accepted" class="consent-modal__checkbox">
      He leído y acepto ambos documentos, incluido el envío de mensajes por WhatsApp sobre mis
      pedidos.
    </NCheckbox>

    <template #footer>
      <div class="consent-modal__actions">
        <NButton quaternary :disabled="isPending" @click="dismiss">Más tarde</NButton>
        <NButton type="primary" :disabled="!accepted" :loading="isPending" @click="confirm">
          Aceptar
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style src="./consent-reaccept-modal.css" />
