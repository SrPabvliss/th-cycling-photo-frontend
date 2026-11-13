import { beforeEach, describe, expect, it, vi } from 'vitest'
import { mount } from '@vue/test-utils'

import PhotoGridSection from './PhotoGridSection.vue'

const photos = ['a', 'b', 'c'].map((id) => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 }))

function mountSection(props: Record<string, unknown> = {}) {
  return mount(PhotoGridSection, {
    props: { photos, selectedIds: new Set(['b']), busyIds: new Set<string>(), ...props },
  })
}

describe('PhotoGridSection', () => {
  beforeEach(() => {
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        observe() {}
        disconnect() {}
        unobserve() {}
      },
    )
  })

  it('draws one tile per photo and marks the ones in the cart', () => {
    const wrapper = mountSection()

    expect(wrapper.findAll('.photo-tile')).toHaveLength(3)
    expect(
      wrapper.findAll('.photo-tile__toggle').map((button) => button.attributes('aria-pressed')),
    ).toEqual(['false', 'true', 'false'])
  })

  it('labels every tile with the searched plate', () => {
    const wrapper = mountSection({ plate: '127' })

    expect(wrapper.findAll('.photo-tile__plate').map((label) => label.text())).toEqual([
      '#127',
      '#127',
      '#127',
    ])
  })

  it('passes on what a tile asks for', async () => {
    const wrapper = mountSection()

    await wrapper.findAll('.photo-tile__toggle')[0]!.trigger('click')
    await wrapper.findAll('.photo-tile__open')[2]!.trigger('click')

    expect(wrapper.emitted('toggle')).toEqual([['a']])
    expect(wrapper.emitted('open')).toEqual([['c']])
  })

  it('adds three placeholders at the end while more photos arrive', () => {
    expect(mountSection().findAll('.photo-grid__placeholder')).toHaveLength(0)
    expect(mountSection({ isLoadingMore: true }).findAll('.photo-grid__placeholder')).toHaveLength(
      3,
    )
  })
})
