import { describe, expect, it, vi, beforeEach } from 'vitest'
import { computed, nextTick, ref } from 'vue'

import { useReviewWorkspaceCore } from './use-workspace-core'
import type { IReviewQueueSource } from '../types/workspace-queue-source.types'
import type { IWorkspaceQueueItem } from '../types/workspace-queue-item.types'

vi.mock('@/shared/composables/use-photo-detail-by-slug', () => ({
  usePhotoDetailBySlugQuery: vi.fn(() => ({
    data: ref(null),
    isPending: ref(false),
  })),
}))

vi.mock('./use-mark-photo-reviewed', () => ({
  useMarkPhotoReviewed: vi.fn(() => ({
    mutate: vi.fn(),
  })),
}))

function makeItem(slug: string): IWorkspaceQueueItem {
  return {
    id: `id-${slug}`,
    publicSlug: slug,
    filename: `${slug}.jpg`,
    thumbnailUrl: null,
    status: 'pending',
    reviewedAt: null,
    minBibConfidence: null,
    bibsCount: 0,
    colorsCount: 0,
  }
}

function makeSource(initial: IWorkspaceQueueItem[] = []) {
  const items = ref<IWorkspaceQueueItem[]>(initial)
  const hasNextPage = ref(false)
  const source: IReviewQueueSource = {
    items: computed(() => items.value),
    totalCount: computed(() => items.value.length),
    isPending: computed(() => false),
    hasNextPage: computed(() => hasNextPage.value),
    isFetchingNextPage: computed(() => false),
    fetchNextPage: vi.fn(),
    refetch: vi.fn().mockResolvedValue(undefined),
  }
  return { source, items, hasNextPage }
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('useReviewWorkspaceCore', () => {
  it('auto-selects first item when no slug is set', async () => {
    const { source } = makeSource([makeItem('a'), makeItem('b'), makeItem('c')])
    const core = useReviewWorkspaceCore(source)
    await nextTick()
    expect(core.currentSlug.value).toBe('a')
  })

  it('recovers to item at the same last-known index when current slug is removed mid-session', async () => {
    const { source, items } = makeSource([
      makeItem('a'),
      makeItem('b'),
      makeItem('c'),
      makeItem('d'),
    ])
    const core = useReviewWorkspaceCore(source, { initialSlug: 'b' })
    await nextTick()
    expect(core.currentSlug.value).toBe('b')
    expect(core.currentIndex.value).toBe(1)

    // Remove 'b' (the current slug) — same index 1 should now point to 'c'
    items.value = [makeItem('a'), makeItem('c'), makeItem('d')]
    await nextTick()

    expect(core.currentSlug.value).toBe('c')
  })

  it('falls back to last item when removed slug was the tail', async () => {
    const { source, items } = makeSource([makeItem('a'), makeItem('b'), makeItem('c')])
    const core = useReviewWorkspaceCore(source, { initialSlug: 'c' })
    await nextTick()
    expect(core.currentIndex.value).toBe(2)

    items.value = [makeItem('a'), makeItem('b')]
    await nextTick()

    expect(core.currentSlug.value).toBe('b')
  })

  it('clears slug when queue empties', async () => {
    const { source, items } = makeSource([makeItem('a')])
    const core = useReviewWorkspaceCore(source, { initialSlug: 'a' })
    await nextTick()
    expect(core.currentSlug.value).toBe('a')

    items.value = []
    await nextTick()

    expect(core.currentSlug.value).toBeNull()
  })

  it('does NOT auto-advance in edit-one mode when current item disappears', async () => {
    const { source, items } = makeSource([makeItem('a'), makeItem('b'), makeItem('c')])
    const core = useReviewWorkspaceCore(source, {
      initialSlug: 'b',
      mode: 'edit-one',
    })
    await nextTick()
    expect(core.currentSlug.value).toBe('b')

    items.value = [makeItem('a'), makeItem('c')]
    await nextTick()

    expect(core.currentSlug.value).toBeNull()
  })

  it('hasNext returns false when current slug is orphan and no more pages', async () => {
    const { source, items } = makeSource([makeItem('a'), makeItem('b')])
    const core = useReviewWorkspaceCore(source, { initialSlug: 'b' })
    await nextTick()

    // Simulate orphan: keep slug pointing at removed 'b' by clearing list to one item
    // but with current behavior the watch should re-target.  When we set items to a list
    // that does not contain 'b' and currentSlug stays 'b' transiently, hasNext must not lie.
    items.value = [makeItem('a')]
    await nextTick()

    // After the fix, the watch reassigns currentSlug to 'a' (last index fallback) and hasNext = false.
    expect(core.currentSlug.value).toBe('a')
    expect(core.hasNext.value).toBe(false)
  })
})
