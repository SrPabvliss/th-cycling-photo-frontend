<script setup lang="ts">
import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton } from 'naive-ui'
import IntlTelInput from 'intl-tel-input/vueWithUtils'
import 'intl-tel-input/styles'
import type { RouteLocationRaw } from 'vue-router'

import { useLocationOptions } from '@/features/locations/composables/use-location-options'
import { LEGAL_PATHS } from '@/features/legal/routes'
import PasswordRules from '@/shared/auth/PasswordRules.vue'
import { DEFAULT_COUNTRY_ISO, PHONE_INPUT_OPTIONS } from '@/shared/constants/phone-input'
import { fieldErrorText, focusFirstInvalid, sendClientForm } from '@/shared/utils/form.utils'
import { findCountryIsoCode } from '@/shared/utils/location.utils'
import { useBirthDateFields } from '../../../composables/use-birth-date-fields'
import { GENDER_OPTIONS, MONTH_OPTIONS } from '../../../constants/register-form.options'
import {
  REGISTER_FORM_DEFAULTS,
  registerFieldValidators as v,
  type IRegisterFormData,
} from '../../../constants/register-form.schema'
import { isMinor } from '../../../utils/age.utils'
import { dialCodeOf, usePhonePrefix } from '../../../utils/phone-prefix'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'

export type RegisterField = keyof IRegisterFormData

const props = defineProps<{
  isSubmitting: boolean
  /** Messages the api gave for a field, shown on it until it is edited. */
  serverErrors?: Partial<Record<RegisterField, string>>
  /** The email already has an account: its field says so and offers to sign in. */
  emailTaken?: boolean
  loginTo: RouteLocationRaw
}>()

const emit = defineEmits<{
  submit: [data: IRegisterFormData]
}>()

const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)

const form = useForm({
  defaultValues: REGISTER_FORM_DEFAULTS,
  onSubmit: ({ value }) => emit('submit', value),
})

// --- Messages from the api: on their field until the buyer edits it ---
const serverShown = ref<Partial<Record<RegisterField, string>>>({})
const emailTakenShown = ref(false)
watch(
  () => [props.serverErrors, props.emailTaken] as const,
  async ([errors, taken]) => {
    serverShown.value = { ...errors }
    emailTakenShown.value = !!taken
    await nextTick()
    focusFirstInvalid(formRef.value)
  },
)

function errorFor(name: RegisterField, field: Parameters<typeof fieldErrorText>[0]) {
  if (name === 'email' && emailTakenShown.value) return 'Ya hay una cuenta con ese correo.'
  return serverShown.value[name] ?? fieldErrorText(field, submitted.value)
}

function change(
  field: { handleChange: (value: never) => void },
  name: RegisterField,
  value: unknown,
) {
  delete serverShown.value[name]
  if (name === 'email') emailTakenShown.value = false
  field.handleChange(value as never)
}

const inputValue = (event: Event) => (event.target as HTMLInputElement).value
const numberOrNull = (event: Event) => {
  const raw = (event.target as HTMLSelectElement).value
  return raw === '' ? null : Number(raw)
}

// --- Birth date and age ---
const birthDay = form.useStore((state) => state.values.birthDay)
const birthMonth = form.useStore((state) => state.values.birthMonth)
const birthYear = form.useStore((state) => state.values.birthYear)
const isMinorRider = computed(() => isMinor(birthYear.value, birthMonth.value, birthDay.value))

watch(isMinorRider, (minor) => {
  if (!minor) form.setFieldValue('guardianConsent', false)
})

const {
  yearOptions,
  dayOptions,
  validate: validateBirthDate,
} = useBirthDateFields({
  year: birthYear,
  month: birthMonth,
  day: birthDay,
  onInvalidDay: () => form.setFieldValue('birthDay', null),
  incompleteMessage: 'Elige día, mes y año.',
})

// --- Where the buyer lives ---
const countryId = form.useStore((state) => state.values.countryId)
const provinceId = form.useStore((state) => state.values.provinceId)
const {
  countries,
  provinces,
  cantons,
  hasProblem: hasPlacesProblem,
  isRetrying: isRetryingPlaces,
  retry: retryPlaces,
} = useLocationOptions(countryId as Ref<number | null>, provinceId as Ref<number | null>)
const hasRegions = computed(() => (provinces.value?.length ?? 0) > 0)

watch(
  countries,
  (list) => {
    if (!list || form.getFieldValue('countryId')) return
    const ecuador = list.find((country) => country.isoCode === DEFAULT_COUNTRY_ISO)
    if (ecuador) form.setFieldValue('countryId', ecuador.id)
  },
  { immediate: true },
)

// --- WhatsApp: the code follows the country until the buyer picks another one ---
const countryIso = computed(() => findCountryIsoCode(countries.value, countryId.value))
const { prefix, following, setByUser } = usePhonePrefix(countryIso)
const phoneInput = ref<{ instance?: { setCountry: (iso2: string) => void } | null } | null>(null)
const isPhoneValid = ref(false)

watch(
  [following, phoneInput],
  ([iso, input]) => {
    if (iso && input) input.instance?.setCountry(iso.toLowerCase())
  },
  { immediate: true },
)

function onPhoneCountry(country: { iso2?: string } | string | undefined) {
  const iso2 = typeof country === 'string' ? country : country?.iso2
  if (!iso2 || iso2 === following.value?.toLowerCase()) return
  const code = dialCodeOf(iso2)
  if (code) setByUser(code)
}

function validatePhone({ value }: { value: string }) {
  if (!value || !value.replace(/\D/g, '')) return 'Escribe tu número de WhatsApp.'
  if (!isPhoneValid.value) return `Ese número no es válido para el código ${prefix.value}.`
  return undefined
}

function validateGuardian({ value }: { value: boolean }) {
  return isMinorRider.value && !value ? 'Marca la autorización para continuar.' : undefined
}

function validateConfirm({ value }: { value: string }) {
  if (!value) return 'Repite tu contraseña.'
  return value !== form.getFieldValue('password') ? 'Las contraseñas no coinciden.' : undefined
}

async function send() {
  if (props.isSubmitting) return
  submitted.value = true
  await sendClientForm(form, formRef.value)
}
</script>

<template>
  <form ref="formRef" class="register-form" novalidate @submit.prevent="send">
    <fieldset class="register-form__group">
      <legend>Tus datos</legend>

      <div class="register-form__row2">
        <form.Field name="firstName" :validators="{ onSubmit: v.firstName }">
          <template #default="{ field }">
            <FormField id="reg-first" label="Nombre" :error="errorFor('firstName', field)">
              <template #default="{ id, describedby, invalid }">
                <input
                  :id="id"
                  autocomplete="given-name"
                  :aria-describedby="describedby"
                  :aria-invalid="invalid"
                  :value="field.state.value"
                  @input="change(field, 'firstName', inputValue($event))"
                  @blur="field.handleBlur"
                />
              </template>
            </FormField>
          </template>
        </form.Field>

        <form.Field name="lastName" :validators="{ onSubmit: v.lastName }">
          <template #default="{ field }">
            <FormField id="reg-last" label="Apellido" :error="errorFor('lastName', field)">
              <template #default="{ id, describedby, invalid }">
                <input
                  :id="id"
                  autocomplete="family-name"
                  :aria-describedby="describedby"
                  :aria-invalid="invalid"
                  :value="field.state.value"
                  @input="change(field, 'lastName', inputValue($event))"
                  @blur="field.handleBlur"
                />
              </template>
            </FormField>
          </template>
        </form.Field>
      </div>

      <form.Field name="birthDay" :validators="{ onSubmit: validateBirthDate }">
        <template #default="{ field: dayField }">
          <div
            class="register-form__date"
            :class="{ 'register-form__date--error': !!errorFor('birthDay', dayField) }"
          >
            <span class="register-form__label" id="reg-dob-label">Fecha de nacimiento</span>
            <div class="register-form__row3" role="group" aria-labelledby="reg-dob-label">
              <select
                id="reg-bd"
                aria-label="Día de nacimiento"
                :aria-describedby="errorFor('birthDay', dayField) ? 'reg-dob-error' : undefined"
                :aria-invalid="errorFor('birthDay', dayField) ? true : undefined"
                :value="dayField.state.value ?? ''"
                @change="change(dayField, 'birthDay', numberOrNull($event))"
              >
                <option value="">Día</option>
                <option v-for="day in dayOptions" :key="day.value" :value="day.value">
                  {{ day.label }}
                </option>
              </select>
              <form.Field name="birthMonth">
                <template #default="{ field }">
                  <select
                    id="reg-bm"
                    aria-label="Mes de nacimiento"
                    :aria-describedby="errorFor('birthDay', dayField) ? 'reg-dob-error' : undefined"
                    :value="field.state.value ?? ''"
                    @change="change(field, 'birthMonth', numberOrNull($event))"
                  >
                    <option value="">Mes</option>
                    <option v-for="month in MONTH_OPTIONS" :key="month.value" :value="month.value">
                      {{ month.label }}
                    </option>
                  </select>
                </template>
              </form.Field>
              <form.Field name="birthYear">
                <template #default="{ field }">
                  <select
                    id="reg-by"
                    aria-label="Año de nacimiento"
                    :aria-describedby="errorFor('birthDay', dayField) ? 'reg-dob-error' : undefined"
                    :value="field.state.value ?? ''"
                    @change="change(field, 'birthYear', numberOrNull($event))"
                  >
                    <option value="">Año</option>
                    <option v-for="year in yearOptions" :key="year.value" :value="year.value">
                      {{ year.label }}
                    </option>
                  </select>
                </template>
              </form.Field>
            </div>
            <em
              v-if="errorFor('birthDay', dayField)"
              id="reg-dob-error"
              class="register-form__error"
            >
              {{ errorFor('birthDay', dayField) }}
            </em>
          </div>
        </template>
      </form.Field>

      <form.Field name="gender">
        <template #default="{ field }">
          <FormField id="reg-gender" label="Género (opcional)">
            <template #default="{ id }">
              <select
                :id="id"
                :value="field.state.value ?? ''"
                @change="
                  change(field, 'gender', ($event.target as HTMLSelectElement).value || null)
                "
              >
                <option value="">Selecciona</option>
                <option v-for="gender in GENDER_OPTIONS" :key="gender.value" :value="gender.value">
                  {{ gender.label }}
                </option>
              </select>
            </template>
          </FormField>
        </template>
      </form.Field>

      <div v-if="isMinorRider" class="register-form__minor">
        <FormAlert
          tone="info"
          title="Eres menor de edad"
          text="Para crear tu cuenta necesitamos que tu madre, padre o representante esté de acuerdo."
        />
        <form.Field name="guardianConsent" :validators="{ onSubmit: validateGuardian }">
          <template #default="{ field }">
            <div class="register-form__check-field">
              <label class="register-form__check">
                <input
                  id="reg-guardian"
                  type="checkbox"
                  :checked="field.state.value"
                  :aria-describedby="
                    errorFor('guardianConsent', field) ? 'reg-guardian-error' : undefined
                  "
                  :aria-invalid="errorFor('guardianConsent', field) ? true : undefined"
                  @change="
                    change(field, 'guardianConsent', ($event.target as HTMLInputElement).checked)
                  "
                />
                <span>Mi representante conoce y acepta que use Titan TV.</span>
              </label>
              <em
                v-if="errorFor('guardianConsent', field)"
                id="reg-guardian-error"
                class="register-form__error"
              >
                {{ errorFor('guardianConsent', field) }}
              </em>
            </div>
          </template>
        </form.Field>
      </div>

      <FormAlert
        v-if="hasPlacesProblem"
        data-test="places-problem"
        tone="bad"
        title="No pudimos cargar los países y ciudades"
        text="Puede ser tu conexión."
        :retrying="isRetryingPlaces"
        @retry="retryPlaces()"
      />
    </fieldset>

    <fieldset class="register-form__group">
      <legend>Dónde te encontramos</legend>

      <form.Field name="countryId" :validators="{ onSubmit: v.countryId }">
        <template #default="{ field }">
          <FormField id="reg-country" label="País" :error="errorFor('countryId', field)">
            <template #default="{ id, describedby, invalid }">
              <select
                :id="id"
                autocomplete="country"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value ?? ''"
                @change="
                  (event: Event) => {
                    change(field, 'countryId', numberOrNull(event))
                    form.setFieldValue('provinceId', null)
                    form.setFieldValue('cantonId', null)
                  }
                "
              >
                <option value="">Elige tu país</option>
                <option v-for="country in countries ?? []" :key="country.id" :value="country.id">
                  {{ country.name }}
                </option>
              </select>
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="phoneNumber" :validators="{ onSubmit: validatePhone }">
        <template #default="{ field }">
          <FormField
            id="reg-phone"
            label="WhatsApp"
            :error="errorFor('phoneNumber', field)"
            hint="Aquí te escribimos por tus pedidos. Si tu número es de otro país, cambia el código."
          >
            <template #default="{ id, describedby, invalid }">
              <div class="register-form__phone tt-phone-input">
                <IntlTelInput
                  ref="phoneInput"
                  :options="{ ...PHONE_INPUT_OPTIONS, allowDropdown: true }"
                  :input-props="{
                    id,
                    autocomplete: 'tel-national',
                    placeholder: '99 123 4567',
                    'aria-describedby': describedby,
                    'aria-invalid': invalid,
                  }"
                  @change-number="(value: string) => change(field, 'phoneNumber', value)"
                  @change-validity="(valid: boolean) => (isPhoneValid = valid)"
                  @change-country="onPhoneCountry"
                />
              </div>
            </template>
          </FormField>
        </template>
      </form.Field>

      <div v-if="hasRegions" class="register-form__row2">
        <form.Field name="provinceId">
          <template #default="{ field }">
            <FormField id="reg-province" label="Provincia (opcional)">
              <template #default="{ id }">
                <select
                  :id="id"
                  :value="field.state.value ?? ''"
                  @change="
                    (event: Event) => {
                      change(field, 'provinceId', numberOrNull(event))
                      form.setFieldValue('cantonId', null)
                    }
                  "
                >
                  <option value="">Selecciona</option>
                  <option
                    v-for="province in provinces ?? []"
                    :key="province.id"
                    :value="province.id"
                  >
                    {{ province.name }}
                  </option>
                </select>
              </template>
            </FormField>
          </template>
        </form.Field>

        <form.Field name="cantonId">
          <template #default="{ field }">
            <FormField id="reg-canton" label="Ciudad (opcional)">
              <template #default="{ id }">
                <select
                  :id="id"
                  :disabled="!provinceId"
                  :value="field.state.value ?? ''"
                  @change="change(field, 'cantonId', numberOrNull($event))"
                >
                  <option value="">Selecciona</option>
                  <option v-for="canton in cantons ?? []" :key="canton.id" :value="canton.id">
                    {{ canton.name }}
                  </option>
                </select>
              </template>
            </FormField>
          </template>
        </form.Field>
      </div>
    </fieldset>

    <fieldset class="register-form__group">
      <legend>Acceso</legend>

      <form.Field name="email" :validators="{ onSubmit: v.email }">
        <template #default="{ field }">
          <FormField id="reg-email" label="Correo electrónico" :error="errorFor('email', field)">
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="email"
                autocomplete="email"
                placeholder="tu@correo.com"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="change(field, 'email', inputValue($event))"
                @blur="field.handleBlur"
              />
            </template>
            <template v-if="emailTakenShown" #error>
              Ya hay una cuenta con ese correo.
              <RouterLink :to="loginTo">Iniciar sesión</RouterLink>
            </template>
          </FormField>
        </template>
      </form.Field>

      <form.Field name="password" :validators="{ onSubmit: v.password }">
        <template #default="{ field }">
          <div class="register-form__password">
            <FormField id="reg-password" label="Contraseña" :error="errorFor('password', field)">
              <template #default="{ id, describedby, invalid }">
                <input
                  :id="id"
                  type="password"
                  autocomplete="new-password"
                  :aria-describedby="describedby"
                  :aria-invalid="invalid"
                  :value="field.state.value"
                  @input="change(field, 'password', inputValue($event))"
                />
              </template>
            </FormField>
            <PasswordRules :value="field.state.value" />
          </div>
        </template>
      </form.Field>

      <form.Field name="confirmPassword" :validators="{ onSubmit: validateConfirm }">
        <template #default="{ field }">
          <FormField
            id="reg-password2"
            label="Confirmar contraseña"
            :error="errorFor('confirmPassword', field)"
          >
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                type="password"
                autocomplete="new-password"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="change(field, 'confirmPassword', inputValue($event))"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </fieldset>

    <form.Field name="acceptedTerms" :validators="{ onSubmit: v.acceptedTerms }">
      <template #default="{ field }">
        <div class="register-form__check-field">
          <label class="register-form__check">
            <input
              id="reg-terms"
              type="checkbox"
              :checked="field.state.value"
              :aria-describedby="errorFor('acceptedTerms', field) ? 'reg-terms-error' : undefined"
              :aria-invalid="errorFor('acceptedTerms', field) ? true : undefined"
              @change="change(field, 'acceptedTerms', ($event.target as HTMLInputElement).checked)"
            />
            <span>
              He leído y acepto la
              <RouterLink :to="LEGAL_PATHS.PRIVACY" target="_blank"
                >Política de Privacidad</RouterLink
              >
              y los
              <RouterLink :to="LEGAL_PATHS.TERMS" target="_blank">Términos y Condiciones</RouterLink
              >, incluido el envío de mensajes por WhatsApp sobre mis pedidos.
            </span>
          </label>
          <em
            v-if="errorFor('acceptedTerms', field)"
            id="reg-terms-error"
            class="register-form__error"
          >
            {{ errorFor('acceptedTerms', field) }}
          </em>
        </div>
      </template>
    </form.Field>

    <slot name="problem" />

    <NButton
      type="primary"
      size="large"
      block
      attr-type="submit"
      :loading="isSubmitting"
      :disabled="isSubmitting"
      :aria-busy="isSubmitting ? 'true' : undefined"
    >
      Crear cuenta
    </NButton>
  </form>
</template>

<style scoped src="./register-form.css"></style>
