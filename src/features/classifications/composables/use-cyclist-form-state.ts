import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'

import type {
  IGearColorInput,
  ICreateParticipantRequest,
} from '../types/requests/create-cyclist.request'
import type { IParticipantDetail } from '../types/responses/cyclist-detail.response'
import { useCreateParticipant } from './mutations/use-create-cyclist'
import { useUpdateParticipant } from './mutations/use-update-cyclist'

export function useParticipantFormState(photoId: string, participant?: IParticipantDetail) {
  const message = useMessage()
  const isEditing = !!participant

  const identifier = ref<string | null>(participant?.identifier?.value ?? null)
  const gearColors = ref<IGearColorInput[]>(
    participant?.gearColors.map((c) => ({
      gearTypeId: c.gearTypeId,
      colorName: c.colorName,
      colorHex: c.colorHex,
    })) ?? [{ gearTypeId: 1, colorName: '', colorHex: '' }],
  )

  const createMutation = useCreateParticipant()
  const updateMutation = useUpdateParticipant()

  const isSubmitting = computed(
    () => createMutation.isPending.value || updateMutation.isPending.value,
  )

  function addColorRow() {
    gearColors.value.push({ gearTypeId: 1, colorName: '', colorHex: '' })
  }

  function removeColorRow(index: number) {
    gearColors.value.splice(index, 1)
  }

  function updateColorRow(index: number, value: IGearColorInput) {
    gearColors.value[index] = value
  }

  async function handleSubmit(): Promise<boolean> {
    const validColors = gearColors.value.filter((c) => c.colorName && c.colorHex)

    if (validColors.length === 0) {
      message.warning('Agrega al menos un color')
      return false
    }

    const data: ICreateParticipantRequest = {
      colors: validColors,
      ...(identifier.value ? { identifier: identifier.value } : {}),
    }

    if (isEditing && participant) {
      await updateMutation.mutateAsync({
        participantId: participant.id,
        photoId,
        data: { identifier: identifier.value, colors: validColors },
      })
      message.success('Participante actualizado')
    } else {
      await createMutation.mutateAsync({ photoId, data })
      message.success('Participante agregado')
    }

    return true
  }

  return {
    isEditing,
    identifier,
    gearColors,
    isSubmitting,
    addColorRow,
    removeColorRow,
    updateColorRow,
    handleSubmit,
  }
}
