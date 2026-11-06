<script setup lang="ts">
import { computed, reactive, ref, watch } from 'vue'
import { isAxiosError } from 'axios'
import {
  NButton,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NRadio,
  NRadioGroup,
  useMessage,
} from 'naive-ui'

import {
  CONTACT_REQUEST_REASON_LABELS,
  contactRequestFormSchema,
} from '../../constants/contact-request-form.schema'
import { useSendContactRequest } from '../../composables/mutations/use-send-contact-request'
import {
  CONTACT_REQUEST_REASONS,
  type ContactRequestReason,
} from '../../types/requests/contact-request.request'

const props = withDefaults(
  defineProps<{
    show: boolean
    initialReason?: ContactRequestReason
  }>(),
  { initialReason: 'more_quota' },
)

const emit = defineEmits<{
  'update:show': [boolean]
  sent: []
}>()

const message = useMessage()
const { mutate: sendContactRequest, isPending } = useSendContactRequest()

const form = reactive<{
  reason: ContactRequestReason
  eventsWanted: number | null
  message: string
}>({ reason: props.initialReason, eventsWanted: null, message: '' })
const errors = ref<Partial<Record<'reason' | 'eventsWanted' | 'message', string>>>({})

const reasonOptions = CONTACT_REQUEST_REASONS.map((value) => ({
  value,
  label: CONTACT_REQUEST_REASON_LABELS[value],
}))
const asksForEvents = computed(() => form.reason === 'more_quota')

watch(
  () => props.show,
  (isOpen) => {
    if (!isOpen) return
    form.reason = props.initialReason
    form.eventsWanted = null
    form.message = ''
    errors.value = {}
  },
)

function readErrorMessage(caught: unknown): string {
  if (isAxiosError(caught) && caught.response?.status === 429) {
    return 'Ya enviaste varios mensajes. Intenta de nuevo en un rato.'
  }
  if (isAxiosError(caught)) {
    return (
      caught.response?.data?.error?.message ?? 'No pudimos enviar tu mensaje. Intenta de nuevo.'
    )
  }
  return 'No pudimos enviar tu mensaje. Intenta de nuevo.'
}

function submit() {
  const parsed = contactRequestFormSchema.safeParse({
    reason: form.reason,
    eventsWanted: asksForEvents.value ? form.eventsWanted : null,
    message: form.message,
  })
  if (!parsed.success) {
    errors.value = Object.fromEntries(
      parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message]),
    )
    return
  }
  errors.value = {}

  sendContactRequest(
    {
      reason: parsed.data.reason,
      eventsWanted: parsed.data.eventsWanted ?? undefined,
      message: parsed.data.message,
    },
    {
      onSuccess: () => {
        message.success('Mensaje enviado. Titan TV te responderá a tu correo.')
        emit('sent')
        emit('update:show', false)
      },
      onError: (caught) => message.error(readErrorMessage(caught)),
    },
  )
}
</script>

<template>
  <NModal
    :show="show"
    preset="card"
    title="Escribir a Titan TV"
    style="width: 480px; max-width: calc(100vw - 32px)"
    data-test="contact-titan-modal"
    @update:show="emit('update:show', $event)"
  >
    <form class="contact-titan" @submit.prevent="submit">
      <NFormItem
        label="Motivo"
        :validation-status="errors.reason ? 'error' : undefined"
        :feedback="errors.reason"
      >
        <NRadioGroup v-model:value="form.reason" name="contact-reason">
          <div class="contact-titan__reasons">
            <NRadio
              v-for="option in reasonOptions"
              :key="option.value"
              :value="option.value"
              :data-test="`contact-reason-${option.value}`"
            >
              {{ option.label }}
            </NRadio>
          </div>
        </NRadioGroup>
      </NFormItem>

      <NFormItem
        v-if="asksForEvents"
        label="¿Cuántos eventos más necesitas?"
        :validation-status="errors.eventsWanted ? 'error' : undefined"
        :feedback="errors.eventsWanted"
      >
        <NInputNumber
          v-model:value="form.eventsWanted"
          :min="1"
          :max="100"
          placeholder="Ej. 3"
          style="width: 100%"
          data-test="contact-events-wanted"
        />
      </NFormItem>

      <NFormItem
        label="Mensaje"
        :validation-status="errors.message ? 'error' : undefined"
        :feedback="errors.message"
      >
        <NInput
          v-model:value="form.message"
          type="textarea"
          :autosize="{ minRows: 3, maxRows: 8 }"
          :maxlength="2000"
          show-count
          placeholder="Cuéntanos qué evento viene o qué necesitas."
          data-test="contact-message"
        />
      </NFormItem>

      <p class="contact-titan__note">
        Enviamos tu mensaje con los datos de tu contrato. Te respondemos a tu correo.
      </p>

      <div class="contact-titan__actions">
        <NButton @click="emit('update:show', false)">Cancelar</NButton>
        <NButton type="primary" attr-type="submit" :loading="isPending" data-test="contact-send">
          Enviar
        </NButton>
      </div>
    </form>
  </NModal>
</template>

<style scoped>
.contact-titan__reasons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.contact-titan__note {
  margin: 0 0 12px;
  font-size: 12.5px;
  color: #6b7280;
}

.contact-titan__actions {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}
</style>
