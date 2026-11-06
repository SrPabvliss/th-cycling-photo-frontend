import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, type Ref } from 'vue'
import { NMessageProvider } from 'naive-ui'

vi.mock('vue-router', () => ({
  useRoute: () => ({ params: { slug: 'vuelta-ambato-2026' } }),
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
}))

const eventData = ref<{ id: string; slug: string; name: string } | undefined>(undefined)
const eventPending = ref(true)
const eventError = ref(false)
const eventSlugArg: { value: Ref<string> | null } = { value: null }
vi.mock('@/shared/composables/use-event-detail', () => ({
  useEventDetailQuery: (slug: Ref<string>) => {
    eventSlugArg.value = slug
    return { data: eventData, isPending: eventPending, isError: eventError, refetch: vi.fn() }
  },
}))

const linksData = ref<{ items: unknown[]; pagination: { totalPages: number } } | undefined>(
  undefined,
)
const linksPending = ref(true)
const linksError = ref(false)
const linksEventIdArg: { value: Ref<string> | null } = { value: null }
vi.mock('../../composables/queries/use-preview-links-list', () => ({
  usePreviewLinksListQuery: (eventId: Ref<string>) => {
    linksEventIdArg.value = eventId
    return { data: linksData, isPending: linksPending, isError: linksError, refetch: vi.fn() }
  },
}))

import PreviewLinksListView from './PreviewLinksListView.vue'

function mountView() {
  const Host = defineComponent({
    setup: () => () => h(NMessageProvider, null, () => h(PreviewLinksListView)),
  })
  return mount(Host, { global: { stubs: { NModal: true } } })
}

describe('PreviewLinksListView', () => {
  beforeEach(() => {
    eventData.value = undefined
    eventPending.value = true
    eventError.value = false
    linksData.value = undefined
    linksPending.value = true
    linksError.value = false
  })

  it('loads the event by its slug and the links by the event UUID', async () => {
    mountView()
    expect(eventSlugArg.value?.value).toBe('vuelta-ambato-2026')
    expect(linksEventIdArg.value?.value).toBe('')

    eventData.value = { id: 'a1b2c3d4-uuid', slug: 'vuelta-ambato-2026', name: 'Vuelta' }
    eventPending.value = false
    await flushPromises()

    expect(linksEventIdArg.value?.value).toBe('a1b2c3d4-uuid')
  })

  it('shows a single empty state when the event has no links', async () => {
    eventData.value = { id: 'a1b2c3d4-uuid', slug: 'vuelta-ambato-2026', name: 'Vuelta' }
    eventPending.value = false
    linksData.value = { items: [], pagination: { totalPages: 0 } }
    linksPending.value = false
    const w = mountView()
    await flushPromises()

    expect(w.text().match(/No hay preview links para este evento/g)).toHaveLength(1)
    expect(w.text()).not.toContain('No Data')
    expect(w.text()).not.toContain('Sin datos')
  })

  it('shows the error state when the event cannot be loaded', async () => {
    eventPending.value = false
    eventError.value = true
    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('Error al cargar preview links')
  })
})
