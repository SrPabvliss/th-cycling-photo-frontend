import { computed, ref, watch, type Ref } from 'vue'
import { useDialog, useMessage } from 'naive-ui'

import { useParticipantDetailQuery } from './queries/use-cyclist-detail'
import { useDeleteParticipant } from './mutations/use-delete-cyclist'
import type { IParticipantListItem } from '../types/responses/cyclist-list.response'

type FormMode = 'closed' | 'creating' | 'loading-edit' | 'editing'

export function useParticipantListState(photoId: Ref<string>) {
  const message = useMessage()
  const dialog = useDialog()
  const deleteMutation = useDeleteParticipant()

  const formMode = ref<FormMode>('closed')
  const editingParticipantId = ref<string | null>(null)

  const { data: editingParticipantDetail, isFetching: isLoadingDetail } =
    useParticipantDetailQuery(editingParticipantId)

  // Transition loading-edit → editing when detail arrives
  watch(editingParticipantDetail, (detail) => {
    if (detail && formMode.value === 'loading-edit') {
      formMode.value = 'editing'
    }
  })

  // Reset form when photo changes
  watch(photoId, () => {
    formMode.value = 'closed'
    editingParticipantId.value = null
  })

  function handleAdd() {
    editingParticipantId.value = null
    formMode.value = 'creating'
  }

  function handleEdit(participant: IParticipantListItem) {
    editingParticipantId.value = participant.id
    formMode.value = 'loading-edit'
  }

  function handleDelete(participant: IParticipantListItem) {
    dialog.warning({
      title: 'Eliminar participante',
      content: `Se eliminará el participante ${participant.identifier ? `#${participant.identifier}` : 'sin identificador'}. Esta acción no se puede deshacer.`,
      positiveText: 'Eliminar',
      negativeText: 'Cancelar',
      onPositiveClick: async () => {
        await deleteMutation.mutateAsync({
          participantId: participant.id,
          photoId: photoId.value,
        })
        message.success('Participante eliminado')
      },
    })
  }

  function closeForm() {
    formMode.value = 'closed'
    editingParticipantId.value = null
  }

  const showForm = computed(() => formMode.value === 'creating' || formMode.value === 'editing')
  const isFormBusy = computed(() => formMode.value !== 'closed')

  return {
    formMode,
    editingParticipantId,
    editingParticipantDetail,
    isLoadingDetail,
    showForm,
    isFormBusy,
    handleAdd,
    handleEdit,
    handleDelete,
    closeForm,
  }
}
