import { ref } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import type { IColorInput } from '../types/requests/create-cyclist.request'
import type { ISimilarPhoto } from '../types/responses/similar-photo.response'
import type { IApiCyclistListItem } from '../types/responses/cyclist-list.response'
import { toCyclistListItems } from '../mappers/cyclist-list.mapper'

export interface ILabelSet {
  plateNumber: number | null
  colors: IColorInput[]
}

export function useLabelConflict() {
  const showInheritModal = ref(false)
  const showConflictModal = ref(false)
  const pendingPhoto = ref<ISimilarPhoto | null>(null)
  const existingLabels = ref<ILabelSet | null>(null)
  const incomingLabels = ref<ILabelSet | null>(null)
  const inheritedLabels = ref<ILabelSet | null>(null)

  async function fetchCyclistLabels(photoId: string): Promise<ILabelSet | null> {
    try {
      const response = await httpClient.get<IApiCyclistListItem[]>(
        API_ROUTES.PHOTOS.CYCLISTS_BY_PHOTO(photoId),
      )
      const cyclists = toCyclistListItems(response.data)
      const first = cyclists[0]
      if (!first) return null
      return {
        plateNumber: first.plateNumber,
        colors: [],
      }
    } catch {
      return null
    }
  }

  async function handleAddWithConflictCheck(
    photo: ISimilarPhoto,
    currentLabels: ILabelSet | null,
    addToGroup: (photo: ISimilarPhoto) => void,
  ) {
    if (!photo.hasClassifications) {
      addToGroup(photo)
      return
    }

    const photoLabels = await fetchCyclistLabels(photo.id)
    if (!photoLabels) {
      addToGroup(photo)
      return
    }

    pendingPhoto.value = photo
    incomingLabels.value = photoLabels

    if (!currentLabels) {
      // No labels in current group — offer to inherit
      showInheritModal.value = true
    } else if (currentLabels.plateNumber !== photoLabels.plateNumber) {
      // Different labels — show conflict resolution
      existingLabels.value = currentLabels
      showConflictModal.value = true
    } else {
      // Same labels — just add
      addToGroup(photo)
    }
  }

  function resolveInherit(accept: boolean, addToGroup: (photo: ISimilarPhoto) => void) {
    if (accept && incomingLabels.value) {
      inheritedLabels.value = incomingLabels.value
    }
    if (pendingPhoto.value) {
      addToGroup(pendingPhoto.value)
    }
    showInheritModal.value = false
    pendingPhoto.value = null
  }

  function resolveConflict(
    winner: 'existing' | 'incoming',
    addToGroup: (photo: ISimilarPhoto) => void,
  ) {
    inheritedLabels.value = winner === 'existing' ? existingLabels.value : incomingLabels.value
    if (pendingPhoto.value) {
      addToGroup(pendingPhoto.value)
    }
    showConflictModal.value = false
    pendingPhoto.value = null
    existingLabels.value = null
  }

  function clearInheritedLabels() {
    inheritedLabels.value = null
  }

  return {
    showInheritModal,
    showConflictModal,
    pendingPhoto,
    existingLabels,
    incomingLabels,
    inheritedLabels,
    handleAddWithConflictCheck,
    resolveInherit,
    resolveConflict,
    clearInheritedLabels,
  }
}
