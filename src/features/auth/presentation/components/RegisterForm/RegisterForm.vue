<script setup lang="ts">
import { computed, ref, watch, type Ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import {
  NAlert,
  NButton,
  NCheckbox,
  NFormItem,
  NGrid,
  NGridItem,
  NIcon,
  NInput,
  NSelect,
} from 'naive-ui'
import { PersonAddOutline } from '@vicons/ionicons5'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { useCountriesQuery } from '@/features/locations/composables/queries/use-countries'
import { useProvincesByCountryQuery } from '@/features/locations/composables/queries/use-provinces-by-country'
import { useCantonsQuery } from '@/features/locations/composables/queries/use-cantons'
import { useBirthDateFields } from '../../../composables/use-birth-date-fields'
import { useCountryPhoneSync } from '../../../composables/use-country-phone-sync'
import {
  REGISTER_FORM_DEFAULTS,
  registerFieldValidators as v,
  type IRegisterFormData,
} from '../../../constants/register-form.schema'
import {
  DEFAULT_COUNTRY_ISO,
  GENDER_OPTIONS,
  MONTH_OPTIONS,
  PHONE_PRIORITY_ISOS,
} from '../../../constants/register-form.options'
import type { Gender } from '../../../types/requests/register.request'
import { isMinor } from '../../../utils/age.utils'
import { LEGAL_PATHS } from '@/features/legal/routes'

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

const birthDay = form.useStore((s) => s.values.birthDay)
const birthMonth = form.useStore((s) => s.values.birthMonth)
const birthYear = form.useStore((s) => s.values.birthYear)

const isMinorRider = computed(() => isMinor(birthYear.value, birthMonth.value, birthDay.value))

watch(isMinorRider, (minor) => {
  if (!minor) form.setFieldValue('guardianConsent', false)
})

const { data: countries } = useCountriesQuery()

const countryOptions = computed(
  () => countries.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

const selectedCountryId = form.useStore((s) => s.values.countryId)
const selectedProvinceId = form.useStore((s) => s.values.provinceId)

const { data: provinces, isFetching: isLoadingProvinces } = useProvincesByCountryQuery(
  selectedCountryId as Ref<number | null>,
)
const { data: cantons, isFetching: isLoadingCantons } = useCantonsQuery(
  selectedProvinceId as Ref<number | null>,
)

const provinceOptions = computed(
  () => provinces.value?.map((p) => ({ label: p.name, value: p.id })) ?? [],
)
const cantonOptions = computed(
  () => cantons.value?.map((c) => ({ label: c.name, value: c.id })) ?? [],
)

const hasRegions = computed(() => provinceOptions.value.length > 0)

const selectedCountryIso = computed(() => {
  const cid = selectedCountryId.value
  if (!cid || !countries.value) return null
  return countries.value.find((c) => c.id === cid)?.isoCode ?? null
})

watch(countries, (list) => {
  if (list && !form.getFieldValue('countryId')) {
    const ec = list.find((c) => c.isoCode === DEFAULT_COUNTRY_ISO)
    if (ec) form.setFieldValue('countryId', ec.id)
  }
})

const telInputRef = ref<{ instance: { setCountry: (iso2: string) => void } } | null>(null)
const isPhoneValid = ref(false)

useCountryPhoneSync(selectedCountryIso, telInputRef)

const selectedBirthYear = form.useStore((s) => s.values.birthYear)
const selectedBirthMonth = form.useStore((s) => s.values.birthMonth)
const selectedBirthDay = form.useStore((s) => s.values.birthDay)

const {
  yearOptions,
  dayOptions,
  validate: validateBirthDate,
} = useBirthDateFields({
  year: selectedBirthYear,
  month: selectedBirthMonth,
  day: selectedBirthDay,
  onInvalidDay: () => form.setFieldValue('birthDay', null),
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

    <form.Field name="email" :validators="{ onBlur: v.email, onSubmit: v.email }">
      <template v-slot="{ field }">
        <NFormItem label="Correo electrónico" required v-bind="fieldStatus(field)">
          <NInput placeholder="correo@ejemplo.com" v-bind="fieldInput(field)" />
        </NFormItem>
      </template>
    </form.Field>

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

    <div class="register-form__row">
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

      <form.Field
        name="phoneNumber"
        :validators="{
          onSubmit: ({ value }: { value: string }) => {
            if (!value) return 'Ingresa tu número de WhatsApp'
            if (!isPhoneValid) return 'Número inválido para el país seleccionado'
            return undefined
          },
        }"
      >
        <template v-slot="{ field }">
          <NFormItem label="WhatsApp" required v-bind="fieldStatus(field)">
            <div class="register-form__phone">
              <IntlTelInput
                ref="telInputRef"
                :options="{
                  initialCountry: DEFAULT_COUNTRY_ISO.toLowerCase(),
                  separateDialCode: true,
                  strictMode: true,
                  allowDropdown: false,
                  countryOrder: PHONE_PRIORITY_ISOS,
                  i18n: { searchPlaceholder: 'Buscar país...' },
                }"
                :input-props="{ placeholder: 'Ej. 99 123 4567' }"
                @change-number="(num: string) => field.handleChange(num)"
                @change-validity="(valid: boolean) => (isPhoneValid = valid)"
              />
            </div>
          </NFormItem>
        </template>
      </form.Field>
    </div>

    <NGrid v-if="hasRegions" :cols="2" :x-gap="12">
      <NGridItem>
        <form.Field name="provinceId">
          <template v-slot="{ field }">
            <NFormItem label="Región">
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
            <NFormItem label="Ciudad">
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

    <div class="register-form__row register-form__row--3">
      <form.Field name="birthDay" :validators="{ onSubmit: validateBirthDate }">
        <template v-slot="{ field }">
          <NFormItem label="Día" required v-bind="fieldStatus(field)">
            <NSelect
              :options="dayOptions"
              placeholder="Día"
              :value="field.state.value"
              @update:value="(val: number | null) => field.handleChange(val)"
              @blur="field.handleBlur"
            />
          </NFormItem>
        </template>
      </form.Field>
      <form.Field name="birthMonth">
        <template v-slot="{ field }">
          <NFormItem label="Mes" required v-bind="fieldStatus(field)">
            <NSelect
              :options="MONTH_OPTIONS"
              placeholder="Mes"
              :value="field.state.value"
              @update:value="(val: number | null) => field.handleChange(val)"
              @blur="field.handleBlur"
            />
          </NFormItem>
        </template>
      </form.Field>
      <form.Field name="birthYear">
        <template v-slot="{ field }">
          <NFormItem label="Año" required v-bind="fieldStatus(field)">
            <NSelect
              :options="yearOptions"
              placeholder="Año"
              filterable
              :value="field.state.value"
              @update:value="(val: number | null) => field.handleChange(val)"
              @blur="field.handleBlur"
            />
          </NFormItem>
        </template>
      </form.Field>
    </div>

    <form.Field name="gender">
      <template v-slot="{ field }">
        <NFormItem label="Género" v-bind="fieldStatus(field)">
          <NSelect
            :options="GENDER_OPTIONS"
            placeholder="Selecciona (opcional)"
            clearable
            :value="field.state.value"
            @update:value="(val: Gender | null) => field.handleChange(val)"
            @blur="field.handleBlur"
          />
        </NFormItem>
      </template>
    </form.Field>

    <div class="register-form__consent">
      <NAlert v-if="isMinorRider" type="info" :bordered="false" class="register-form__minor-alert">
        Detectamos que el participante es menor de edad. La cuenta debe ser creada y utilizada por
        su padre, madre o representante legal.
      </NAlert>

      <form.Field v-if="isMinorRider" name="guardianConsent">
        <template v-slot="{ field }">
          <NCheckbox
            :checked="field.state.value"
            @update:checked="(val: boolean) => field.handleChange(val)"
          >
            Confirmo que soy el padre, madre o representante legal del participante y autorizo el
            tratamiento de sus datos.
          </NCheckbox>
        </template>
      </form.Field>

      <form.Field name="acceptedTerms" :validators="{ onSubmit: v.acceptedTerms }">
        <template v-slot="{ field }">
          <NFormItem :show-label="false" v-bind="fieldStatus(field)">
            <NCheckbox
              :checked="field.state.value"
              @update:checked="(val: boolean) => field.handleChange(val)"
            >
              He leído y acepto la
              <RouterLink :to="LEGAL_PATHS.PRIVACY" target="_blank">
                Política de Privacidad
              </RouterLink>
              y los
              <RouterLink :to="LEGAL_PATHS.TERMS" target="_blank"
                >Términos y Condiciones</RouterLink
              >
              , incluido el envío de mensajes por WhatsApp sobre mis pedidos.
            </NCheckbox>
          </NFormItem>
        </template>
      </form.Field>
    </div>

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
