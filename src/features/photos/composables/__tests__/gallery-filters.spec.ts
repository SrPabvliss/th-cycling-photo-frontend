import { defineComponent } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'
import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import { useGalleryFilters } from '../use-gallery-filters'

const Host = defineComponent({
  setup() {
    return useGalleryFilters(() => 'event-1')
  },
  render: () => null,
})

function mountHost() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/', component: Host }],
  })
  router.push('/')
  return mount(Host, { global: { plugins: [router] } })
}

describe('useGalleryFilters', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('counts a bib predicate, a category and a sale as three active filters', async () => {
    const wrapper = mountHost()

    wrapper.vm.bib = 'doubtful'
    wrapper.vm.photoCategoryId = 3
    wrapper.vm.sale = 'sold'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeFilterCount).toBe(3)
  })

  it('does not count the sort as an active filter', async () => {
    const wrapper = mountHost()

    wrapper.vm.bib = 'any'
    wrapper.vm.sort = 'bib_asc'
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.activeFilterCount).toBe(1)
    expect(wrapper.vm.hasActiveFilters).toBe(true)
  })

  it('clears the category when uncategorized is turned on', async () => {
    const wrapper = mountHost()

    wrapper.vm.photoCategoryId = 3
    await wrapper.vm.$nextTick()
    wrapper.vm.uncategorized = true
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.photoCategoryId).toBeNull()
    expect(wrapper.vm.uncategorized).toBe(true)
  })

  it('clears uncategorized when a category is picked', async () => {
    const wrapper = mountHost()

    wrapper.vm.uncategorized = true
    await wrapper.vm.$nextTick()
    wrapper.vm.photoCategoryId = 3
    await wrapper.vm.$nextTick()

    expect(wrapper.vm.uncategorized).toBe(false)
    expect(wrapper.vm.photoCategoryId).toBe(3)
  })
})
