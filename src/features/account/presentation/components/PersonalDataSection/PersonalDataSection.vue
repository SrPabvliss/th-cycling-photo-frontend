<script setup lang="ts">
import { computed, nextTick, ref, watch, type Ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { NButton, useMessage } from 'naive-ui'

import { useBirthDateFields } from '@/features/auth/composables/use-birth-date-fields'
import { GENDER_OPTIONS, MONTH_OPTIONS } from '@/features/auth/constants/register-form.options'
import { registerFieldValidators as v } from '@/features/auth/constants/register-form.schema'
import { useLocationOptions } from '@/features/locations/composables/use-location-options'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import FormField from '@/shared/components/form/FormField/FormField.vue'
import { fieldErrorText, focusFirstInvalid } from '@/shared/utils/form.utils'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useUpdateProfile } from '../../../composables/mutations/use-update-profile'
import type { IProfileFormData } from '../../../constants/profile-form.schema'
import type { IMyProfile, IUserGender } from '../../../types/responses/my-profile.response'
import { decomposeBirthDate } from '../../../utils/birth-date.utils'
import { buildUpdatePayload } from '../../../utils/profile-payload.utils'

const props = defineProps<{
  profile: IMyProfile
}>()

const message = useMessage()
const updateProfile = useUpdateProfile({ silent: true })

function toFormData(profile: IMyProfile): IProfileFormData {
  return {
    firstName: profile.firstName ?? '',
    lastName: profile.lastName ?? '',
    countryId: profile.countryId,
    provinceId: profile.provinceId,
    cantonId: profile.cantonId,
    ...decomposeBirthDate(profile.birthDate),
    gender: profile.gender,
  }
}

const saved = ref<IProfileFormData>(toFormData(props.profile))
const formRef = ref<HTMLFormElement | null>(null)
const submitted = ref(false)
const problem = ref<IFormProblem | null>(null)

const form = useForm({
  defaultValues: saved.value,
  onSubmit: async ({ value }) => {
    problem.value = null
    const next = { ...value, firstName: value.firstName.trim(), lastName: value.lastName.trim() }
    const payload = buildUpdatePayload(saved.value, next)
    if (Object.keys(payload).length === 0) {
      message.success('Guardamos tus cambios.')
      return
    }
    try {
      await updateProfile.mutateAsync(payload)
      saved.value = next
      message.success('Guardamos tus cambios.')
    } catch (error) {
      // What was written stays: only the message is new.
      problem.value = generalProblem(error)
    }
  },
})

const birthDay = form.useStore((state) => state.values.birthDay)
const birthMonth = form.useStore((state) => state.values.birthMonth)
const birthYear = form.useStore((state) => state.values.birthYear)
const { yearOptions, dayOptions } = useBirthDateFields({
  year: birthYear,
  month: birthMonth,
  day: birthDay,
  onInvalidDay: () => form.setFieldValue('birthDay', null),
})

// The date is optional, but not by halves.
function validateDate() {
  const parts = [birthDay.value, birthMonth.value, birthYear.value].filter((part) => part != null)
  return parts.length > 0 && parts.length < 3 ? 'Completa día, mes y año.' : undefined
}

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

// A profile read again elsewhere replaces the form only when nothing is being edited.
watch(
  () => props.profile,
  (profile) => {
    if (Object.keys(buildUpdatePayload(saved.value, form.state.values)).length > 0) return
    saved.value = toFormData(profile)
    form.reset(saved.value)
  },
)

const inputValue = (event: Event) => (event.target as HTMLInputElement).value
const numberOrNull = (event: Event) => {
  const raw = (event.target as HTMLSelectElement).value
  return raw === '' ? null : Number(raw)
}

async function save() {
  if (updateProfile.isPending.value) return
  submitted.value = true
  await form.handleSubmit()
  if (!form.state.isValid) {
    await nextTick()
    focusFirstInvalid(formRef.value)
  }
}
</script>

<template>
  <form ref="formRef" class="personal-data" novalidate @submit.prevent="save">
    <div class="personal-data__row2">
      <form.Field name="firstName" :validators="{ onSubmit: v.firstName }">
        <template #default="{ field }">
          <FormField id="perfil-first" label="Nombre" :error="fieldErrorText(field, submitted)">
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                autocomplete="given-name"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="field.handleChange(inputValue($event))"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
      <form.Field name="lastName" :validators="{ onSubmit: v.lastName }">
        <template #default="{ field }">
          <FormField id="perfil-last" label="Apellido" :error="fieldErrorText(field, submitted)">
            <template #default="{ id, describedby, invalid }">
              <input
                :id="id"
                autocomplete="family-name"
                :aria-describedby="describedby"
                :aria-invalid="invalid"
                :value="field.state.value"
                @input="field.handleChange(inputValue($event))"
              />
            </template>
          </FormField>
        </template>
      </form.Field>
    </div>

    <form.Field name="countryId" :validators="{ onSubmit: v.countryId }">
      <template #default="{ field }">
        <FormField id="perfil-country" label="País" :error="fieldErrorText(field, submitted)">
          <template #default="{ id, describedby, invalid }">
            <select
              :id="id"
              :aria-describedby="describedby"
              :aria-invalid="invalid"
              :value="field.state.value ?? ''"
              @change="
                (event: Event) => {
                  field.handleChange(numberOrNull(event))
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

    <div v-if="hasRegions" class="personal-data__row2">
      <form.Field name="provinceId">
        <template #default="{ field }">
          <FormField id="perfil-province" label="Provincia (opcional)">
            <template #default="{ id }">
              <select
                :id="id"
                :value="field.state.value ?? ''"
                @change="
                  (event: Event) => {
                    field.handleChange(numberOrNull(event))
                    form.setFieldValue('cantonId', null)
                  }
                "
              >
                <option value="">Selecciona</option>
                <option v-for="province in provinces ?? []" :key="province.id" :value="province.id">
                  {{ province.name }}
                </option>
              </select>
            </template>
          </FormField>
        </template>
      </form.Field>
      <form.Field name="cantonId">
        <template #default="{ field }">
          <FormField id="perfil-canton" label="Ciudad (opcional)">
            <template #default="{ id }">
              <select
                :id="id"
                :disabled="!provinceId"
                :value="field.state.value ?? ''"
                @change="field.handleChange(numberOrNull($event))"
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

    <FormAlert
      v-if="hasPlacesProblem"
      data-test="places-problem"
      tone="bad"
      title="No pudimos cargar los países y ciudades"
      text="Puede ser tu conexión."
      :retrying="isRetryingPlaces"
      @retry="retryPlaces()"
    />

    <form.Field name="birthDay" :validators="{ onSubmit: validateDate }">
      <template #default="{ field: dayField }">
        <div class="personal-data__date">
          <span id="perfil-dob-label" class="personal-data__label">Fecha de nacimiento</span>
          <div class="personal-data__row3" role="group" aria-labelledby="perfil-dob-label">
            <select
              id="perfil-bd"
              aria-label="Día de nacimiento"
              :aria-describedby="
                fieldErrorText(dayField, submitted) ? 'perfil-dob-error' : undefined
              "
              :aria-invalid="fieldErrorText(dayField, submitted) ? true : undefined"
              :value="dayField.state.value ?? ''"
              @change="dayField.handleChange(numberOrNull($event))"
            >
              <option value="">Día</option>
              <option v-for="day in dayOptions" :key="day.value" :value="day.value">
                {{ day.label }}
              </option>
            </select>
            <form.Field name="birthMonth">
              <template #default="{ field }">
                <select
                  id="perfil-bm"
                  aria-label="Mes de nacimiento"
                  :value="field.state.value ?? ''"
                  @change="field.handleChange(numberOrNull($event))"
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
                  id="perfil-by"
                  aria-label="Año de nacimiento"
                  :value="field.state.value ?? ''"
                  @change="field.handleChange(numberOrNull($event))"
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
            v-if="fieldErrorText(dayField, submitted)"
            id="perfil-dob-error"
            class="personal-data__error"
          >
            {{ fieldErrorText(dayField, submitted) }}
          </em>
        </div>
      </template>
    </form.Field>

    <form.Field name="gender">
      <template #default="{ field }">
        <FormField id="perfil-gender" label="Género (opcional)">
          <template #default="{ id }">
            <select
              :id="id"
              :value="field.state.value ?? ''"
              @change="
                field.handleChange(
                  (($event.target as HTMLSelectElement).value || null) as IUserGender | null,
                )
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

    <FormAlert v-if="problem" tone="bad" :title="problem.title" :text="problem.text" />

    <NButton
      class="personal-data__save"
      type="primary"
      size="large"
      attr-type="submit"
      :loading="updateProfile.isPending.value"
      :disabled="updateProfile.isPending.value"
      :aria-busy="updateProfile.isPending.value ? 'true' : undefined"
    >
      Guardar cambios
    </NButton>
  </form>
</template>

<style scoped>
.personal-data {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-4);
  font-family: var(--tt-font-sans);
}

.personal-data__row2 {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: var(--tt-space-3);
}

.personal-data__date {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
}

.personal-data__label {
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  font-weight: var(--tt-type-title-weight);
}

.personal-data__row3 {
  display: grid;
  grid-template-columns: 0.8fr 1.3fr 1fr;
  gap: var(--tt-space-2);
}

.personal-data__row3 select {
  inline-size: 100%;
  min-inline-size: 0;
  block-size: var(--tt-control-l);
  padding: 0 var(--tt-space-2);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  font-family: inherit;
  font-size: var(--tt-type-title-size);
}

.personal-data__row3 select[aria-invalid='true'] {
  border-color: var(--tt-danger-ink);
}

.personal-data__error {
  color: var(--tt-danger-ink);
  font-style: normal;
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

@media (min-width: 768px) {
  .personal-data__save {
    align-self: flex-start;
  }
}
</style>
