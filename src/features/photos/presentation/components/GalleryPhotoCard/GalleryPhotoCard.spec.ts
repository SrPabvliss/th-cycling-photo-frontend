import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import type { IPhotoListItem } from '@/features/photos/types/responses/photo-list.response'
import GalleryPhotoCard from './GalleryPhotoCard.vue'

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

const mountCard = (photo: IPhotoListItem, retryable: boolean) =>
  mount(GalleryPhotoCard, {
    props: { photo, dense: 'comfortable', retryable },
    global: { stubs: { GalleryBibChips: true } },
  })

describe('GalleryPhotoCard retry', () => {
  it('shows retry only for failed photos when retryable', async () => {
    const failed = mountCard(buildPhoto({ status: 'failed' }), true)
    expect(failed.find('[data-test="photo-failed-badge"]').exists()).toBe(true)
    await failed.find('[data-test="retry-photo-classification"]').trigger('click')
    expect(failed.emitted('retry')).toEqual([['p1']])
    expect(failed.emitted('open')).toBeUndefined()

    const processed = mountCard(buildPhoto({ status: 'processed' }), true)
    expect(processed.find('[data-test="retry-photo-classification"]').exists()).toBe(false)

    const notAllowed = mountCard(buildPhoto({ status: 'failed' }), false)
    expect(notAllowed.find('[data-test="retry-photo-classification"]').exists()).toBe(false)
  })

  it('disables the retry button while that photo is being retried', () => {
    const wrapper = mount(GalleryPhotoCard, {
      props: {
        photo: buildPhoto({ status: 'failed' }),
        dense: 'comfortable',
        retryable: true,
        retrying: true,
      },
      global: { stubs: { GalleryBibChips: true } },
    })
    expect(
      wrapper.find('[data-test="retry-photo-classification"]').attributes('disabled'),
    ).toBeDefined()
  })
})
