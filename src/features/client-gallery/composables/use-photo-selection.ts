import { ref, computed, type Ref } from 'vue'

import type { IPreviewPhoto } from '../types/responses/preview-data.response'

export function usePhotoSelection(photos: Ref<IPreviewPhoto[] | undefined>) {
  const selectedIds = ref<Set<string>>(new Set())

  const selectedCount = computed(() => selectedIds.value.size)

  const selectedPhotos = computed<IPreviewPhoto[]>(
    () => photos.value?.filter((p) => selectedIds.value.has(p.id)) ?? [],
  )

  const allSelected = computed(
    () => (photos.value?.length ?? 0) > 0 && selectedCount.value === photos.value!.length,
  )

  function selectAll() {
    selectedIds.value = new Set(photos.value?.map((p) => p.id) ?? [])
  }

  function clearSelection() {
    selectedIds.value = new Set()
  }

  function toggleSelect(id: string) {
    const next = new Set(selectedIds.value)
    if (next.has(id)) {
      next.delete(id)
    } else {
      next.add(id)
    }
    selectedIds.value = next
  }

  function removeFromSelection(id: string) {
    const next = new Set(selectedIds.value)
    next.delete(id)
    selectedIds.value = next
  }

  return {
    selectedIds,
    selectedCount,
    selectedPhotos,
    allSelected,
    selectAll,
    clearSelection,
    toggleSelect,
    removeFromSelection,
  }
}
