import { ref, computed, watch, type Ref } from 'vue'

import type { IPreviewPhoto } from '../types/responses/preview-data.response'

const STORAGE_PREFIX = 'preview-selection:'

function readStored(key: string): Set<string> {
  try {
    const raw = sessionStorage.getItem(STORAGE_PREFIX + key)
    const ids: unknown = raw ? JSON.parse(raw) : []
    return new Set(Array.isArray(ids) ? ids.filter((id) => typeof id === 'string') : [])
  } catch {
    return new Set()
  }
}

function writeStored(key: string, ids: Set<string>) {
  try {
    if (ids.size === 0) sessionStorage.removeItem(STORAGE_PREFIX + key)
    else sessionStorage.setItem(STORAGE_PREFIX + key, JSON.stringify([...ids]))
  } catch {
    // Storage blocked (private mode): the selection just won't survive a reload.
  }
}

/**
 * Photo selection of a preview link. With `storageKey` (the preview token) it is
 * kept in sessionStorage, so a buyer who leaves to sign up comes back to it.
 */
export function usePhotoSelection(
  photos: Ref<IPreviewPhoto[] | undefined>,
  storageKey?: Ref<string>,
) {
  const selectedIds = ref<Set<string>>(storageKey?.value ? readStored(storageKey.value) : new Set())

  if (storageKey) {
    watch(selectedIds, (ids) => {
      if (storageKey.value) writeStored(storageKey.value, ids)
    })

    // Drop stored ids that are not (or no longer) part of this preview.
    watch(
      photos,
      (list) => {
        if (!list) return
        const available = new Set(list.map((p) => p.id))
        const kept = [...selectedIds.value].filter((id) => available.has(id))
        if (kept.length !== selectedIds.value.size) selectedIds.value = new Set(kept)
      },
      { immediate: true },
    )
  }

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

  /** Clears the selection and its stored copy, e.g. once the order is placed. */
  function forgetSelection() {
    selectedIds.value = new Set()
    if (storageKey?.value) writeStored(storageKey.value, new Set())
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
    forgetSelection,
  }
}
