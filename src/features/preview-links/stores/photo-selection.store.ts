import { defineStore } from 'pinia'
import { computed, ref } from 'vue'

export interface ISelectedPhoto {
  id: string
  thumbnailUrl: string
}

export const usePhotoSelectionStore = defineStore('photo-selection', () => {
  const selectedPhotos = ref<Map<string, ISelectedPhoto>>(new Map())
  const isSelectionMode = ref(false)

  const selectedCount = computed(() => selectedPhotos.value.size)
  const hasSelection = computed(() => selectedPhotos.value.size > 0)
  const selectedArray = computed(() => Array.from(selectedPhotos.value.values()))
  const selectedIds = computed(() => Array.from(selectedPhotos.value.keys()))

  function togglePhoto(photo: ISelectedPhoto) {
    const next = new Map(selectedPhotos.value)
    if (next.has(photo.id)) {
      next.delete(photo.id)
    } else {
      next.set(photo.id, photo)
    }
    selectedPhotos.value = next
  }

  function selectPhotos(photos: ISelectedPhoto[]) {
    const next = new Map(selectedPhotos.value)
    for (const photo of photos) {
      next.set(photo.id, photo)
    }
    selectedPhotos.value = next
  }

  function deselectPhotos(ids: string[]) {
    const next = new Map(selectedPhotos.value)
    for (const id of ids) {
      next.delete(id)
    }
    selectedPhotos.value = next
  }

  function isSelected(id: string): boolean {
    return selectedPhotos.value.has(id)
  }

  function selectAll(photos: ISelectedPhoto[]) {
    selectedPhotos.value = new Map(photos.map((p) => [p.id, p]))
  }

  function enterSelectionMode() {
    isSelectionMode.value = true
  }

  function exitSelectionMode() {
    isSelectionMode.value = false
    selectedPhotos.value = new Map()
  }

  function clear() {
    selectedPhotos.value = new Map()
  }

  return {
    selectedPhotos,
    isSelectionMode,
    selectedCount,
    hasSelection,
    selectedArray,
    selectedIds,
    togglePhoto,
    selectPhotos,
    deselectPhotos,
    isSelected,
    selectAll,
    enterSelectionMode,
    exitSelectionMode,
    clear,
  }
})
