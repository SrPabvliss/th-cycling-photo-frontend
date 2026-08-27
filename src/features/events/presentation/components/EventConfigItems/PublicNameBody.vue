<script setup lang="ts">
import { computed } from 'vue'

import {
  MAX_PUBLIC_NAME_LENGTH,
  MIN_PUBLIC_NAME_LENGTH,
  isValidPublicName,
} from '@/shared/utils/payout.validation'
import type { IPublicNameDraft } from '../../../composables/use-configuration-items'
import ConfigField from './ConfigField.vue'
import ConfigInput from './ConfigInput.vue'
import SaveToProfileCheck from './SaveToProfileCheck.vue'
import SourceChoice from './SourceChoice.vue'

const props = withDefaults(
  defineProps<{
    hasProfileValue: boolean
    profileLabel: string
    useProfile: boolean
    saveToProfile: boolean
    showSaveToProfile?: boolean
    draft: IPublicNameDraft
  }>(),
  { showSaveToProfile: true },
)

const emit = defineEmits<{
  'update:use-profile': [boolean]
  'update:save-to-profile': [boolean]
  'update:draft': [Partial<IPublicNameDraft>]
}>()

const error = computed(() =>
  props.draft.value === '' || isValidPublicName(props.draft.value)
    ? null
    : `Escribe al menos ${MIN_PUBLIC_NAME_LENGTH} caracteres.`,
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
      label="Nombre público"
      hint="Es el nombre que el comprador ve como vendedor de las fotos."
      :error="error"
    >
      <ConfigInput
        :model-value="draft.value"
        :state="error ? 'bad' : ''"
        :maxlength="MAX_PUBLIC_NAME_LENGTH"
        placeholder="Ej. Andes Bike Media"
        data-test="public-name-input"
        @update:model-value="emit('update:draft', { value: $event })"
      />
    </ConfigField>

    <SaveToProfileCheck
      v-if="showSaveToProfile"
      :model-value="saveToProfile"
      :has-profile-value="hasProfileValue"
      @update:model-value="emit('update:save-to-profile', $event)"
    />
  </template>
</template>
