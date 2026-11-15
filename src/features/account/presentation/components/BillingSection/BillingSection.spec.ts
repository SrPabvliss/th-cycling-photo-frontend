import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { computed, defineComponent, h, ref } from 'vue'

import type { IBillingAccount } from '../../../types/responses/billing-account.response'
import {
  identificationMessageOf,
  type IBillingServerError,
} from '../../../utils/billing-server-error'
import BillingSection from './BillingSection.vue'

const accounts = ref<IBillingAccount[]>([])
const refetch = vi.fn()
const setDefault = vi.fn()
const remove = vi.fn()
const update = vi.fn()
const success = vi.fn()
const info = vi.fn()

vi.mock('../../../composables/queries/use-my-billing-accounts', () => ({
  useMyBillingAccountsQuery: () => ({
    data: computed(() => ({ accounts: accounts.value, invoiceConsentGiven: true })),
    status: computed(() => 'success'),
    isFetching: ref(false),
    refetch,
  }),
}))
vi.mock('../../../composables/mutations/use-set-default-billing-account', () => ({
  useSetDefaultBillingAccount: () => ({ mutateAsync: setDefault, isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-delete-billing-account', () => ({
  useDeleteBillingAccount: () => ({ mutateAsync: remove, isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-update-billing-account', async (original) => ({
  ...(await original<typeof import('../../../composables/mutations/use-update-billing-account')>()),
  useUpdateBillingAccount: () => ({ mutateAsync: update, isPending: ref(false) }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success, info }),
}))

// The form has its own spec: here it only hands over what it would send, and shows the
// identification message it was given.
const FormStub = defineComponent({
  name: 'BillingAccountForm',
  props: { mode: String, initial: Object, serverError: Object },
  emits: ['submit', 'saved', 'cancel'],
  setup(props, { emit }) {
    return () =>
      h('div', { 'data-test': 'billing-form', 'data-mode': props.mode }, [
        h('button', {
          'data-test': 'form-rename',
          onClick: () =>
            emit('submit', { ...(props.initial as object), legalName: 'Juan P. Pérez' }),
        }),
        h('button', { 'data-test': 'form-saved', onClick: () => emit('saved', 'b9') }),
        props.serverError
          ? h(
              'em',
              { 'data-test': 'id-error' },
              identificationMessageOf(props.serverError as IBillingServerError) ?? '',
            )
          : null,
      ])
  },
})

const account = (id: string, isDefault: boolean, legalName = 'Juan Pérez'): IBillingAccount => ({
  id,
  idType: 'national_id',
  idNumber: '1710034065',
  legalName,
  email: 'juan@correo.com',
  address: id === 'b1' ? 'Av. Amazonas' : null,
  isDefault,
})

function apiError(status: number, messageKey = '') {
  const response = {
    status,
    data: { error: { messageKey, message: 'x' } },
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const mounted: { unmount(): void }[] = []
async function mountSection() {
  mounted.push(
    mount(BillingSection, {
      attachTo: document.body,
      global: { stubs: { BillingAccountForm: FormStub } },
    }),
  )
  await flushPromises()
  return new DOMWrapper(document.body)
}
const cards = (wrapper: DOMWrapper<Element>) => wrapper.findAll('.billing-section__card')
const buttonIn = (scope: Pick<DOMWrapper<Element>, 'findAll'>, name: string) =>
  scope.findAll('button').find((each) => each.text().trim() === name)

describe('BillingSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    setActivePinia(createPinia())
    accounts.value = [account('b1', true), account('b2', false, 'Bicis S.A.')]
    for (const mock of [refetch, setDefault, remove, update, success, info]) mock.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('says there is no billing data yet, and why it matters', async () => {
    accounts.value = []
    const wrapper = await mountSection()

    expect(wrapper.text()).toContain('Todavía no tienes datos de facturación')
    expect(wrapper.text()).toContain('Los necesitas para confirmar un pedido.')
    expect(buttonIn(wrapper, 'Agregar datos de facturación')).toBeDefined()
  })

  it('shows each account and marks the default one', async () => {
    const wrapper = await mountSection()

    expect(cards(wrapper)).toHaveLength(2)
    expect(cards(wrapper)[0]!.text()).toContain('Juan Pérez')
    expect(cards(wrapper)[0]!.text()).toContain('Cédula 1710034065')
    expect(cards(wrapper)[0]!.text()).toContain('Av. Amazonas')
    expect(cards(wrapper)[0]!.text()).toContain('Predeterminada')
    expect(cards(wrapper)[1]!.text()).not.toContain('Predeterminada')
    expect(buttonIn(cards(wrapper)[0]!, 'Usar como predeterminada')).toBeUndefined()
  })

  it('makes another account the default one', async () => {
    setDefault.mockImplementation(async () => {
      accounts.value = [account('b1', false), account('b2', true, 'Bicis S.A.')]
    })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Usar como predeterminada')!.trigger('click')
    await flushPromises()

    expect(setDefault).toHaveBeenCalledWith('b2')
    expect(cards(wrapper)[1]!.text()).toContain('Predeterminada')
  })

  it('asks before deleting, then deletes and says so', async () => {
    remove.mockImplementation(async () => {
      accounts.value = [account('b1', true)]
    })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    expect(remove).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('¿Eliminar estos datos?')
    expect(wrapper.text()).toContain(
      'Tus pedidos anteriores conservan los datos con los que se hicieron.',
    )

    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(remove).toHaveBeenCalledWith('b2')
    expect(success).toHaveBeenCalledWith('Datos de facturación eliminados.')
    expect(cards(wrapper)).toHaveLength(1)
  })

  it('asks in a dialog that starts on keeping the data, so Enter does not delete', async () => {
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await new Promise((resolve) => setTimeout(resolve, 0))

    const dialog = wrapper.get('[role="alertdialog"]')
    expect(dialog.text()).toContain('¿Eliminar estos datos?')
    expect(document.activeElement?.textContent?.trim()).toBe('Conservar')

    await buttonIn(dialog, 'Conservar')!.trigger('click')
    await flushPromises()
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
    expect(remove).not.toHaveBeenCalled()
  })

  it('says next to the list why the default did not change, without a toast', async () => {
    setDefault.mockRejectedValue(apiError(500))
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Usar como predeterminada')!.trigger('click')
    await flushPromises()

    const alert = wrapper.get('.form-alert')
    expect(alert.attributes('role')).toBe('alert')
    expect(alert.text()).toContain('No se pudo completar')
    expect(alert.text()).toContain('Parece un problema de conexión.')
    expect(info).not.toHaveBeenCalled()
    expect(cards(wrapper)[0]!.text()).toContain('Predeterminada')
  })

  it('says in the dialog what went wrong when deleting fails, keeping the data, and retries', async () => {
    remove.mockRejectedValue(apiError(500))
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    const dialog = wrapper.get('[role="alertdialog"]')
    expect(dialog.get('.form-alert').text()).toContain('No se pudo completar')
    expect(cards(wrapper)).toHaveLength(2)

    remove.mockResolvedValueOnce(undefined)
    await buttonIn(dialog, 'Eliminar')!.trigger('click')
    await flushPromises()
    expect(remove).toHaveBeenCalledTimes(2)
    expect(wrapper.find('[role="alertdialog"]').exists()).toBe(false)
  })

  it('shows the empty state after deleting the only account', async () => {
    accounts.value = [account('b1', true)]
    remove.mockImplementation(async () => {
      accounts.value = []
    })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[0]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Todavía no tienes datos de facturación')
  })

  // The card that held the focus is gone: the focus goes on to the list, not to the page body.
  it('puts the focus on the first remaining card after deleting', async () => {
    remove.mockImplementation(async () => {
      accounts.value = [account('b1', true)]
    })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(document.activeElement).toBe(cards(wrapper)[0]!.find('.billing-section__action').element)
  })

  it('puts the focus on "Agregar datos de facturación" after deleting the only account', async () => {
    accounts.value = [account('b1', true)]
    remove.mockImplementation(async () => {
      accounts.value = []
    })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[0]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    expect((document.activeElement as HTMLElement).textContent?.trim()).toBe(
      'Agregar datos de facturación',
    )
  })

  it('takes off an account that no longer exists, saying so', async () => {
    remove.mockRejectedValue(apiError(404))
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[1]!, 'Eliminar')!.trigger('click')
    await flushPromises()
    await buttonIn(wrapper.get('[role="alertdialog"]'), 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(info).toHaveBeenCalledWith('Esos datos ya no existen.')
    expect(refetch).toHaveBeenCalled()
  })

  it('edits only the name, without asking the number again', async () => {
    update.mockResolvedValue({ id: 'b1' })
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[0]!, 'Editar')!.trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test="billing-form"]').attributes('data-mode')).toBe('edit')
    await wrapper.get('[data-test="form-rename"]').trigger('click')
    await flushPromises()

    expect(update).toHaveBeenCalledWith({ id: 'b1', changes: { legalName: 'Juan P. Pérez' } })
    expect(success).toHaveBeenCalledWith('Datos de facturación guardados.')
  })

  it('puts a number the tax service turned down on its field, keeping the form', async () => {
    update.mockRejectedValue(apiError(422, 'billing.identification_invalid'))
    const wrapper = await mountSection()

    await buttonIn(cards(wrapper)[0]!, 'Editar')!.trigger('click')
    await flushPromises()
    await wrapper.get('[data-test="form-rename"]').trigger('click')
    await flushPromises()

    expect(wrapper.get('[data-test="id-error"]').text()).toBe(
      'No pudimos validar ese número. Revísalo.',
    )
    expect(wrapper.find('[data-test="billing-form"]').exists()).toBe(true)
  })

  it('says a new account was saved', async () => {
    const wrapper = await mountSection()

    await buttonIn(wrapper, 'Agregar datos de facturación')!.trigger('click')
    await flushPromises()
    expect(wrapper.get('[data-test="billing-form"]').attributes('data-mode')).toBe('create')
    await wrapper.get('[data-test="form-saved"]').trigger('click')
    await flushPromises()

    expect(success).toHaveBeenCalledWith('Datos de facturación guardados.')
  })
})
