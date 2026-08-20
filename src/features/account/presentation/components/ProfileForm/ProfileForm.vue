<script setup lang="ts">
import { computed } from 'vue'
import { NButton, NCard, NFormItem, NGrid, NGridItem, NInput, NSelect } from 'naive-ui'

import { fieldInput, fieldStatus } from '@/shared/utils/form.utils'
import { isValidCalendarDate } from '@/shared/utils/date.utils'
import { useBirthDateFields } from '@/features/auth/composables/use-birth-date-fields'
import { GENDER_OPTIONS, MONTH_OPTIONS } from '@/features/auth/constants/register-form.options'
import type { Gender } from '@/features/auth/types/requests/register.request'
import { profileFieldValidators as v } from '../../../constants/profile-form.schema'
import { useProfileForm } from '@/features/account/composables/use-profile-form'
import { useLocationCascade } from '@/features/account/composables/use-location-cascade'
import type { IMyProfile } from '../../../types/responses/my-profile.response'

const props = defineProps<{
  profile: IMyProfile
}>()

const profileRef = computed(() => props.profile)

const { form, hasChanges, isSaving } = useProfileForm(profileRef)

const {
  countryOptions,
  provinceOptions,
  cantonOptions,
  isLoadingProvinces,
  isLoadingCantons,
  hasRegions,
  selectedProvinceId,
  onCountryChange,
  onProvinceChange,
} = useLocationCascade(form)

const selectedBirthYear = form.useStore((s) => s.values.birthYear)
const selectedBirthMonth = form.useStore((s) => s.values.birthMonth)
const selectedBirthDay = form.useStore((s) => s.values.birthDay)

const { yearOptions, dayOptions } = useBirthDateFields({
  year: selectedBirthYear,
  month: selectedBirthMonth,
  day: selectedBirthDay,
  onInvalidDay: () => form.setFieldValue('birthDay', null),
})

function validateBirthDateFields(): string | undefined {
  const day = form.getFieldValue('birthDay')
  const month = form.getFieldValue('birthMonth')
  const year = form.getFieldValue('birthYear')
  const filledCount = [day, month, year].filter((value) => value != null).length

  if (filledCount === 0) return undefined
  if (filledCount < 3) return 'Completa la fecha de nacimiento o déjala vacía'
  if (!isValidCalendarDate(year!, month!, day!)) return 'Fecha inválida'
  return undefined
}
</script>

<template>
  <form
    class="profile-form"
    @submit="
      (e) => {
        e.preventDefault()
        e.stopPropagation()
        form.handleSubmit()
      }
    "
  >
    <NCard title="Datos personales" class="profile-form__card">
      <div class="profile-form__row">
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

      <NFormItem label="Correo">
        <NInput :value="profile.email" disabled />
      </NFormItem>
    </NCard>

    <NCard title="Ubicación" class="profile-form__card">
      <form.Field name="countryId" :validators="{ onSubmit: v.countryId }">
        <template v-slot="{ field }">
          <NFormItem label="País" required v-bind="fieldStatus(field)">
            <NSelect
              :options="countryOptions"
              placeholder="Seleccionar país"
              filterable
              :value="field.state.value"
              @update:value="(val: number | null) => onCountryChange(field, val)"
              @blur="field.handleBlur"
            />
          </NFormItem>
        </template>
      </form.Field>

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
                  @update:value="(val: number | null) => onProvinceChange(field, val)"
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
    </NCard>

    <NCard title="Nacimiento y género" class="profile-form__card">
      <div class="profile-form__row profile-form__row--3">
        <form.Field name="birthDay" :validators="{ onSubmit: validateBirthDateFields }">
          <template v-slot="{ field }">
            <NFormItem label="Día" v-bind="fieldStatus(field)">
              <NSelect
                :options="dayOptions"
                placeholder="Día"
                clearable
                :value="field.state.value"
                @update:value="(val: number | null) => field.handleChange(val)"
                @blur="field.handleBlur"
              />
            </NFormItem>
          </template>
        </form.Field>
        <form.Field name="birthMonth">
          <template v-slot="{ field }">
            <NFormItem label="Mes" v-bind="fieldStatus(field)">
              <NSelect
                :options="MONTH_OPTIONS"
                placeholder="Mes"
                clearable
                :value="field.state.value"
                @update:value="(val: number | null) => field.handleChange(val)"
                @blur="field.handleBlur"
              />
            </NFormItem>
          </template>
        </form.Field>
        <form.Field name="birthYear">
          <template v-slot="{ field }">
            <NFormItem label="Año" v-bind="fieldStatus(field)">
              <NSelect
                :options="yearOptions"
                placeholder="Año"
                filterable
                clearable
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
    </NCard>

    <div v-if="hasChanges" class="profile-form__submit-bar">
      <form.Subscribe>
        <template v-slot="{ canSubmit }">
          <NButton
            type="primary"
            size="large"
            :loading="isSaving"
            :disabled="!canSubmit"
            attr-type="submit"
            class="profile-form__submit"
          >
            Guardar cambios
          </NButton>
        </template>
      </form.Subscribe>
    </div>
  </form>
</template>

<style scoped src="./profile-form.css"></style>
