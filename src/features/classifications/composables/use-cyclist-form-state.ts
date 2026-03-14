import { ref, computed } from 'vue'
import { useMessage } from 'naive-ui'

import type { IColorInput, ICreateCyclistRequest } from '../types/requests/create-cyclist.request'
import type { ICyclistDetail } from '../types/responses/cyclist-detail.response'
import { useCreateCyclist } from './mutations/use-create-cyclist'
import { useUpdateCyclist } from './mutations/use-update-cyclist'

export function useCyclistFormState(photoId: string, cyclist?: ICyclistDetail) {
  const message = useMessage()
  const isEditing = !!cyclist

  const plateNumber = ref<number | null>(cyclist?.plateNumber?.number ?? null)
  const colors = ref<IColorInput[]>(
    cyclist?.equipmentColors.map((c) => ({
      itemType: c.itemType,
      colorName: c.colorName,
      colorHex: c.colorHex,
    })) ?? [{ itemType: 'clothing', colorName: '', colorHex: '' }],
  )

  const createMutation = useCreateCyclist()
  const updateMutation = useUpdateCyclist()

  const isSubmitting = computed(
    () => createMutation.isPending.value || updateMutation.isPending.value,
  )

  function addColorRow() {
    colors.value.push({ itemType: 'clothing', colorName: '', colorHex: '' })
  }

  function removeColorRow(index: number) {
    colors.value.splice(index, 1)
  }

  function updateColorRow(index: number, value: IColorInput) {
    colors.value[index] = value
  }

  async function handleSubmit(): Promise<boolean> {
    const validColors = colors.value.filter((c) => c.colorName && c.colorHex)

    if (validColors.length === 0) {
      message.warning('Agrega al menos un color')
      return false
    }

    const data: ICreateCyclistRequest = {
      colors: validColors,
      ...(plateNumber.value ? { plateNumber: plateNumber.value } : {}),
    }

    if (isEditing && cyclist) {
      await updateMutation.mutateAsync({
        cyclistId: cyclist.id,
        photoId,
        data: { plateNumber: plateNumber.value, colors: validColors },
      })
      message.success('Ciclista actualizado')
    } else {
      await createMutation.mutateAsync({ photoId, data })
      message.success('Ciclista agregado')
    }

    return true
  }

  return {
    isEditing,
    plateNumber,
    colors,
    isSubmitting,
    addColorRow,
    removeColorRow,
    updateColorRow,
    handleSubmit,
  }
}
