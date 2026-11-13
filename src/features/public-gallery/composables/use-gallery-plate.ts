import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'

import { parsePlate, PLATE_QUERY, plateFromQuery } from '@/shared/utils/plate.utils'

export interface IGalleryPlate {
  /** The plate being searched; null shows every photo. It lives in the url (`?placa=`). */
  plate: ComputedRef<string | null>
  /** What the search field holds; it only becomes the plate when submitted. */
  draft: Ref<string>
  error: Ref<string | null>
  submit(): void
  clear(): void
}

/**
 * Plate search of an event gallery, kept in the url: the home finder arrives with it, a link can
 * be shared with it, and going back returns to it. A plate the url carries but that cannot be a
 * plate (letters, too long) is treated as none. The url is replaced, not pushed.
 */
export function useGalleryPlate(): IGalleryPlate {
  const route = useRoute()
  const router = useRouter()

  const plate = computed(() => plateFromQuery(route.query[PLATE_QUERY]) || null)
  const draft = ref(plate.value ?? '')
  const error = ref<string | null>(null)

  // Back, forward and the links of the screen change the url under the field.
  watch(plate, (current) => {
    draft.value = current ?? ''
  })
  // Sync: the error goes the moment the text changes, not after a submit in the same tick.
  watch(
    draft,
    () => {
      error.value = null
    },
    { flush: 'sync' },
  )

  function clear() {
    draft.value = ''
    if (!(PLATE_QUERY in route.query)) return

    const query = { ...route.query }
    delete query[PLATE_QUERY]
    router.replace({ query })
  }

  function submit() {
    const parsed = parsePlate(draft.value)
    if (parsed.error) {
      error.value = 'Escribe solo el número de tu placa.'
      return
    }
    if (parsed.plate === null) return clear()

    draft.value = parsed.plate
    if (parsed.plate === plate.value) return

    router.replace({ query: { ...route.query, [PLATE_QUERY]: parsed.plate } })
  }

  return { plate, draft, error, submit, clear }
}
