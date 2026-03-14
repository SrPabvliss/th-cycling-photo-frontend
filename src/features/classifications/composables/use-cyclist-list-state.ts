import { computed, ref, watch, type Ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'

import { useCyclistDetailQuery } from './queries/use-cyclist-detail'
import { useDeleteCyclist } from './mutations/use-delete-cyclist'
import type { ICyclistListItem } from '../types/responses/cyclist-list.response'

type FormMode = 'closed' | 'creating' | 'loading-edit' | 'editing'

export function useCyclistListState(photoId: Ref<string>) {
  const message = useMessage()
  const dialog = useDialog()
  const deleteMutation = useDeleteCyclist()

  const formMode = ref<FormMode>('closed')
  const editingCyclistId = ref<string | null>(null)

  const { data: editingCyclistDetail, isFetching: isLoadingDetail } =
    useCyclistDetailQuery(editingCyclistId)

  // Transition loading-edit → editing when detail arrives
  watch(editingCyclistDetail, (detail) => {
    if (detail && formMode.value === 'loading-edit') {
      formMode.value = 'editing'
    }
  })

  // Reset form when photo changes
  watch(photoId, () => {
    formMode.value = 'closed'
    editingCyclistId.value = null
  })

  function handleAdd() {
    editingCyclistId.value = null
    formMode.value = 'creating'
  }

  function handleEdit(cyclist: ICyclistListItem) {
    editingCyclistId.value = cyclist.id
    formMode.value = 'loading-edit'
  }

  function handleDelete(cyclist: ICyclistListItem) {
    dialog.warning({
      title: 'Eliminar ciclista',
      content: `Se eliminará el ciclista ${cyclist.plateNumber ? `#${cyclist.plateNumber}` : 'sin dorsal'}. Esta acción no se puede deshacer.`,
      positiveText: 'Eliminar',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        await deleteMutation.mutateAsync({ cyclistId: cyclist.id, photoId: photoId.value })
        message.success('Ciclista eliminado')
      },
    })
  }

  function closeForm() {
    formMode.value = 'closed'
    editingCyclistId.value = null
  }

  const showForm = computed(() => formMode.value === 'creating' || formMode.value === 'editing')
  const isFormBusy = computed(() => formMode.value !== 'closed')

  return {
    formMode,
    editingCyclistId,
    editingCyclistDetail,
    isLoadingDetail,
    showForm,
    isFormBusy,
    handleAdd,
    handleEdit,
    handleDelete,
    closeForm,
  }
}
