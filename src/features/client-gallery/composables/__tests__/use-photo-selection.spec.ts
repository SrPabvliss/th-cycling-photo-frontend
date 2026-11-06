import { beforeEach, describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import type { IPreviewPhoto } from '../../types/responses/preview-data.response'
import { usePhotoSelection } from '../use-photo-selection'

const photos = (...ids: string[]): IPreviewPhoto[] => ids.map((id) => ({ id, url: `u/${id}` }))

describe('usePhotoSelection with a preview token', () => {
  beforeEach(() => sessionStorage.clear())

  it('brings the selection back after leaving the page (e.g. to sign up)', async () => {
    const first = usePhotoSelection(ref(photos('a', 'b', 'c')), ref('tok-1'))
    first.toggleSelect('a')
    first.toggleSelect('c')
    await nextTick()

    const back = usePhotoSelection(ref(photos('a', 'b', 'c')), ref('tok-1'))
    expect([...back.selectedIds.value]).toEqual(['a', 'c'])
  })

  it('keeps each preview link separate', async () => {
    const one = usePhotoSelection(ref(photos('a')), ref('tok-1'))
    one.toggleSelect('a')
    await nextTick()

    const other = usePhotoSelection(ref(photos('a')), ref('tok-2'))
    expect(other.selectedCount.value).toBe(0)
  })

  it('drops stored photos that are not part of the preview', async () => {
    sessionStorage.setItem('preview-selection:tok-1', JSON.stringify(['a', 'gone']))
    const photosRef = ref<IPreviewPhoto[] | undefined>(undefined)
    const selection = usePhotoSelection(photosRef, ref('tok-1'))

    photosRef.value = photos('a', 'b')
    await nextTick()

    expect([...selection.selectedIds.value]).toEqual(['a'])
  })

  it('forgets the stored selection once the order is placed', async () => {
    const selection = usePhotoSelection(ref(photos('a')), ref('tok-1'))
    selection.toggleSelect('a')
    await nextTick()

    selection.forgetSelection()
    await nextTick()

    expect(sessionStorage.getItem('preview-selection:tok-1')).toBeNull()
    expect(usePhotoSelection(ref(photos('a')), ref('tok-1')).selectedCount.value).toBe(0)
  })
})
