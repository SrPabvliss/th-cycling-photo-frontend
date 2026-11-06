import { mount } from '@vue/test-utils'
import { describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

vi.mock('@/core/auth/use-permissions', () => ({
  usePermissions: () => ({ has: (key: string) => key === 'photo_category.create' }),
}))
vi.mock('../../../composables/queries/use-photo-category-catalog', () => ({
  usePhotoCategoryCatalogQuery: () => ({
    data: ref([
      { id: 1, name: 'Competencia', scope: 'base', photoCount: 0 },
      { id: 9, name: 'Best Trick Contest', scope: 'own', photoCount: 0 },
    ]),
  }),
}))

import EventCategoryPicker from './EventCategoryPicker.vue'

const onCreate = vi.fn()

describe('EventCategoryPicker', () => {
  it('groups the catalog into Base and Mías', () => {
    const w = mount(EventCategoryPicker, { props: { selectedIds: [] } })

    expect(w.find('[data-test="category-group-base"]').text()).toContain('Competencia')
    expect(w.find('[data-test="category-group-own"]').text()).toContain('Best Trick Contest')
  })

  it('creates the category on Enter without submitting the surrounding event form', async () => {
    const onSubmit = vi.fn((event: Event) => event.preventDefault())
    const w = mount(
      {
        components: { EventCategoryPicker },
        template:
          '<form @submit="onSubmit"><EventCategoryPicker :selected-ids="[]" @create-new="onCreate" /></form>',
        setup: () => ({ onSubmit, onCreate }),
      },
      { attachTo: document.body },
    )
    const input = w.find('.category-picker__add input')
    await input.setValue('Salto QA')

    const enter = new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, cancelable: true })
    input.element.dispatchEvent(enter)

    expect(enter.defaultPrevented).toBe(true)
    expect(onCreate).toHaveBeenCalledWith({ name: 'Salto QA' })
    w.unmount()
  })
})
