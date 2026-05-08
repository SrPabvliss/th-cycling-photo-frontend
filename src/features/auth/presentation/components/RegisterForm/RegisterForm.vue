<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NSelect } from 'naive-ui'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'

import { fieldInput, getFieldErrors } from '@/shared/utils/form.utils'
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

// Password strength (visual only)
const passwordValue = ref('')
const showPassword = ref(false)
const showConfirm = ref(false)

const passStrength = computed(() => {
  const val = passwordValue.value
  if (!val) return 0
  let s = 0
  if (val.length >= 8) s++
  if (/[A-Z]/.test(val)) s++
  if (/[0-9]/.test(val)) s++
  if (/[^A-Za-z0-9]/.test(val)) s++
  return s
})

const passStrengthLabel = computed(() => {
  return ['—', 'Débil', 'Regular', 'Buena', 'Fuerte'][passStrength.value] ?? '—'
})

// --- Location ---
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
    <!-- Name row -->
    <div class="auth-two-cols">
      <form.Field name="firstName" :validators="{ onBlur: v.firstName, onSubmit: v.firstName }">
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label" :for="field.name">
              Nombre <span class="auth-req">*</span>
            </label>
            <input
              :id="field.name"
              type="text"
              class="auth-input"
              placeholder="Tu nombre"
              v-bind="fieldInput(field)"
            />
            <div v-if="field.state.meta.errors.length" class="auth-field-error">
              {{ getFieldErrors(field.state.meta.errors) }}
            </div>
          </div>
        </template>
      </form.Field>

      <form.Field name="lastName" :validators="{ onBlur: v.lastName, onSubmit: v.lastName }">
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label" :for="field.name">
              Apellido <span class="auth-req">*</span>
            </label>
            <input
              :id="field.name"
              type="text"
              class="auth-input"
              placeholder="Tu apellido"
              v-bind="fieldInput(field)"
            />
            <div v-if="field.state.meta.errors.length" class="auth-field-error">
              {{ getFieldErrors(field.state.meta.errors) }}
            </div>
          </div>
        </template>
      </form.Field>
    </div>

    <!-- Email -->
    <form.Field name="email" :validators="{ onBlur: v.email, onSubmit: v.email }">
      <template v-slot="{ field }">
        <div class="auth-field">
          <label class="auth-label" :for="field.name">
            Correo electrónico <span class="auth-req">*</span>
          </label>
          <div class="auth-input-wrap">
            <span class="auth-field-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path
                  d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                />
                <polyline points="22,6 12,13 2,6" />
              </svg>
            </span>
            <input
              :id="field.name"
              type="email"
              class="auth-input auth-input--icon"
              placeholder="correo@ejemplo.com"
              v-bind="fieldInput(field)"
            />
          </div>
          <div v-if="field.state.meta.errors.length" class="auth-field-error">
            {{ getFieldErrors(field.state.meta.errors) }}
          </div>
        </div>
      </template>
    </form.Field>

    <!-- Password -->
    <form.Field name="password" :validators="{ onBlur: v.password, onSubmit: v.password }">
      <template v-slot="{ field }">
        <div class="auth-field">
          <label class="auth-label" :for="field.name">
            Contraseña <span class="auth-req">*</span>
          </label>
          <div class="auth-input-wrap">
            <span class="auth-field-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              :id="field.name"
              :type="showPassword ? 'text' : 'password'"
              class="auth-input auth-input--icon auth-input--pass"
              placeholder="Mínimo 8 caracteres"
              :value="field.state.value"
              @input="
                (e) => {
                  const val = (e.target as HTMLInputElement).value
                  field.handleChange(val)
                  passwordValue = val
                }
              "
              @blur="field.handleBlur"
            />
            <button
              type="button"
              class="auth-pass-toggle"
              :style="showPassword ? 'color: var(--titan-blue)' : ''"
              @click="showPassword = !showPassword"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <!-- Password strength bars -->
          <div
            v-if="passwordValue"
            class="auth-pass-strength"
            :class="`auth-pass-strength--s${passStrength}`"
          >
            <div class="auth-pass-strength__bar" />
            <div class="auth-pass-strength__bar" />
            <div class="auth-pass-strength__bar" />
            <div class="auth-pass-strength__bar" />
            <span class="auth-pass-strength__label">{{ passStrengthLabel }}</span>
          </div>
          <div v-if="field.state.meta.errors.length" class="auth-field-error">
            {{ getFieldErrors(field.state.meta.errors) }}
          </div>
        </div>
      </template>
    </form.Field>

    <!-- Confirm password -->
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
        <div class="auth-field">
          <label class="auth-label" :for="field.name">
            Confirmar contraseña <span class="auth-req">*</span>
          </label>
          <div class="auth-input-wrap">
            <span class="auth-field-icon">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <rect x="3" y="11" width="18" height="11" rx="2" />
                <path d="M7 11V7a5 5 0 0110 0v4" />
              </svg>
            </span>
            <input
              :id="field.name"
              :type="showConfirm ? 'text' : 'password'"
              class="auth-input auth-input--icon auth-input--pass"
              placeholder="Repite tu contraseña"
              :value="field.state.value"
              @input="(e) => field.handleChange((e.target as HTMLInputElement).value)"
              @blur="field.handleBlur"
            />
            <button
              type="button"
              class="auth-pass-toggle"
              :style="showConfirm ? 'color: var(--titan-blue)' : ''"
              @click="showConfirm = !showConfirm"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
              >
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            </button>
          </div>
          <div v-if="field.state.meta.errors.length" class="auth-field-error">
            {{ getFieldErrors(field.state.meta.errors) }}
          </div>
        </div>
      </template>
    </form.Field>

    <!-- Phone -->
    <form.Field name="phoneNumber" :validators="{ onSubmit: v.phoneNumber }">
      <template v-slot="{ field }">
        <div class="auth-field">
          <label class="auth-label">WhatsApp <span class="auth-req">*</span></label>
          <div class="register-form__phone">
            <IntlTelInput
              :options="{
                initialCountry: 'ec',
                separateDialCode: true,
                strictMode: true,
                countryOrder: ['ec', 'co', 'pe', 'cl', 'ar', 'mx'],
                i18n: { searchPlaceholder: 'Buscar país...' },
              }"
              :input-props="{ placeholder: 'Ej. 99 123 4567', class: 'auth-input' }"
              @change-number="(num: string) => field.handleChange(num)"
              @change-validity="() => {}"
            />
          </div>
          <div v-if="field.state.meta.errors.length" class="auth-field-error">
            {{ getFieldErrors(field.state.meta.errors) }}
          </div>
        </div>
      </template>
    </form.Field>

    <!-- Country + ¿Cómo nos conociste? -->
    <div class="auth-two-cols">
      <form.Field name="countryId" :validators="{ onSubmit: v.countryId }">
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label">País <span class="auth-req">*</span></label>
            <NSelect
              class="auth-n-select"
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
            <div v-if="field.state.meta.errors.length" class="auth-field-error">
              {{ getFieldErrors(field.state.meta.errors) }}
            </div>
          </div>
        </template>
      </form.Field>

      <!-- TODO: no enviado al backend — agregar campo referralSource al endpoint POST /auth/register -->
      <div class="auth-field">
        <label class="auth-label" for="register-source">¿Cómo nos conociste?</label>
        <select id="register-source" class="auth-select">
          <option value="">Selecciona una opción</option>
          <option>Fotógrafo en el evento</option>
          <option>Instagram</option>
          <option>Facebook</option>
          <option>YouTube</option>
          <option>Amigo / recomendación</option>
          <option>Organizador del evento</option>
          <option>Otro</option>
        </select>
      </div>
    </div>

    <!-- Province + Canton (Ecuador only) -->
    <div v-if="isEcuador" class="auth-two-cols">
      <form.Field name="provinceId">
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label">Provincia</label>
            <NSelect
              class="auth-n-select"
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
          </div>
        </template>
      </form.Field>

      <form.Field name="cantonId">
        <template v-slot="{ field }">
          <div class="auth-field">
            <label class="auth-label">Cantón</label>
            <NSelect
              class="auth-n-select"
              :options="cantonOptions"
              :loading="isLoadingCantons"
              :disabled="!selectedProvinceId"
              placeholder="Seleccionar"
              filterable
              clearable
              v-bind="fieldInput(field)"
            />
          </div>
        </template>
      </form.Field>
    </div>

    <!-- Checkboxes -->
    <label class="auth-checkbox-row">
      <input type="checkbox" checked required />
      <span>
        Acepto los <a href="#">términos & condiciones</a> y la
        <a href="#">política de privacidad</a>
      </span>
    </label>

    <label class="auth-checkbox-row">
      <input type="checkbox" checked />
      <span>Quiero recibir alertas de nuevos eventos y galerías por WhatsApp</span>
    </label>

    <!-- Submit -->
    <form.Subscribe>
      <template v-slot="{ canSubmit }">
        <button type="submit" class="auth-btn-cta" :disabled="!canSubmit || isSubmitting">
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2.5"
          >
            <path d="M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M19 8v6M22 11h-6" />
          </svg>
          <span v-if="isSubmitting">Creando cuenta…</span>
          <span v-else>Crear cuenta</span>
        </button>
      </template>
    </form.Subscribe>

    <p v-if="loginUrl" class="auth-switch-row">
      ¿Ya tienes cuenta?
      <RouterLink :to="loginUrl">Inicia sesión</RouterLink>
    </p>
  </form>
</template>

<style scoped src="./register-form.css" />
