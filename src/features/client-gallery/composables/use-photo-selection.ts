import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'

const STORAGE_PREFIX = 'preview-selection:'

/**
 * A short fingerprint of the link token for the storage key, so the token itself is never
 * written down. Synchronous on purpose (the selection must be there on the first render);
 * the token is long and random, so the fingerprint does not give it away.
 */
function fingerprint(token: string): string {
  let h1 = 0xdeadbeef
  let h2 = 0x41c6ce57
  for (let index = 0; index < token.length; index += 1) {
    const code = token.charCodeAt(index)
    h1 = Math.imul(h1 ^ code, 2654435761)
    h2 = Math.imul(h2 ^ code, 1597334677)
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909)
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909)
  return (h2 >>> 0).toString(16).padStart(8, '0') + (h1 >>> 0).toString(16).padStart(8, '0')
}

const keyOf = (token: string) => STORAGE_PREFIX + fingerprint(token)

function readStored(token: string): string[] {
  try {
    const raw = sessionStorage.getItem(keyOf(token))
    const ids: unknown = raw ? JSON.parse(raw) : []
    return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === 'string') : []
  } catch {
    return []
  }
}

function writeStored(token: string, ids: string[]) {
  try {
    if (ids.length === 0) sessionStorage.removeItem(keyOf(token))
    else sessionStorage.setItem(keyOf(token), JSON.stringify(ids))
  } catch {
    // Storage blocked (private mode): the selection lives in memory for this visit.
  }
}

export interface IPhotoSelection {
  selected: Readonly<Ref<string[]>>
  isSelected(id: string): boolean
  toggle(id: string): void
  selectAll(): void
  clear(): void
  allSelected: ComputedRef<boolean>
}

/**
 * The photos a buyer picks on a preview link. Kept for the visit (sessionStorage, under a key
 * derived from the token), so leaving to sign in or sign up and coming back finds them again.
 * Restored ids no longer in the preview are dropped.
 */
export function usePhotoSelection(token: Ref<string>, photoIds: Ref<string[]>): IPhotoSelection {
  const selected = ref<string[]>(token.value ? readStored(token.value) : [])

  watch(selected, (ids) => {
    if (token.value) writeStored(token.value, ids)
  })

  watch(
    photoIds,
    (ids) => {
      if (ids.length === 0) return
      const available = new Set(ids)
      const kept = selected.value.filter((id) => available.has(id))
      if (kept.length !== selected.value.length) selected.value = kept
    },
    { immediate: true },
  )

  const chosen = computed(() => new Set(selected.value))

  return {
    selected,
    isSelected: (id) => chosen.value.has(id),
    // Only photos on offer can be chosen (one already bought is shown, not offered).
    toggle: (id) => {
      if (chosen.value.has(id)) selected.value = selected.value.filter((each) => each !== id)
      else if (photoIds.value.includes(id)) selected.value = [...selected.value, id]
    },
    selectAll: () => {
      selected.value = [...photoIds.value]
    },
    clear: () => {
      selected.value = []
      if (token.value) writeStored(token.value, [])
    },
    allSelected: computed(
      () => photoIds.value.length > 0 && photoIds.value.every((id) => chosen.value.has(id)),
    ),
  }
}
