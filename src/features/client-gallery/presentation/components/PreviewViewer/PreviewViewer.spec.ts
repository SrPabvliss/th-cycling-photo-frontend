import { afterEach, describe, expect, it } from 'vitest'
import { DOMWrapper, flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'

import { usePhotoSelection } from '../../../composables/use-photo-selection'
import PreviewViewer from './PreviewViewer.vue'

const PHOTOS = [
  { id: 'a', url: 'u/a' },
  { id: 'b', url: 'u/b' },
]

let wrapper: VueWrapper | null = null
afterEach(() => {
  wrapper?.unmount()
  wrapper = null
  document.body.innerHTML = ''
})

async function mountViewer(selectedIds: string[]) {
  sessionStorage.clear()
  const selection = usePhotoSelection(ref('t'), ref(['a', 'b']))
  selectedIds.forEach((id) => selection.toggle(id))
  wrapper = mount(PreviewViewer, {
    attachTo: document.body,
    props: { photos: PHOTOS, photoId: 'a', selection },
  })
  await flushPromises()
  return { body: new DOMWrapper(document.body), selection }
}

const button = (body: DOMWrapper<Element>, name: string) =>
  body.findAll('button').find((each) => each.text().trim() === name)

describe('PreviewViewer', () => {
  it('says the watermark goes away and picks the photo', async () => {
    const { body, selection } = await mountViewer([])

    expect(body.text()).toContain('La marca de agua desaparece al comprar.')
    expect(body.get('img').attributes('src')).toBe('u/a')
    await button(body, 'Elegir foto')!.trigger('click')

    expect(selection.selected.value).toEqual(['a'])
  })

  it('takes out a photo already chosen', async () => {
    const { body, selection } = await mountViewer(['a'])

    await button(body, 'Quitar foto')!.trigger('click')

    expect(selection.selected.value).toEqual([])
  })
})
