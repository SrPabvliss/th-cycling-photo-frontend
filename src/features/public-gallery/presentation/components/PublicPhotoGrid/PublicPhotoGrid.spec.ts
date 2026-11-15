import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, type Ref } from 'vue'

import type { IPublicPhoto } from '../../../types/responses/public-photo.response'

vi.mock('@/features/house-spots/presentation/components/HouseSpot/HouseSpot.vue', async () => ({
  default: (await import('@/features/house-spots/testing/spot-stubs')).HouseSpotStub,
}))

const config = vi.hoisted(() => ({ SPOTS_ENABLED: true }))
vi.mock('@/features/house-spots/spots-config', async (original) => ({
  ...(await original<typeof import('@/features/house-spots/spots-config')>()),
  get SPOTS_ENABLED() {
    return config.SPOTS_ENABLED
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

function mountGrid(count: number, withSpot = true) {
  return mount(PublicPhotoGrid, {
    props: {
      photos: photos(count),
      selectedIds: new Set<string>(),
      busyIds: new Set<string>(),
      withSpot,
    },
  })
}

// Every cell in reading order: a photo by its id, the ad as "ad".
const cells = (wrapper: ReturnType<typeof mountGrid>) =>
  wrapper.findAll('.photo-grid-virtual__row > *').map((cell) =>
    cell.attributes('data-test') === 'house-spot'
      ? 'ad'
      : cell
          .find('img')
          .attributes('src')
          ?.match(/s(\d+)/)?.[0],
  )

describe('PublicPhotoGrid', () => {
  beforeEach(() => {
    config.SPOTS_ENABLED = true
  })
  afterEach(() => vi.unstubAllGlobals())

  const adsAt = (order: ReturnType<typeof cells>) =>
    order.flatMap((cell, index) => (cell === 'ad' ? [index] : []))

  it('puts the first tile 8th, the next 18 photos further down, then one every 30', async () => {
    const wrapper = mountGrid(100)
    await flushPromises()

    const order = cells(wrapper)
    // Before photos 8, 26, 56 and 86: each cell also counts the ads before it.
    expect(adsAt(order)).toEqual([7, 26, 57, 88])
    expect(order.filter((cell) => cell !== 'ad')).toEqual(
      photos(100).map((each) => each.publicSlug),
    )
    const ads = wrapper.findAll('[data-test="house-spot"]')
    expect(ads.map((ad) => ad.attributes('data-format'))).toEqual(['C', 'C', 'C', 'C'])
    expect(ads.map((ad) => ad.attributes('data-seed'))).toEqual(['59', '60', '61', '62'])
  })

  it.each([
    [12, [7]],
    [8, [7]],
    [7, []],
  ])('with %i photos has tiles at %j: one never closes the gallery', async (count, expected) => {
    const wrapper = mountGrid(count)
    await flushPromises()

    expect(adsAt(cells(wrapper))).toEqual(expected)
  })

  it('keeps the cells already placed where they were when the next page arrives', async () => {
    const wrapper = mountGrid(24)
    await flushPromises()
    const before = cells(wrapper)

    await wrapper.setProps({ photos: photos(48) })
    const after = cells(wrapper)

    expect(after.slice(0, before.length)).toEqual(before)
    expect(adsAt(after)).toEqual([7, 26])
  })

  it('has no tile when the screen does not ask for one, or ads are off', async () => {
    expect(mountGrid(20, false).find('[data-test="house-spot"]').exists()).toBe(false)

    config.SPOTS_ENABLED = false
    expect(mountGrid(20).find('[data-test="house-spot"]').exists()).toBe(false)
  })

  it('gives every cell back to the photos when the tiles cannot be shown', async () => {
    const wrapper = mountGrid(30)
    await flushPromises()

    wrapper.getComponent({ name: 'HouseSpot' }).vm.$emit('unavailable')
    await flushPromises()

    expect(cells(wrapper)).toEqual(photos(30).map((each) => each.publicSlug))
  })

  it('opens the photo, never the tile, and asks for more from the photo rows', async () => {
    const wrapper = mountGrid(20)
    await flushPromises()

    const eighth = wrapper.findAll('.photo-tile__open')[7]!
    await eighth.trigger('click')

    expect(wrapper.emitted('open')).toEqual([['p8']])
  })
})
