import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useMessage } from 'naive-ui'

import { useEventDetailQuery } from '@/features/events/composables/queries/use-event-detail'
import { usePhotoDetailQuery } from '@/features/photos/composables/queries/use-photo-detail'
import type { ISimilarPhoto } from '../types/responses/similar-photo.response'
import { classifyBreadcrumbs } from '../constants/classification-breadcrumbs'
import { useWorkspaceNavigation } from './use-workspace-navigation'
import { useKeyboardNavigation } from './use-keyboard-navigation'
import { useClassifyPhoto } from './mutations/use-classify-photo'
import { useWorkingGroup } from './use-working-group'
import { useLabelConflict } from './use-label-conflict'

export function useClassificationWorkspace() {
  const route = useRoute()
  const message = useMessage()
  const eventId = computed(() => route.params.eventId as string)

  // Classified filter
  const showOnlyUnclassified = ref(false)
  const classifiedFilter = computed<boolean | undefined>(() =>
    showOnlyUnclassified.value ? false : undefined,
  )

  // Event detail
  const {
    data: event,
    isPending: isEventPending,
    isError: isEventError,
  } = useEventDetailQuery(eventId)

  // Workspace navigation with resume + filter
  const {
    currentPhotoId,
    progress,
    hasNext,
    hasPrev,
    isLoadingPhotos,
    resumeData,
    goNext,
    goPrev,
  } = useWorkspaceNavigation(eventId, classifiedFilter)

  // Current photo detail
  const currentPhotoIdRef = computed(() => currentPhotoId.value ?? '')
  const { data: photo, isPending: isPhotoPending } = usePhotoDetailQuery(currentPhotoIdRef)

  // Working group
  const workingGroup = useWorkingGroup(computed(() => currentPhotoId.value ?? null))

  // Label conflict
  const labelConflict = useLabelConflict()

  // Preview: resolve storageKey for previewed photo
  const previewStorageKey = computed(() => {
    if (!workingGroup.previewPhotoId.value) return null
    const found = workingGroup.groupPhotos.value.find(
      (p) => p.id === workingGroup.previewPhotoId.value,
    )
    return found?.storageKey ?? null
  })

  // Handlers
  function handleAddToGroup(similarPhoto: ISimilarPhoto) {
    const currentLabels = labelConflict.inheritedLabels.value
    labelConflict.handleAddWithConflictCheck(similarPhoto, currentLabels, workingGroup.addToGroup)
  }

  function handleBulkClassifyDone() {
    workingGroup.clearGroup()
    labelConflict.clearInheritedLabels()
    if (hasNext.value) goNext()
  }

  function handleBulkClassifyCancel() {
    workingGroup.clearGroup()
    labelConflict.clearInheritedLabels()
  }

  // Preview modal state
  const previewModalPhoto = ref<ISimilarPhoto | null>(null)
  const showPreviewModal = computed({
    get: () => previewModalPhoto.value !== null,
    set: (v: boolean) => {
      if (!v) previewModalPhoto.value = null
    },
  })

  function handlePreviewSimilar(photo: ISimilarPhoto) {
    previewModalPhoto.value = photo
  }

  function handlePreviewAdd() {
    if (previewModalPhoto.value) {
      handleAddToGroup(previewModalPhoto.value)
    }
    previewModalPhoto.value = null
  }

  // Classify mutation (single photo flow)
  const classifyMutation = useClassifyPhoto()

  function classifyAndAdvance() {
    if (!photo.value || !currentPhotoId.value) return
    if (workingGroup.hasGroup.value) return // bulk mode handles this

    if (photo.value.classifiedAt) {
      if (hasNext.value) goNext()
      return
    }

    if (photo.value.detectedCyclists.length === 0) return

    classifyMutation.mutate(
      { photoId: currentPhotoId.value, eventId: eventId.value },
      {
        onSuccess: () => {
          message.success('Foto clasificada')
          if (hasNext.value) goNext()
        },
        onError: () => {
          message.error('Error al clasificar la foto')
        },
      },
    )
  }

  // Keyboard shortcuts
  useKeyboardNavigation(goNext, goPrev, classifyAndAdvance)

  // Resume toast
  watch(
    resumeData,
    (data) => {
      if (!data) return
      if (data.photoId) {
        message.info('Retomando donde lo dejaste')
      } else {
        message.success('Todas las fotos están clasificadas')
      }
    },
    { once: true },
  )

  // Derived
  const breadcrumbs = computed(() =>
    classifyBreadcrumbs(eventId.value, event.value?.name ?? 'Cargando...'),
  )
  const isLoading = computed(() => isEventPending.value || isLoadingPhotos.value)

  return {
    eventId,
    event,
    isLoading,
    isEventError,
    photo,
    isPhotoPending,
    currentPhotoId,
    progress,
    hasNext,
    hasPrev,
    showOnlyUnclassified,
    breadcrumbs,
    goNext,
    goPrev,
    // Working group
    workingGroup,
    // Label conflict
    labelConflict,
    // Preview
    previewStorageKey,
    previewModalPhoto,
    showPreviewModal,
    handlePreviewSimilar,
    handlePreviewAdd,
    // Handlers
    handleAddToGroup,
    handleBulkClassifyDone,
    handleBulkClassifyCancel,
  }
}
