<script setup lang="ts">
import { computed, ref } from 'vue'
import { NAlert, NButton, NCheckbox, NModal } from 'naive-ui'

import { LEGAL_PATHS } from '@/features/legal/routes'
import { useRecordConsentsMutation } from '../../../composables/mutations/use-record-consents'
import { CONSENT_TYPE } from '../../../constants/consent.constants'
import { useSessionStore } from '@/core/auth/stores/session.store'
import ModalCloseButton from '@/shared/components/ModalCloseButton/ModalCloseButton.vue'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'

const authStore = useSessionStore()
// Silent: a failure is said inside the modal, which stays open to try again.
const { mutateAsync: recordConsents, isPending } = useRecordConsentsMutation({ silent: true })

const dismissed = ref(false)
const accepted = ref(false)
const problem = ref<IFormProblem | null>(null)

const isVisible = computed(
  () =>
    !dismissed.value &&
    (authStore.currentUser?.pendingConsents ?? []).includes(CONSENT_TYPE.TERMS_PRIVACY),
)

async function confirm() {
  problem.value = null
  try {
    await recordConsents([CONSENT_TYPE.TERMS_PRIVACY])
    accepted.value = false
  } catch (error) {
    problem.value = generalProblem(error)
  }
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
    :closable="false"
    :mask-closable="false"
    @close="dismiss"
  >
    <template #header-extra>
      <ModalCloseButton @close="dismiss" />
    </template>

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

    <!-- Naive's alert takes the theme of the area it opens on: client or panel. -->
    <NAlert
      v-if="problem"
      type="error"
      class="consent-modal__problem"
      data-test="consent-problem"
      role="alert"
      :title="problem.title"
    >
      {{ problem.text }}
    </NAlert>

    <template #footer>
      <div class="consent-modal__actions">
        <NButton quaternary :disabled="isPending" @click="dismiss">Más tarde</NButton>
        <NButton type="primary" :disabled="!accepted" :loading="isPending" @click="confirm">
          {{ problem ? 'Reintentar' : 'Aceptar' }}
        </NButton>
      </div>
    </template>
  </NModal>
</template>

<style src="./consent-reaccept-modal.css" />
