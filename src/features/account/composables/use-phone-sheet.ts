import { computed, reactive, ref } from 'vue'
import { useMessage } from 'naive-ui'

import { useAddPhone } from './mutations/use-add-phone'
import { useUpdatePhone } from './mutations/use-update-phone'
import { useDeletePhone } from './mutations/use-delete-phone'
import { useSetPrimaryPhone } from './mutations/use-set-primary-phone'
import { buildUpdatePhonePayload } from '../utils/phone-payload.utils'
import type { IUserPhone } from '../types/responses/user-phone.response'

interface ISheetState {
  phoneNumber: string
  label: string
  isValid: boolean
  isWhatsapp: boolean
  makePrimary: boolean
}

export function usePhoneSheet() {
  const message = useMessage()
  const addPhone = useAddPhone()
  const updatePhone = useUpdatePhone()
  const deletePhone = useDeletePhone()
  const setPrimaryPhone = useSetPrimaryPhone()

  const isSheetOpen = ref(false)
  const isAddMode = ref(false)
  const editingPhone = ref<IUserPhone | null>(null)

  const sheetForm = reactive<ISheetState>({
    phoneNumber: '',
    label: '',
    isValid: true,
    isWhatsapp: true,
    makePrimary: false,
  })

  const sheetTitle = computed(() => (isAddMode.value ? 'Agregar teléfono' : 'Editar teléfono'))

  const showMakePrimary = computed(
    () => !isAddMode.value && editingPhone.value !== null && !editingPhone.value.isPrimary,
  )

  const canSubmitSheet = computed(() =>
    isAddMode.value ? sheetForm.isValid && sheetForm.phoneNumber.length > 0 : true,
  )

  const isSaving = computed(
    () =>
      addPhone.isPending.value || updatePhone.isPending.value || setPrimaryPhone.isPending.value,
  )

  function openEditSheet(phone: IUserPhone) {
    isAddMode.value = false
    editingPhone.value = phone
    sheetForm.phoneNumber = phone.phoneNumber
    sheetForm.label = phone.label ?? ''
    sheetForm.isValid = true
    sheetForm.isWhatsapp = phone.isWhatsapp
    sheetForm.makePrimary = false
    isSheetOpen.value = true
  }

  function openAddSheet() {
    isAddMode.value = true
    editingPhone.value = null
    sheetForm.phoneNumber = ''
    sheetForm.label = ''
    sheetForm.isValid = false
    sheetForm.isWhatsapp = true
    sheetForm.makePrimary = false
    isSheetOpen.value = true
  }

  function closeSheet() {
    isSheetOpen.value = false
  }

  async function submitAdd() {
    if (!canSubmitSheet.value) return

    await addPhone.mutateAsync({
      phoneNumber: sheetForm.phoneNumber,
      label: sheetForm.label.trim() || undefined,
      isWhatsapp: sheetForm.isWhatsapp,
    })
    message.success('Teléfono agregado')
    closeSheet()
  }

  async function submitEdit() {
    const phone = editingPhone.value
    if (!phone) return

    const numberChangedButInvalid =
      !sheetForm.isValid && sheetForm.phoneNumber !== phone.phoneNumber
    const payload = buildUpdatePhonePayload(sheetForm, phone)
    const hasFieldChanges = Object.keys(payload).length > 0
    const shouldSetPrimary = sheetForm.makePrimary && !phone.isPrimary

    if (hasFieldChanges) {
      await updatePhone.mutateAsync({ phoneId: phone.id, payload })
    }

    if (shouldSetPrimary) {
      await setPrimaryPhone.mutateAsync(phone.id)
    }

    if (hasFieldChanges || shouldSetPrimary) {
      message.success('Teléfono actualizado')
    }

    if (numberChangedButInvalid) {
      message.warning('El número de teléfono no es válido, no se actualizó')
    }

    closeSheet()
  }

  function submitSheet() {
    return isAddMode.value ? submitAdd() : submitEdit()
  }

  async function removePhone(phone: IUserPhone) {
    await deletePhone.mutateAsync(phone.id)
    message.success('Teléfono eliminado')
    closeSheet()
  }

  function confirmDelete() {
    if (editingPhone.value) removePhone(editingPhone.value)
  }

  return {
    isSheetOpen,
    isAddMode,
    sheetForm,
    sheetTitle,
    showMakePrimary,
    canSubmitSheet,
    isSaving,
    openEditSheet,
    openAddSheet,
    submitSheet,
    confirmDelete,
  }
}
