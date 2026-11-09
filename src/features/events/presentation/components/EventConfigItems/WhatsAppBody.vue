<script setup lang="ts">
import { computed } from 'vue'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { isPhoneValid } from '@/shared/utils/phone.utils'
import type { IWhatsappDraft } from '../../../composables/use-configuration-items'
import ConfigField from './ConfigField.vue'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

const INVALID_MESSAGE = 'Ese número no es válido para el país seleccionado.'

const props = withDefaults(
  defineProps<{
    hasProfileValue: boolean
    profileLabel: string
    useProfile: boolean
    saveToProfile: boolean
    showSaveToProfile?: boolean
    draft: IWhatsappDraft
  }>(),
  { showSaveToProfile: true },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:draft': [Partial<IWhatsappDraft>]
}>()

const error = computed(() =>
  props.draft.value === '' || isPhoneValid(props.draft.value) ? null : INVALID_MESSAGE,
)
</script>

<template>
  <SourceChoice
    v-if="hasProfileValue"
    :profile-label="profileLabel"
    :use-profile="useProfile"
    @update:use-profile="emit('update:use-profile', $event)"
  />

  <template v-if="!useProfile">
    <ConfigField
      label="WhatsApp de contacto"
      hint="Los compradores escriben a este número desde la página del evento y desde sus pedidos."
      :error="error"
    >
      <div class="tt-phone-input" data-test="whatsapp-input">
        <IntlTelInput
          :options="PHONE_INPUT_OPTIONS"
          :value="draft.value"
          :input-props="{ placeholder: 'Ej. 99 123 4567' }"
          @change-number="(num: string) => emit('update:draft', { value: num })"
        />
      </div>
    </ConfigField>

    <SaveToProfileCheck
      v-if="showSaveToProfile"
      :model-value="saveToProfile"
      :has-profile-value="hasProfileValue"
      @update:model-value="emit('update:save-to-profile', $event)"
    />
  </template>
</template>
