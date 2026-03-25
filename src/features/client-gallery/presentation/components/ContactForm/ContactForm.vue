<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton, NFormItem, NIcon, NInput, NInputGroup, NInputGroupLabel, NSpin } from 'naive-ui'
import { LogoWhatsapp, SendOutline, ChevronBack, CheckmarkCircleOutline } from '@vicons/ionicons5'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import {
  COUNTRY_CODE,
  buildWhatsAppNumber,
  formatWhatsAppNumber,
  isPhoneValid as checkPhoneValid,
} from '@/shared/utils/phone.utils'
import { useCustomerLookup } from '../../../composables/queries/use-customer-lookup'
import {
  CONTACT_FORM_DEFAULTS,
  contactFormSchema,
  type IContactFormData,
} from '../../../constants/contact-form.schema'
import type { IPreviewPhoto } from '../../../types/responses/preview-data.response'
import OrderSummary from '../OrderSummary/OrderSummary.vue'

const props = defineProps<{
  token: string
  eventName: string
  eventDate: Date
  selectedPhotos: IPreviewPhoto[]
  photoCount: number
  isSubmitting: boolean
}>()

const emit = defineEmits<{
  submit: [data: IContactFormData]
  back: []
}>()

const phoneLocal = ref('')
const hasSearched = ref(false)

const fullWhatsApp = computed(() => buildWhatsAppNumber(phoneLocal.value))
const formattedWhatsApp = computed(() => formatWhatsAppNumber(phoneLocal.value))
const phoneValid = computed(() => checkPhoneValid(phoneLocal.value))

const tokenRef = ref(props.token)
const lookupPhone = ref('')
const { data: customer, isFetching: isLookingUp } = useCustomerLookup(tokenRef, lookupPhone)

const form = useForm({
  defaultValues: CONTACT_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    emit('submit', value)
  },
})

watch(customer, (c) => {
  if (c) {
    form.setFieldValue('firstName', c.firstName)
    form.setFieldValue('lastName', c.lastName)
    form.setFieldValue('whatsapp', c.whatsapp)
    if (c.email) form.setFieldValue('email', c.email)
    hasSearched.value = true
  }
})

function handleContinue() {
  if (!phoneValid.value) return
  lookupPhone.value = fullWhatsApp.value
  form.setFieldValue('whatsapp', fullWhatsApp.value)
  hasSearched.value = true
}
</script>

<template>
  <div class="cf">
    <!-- Back bar -->
    <div class="cf-back-bar">
      <a class="cf-back-link" @click="emit('back')">
        <NIcon :component="ChevronBack" :size="14" />
        Volver a las fotos
      </a>
      <span class="cf-breadcrumb-sep">/</span>
      <span class="cf-breadcrumb-cur">Confirmar pedido</span>
    </div>

    <div class="cf-grid">
      <!-- LEFT: Summary -->
      <OrderSummary
        :event-name="eventName"
        :event-date="eventDate"
        :selected-photos="selectedPhotos"
        :photo-count="photoCount"
      />

      <!-- RIGHT: Form -->
      <div class="cf-form-col">
        <div class="cf-form-heading">
          <h1 class="cf-form-title">Casi listo</h1>
          <p class="cf-form-subtitle">
            Cuéntanos cómo contactarte. Te enviaremos los detalles de pago y las fotos originales
            por WhatsApp.
          </p>
        </div>

        <!-- WhatsApp first step -->
        <div v-if="!hasSearched" class="cf-whatsapp-step">
          <NFormItem label="Número de WhatsApp" required>
            <template #label-extra>
              <span class="cf-form-hint">Escribe tu número sin el 0 inicial</span>
            </template>
            <NInputGroup>
              <NInputGroupLabel size="large" class="cf-phone-prefix">
                <NIcon :component="LogoWhatsapp" color="#25D366" :size="16" />
                {{ COUNTRY_CODE }}
              </NInputGroupLabel>
              <NInput
                v-model:value="phoneLocal"
                placeholder="99 123 4567"
                size="large"
                @keyup.enter="handleContinue"
              />
            </NInputGroup>
          </NFormItem>
          <p v-if="phoneLocal && phoneValid" class="cf-phone-preview">
            Número completo: <strong>{{ formattedWhatsApp }}</strong>
          </p>
          <NSpin v-if="isLookingUp" size="small" />
          <NButton
            type="primary"
            size="large"
            block
            :disabled="!phoneValid"
            @click="handleContinue"
          >
            Continuar
          </NButton>
        </div>

        <!-- Full form -->
        <form
          v-else
          class="cf-form-grid"
          @submit="
            (e) => {
              e.preventDefault()
              e.stopPropagation()
              form.handleSubmit()
            }
          "
        >
          <div class="cf-field cf-field--full">
            <form.Field
              name="whatsapp"
              :validators="{ onSubmit: contactFormSchema.shape.whatsapp }"
            >
              <template v-slot="{ field }">
                <NFormItem label="WhatsApp" required v-bind="fieldStatus(field)">
                  <NInput :value="field.state.value" disabled>
                    <template #prefix>
                      <NIcon :component="LogoWhatsapp" color="#25D366" />
                    </template>
                  </NInput>
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field">
            <form.Field
              name="firstName"
              :validators="{
                onBlur: contactFormSchema.shape.firstName,
                onSubmit: contactFormSchema.shape.firstName,
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Nombre" required v-bind="fieldStatus(field)">
                  <NInput placeholder="Tu nombre" v-bind="fieldInput(field)" />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field">
            <form.Field
              name="lastName"
              :validators="{
                onBlur: contactFormSchema.shape.lastName,
                onSubmit: contactFormSchema.shape.lastName,
              }"
            >
              <template v-slot="{ field }">
                <NFormItem label="Apellido" required v-bind="fieldStatus(field)">
                  <NInput placeholder="Tu apellido" v-bind="fieldInput(field)" />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field cf-field--full">
            <form.Field name="email">
              <template v-slot="{ field }">
                <NFormItem label="Email (opcional)">
                  <NInput placeholder="correo@ejemplo.com" v-bind="fieldInput(field)" />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field cf-field--full">
            <form.Field name="notes">
              <template v-slot="{ field }">
                <NFormItem label="Observaciones (opcional)">
                  <NInput
                    type="textarea"
                    placeholder="¿Algún comentario adicional sobre tu pedido?"
                    :rows="3"
                    :maxlength="500"
                    show-count
                    v-bind="fieldInput(field)"
                  />
                </NFormItem>
              </template>
            </form.Field>
          </div>

          <div class="cf-field cf-field--full cf-cta">
            <form.Subscribe>
              <template v-slot="{ canSubmit }">
                <NButton
                  type="primary"
                  size="large"
                  block
                  :loading="isSubmitting"
                  :disabled="!canSubmit"
                  attr-type="submit"
                >
                  <template #icon><NIcon :component="SendOutline" /></template>
                  Confirmar mi pedido
                </NButton>
              </template>
            </form.Subscribe>
            <p class="cf-cta-note">
              <NIcon :component="CheckmarkCircleOutline" :size="14" color="#18a058" />
              Te contactaremos por WhatsApp para coordinar el pago
            </p>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<style scoped src="./contact-form.css" />
