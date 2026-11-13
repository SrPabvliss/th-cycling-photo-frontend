import { flushPromises, mount, type VueWrapper } from '@vue/test-utils'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

import BillingAccountForm from './BillingAccountForm.vue'

const calls: string[] = []
const recordConsents = vi.fn(async () => {
  calls.push('consent')
})
const createAccount = vi.fn(async (_request: unknown) => {
  calls.push('create')
  return { id: 'ba-new' }
})

vi.mock('@/features/account/composables/mutations/use-record-invoice-consent', () => ({
  useRecordInvoiceConsent: () => ({ mutateAsync: recordConsents, isPending: ref(false) }),
}))

vi.mock('@/features/account/composables/mutations/use-create-billing-account', () => ({
  useCreateBillingAccount: () => ({ mutateAsync: createAccount, isPending: ref(false) }),
}))

const mounted: VueWrapper[] = []

afterEach(() => {
  calls.length = 0
  recordConsents.mockClear()
  createAccount.mockClear()
  while (mounted.length) mounted.pop()!.unmount()
})

function mountForm(needsConsent: boolean, extra: Record<string, unknown> = {}) {
  const wrapper = mount(BillingAccountForm, {
    attachTo: document.body,
    props: {
      needsConsent,
      prefill: { legalName: 'Juan Pérez', email: 'juan@correo.com' },
      ...extra,
    },
  })
  mounted.push(wrapper)
  return wrapper
}

type Form = ReturnType<typeof mountForm>

const input = (wrapper: Form, test: string) =>
  wrapper.get(`[data-test="${test}"]`).element as HTMLInputElement

async function fillIdNumber(wrapper: Form, value: string) {
  await wrapper.get('[data-test="billing-id-number"]').setValue(value)
}

async function submit(wrapper: Form) {
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

const errorOf = (wrapper: Form, test: string) => {
  const field = input(wrapper, test)
  const id = field.getAttribute('aria-describedby')?.split(' ')[0]
  return id ? (document.getElementById(id)?.textContent?.trim() ?? null) : null
}

describe('BillingAccountForm', () => {
  it('prefills the name and the email from the profile', () => {
    const wrapper = mountForm(true)

    expect(input(wrapper, 'billing-legal-name').value).toBe('Juan Pérez')
    expect(input(wrapper, 'billing-email').value).toBe('juan@correo.com')
  })

  it('validates on its own: no browser bubble, the email still opens the email keyboard', () => {
    const wrapper = mountForm(false)

    expect(wrapper.get('form').attributes('novalidate')).toBeDefined()
    expect(input(wrapper, 'billing-email').type).toBe('email')
  })

  it('labels every field', () => {
    const wrapper = mountForm(true)

    for (const test of [
      'billing-id-number',
      'billing-legal-name',
      'billing-email',
      'billing-address',
    ]) {
      const field = input(wrapper, test)
      expect(wrapper.find(`label[for="${field.id}"]`).exists()).toBe(true)
    }
  })

  it('chooses the kind of identification among native radios, and the hint follows it', async () => {
    const wrapper = mountForm(false)
    const group = wrapper.get('[data-test="billing-id-type"]')

    expect(group.element.tagName).toBe('FIELDSET')
    expect(group.get('legend').text()).toBe('Tipo de identificación')
    const radios = group.findAll('input[type="radio"]')
    expect(radios.map((radio) => radio.element.parentElement?.textContent?.trim())).toEqual([
      'Cédula',
      'RUC',
      'Pasaporte',
    ])
    expect((radios[0]!.element as HTMLInputElement).checked).toBe(true)
    expect(input(wrapper, 'billing-id-number').placeholder).toBe('10 dígitos')

    await radios[1]!.setValue(true)

    expect(input(wrapper, 'billing-id-number').placeholder).toBe('13 dígitos')
  })

  it('says nothing before the person leaves a field or sends', () => {
    const wrapper = mountForm(true)

    expect(wrapper.findAll('[aria-invalid="true"]')).toHaveLength(0)
    expect(wrapper.find('.form-field__error').exists()).toBe(false)
  })

  it('shows a wrong email under its field and keeps it from the server', async () => {
    const wrapper = mountForm(false)
    await fillIdNumber(wrapper, '1710034065')
    await wrapper.get('[data-test="billing-email"]').setValue('juan@')

    await submit(wrapper)

    expect(createAccount).not.toHaveBeenCalled()
    expect(input(wrapper, 'billing-email').getAttribute('aria-invalid')).toBe('true')
    expect(errorOf(wrapper, 'billing-email')).toBe('Escribe un correo válido')
  })

  // Like the other client forms: an error that appeared on leaving a field would push the button
  // away from under the pointer that is about to press it.
  it('waits for the send to say what is wrong, not for the person to leave a field', async () => {
    const wrapper = mountForm(false)
    const email = wrapper.get('[data-test="billing-email"]')

    await email.setValue('juan@')
    await email.trigger('blur')
    await flushPromises()

    expect(errorOf(wrapper, 'billing-email')).toBeNull()
  })

  it('keeps a malformed number from the server and takes the focus to it', async () => {
    const wrapper = mountForm(false)
    await fillIdNumber(wrapper, '171003406')

    await submit(wrapper)

    expect(createAccount).not.toHaveBeenCalled()
    expect(errorOf(wrapper, 'billing-id-number')).toContain('Revisa el número')
    expect(document.activeElement).toBe(input(wrapper, 'billing-id-number'))
  })

  it('does not save while the consent box is unchecked, and says why next to it', async () => {
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')

    await submit(wrapper)

    expect(recordConsents).not.toHaveBeenCalled()
    expect(createAccount).not.toHaveBeenCalled()
    expect(errorOf(wrapper, 'billing-consent')).toBe(
      'Acepta recibir tu factura electrónica para continuar',
    )
    expect(document.activeElement).toBe(input(wrapper, 'billing-consent'))
  })

  it('records the consent before saving the account and reports the new id', async () => {
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')
    await wrapper.get('[data-test="billing-consent"]').setValue(true)

    await submit(wrapper)

    expect(calls).toEqual(['consent', 'create'])
    expect(createAccount).toHaveBeenCalledWith({
      idType: 'national_id',
      idNumber: '1710034065',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
    })
    expect(wrapper.emitted('saved')).toEqual([['ba-new']])
  })

  it('opens and closes what the consent means', async () => {
    const wrapper = mountForm(true)
    const more = wrapper.get('[data-test="billing-consent-more"]')

    expect(more.attributes('aria-expanded')).toBe('false')
    await more.trigger('click')
    expect(more.attributes('aria-expanded')).toBe('true')
    expect(wrapper.get(`#${more.attributes('aria-controls')}`).text()).toContain('SRI')
    await more.trigger('click')
    expect(wrapper.find(`#${more.attributes('aria-controls')}`).exists()).toBe(false)
  })

  it('does not show the consent box to a user who already consented', async () => {
    const wrapper = mountForm(false)
    await fillIdNumber(wrapper, '1710034065')

    expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(false)
    await submit(wrapper)
    expect(recordConsents).not.toHaveBeenCalled()
    expect(createAccount).toHaveBeenCalled()
  })

  it('keeps the consent box on screen when the account is rejected after the consent was recorded', async () => {
    createAccount.mockRejectedValueOnce(new Error('rejected'))
    const wrapper = mountForm(true)
    await fillIdNumber(wrapper, '1710034065')
    await wrapper.get('[data-test="billing-consent"]').setValue(true)

    await submit(wrapper)
    await wrapper.setProps({ needsConsent: false })

    expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(true)
    expect(wrapper.emitted('saved')).toBeUndefined()
    expect(wrapper.get('[role="alert"]').text()).toContain(
      'No pudimos guardar tus datos de facturación. Intenta de nuevo.',
    )
  })

  it('speaks plainly: no shouting, no formal requests', () => {
    const wrapper = mountForm(true)

    expect(wrapper.text()).not.toMatch(/[¡!]|ingrese|por favor/i)
  })

  it('cancels', async () => {
    const wrapper = mountForm(false)

    await wrapper.get('[data-test="billing-cancel"]').trigger('click')

    expect(wrapper.emitted('cancel')).toHaveLength(1)
  })

  describe('correct mode', () => {
    const initial = {
      idType: 'ruc' as const,
      idNumber: '1790012345001',
      legalName: 'Bicicletas SA',
      email: 'facturas@bicis.com',
      address: 'Av. Amazonas',
    }

    function mountCorrect(extra: Record<string, unknown> = {}) {
      return mountForm(true, {
        prefill: { legalName: 'Otro', email: 'otro@correo.com' },
        mode: 'correct',
        initial,
        submitLabel: 'Enviar corrección',
        ...extra,
      })
    }

    it('prefills every field and hides consent in correct mode', () => {
      const wrapper = mountCorrect()

      expect(input(wrapper, 'billing-id-number').value).toBe('1790012345001')
      expect(input(wrapper, 'billing-legal-name').value).toBe('Bicicletas SA')
      expect(input(wrapper, 'billing-email').value).toBe('facturas@bicis.com')
      expect(input(wrapper, 'billing-address').value).toBe('Av. Amazonas')
      expect(
        (wrapper.get('input[type="radio"][value="ruc"]').element as HTMLInputElement).checked,
      ).toBe(true)
      expect(wrapper.find('[data-test="billing-consent"]').exists()).toBe(false)
      expect(wrapper.get('[data-test="billing-submit"]').text()).toContain('Enviar corrección')
    })

    it('emits submit instead of creating an account in correct mode', async () => {
      const wrapper = mountCorrect()

      await submit(wrapper)

      expect(createAccount).not.toHaveBeenCalled()
      expect(recordConsents).not.toHaveBeenCalled()
      expect(wrapper.emitted('submit')).toEqual([[initial]])
    })

    it('shows an identification error of the server under the number', () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'RUC no registrado',
          messageKey: 'billing.identification_invalid',
          fields: null,
        },
      })

      expect(errorOf(wrapper, 'billing-id-number')).toBe('RUC no registrado')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('shows the identification field of a validation answer under the number', () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'Datos inválidos',
          messageKey: 'errors.VALIDATION_FAILED',
          fields: { idNumber: ['El número es obligatorio'] },
        },
      })

      expect(errorOf(wrapper, 'billing-id-number')).toBe('El número es obligatorio')
      expect(wrapper.find('[role="alert"]').exists()).toBe(false)
    })

    it('sends every other server error to the alert', async () => {
      const wrapper = mountCorrect({
        serverError: {
          message: 'La razón social no es válida',
          messageKey: 'billing.legal_name_invalid',
          fields: null,
        },
      })
      expect(wrapper.get('[role="alert"]').text()).toContain('La razón social no es válida')

      await wrapper.setProps({
        serverError: { message: 'Ya no se puede corregir', messageKey: null, fields: null },
      })
      expect(wrapper.get('[role="alert"]').text()).toContain('Ya no se puede corregir')
    })
  })

  it('edits saved data: says when it applies, asks no consent and hands the request over', async () => {
    const wrapper = mountForm(true, {
      mode: 'edit',
      prefill: { legalName: '', email: '' },
      initial: {
        idType: 'national_id',
        idNumber: '1710034065',
        legalName: 'Juan Pérez',
        email: 'juan@correo.com',
      },
      submitLabel: 'Guardar cambios',
    })

    expect(wrapper.get('[data-test="billing-edit-note"]').text()).toBe(
      'Los cambios aplican a tus próximas compras.',
    )
    expect(wrapper.text()).not.toContain('Acepto recibir')
    await submit(wrapper)

    expect(createAccount).not.toHaveBeenCalled()
    expect(wrapper.emitted('submit')?.[0]?.[0]).toEqual({
      idType: 'national_id',
      idNumber: '1710034065',
      legalName: 'Juan Pérez',
      email: 'juan@correo.com',
    })
  })
})
