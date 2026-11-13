import { computed, type ComputedRef } from 'vue'
import { useRoute, useRouter } from 'vue-router'

/** Query parameter that holds the photo open in the viewer. */
export const PHOTO_QUERY = 'foto'

export interface IGalleryViewer {
  /** Id of the photo open in the viewer; null when it is closed. */
  photoId: ComputedRef<string | null>
  open(photoId: string): void
  /** Moves the viewer, already open, to another photo. */
  show(photoId: string): void
  close(): void
}

/**
 * The photo open in the viewer lives in the url (`?foto=`). Opening adds a step to the history,
 * so the back button of the phone closes the viewer instead of leaving the gallery; moving
 * between photos replaces that step, so going back never walks through every photo seen.
 */
export function useGalleryViewer(): IGalleryViewer {
  const route = useRoute()
  const router = useRouter()

  const photoId = computed(() => {
    const value = route.query[PHOTO_QUERY]
    return typeof value === 'string' && value ? value : null
  })

  // Whether the step in the history is ours to take back.
  let openedHere = false

  function open(id: string) {
    openedHere = true
    router.push({ query: { ...route.query, [PHOTO_QUERY]: id } })
  }

  function show(id: string) {
    router.replace({ query: { ...route.query, [PHOTO_QUERY]: id } })
  }

  function close() {
    if (openedHere) {
      openedHere = false
      return router.back()
    }

    // Opened straight from a link: there is no step of ours behind, so the url is cleaned in place.
    const query = { ...route.query }
    delete query[PHOTO_QUERY]
    router.replace({ query })
  }

  return { photoId, open, show, close }
}
