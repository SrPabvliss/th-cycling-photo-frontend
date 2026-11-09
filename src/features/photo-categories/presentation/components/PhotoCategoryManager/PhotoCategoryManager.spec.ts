import { flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, toValue, type MaybeRefOrGetter } from 'vue'
import { NMessageProvider } from 'naive-ui'

const permissions = new Set<string>()
vi.mock('@/core/auth/use-permissions', () => ({
  usePermissions: () => ({ has: (key: string) => permissions.has(key) }),
}))

const catalogEventIds: unknown[] = []
vi.mock('../../../composables/queries/use-photo-category-catalog', () => ({
  usePhotoCategoryCatalogQuery: (eventId: MaybeRefOrGetter<string>) => {
    catalogEventIds.push(toValue(eventId))
    return {
      data: ref([
        { id: 1, name: 'Competencia', scope: 'base', photoCount: 0 },
        { id: 9, name: 'Best Trick Contest', scope: 'own', photoCount: 0 },
      ]),
    }
  },
}))
vi.mock('../../../composables/queries/use-photo-categories', () => ({
  usePhotoCategoriesQuery: () => ({
    data: ref([{ id: 1, name: 'Competencia', scope: 'base', photoCount: 3 }]),
  }),
}))

const createCategory = vi.fn()
vi.mock('../../../composables/mutations/use-create-photo-category', () => ({
  useCreatePhotoCategory: () => ({ mutateAsync: createCategory, isPending: ref(false) }),
}))
const assignCategory = vi.fn()
vi.mock('../../../composables/mutations/use-assign-photo-category', () => ({
  useAssignPhotoCategory: () => ({ mutateAsync: assignCategory }),
}))
vi.mock('../../../composables/mutations/use-unassign-photo-category', () => ({
  useUnassignPhotoCategory: () => ({ mutate: vi.fn() }),
}))

vi.mock('@/shared/components/CollapsibleCard/CollapsibleCard.vue', () => ({
  default: { name: 'CollapsibleCard', template: '<section><slot /></section>' },
}))

import PhotoCategoryManager from './PhotoCategoryManager.vue'

function conflict(message: string) {
  const response = { status: 409, data: { error: { message } } } as AxiosResponse
  return new AxiosError('conflict', '409', undefined, undefined, response)
}

function mountManager() {
  const Host = defineComponent({
    setup: () => () =>
      h(NMessageProvider, null, () => h(PhotoCategoryManager, { eventId: 'ev-1', editable: true })),
  })
  return mount(Host, { attachTo: document.body })
}

describe('PhotoCategoryManager', () => {
  beforeEach(() => {
    permissions.clear()
    catalogEventIds.length = 0
    createCategory.mockReset()
    assignCategory.mockReset()
    document.body.innerHTML = ''
  })

  it("reads the catalog of the event's organizer", () => {
    mountManager()
    expect(catalogEventIds).toEqual(['ev-1'])
  })

  it('tags base categories among the assigned ones', () => {
    const w = mountManager()
    expect(w.find('.category-item').text()).toContain('Base')
  })

  it('shows the backend message when the name already exists, and does not assign', async () => {
    permissions.add('photo_category.create')
    createCategory.mockRejectedValue(conflict('Ya existe una categoría con ese nombre'))
    const w = mountManager()

    await w.find('.category-add input').setValue('competencia')
    await w.find('.category-add button').trigger('click')
    await flushPromises()

    expect(assignCategory).not.toHaveBeenCalled()
    expect(document.body.textContent).toContain('Ya existe una categoría con ese nombre')
  })

  it('offers «Crear como base» only with photo_category.base.manage', async () => {
    permissions.add('photo_category.create')
    expect(mountManager().text()).not.toContain('Crear como base')

    permissions.add('photo_category.base.manage')
    createCategory.mockResolvedValue({ data: { id: 30 } })
    const w = mountManager()
    expect(w.text()).toContain('Crear como base')

    await w.find('.category-add__base').trigger('click')
    await w.find('.category-add input').setValue('Podio')
    await w.find('.category-add button').trigger('click')
    await flushPromises()

    expect(createCategory).toHaveBeenCalledWith({ name: 'Podio', base: true })
    expect(assignCategory).toHaveBeenCalledWith(30)
  })
})
