import { computed, nextTick, type ComputedRef, type Ref } from 'vue'

interface IViewerPhoto {
  id: string
}

export interface IViewerNavigationOptions {
  /** There are photos the list has not loaded yet. */
  hasNextPage: Ref<boolean>
  fetchNextPage: () => Promise<unknown>
}

export interface IViewerNavigation {
  /** Position of the current photo in the list; -1 when it is not in it. */
  index: ComputedRef<number>
  hasPrevious: ComputedRef<boolean>
  /** True at the last loaded photo too, while there are more pages to ask for. */
  hasNext: ComputedRef<boolean>
  previous(): void
  next(): Promise<void>
}

/**
 * Moves through the list the viewer was opened from: every photo of the event, or the results of
 * a plate search. It does not wrap around. At the last loaded photo, "next" asks for the next
 * page and moves on when it arrives.
 */
export function useViewerNavigation<T extends IViewerPhoto>(
  photos: Ref<T[]>,
  currentId: Ref<string | null>,
  options: IViewerNavigationOptions,
): IViewerNavigation {
  const index = computed(() => photos.value.findIndex((photo) => photo.id === currentId.value))
  const isLast = computed(() => index.value === photos.value.length - 1)

  const hasPrevious = computed(() => index.value > 0)
  const hasNext = computed(() => index.value !== -1 && (!isLast.value || options.hasNextPage.value))

  let pendingPage: Promise<void> | null = null

  function goTo(position: number) {
    const target = photos.value[position]
    if (target) currentId.value = target.id
  }

  function previous() {
    if (hasPrevious.value) goTo(index.value - 1)
  }

  async function next() {
    if (!hasNext.value) return
    if (!isLast.value) return goTo(index.value + 1)

    // One request however many times "next" is pressed while it is on its way.
    const from = index.value
    pendingPage ??= options
      .fetchNextPage()
      .then(
        () => nextTick(),
        () => {},
      )
      .finally(() => {
        pendingPage = null
      })
    await pendingPage

    if (index.value === from) goTo(from + 1)
  }

  return { index, hasPrevious, hasNext, previous, next }
}
