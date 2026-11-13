import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, type Ref } from 'vue'

import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

vi.mock('@/features/ads/presentation/components/AdSlot/AdSlot.vue', async () => ({
  default: (await import('@/features/ads/testing/ad-stubs')).AdSlotStub,
}))

const config = vi.hoisted(() => ({ ADS_ENABLED: true }))
vi.mock('@/features/ads/ads-config', async (original) => ({
  ...(await original<typeof import('@/features/ads/ads-config')>()),
  get ADS_ENABLED() {
    return config.ADS_ENABLED
  },
}))

// jsdom cannot measure the window: every row counts as near the screen.
vi.mock('@tanstack/vue-virtual', () => ({
  useWindowVirtualizer: (options: Ref<{ count: number }>) =>
    computed(() => ({
      getVirtualItems: () =>
        Array.from({ length: options.value.count }, (_, index) => ({
          index,
          key: index,
          start: index * 100,
        })),
      getTotalSize: () => options.value.count * 100,
      measure: () => {},
    })),
}))

import PublicPhotoGrid from './PublicPhotoGrid.vue'

const photos = (count: number): IPublicPhoto[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    publicSlug: `s${index + 1}`,
    width: 3,
    height: 4,
  }))

function mountGrid(count: number, withAd = true) {
  return mount(PublicPhotoGrid, {
    props: {
      photos: photos(count),
      selectedIds: new Set<string>(),
      busyIds: new Set<string>(),
      withAd,
    },
  })
}

// Every cell in reading order: a photo by its id, the ad as "ad".
const cells = (wrapper: ReturnType<typeof mountGrid>) =>
  wrapper.findAll('.photo-grid-virtual__row > *').map((cell) =>
    cell.attributes('data-test') === 'ad'
      ? 'ad'
      : cell
          .find('img')
          .attributes('src')
          ?.match(/s(\d+)/)?.[0],
  )

describe('PublicPhotoGrid', () => {
  beforeEach(() => {
    config.ADS_ENABLED = true
  })
  afterEach(() => vi.unstubAllGlobals())

  it('puts the ad tile 13th among 20 photos, in a 3:4 cell, keeping the photo order', async () => {
    const wrapper = mountGrid(20)
    await flushPromises()

    const order = cells(wrapper)
    expect(order).toHaveLength(21)
    expect(order[12]).toBe('ad')
    expect(order.filter((cell) => cell !== 'ad')).toEqual(photos(20).map((each) => each.publicSlug))
    const ad = wrapper.get('[data-test="ad"]')
    expect(ad.attributes('data-format')).toBe('C')
    expect(ad.attributes('data-seed')).toBe('59')
  })

  it('has no tile with fewer than 13 photos', async () => {
    const wrapper = mountGrid(12)
    await flushPromises()

    expect(wrapper.find('[data-test="ad"]').exists()).toBe(false)
  })

  it('has no tile when the screen does not ask for one, or ads are off', async () => {
    expect(mountGrid(20, false).find('[data-test="ad"]').exists()).toBe(false)

    config.ADS_ENABLED = false
    expect(mountGrid(20).find('[data-test="ad"]').exists()).toBe(false)
  })

  it('gives the cell back to the photos when the tile cannot be shown', async () => {
    const wrapper = mountGrid(20)
    await flushPromises()

    wrapper.getComponent({ name: 'AdSlot' }).vm.$emit('unavailable')
    await flushPromises()

    expect(cells(wrapper)).toEqual(photos(20).map((each) => each.publicSlug))
  })

  it('opens the photo, never the tile, and asks for more from the photo rows', async () => {
    const wrapper = mountGrid(20)
    await flushPromises()

    const thirteenth = wrapper.findAll('.photo-tile__open')[12]!
    await thirteenth.trigger('click')

    expect(wrapper.emitted('open')).toEqual([['p13']])
  })
})
