import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { IPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import GalleryAuditTable from './GalleryAuditTable.vue'

const buildPhoto = (overrides: Partial<IPhotoListItem> = {}): IPhotoListItem => ({
  id: 'p1',
  publicSlug: 'slug-1',
  filename: 'IMG_001.jpg',
  thumbnailUrl: 'https://cdn/thumb.jpg',
  status: 'processed',
  uploadedAt: new Date(),
  reviewedAt: null,
  bibs: [],
  photoCategoryId: null,
  photoCategoryName: null,
  sold: false,
  ...overrides,
})

const mountTable = (photos: IPhotoListItem[], extra: Record<string, unknown> = {}) =>
  mount(GalleryAuditTable, {
    props: { photos, selectedIds: [], ...extra },
    global: { stubs: { GalleryBibChips: true } },
  })

describe('GalleryAuditTable failed rows', () => {
  it('shows the Fallida badge on failed rows even without the retry permission', () => {
    const wrapper = mountTable([
      buildPhoto({ id: 'p1', status: 'failed' }),
      buildPhoto({ id: 'p2' }),
    ])
    expect(wrapper.findAll('[data-test="photo-failed-badge"]')).toHaveLength(1)
    expect(wrapper.find('[data-test="retry-photo-classification"]').exists()).toBe(false)
  })

  it('emits retry for a failed row and disables it while retrying', async () => {
    const wrapper = mountTable([buildPhoto({ status: 'failed' })], {
      retryable: true,
      retryingIds: ['p1'],
    })
    const button = wrapper.find('[data-test="retry-photo-classification"]')
    expect(button.attributes('disabled')).toBeDefined()

    const idle = mountTable([buildPhoto({ status: 'failed' })], {
      retryable: true,
      retryingIds: [],
    })
    await idle.find('[data-test="retry-photo-classification"]').trigger('click')
    expect(idle.emitted('retry')).toEqual([['p1']])
  })
})
