import { computed, ref, watch, type Ref } from 'vue'
import { useForm } from '@tanstack/vue-form'
import { useMessage } from 'naive-ui'

import { PROFILE_FORM_DEFAULTS, type IProfileFormData } from '../constants/profile-form.schema'
import { decomposeBirthDate } from '../utils/birth-date.utils'
import { buildUpdatePayload, hasUnsavedChanges } from '../utils/profile-payload.utils'
import { useUpdateProfile } from './mutations/use-update-profile'
import type { IMyProfile } from '../types/responses/my-profile.response'

function toFormData(profile: IMyProfile): IProfileFormData {
  const { birthDay, birthMonth, birthYear } = decomposeBirthDate(profile.birthDate)
  return {
    firstName: profile.firstName ?? PROFILE_FORM_DEFAULTS.firstName,
    lastName: profile.lastName ?? PROFILE_FORM_DEFAULTS.lastName,
    countryId: profile.countryId,
    provinceId: profile.provinceId,
    cantonId: profile.cantonId,
    birthDay,
    birthMonth,
    birthYear,
    gender: profile.gender,
  }
}

export function useProfileForm(profile: Ref<IMyProfile>) {
  const message = useMessage()
  const updateProfile = useUpdateProfile()

  const initialFormData = ref<IProfileFormData>(toFormData(profile.value))

  const form = useForm({
    defaultValues: initialFormData.value,
    onSubmit: async ({ value }) => {
      const payload = buildUpdatePayload(initialFormData.value, value)
      await updateProfile.mutateAsync(payload)
      initialFormData.value = value
      form.reset(value)
      message.success('Perfil actualizado')
    },
  })

  watch(profile, (nextProfile) => {
    if (hasUnsavedChanges(initialFormData.value, form.state.values)) return
    const nextFormData = toFormData(nextProfile)
    initialFormData.value = nextFormData
    form.reset(nextFormData)
  })

  const currentFormValues = form.useStore((s) => s.values)
  const hasChanges = computed(() =>
    hasUnsavedChanges(initialFormData.value, currentFormValues.value),
  )

  return {
    form,
    hasChanges,
    isSaving: updateProfile.isPending,
  }
}

export type IProfileFormInstance = ReturnType<typeof useProfileForm>['form']
