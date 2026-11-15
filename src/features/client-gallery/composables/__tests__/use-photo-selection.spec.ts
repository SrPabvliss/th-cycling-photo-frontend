import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { nextTick, ref } from 'vue'

import { usePhotoSelection } from '../use-photo-selection'

const TOKEN = 'tok-secreto-123456'

describe('usePhotoSelection', () => {
  beforeEach(() => sessionStorage.clear())
  afterEach(() => vi.restoreAllMocks())

  it('adds and removes photos', () => {
    const selection = usePhotoSelection(ref(TOKEN), ref(['a', 'b', 'c']))

    selection.toggle('a')
    selection.toggle('c')
    expect(selection.selected.value).toEqual(['a', 'c'])
    expect(selection.isSelected('a')).toBe(true)

    selection.toggle('a')
    expect(selection.selected.value).toEqual(['c'])
  })

  it('selects all and clears', () => {
    const selection = usePhotoSelection(ref(TOKEN), ref(['a', 'b']))

    selection.selectAll()
    expect(selection.allSelected.value).toBe(true)
    expect(selection.selected.value).toEqual(['a', 'b'])

    selection.clear()
    expect(selection.selected.value).toEqual([])
    expect(selection.allSelected.value).toBe(false)
  })

  it('brings the selection back for the same link (after signing in)', async () => {
    const first = usePhotoSelection(ref(TOKEN), ref(['a', 'b', 'c']))
    first.toggle('a')
    first.toggle('c')
    await nextTick()

    const back = usePhotoSelection(ref(TOKEN), ref(['a', 'b', 'c']))
    expect(back.selected.value).toEqual(['a', 'c'])
  })

  it('keeps each link separate', async () => {
    usePhotoSelection(ref(TOKEN), ref(['a'])).toggle('a')
    await nextTick()

    expect(usePhotoSelection(ref('otro-token'), ref(['a'])).selected.value).toEqual([])
  })

  it('drops restored photos that are no longer in the preview', async () => {
    const first = usePhotoSelection(ref(TOKEN), ref(['a', 'gone']))
    first.toggle('a')
    first.toggle('gone')
    await nextTick()

    const photoIds = ref<string[]>([])
    const back = usePhotoSelection(ref(TOKEN), photoIds)
    photoIds.value = ['a', 'b']
    await nextTick()

    expect(back.selected.value).toEqual(['a'])
  })

  it('never stores the token in the clear', async () => {
    usePhotoSelection(ref(TOKEN), ref(['a'])).toggle('a')
    await nextTick()

    const keys = Object.keys(sessionStorage)
    expect(keys).toHaveLength(1)
    expect(keys[0]).not.toContain(TOKEN)
    expect(sessionStorage.getItem(keys[0]!)).not.toContain(TOKEN)
  })

  it('works in memory when storage throws', async () => {
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked')
    })
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const selection = usePhotoSelection(ref(TOKEN), ref(['a']))
    selection.toggle('a')
    await nextTick()

    expect(selection.selected.value).toEqual(['a'])
  })
})
