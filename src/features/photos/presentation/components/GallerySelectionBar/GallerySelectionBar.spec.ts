import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import GallerySelectionBar from './GallerySelectionBar.vue'

function mountBar(overrides: Partial<InstanceType<typeof GallerySelectionBar>['$props']> = {}) {
  return mount(GallerySelectionBar, {
    props: {
      count: 3,
      total: 40,
      phrase: 'fotos',
      wholeSet: false,
      canAssign: true,
      canCreatePreview: true,
      ...overrides,
    },
  })
}

describe('GallerySelectionBar · crear preview', () => {
  it('emits create-preview for a hand-picked selection', async () => {
    const w = mountBar()
    await w.find('[data-test="create-preview-btn"]').trigger('click')

    expect(w.emitted('create-preview')).toHaveLength(1)
  })

  it('hides the action without the preview_link.create permission', () => {
    const w = mountBar({ canCreatePreview: false })

    expect(w.find('[data-test="create-preview-btn"]').exists()).toBe(false)
  })

  it('disables the action when the whole event is selected', async () => {
    const w = mountBar({ wholeSet: true })
    const button = w.find('[data-test="create-preview-btn"]')

    expect(button.attributes('disabled')).toBeDefined()
    await button.trigger('click')
    expect(w.emitted('create-preview')).toBeUndefined()
  })
})
