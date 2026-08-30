<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NButton, NTag } from 'naive-ui'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { message } from '@/core/ui/discrete-api'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { isPhoneValid } from '@/shared/utils/phone.utils'
import { useUpdateTenantProfile } from '../../composables/mutations/use-update-tenant-profile'
import PersonalPhonePickerModal from '../modals/PersonalPhonePickerModal.vue'
import type { TenantProfileResponse } from '../../types/responses/tenant-profile.response'

const props = defineProps<{ profile: TenantProfileResponse }>()

const { has } = usePermissions()
const canEditProfile = computed(() => has(PERMISSIONS.TENANT_PROFILE_UPDATE))

const whatsappNumber = ref(props.profile.whatsappNumber ?? '')

watch(
  () => props.profile.whatsappNumber,
  (serverWhatsappNumber) => {
    whatsappNumber.value = serverWhatsappNumber ?? ''
  },
)

const isEmpty = computed(() => whatsappNumber.value.trim() === '')
const isValid = computed(() => isEmpty.value || isPhoneValid(whatsappNumber.value))
const hasChanges = computed(() => whatsappNumber.value !== (props.profile.whatsappNumber ?? ''))
const canSubmit = computed(() => hasChanges.value && isValid.value)

const isPickerOpen = ref(false)

const { mutate, isPending } = useUpdateTenantProfile()

function submit() {
  if (!canSubmit.value) return
  mutate(
    { whatsappNumber: isEmpty.value ? null : whatsappNumber.value },
    { onSuccess: () => message.success('Número de WhatsApp actualizado') },
  )
}

function usePersonalPhone(phoneNumber: string) {
  mutate(
    { whatsappNumber: phoneNumber },
    {
      onSuccess: () => {
        whatsappNumber.value = phoneNumber
        isPickerOpen.value = false
        message.success('Número de WhatsApp actualizado')
      },
    },
  )
}
</script>

<template>
  <div class="contact-section">
    <div class="contact-section__field">
      <div class="contact-section__label-row">
        <span class="contact-section__label">Número de WhatsApp</span>
        <NTag v-if="profile.whatsappPendingVerification" type="warning" size="small" round>
          Pendiente de verificar
        </NTag>
      </div>

      <div class="tt-phone-input contact-section__input">
        <IntlTelInput
          :options="PHONE_INPUT_OPTIONS"
          :value="whatsappNumber"
          :disabled="!canEditProfile"
          :input-props="{ placeholder: 'Ej. 99 123 4567' }"
          @change-number="(num: string) => (whatsappNumber = num)"
        />
      </div>

      <p v-if="!isValid" class="contact-section__error">
        Ese número no es válido para el país seleccionado.
      </p>

      <p class="contact-section__hint">
        Los compradores te escriben a este número desde la galería pública de tus eventos, así que
        queda visible para cualquiera que la abra.
      </p>
    </div>

    <div v-if="canEditProfile" class="contact-section__actions">
      <NButton type="primary" :disabled="!canSubmit" :loading="isPending" @click="submit">
        Guardar cambios
      </NButton>

      <NButton quaternary size="small" @click="isPickerOpen = true">
        Usar uno de mis teléfonos
      </NButton>
    </div>

    <PersonalPhonePickerModal
      v-model:show="isPickerOpen"
      :current-number="profile.whatsappNumber"
      :saving="isPending"
      @select="usePersonalPhone"
    />
  </div>
</template>

<style scoped>
.contact-section {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.contact-section__field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 420px;
}

.contact-section__label-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.contact-section__label {
  font-size: 13px;
  font-weight: 500;
}

.contact-section__input {
  width: 100%;
}

.contact-section__error {
  margin: 0;
  font-size: 12px;
  color: #d03050;
}

.contact-section__hint {
  margin: 0;
  font-size: 12px;
  line-height: 1.5;
  opacity: 0.7;
}

.contact-section__actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}
</style>
