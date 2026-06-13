import { ref, type Ref } from 'vue'

import type { ILightboxPhoto } from '@/shared/types/lightbox-photo'

/**
 * Local state for opening the PhotoLightbox from a grid. Destructure the refs
 * so the template binds them directly:
 *
 *   const { photos, index, show, open } = useLightbox<ICartPhoto>()
 */
export function useLightbox<T extends ILightboxPhoto>() {
  const photos = ref<T[]>([]) as Ref<T[]>
  const index = ref(0)
  const show = ref(false)

  function open(items: T[], at: number) {
    photos.value = items
    index.value = at
    show.value = true
  }

  return { photos, index, show, open }
}
