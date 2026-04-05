<script setup lang="ts">
import { computed, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton, NFormItem, NGrid, NGridItem, NIcon, NInput, NSelect } from 'naive-ui'
import { PersonAddOutline } from '@vicons/ionicons5'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useCountriesQuery } from '@/features/locations/composables/queries/use-countries'
import { useProvincesByCountryQuery } from '@/features/locations/composables/queries/use-provinces-by-country'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import {
  REGISTER_FORM_DEFAULTS,
  registerFieldValidators as v,
  type IRegisterFormData,
} from '../../../constants/register-form.schema'

const ECUADOR_ISO = 'EC'

defineProps<{
  isSubmitting: boolean
  loginUrl?: string
}>()

const emit = defineEmits<{
  submit: [data: IRegisterFormData]
}>()

const form = useForm({
  defaultValues: REGISTER_FORM_DEFAULTS,
  onSubmit: async ({ value }) => {
    emit('submit', value)
  },
})

// --- Location (derived from form state, no duplicate refs) ---
const { data: countries } = useCountriesQuery()

const countryOptions = computed(
  () => countries.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

const selectedCountryId = computed(() => form.getFieldValue('countryId'))
const selectedProvinceId = computed(() => form.getFieldValue('provinceId'))

const isEcuador = computed(() => {
  const cid = selectedCountryId.value
  if (!cid || !countries.value) return false
  return countries.value.find((c) => c.id === cid)?.isoCode === ECUADOR_ISO
})

const { data: provinces, isFetching: isLoadingProvinces } =
  useProvincesByCountryQuery(selectedCountryId)
const { data: cantons, isFetching: isLoadingCantons } = useCantonsQuery(selectedProvinceId)

const provinceOptions = computed(
  () => provinces.value?.map((p) => ({ label: p.name, value: p.id })) ?? [],
)
const cantonOptions = computed(
  () => cantons.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

// Default Ecuador when countries load
watch(countries, (list) => {
  if (list && !form.getFieldValue('countryId')) {
    const ec = list.find((c) => c.isoCode === ECUADOR_ISO)
    if (ec) form.setFieldValue('countryId', ec.id)
  }
})
</script>

<template>
  <form
    class="register-form"
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <!-- Name -->
    <div class="register-form__row">
      <form.Field name="firstName" :validators="{ onBlur: v.firstName, onSubmit: v.firstName }">
        <template v-slot="{ field }">
          <NFormItem label="Nombre" required v-bind="fieldStatus(field)">
            <NInput placeholder="Tu nombre" v-bind="fieldInput(field)" />
          </NFormItem>
        </template>
      </form.Field>

      <form.Field name="lastName" :validators="{ onBlur: v.lastName, onSubmit: v.lastName }">
        <template v-slot="{ field }">
          <NFormItem label="Apellido" required v-bind="fieldStatus(field)">
            <NInput placeholder="Tu apellido" v-bind="fieldInput(field)" />
          </NFormItem>
        </template>
      </form.Field>
    </div>

    <!-- Email -->
    <form.Field name="email" :validators="{ onBlur: v.email, onSubmit: v.email }">
      <template v-slot="{ field }">
        <NFormItem label="Correo electrónico" required v-bind="fieldStatus(field)">
          <NInput placeholder="correo@ejemplo.com" v-bind="fieldInput(field)" />
        </NFormItem>
      </template>
    </form.Field>

    <!-- Password + Confirm (linked via onChangeListenTo) -->
    <div class="register-form__row">
      <form.Field name="password" :validators="{ onBlur: v.password, onSubmit: v.password }">
        <template v-slot="{ field }">
          <NFormItem label="Contraseña" required v-bind="fieldStatus(field)">
            <NInput
              type="password"
              show-password-on="click"
              placeholder="Mínimo 8 caracteres"
              v-bind="fieldInput(field)"
            />
          </NFormItem>
        </template>
      </form.Field>

      <form.Field
        name="confirmPassword"
        :validators="{
          onChangeListenTo: ['password'],
          onChange: ({ value, fieldApi }) =>
            value !== fieldApi.form.getFieldValue('password')
              ? 'Las contraseñas no coinciden'
              : undefined,
          onSubmit: ({ value, fieldApi }) =>
            !value
              ? 'Confirma tu contraseña'
              : value !== fieldApi.form.getFieldValue('password')
                ? 'Las contraseñas no coinciden'
                : undefined,
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="Confirmar contraseña" required v-bind="fieldStatus(field)">
            <NInput
              type="password"
              show-password-on="click"
              placeholder="Repite tu contraseña"
              v-bind="fieldInput(field)"
            />
          </NFormItem>
        </template>
      </form.Field>
    </div>

    <!-- Phone (intl-tel-input → field.handleChange directly) -->
    <form.Field name="phoneNumber" :validators="{ onSubmit: v.phoneNumber }">
      <template v-slot="{ field }">
        <NFormItem label="WhatsApp" required v-bind="fieldStatus(field)">
          <div class="register-form__phone">
            <IntlTelInput
              :options="{
                initialCountry: 'ec',
                separateDialCode: true,
                strictMode: true,
                countryOrder: ['ec', 'co', 'pe', 'cl', 'ar', 'mx'],
                i18n: { searchPlaceholder: 'Buscar país...' },
              }"
              :input-props="{ placeholder: 'Ej. 99 123 4567' }"
              @change-number="(num: string) => field.handleChange(num)"
              @change-validity="() => {}"
            />
          </div>
        </NFormItem>
      </template>
    </form.Field>

    <!-- Country -->
    <form.Field name="countryId" :validators="{ onSubmit: v.countryId }">
      <template v-slot="{ field }">
        <NFormItem label="País" required v-bind="fieldStatus(field)">
          <NSelect
            :options="countryOptions"
            placeholder="Seleccionar país"
            filterable
            :value="field.state.value"
            @update:value="
              (val: number | null) => {
                field.handleChange(val)
                form.setFieldValue('provinceId', null)
                form.setFieldValue('cantonId', null)
              }
            "
            @blur="field.handleBlur"
          />
        </NFormItem>
      </template>
    </form.Field>

    <!-- Province + Canton (Ecuador only, cascading from form state) -->
    <NGrid v-if="isEcuador" :cols="2" :x-gap="12">
      <NGridItem>
        <form.Field name="provinceId">
          <template v-slot="{ field }">
            <NFormItem label="Provincia">
              <NSelect
                :options="provinceOptions"
                :loading="isLoadingProvinces"
                placeholder="Seleccionar"
                filterable
                clearable
                :value="field.state.value"
                @update:value="
                  (val: number | null) => {
                    field.handleChange(val)
                    form.setFieldValue('cantonId', null)
                  }
                "
                @blur="field.handleBlur"
              />
            </NFormItem>
          </template>
        </form.Field>
      </NGridItem>
      <NGridItem>
        <form.Field name="cantonId">
          <template v-slot="{ field }">
            <NFormItem label="Cantón">
              <NSelect
                :options="cantonOptions"
                :loading="isLoadingCantons"
                :disabled="!selectedProvinceId"
                placeholder="Seleccionar"
                filterable
                clearable
                v-bind="fieldInput(field)"
              />
            </NFormItem>
          </template>
        </form.Field>
      </NGridItem>
    </NGrid>

    <!-- Submit -->
    <form.Subscribe>
      <template v-slot="{ canSubmit }">
        <NButton
          type="primary"
          block
          size="large"
          :loading="isSubmitting"
          :disabled="!canSubmit"
          attr-type="submit"
          class="register-form__submit"
        >
          <template #icon><NIcon :component="PersonAddOutline" /></template>
          Crear cuenta
        </NButton>
      </template>
    </form.Subscribe>

    <p v-if="loginUrl" class="register-form__login-link">
      ¿Ya tienes cuenta?
      <RouterLink :to="loginUrl">Inicia sesión</RouterLink>
    </p>
  </form>
</template>

<style scoped src="./register-form.css"></style>
