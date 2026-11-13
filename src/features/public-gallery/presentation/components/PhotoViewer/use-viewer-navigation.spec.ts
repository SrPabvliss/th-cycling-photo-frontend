import { describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { useViewerNavigation } from './use-viewer-navigation'

const photo = (id: string) => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 })

function setup(ids: string[], current: string | null, more = false) {
  const photos = ref(ids.map(photo))
  const currentId = ref<string | null>(current)
  const hasNextPage = ref(more)
  const fetchNextPage = vi.fn(async () => {})
  const navigation = useViewerNavigation(photos, currentId, { hasNextPage, fetchNextPage })
  return { photos, currentId, hasNextPage, fetchNextPage, navigation }
}

describe('useViewerNavigation', () => {
  it('moves back and forth in the middle of the list', async () => {
    const { currentId, navigation } = setup(['a', 'b', 'c'], 'b')
    expect(navigation.index.value).toBe(1)
    expect(navigation.hasPrevious.value).toBe(true)
    expect(navigation.hasNext.value).toBe(true)

    await navigation.next()
    expect(currentId.value).toBe('c')

    navigation.previous()
    navigation.previous()
    expect(currentId.value).toBe('a')
  })

  it('has nothing before the first photo, and does not wrap around', () => {
    const { currentId, navigation } = setup(['a', 'b', 'c'], 'a')

    expect(navigation.hasPrevious.value).toBe(false)
    navigation.previous()

    expect(currentId.value).toBe('a')
  })

  it('has nothing after the last photo when there are no more pages', async () => {
    const { currentId, fetchNextPage, navigation } = setup(['a', 'b', 'c'], 'c')

    expect(navigation.hasNext.value).toBe(false)
    await navigation.next()

    expect(currentId.value).toBe('c')
    expect(fetchNextPage).not.toHaveBeenCalled()
  })

  it('asks for the next page at the last loaded photo, and moves on when it arrives', async () => {
    const { photos, currentId, fetchNextPage, navigation } = setup(['a', 'b'], 'b', true)
    fetchNextPage.mockImplementation(async () => {
      photos.value = [...photos.value, photo('c'), photo('d')]
    })
    expect(navigation.hasNext.value).toBe(true)

    await navigation.next()

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    expect(currentId.value).toBe('c')
  })

  it('stays put when the next page brings nothing or fails', async () => {
    const { currentId, fetchNextPage, navigation } = setup(['a', 'b'], 'b', true)

    await navigation.next()
    expect(currentId.value).toBe('b')

    fetchNextPage.mockRejectedValueOnce(new Error('network'))
    await navigation.next()
    expect(currentId.value).toBe('b')
  })

  it('does not ask twice while a page is on its way', async () => {
    const { photos, fetchNextPage, navigation, currentId } = setup(['a'], 'a', true)
    let release: () => void = () => {}
    fetchNextPage.mockImplementation(
      () =>
        new Promise<void>((resolve) => {
          release = () => {
            photos.value = [...photos.value, photo('b')]
            resolve()
          }
        }),
    )

    const first = navigation.next()
    const second = navigation.next()
    release()
    await Promise.all([first, second])

    expect(fetchNextPage).toHaveBeenCalledTimes(1)
    expect(currentId.value).toBe('b')
  })

  it('knows no position for a photo that is not in the list', async () => {
    const { navigation, currentId } = setup(['a', 'b'], 'zzz')

    expect(navigation.index.value).toBe(-1)
    expect(navigation.hasPrevious.value).toBe(false)
    expect(navigation.hasNext.value).toBe(false)

    currentId.value = 'a'
    await nextTick()
    expect(navigation.index.value).toBe(0)
  })
})
