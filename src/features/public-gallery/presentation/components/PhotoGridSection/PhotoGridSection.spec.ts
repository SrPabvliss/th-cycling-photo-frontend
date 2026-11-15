import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'

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

import PhotoGridSection from './PhotoGridSection.vue'

const photos = ['a', 'b', 'c'].map((id) => ({ id, publicSlug: `slug-${id}`, width: 3, height: 4 }))

function mountSection(props: Record<string, unknown> = {}) {
  return mount(PhotoGridSection, {
    props: { photos, selectedIds: new Set(['b']), busyIds: new Set<string>(), ...props },
  })
}

const many = (count: number) =>
  Array.from({ length: count }, (_, index) => ({
    id: `p${index + 1}`,
    publicSlug: `s${index + 1}`,
    width: 3,
    height: 4,
  }))

// Every cell in reading order: a photo by its number, an ad as "ad".
const cells = (wrapper: ReturnType<typeof mountSection>) =>
  wrapper.findAll('.photo-grid > *').map((cell) =>
    cell.attributes('data-test') === 'house-spot'
      ? 'ad'
      : Number(
          cell
            .find('img')
            .attributes('src')
            ?.match(/s(\d+)/)?.[1],
        ),
  )
const adsAt = (order: (string | number)[]) =>
  order.flatMap((cell, index) => (cell === 'ad' ? [index] : []))

describe('PhotoGridSection', () => {
  beforeEach(() => {
    config.SPOTS_ENABLED = true
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

  describe('ad tiles', () => {
    it.each([
      [4, [4]],
      [1, [1]],
      [7, [7]],
    ])(
      'closes plate results of %i photos with one tile, after the last',
      async (count, expected) => {
        const wrapper = mountSection({ photos: many(count), withSpot: true, spotAtEnd: true })
        await flushPromises()

        expect(adsAt(cells(wrapper))).toEqual(expected)
      },
    )

    it('follows the gallery from 8 plate results on: 8th, 18 further down, then every 30', async () => {
      const wrapper = mountSection({
        photos: many(55),
        withSpot: true,
        spotAtEnd: true,
        spotSeed: 62,
      })
      await flushPromises()

      // Before photos 8 and 26, and closing the list after photo 55; each counts the ads before it.
      const order = cells(wrapper)
      expect(adsAt(order)).toEqual([7, 26, 57])
      expect(order.filter((cell) => cell !== 'ad')).toHaveLength(55)
      const seeds = wrapper
        .findAll('[data-test="house-spot"]')
        .map((ad) => ad.attributes('data-seed'))
      expect(seeds).toEqual(['62', '63', '64'])
      expect(wrapper.find('[data-test="house-spot"]').attributes('data-format')).toBe('C')
    })

    it('has no tile without photos', () => {
      expect(
        mountSection({ photos: [], withSpot: true, spotAtEnd: true })
          .find('[data-test="house-spot"]')
          .exists(),
      ).toBe(false)
    })

    it('never closes the list when not asked to, like the gallery', async () => {
      expect(adsAt(cells(mountSection({ photos: many(7), withSpot: true })))).toEqual([])
      expect(adsAt(cells(mountSection({ photos: many(30), withSpot: true })))).toEqual([7, 26])
    })

    it('has no tile unless asked, or with the ads off', () => {
      expect(
        mountSection({ photos: many(20) })
          .find('[data-test="house-spot"]')
          .exists(),
      ).toBe(false)

      config.SPOTS_ENABLED = false
      expect(
        mountSection({ photos: many(20), withSpot: true })
          .find('[data-test="house-spot"]')
          .exists(),
      ).toBe(false)
    })

    it('gives every cell back to the photos when the tiles cannot be shown', async () => {
      const wrapper = mountSection({ photos: many(30), withSpot: true, spotAtEnd: true })
      await flushPromises()

      wrapper.getComponent({ name: 'HouseSpot' }).vm.$emit('unavailable')
      await flushPromises()

      expect(wrapper.find('[data-test="house-spot"]').exists()).toBe(false)
      expect(cells(wrapper)).toHaveLength(30)
    })
  })
})
