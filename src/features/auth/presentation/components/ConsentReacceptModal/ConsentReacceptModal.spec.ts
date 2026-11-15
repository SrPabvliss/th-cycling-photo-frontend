import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { CONSENT_TYPE } from '../../../constants/consent.constants'
import ConsentReacceptModal from './ConsentReacceptModal.vue'

const record = vi.fn()
const askedWith = vi.fn()

vi.mock('../../../composables/mutations/use-record-consents', () => ({
  useRecordConsentsMutation: (options: unknown) => (
    askedWith(options),
    { mutateAsync: record, isPending: ref(false) }
  ),
}))

const mounted: { unmount(): void }[] = []
async function mountModal() {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [{ path: '/:any(.*)*', component: { render: () => null } }],
  })
  const session = useSessionStore()
  session.currentUser = {
    pendingConsents: [CONSENT_TYPE.TERMS_PRIVACY],
  } as unknown as typeof session.currentUser
  mounted.push(
    mount(ConsentReacceptModal, { attachTo: document.body, global: { plugins: [router] } }),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}

const buttonNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button').find((each) => each.text().trim() === name)

describe('ConsentReacceptModal', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    record.mockReset()
    askedWith.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says inside the modal that the acceptance failed, stays open and offers to retry', async () => {
    record.mockRejectedValueOnce(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = await mountModal()

    await wrapper.get('.consent-modal__checkbox').trigger('click')
    await buttonNamed(wrapper, 'Aceptar')!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[data-test="consent-problem"]')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No se pudo completar')
    expect(alert.text()).toContain('Parece un problema de conexión.')
    expect(wrapper.text()).toContain('Actualizamos nuestras políticas')

    record.mockResolvedValueOnce(undefined)
    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')
    await flushPromises()
    expect(record).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[data-test="consent-problem"]').exists()).toBe(false)
  })

  it('records the acceptance without a toast: the modal says the failure itself', async () => {
    await mountModal()

    expect(askedWith).toHaveBeenCalledWith({ silent: true })
  })
})
