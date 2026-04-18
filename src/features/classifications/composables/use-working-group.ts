import { computed, ref, watch, type Ref } from 'vue'

import type { ISimilarPhoto } from '../types/responses/similar-photo.response'

export function useWorkingGroup(currentPhotoId: Ref<string | null>) {
  const groupPhotos = ref<ISimilarPhoto[]>([])
  const previewPhotoId = ref<string | null>(null)

  const allPhotoIds = computed(() => {
    if (!currentPhotoId.value) return []
    return [currentPhotoId.value, ...groupPhotos.value.map((p) => p.id)]
  })

  const groupSize = computed(() => allPhotoIds.value.length)
  const hasGroup = computed(() => groupSize.value > 1)

  function addToGroup(photo: ISimilarPhoto) {
    if (groupPhotos.value.some((p) => p.id === photo.id)) return
    if (photo.id === currentPhotoId.value) return
    groupPhotos.value.push(photo)
  }

  function removeFromGroup(photoId: string) {
    groupPhotos.value = groupPhotos.value.filter((p) => p.id !== photoId)
    if (previewPhotoId.value === photoId) {
      previewPhotoId.value = null
    }
  }

  function clearGroup() {
    groupPhotos.value = []
  }

  function setPreview(photoId: string | null) {
    previewPhotoId.value = photoId
  }

  // Reset when navigating to a different photo
  watch(currentPhotoId, () => {
    clearGroup()
    previewPhotoId.value = null
  })

  return {
    groupPhotos,
    allPhotoIds,
    groupSize,
    hasGroup,
    previewPhotoId,
    addToGroup,
    removeFromGroup,
    clearGroup,
    setPreview,
  }
}
