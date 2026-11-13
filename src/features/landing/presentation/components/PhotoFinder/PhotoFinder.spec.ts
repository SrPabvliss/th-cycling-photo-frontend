import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { computed, reactive } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IPublicEventFilters, IPublicEventListItem } from '@/shared/public-events'
import PhotoFinder from './PhotoFinder.vue'

type Status = 'pending' | 'error' | 'success'

const races = reactive({
  status: 'success' as Status,
  isFetching: false,
  events: [] as IPublicEventListItem[],
})
const refetch = vi.fn()
const askedWith = vi.fn()

vi.mock('@/shared/public-events', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/public-events')>()),
  usePublicEventsQuery: (filters: IPublicEventFilters, options: unknown) => {
    askedWith(filters, options)
    return {
      status: computed(() => races.status),
      isFetching: computed(() => races.isFetching),
      events: computed(() => races.events),
      refetch,
    }
  },
}))

function race(slug: string, name: string): IPublicEventListItem {
  return {
    slug,
    name,
    startDate: '2026-10-04',
    endDate: '2026-10-04',
    placeLabel: null,
    photoCount: 10,
    ownerName: null,
    coverUrl: null,
    eventTypeId: 1,
    eventTypeName: 'Downhill',
  }
}

const Stub = { render: () => null }

async function mountFinder() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/gallery/:slug', component: Stub },
    ],
  })
  await router.push('/')
  const push = vi.spyOn(router, 'push')
  const wrapper = mount(PhotoFinder, { attachTo: document.body, global: { plugins: [router] } })
  await flushPromises()
  return { wrapper, router, push }
}

type Wrapper = Awaited<ReturnType<typeof mountFinder>>['wrapper']
const select = (wrapper: Wrapper) => wrapper.get('select')
const plate = (wrapper: Wrapper) => wrapper.get('input')
const submit = (wrapper: Wrapper) => wrapper.get('button[type="submit"]')
const send = async (wrapper: Wrapper) => {
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('PhotoFinder', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    Object.assign(races, {
      status: 'success',
      isFetching: false,
      events: [race('mama-rumi', 'Mama Rumi 2026'), race('titan-open', 'Titan Open')],
    })
    refetch.mockClear()
    askedWith.mockClear()
  })

  it('asks for the races that already have photos, up to fifty', async () => {
    await mountFinder()

    expect(askedWith).toHaveBeenCalledWith({ hasPhotos: true }, { pageSize: 50 })
  })

  it('lists the races after the invitation to choose one', async () => {
    const { wrapper } = await mountFinder()

    expect(select(wrapper).attributes('aria-label')).toBe('Carrera')
    expect(
      wrapper.findAll('option').map((option) => [option.text(), option.attributes('value')]),
    ).toEqual([
      ['Elige tu carrera', ''],
      ['Mama Rumi 2026', 'mama-rumi'],
      ['Titan Open', 'titan-open'],
    ])
    expect(submit(wrapper).text()).toBe('Buscar mis fotos')
  })

  it('asks for the plate with a numeric keyboard', async () => {
    const { wrapper } = await mountFinder()

    expect(plate(wrapper).attributes('inputmode')).toBe('numeric')
    expect(plate(wrapper).attributes('placeholder')).toBe('127')
    expect(plate(wrapper).attributes('aria-label')).toBe('Número de placa')
  })

  it('asks for the race first, on the field, and goes nowhere', async () => {
    const { wrapper, push } = await mountFinder()
    await plate(wrapper).setValue('127')

    await send(wrapper)

    expect(wrapper.text()).toContain('Elige primero la carrera.')
    expect(select(wrapper).attributes('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(select(wrapper).element)
    expect(push).not.toHaveBeenCalled()
  })

  it('clears the race error once a race is chosen', async () => {
    const { wrapper } = await mountFinder()
    await send(wrapper)

    await select(wrapper).setValue('mama-rumi')

    expect(wrapper.text()).not.toContain('Elige primero la carrera.')
    expect(select(wrapper).attributes('aria-invalid')).toBeUndefined()
  })

  it('goes to the gallery of the race with the plate', async () => {
    const { wrapper, router } = await mountFinder()
    await select(wrapper).setValue('mama-rumi')
    await plate(wrapper).setValue(' 127 ')

    await send(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/gallery/mama-rumi?placa=127')
  })

  it('goes to the gallery with no plate when the field is empty', async () => {
    const { wrapper, router } = await mountFinder()
    await select(wrapper).setValue('titan-open')

    await send(wrapper)

    expect(router.currentRoute.value.fullPath).toBe('/gallery/titan-open')
  })

  it.each(['12a', '1 2 7', '12345678901'])(
    'rejects the plate "%s" and goes nowhere',
    async (text) => {
      const { wrapper, push } = await mountFinder()
      await select(wrapper).setValue('mama-rumi')
      await plate(wrapper).setValue(text)

      await send(wrapper)

      expect(wrapper.text()).toContain('Escribe solo el número de tu placa.')
      expect(plate(wrapper).attributes('aria-invalid')).toBe('true')
      expect(push).not.toHaveBeenCalled()
    },
  )

  it('disables the race field while the races load', async () => {
    Object.assign(races, { status: 'pending', events: [] })
    const { wrapper } = await mountFinder()

    expect(select(wrapper).attributes('disabled')).toBeDefined()
    expect(wrapper.findAll('option').map((option) => option.text())).toEqual(['Cargando carreras'])
  })

  it('says the races could not load, offers to retry, and blocks the search', async () => {
    Object.assign(races, { status: 'error', events: [] })
    const { wrapper, push } = await mountFinder()

    expect(wrapper.text()).toContain('No pudimos cargar las carreras.')
    expect(submit(wrapper).attributes('disabled')).toBeDefined()

    await wrapper
      .findAll('button')
      .find((button) => button.text() === 'Reintentar')!
      .trigger('click')
    expect(refetch).toHaveBeenCalledTimes(1)

    await send(wrapper)
    expect(push).not.toHaveBeenCalled()
  })
})
