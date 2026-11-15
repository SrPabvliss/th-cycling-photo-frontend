import { describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { defineComponent, h } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useGalleryPlate } from './use-gallery-plate'

const Stub = { render: () => null }

async function setup(path: string) {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/gallery', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push('/gallery')
  await router.push(path)
  const replace = vi.spyOn(router, 'replace')
  const push = vi.spyOn(router, 'push')

  let state!: ReturnType<typeof useGalleryPlate>
  const Host = defineComponent({
    setup() {
      state = useGalleryPlate()
      return () => h('div')
    },
  })
  mount(Host, { global: { plugins: [router] } })

  return { state, router, replace, push }
}

describe('useGalleryPlate', () => {
  it('takes the plate from the url, in the field too', async () => {
    const { state } = await setup('/gallery/mama-rumi?placa=127')

    expect(state.plate.value).toBe('127')
    expect(state.draft.value).toBe('127')
    expect(state.error.value).toBeNull()
  })

  it('has no plate on a clean url', async () => {
    const { state } = await setup('/gallery/mama-rumi')

    expect(state.plate.value).toBeNull()
    expect(state.draft.value).toBe('')
  })

  it.each(['12a', '12345678901', '', '1 2', '%20'])(
    'treats a plate it cannot use in the url as none (%s)',
    async (value) => {
      const { state } = await setup(`/gallery/mama-rumi?placa=${value}`)

      expect(state.plate.value).toBeNull()
      expect(state.draft.value).toBe('')
      expect(state.error.value).toBeNull()
    },
  )

  it('searches the plate that was typed, replacing the url', async () => {
    const { state, router, replace, push } = await setup('/gallery/mama-rumi')

    state.draft.value = '127 '
    state.submit()
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi?placa=127')
    expect(state.plate.value).toBe('127')
    expect(state.draft.value).toBe('127')
    expect(replace).toHaveBeenCalledTimes(1)
    expect(push).not.toHaveBeenCalled()
  })

  it.each(['abc', '12a', '1 2 7', '12345678901'])(
    'rejects "%s" in place and goes nowhere',
    async (text) => {
      const { state, router, replace } = await setup('/gallery/mama-rumi?placa=9')

      state.draft.value = text
      state.submit()
      await flushPromises()

      expect(state.error.value).toBe('Escribe solo el número de tu placa.')
      expect(replace).not.toHaveBeenCalled()
      expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi?placa=9')
      expect(state.plate.value).toBe('9')
    },
  )

  it('forgets the error once the text changes', async () => {
    const { state } = await setup('/gallery/mama-rumi')
    state.draft.value = 'abc'
    state.submit()

    state.draft.value = '12'
    await flushPromises()

    expect(state.error.value).toBeNull()
  })

  it('shows everything again when an empty field is submitted', async () => {
    const { state, router } = await setup('/gallery/mama-rumi?placa=127')

    state.draft.value = '  '
    state.submit()
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi')
    expect(state.plate.value).toBeNull()
    expect(state.draft.value).toBe('')
  })

  it('clears the plate from the url and from the field', async () => {
    const { state, router, replace } = await setup('/gallery/mama-rumi?placa=127&foto=p9')

    state.clear()
    await flushPromises()

    expect(router.currentRoute.value.query).toEqual({ foto: 'p9' })
    expect(state.plate.value).toBeNull()
    expect(state.draft.value).toBe('')
    expect(replace).toHaveBeenCalledTimes(1)
  })

  it('does not touch the url when asked to search what is already searched', async () => {
    const { state, replace } = await setup('/gallery/mama-rumi?placa=127')

    state.submit()
    await flushPromises()

    expect(replace).not.toHaveBeenCalled()
  })

  it('follows the url when the person goes back to another search', async () => {
    const { state, router } = await setup('/gallery/mama-rumi?placa=127')

    await router.push('/gallery/mama-rumi?placa=45')
    await flushPromises()

    expect(state.plate.value).toBe('45')
    expect(state.draft.value).toBe('45')
  })
})
