import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { ref } from 'vue'
import { createMemoryHistory, createRouter } from 'vue-router'

import type { IApiEmailVerificationStatus } from '../../types/responses/email-verification-status.response'
import VerifyEmailView from './VerifyEmailView.vue'

const status = ref<IApiEmailVerificationStatus | undefined>(undefined)
const statusPending = ref(false)
const statusError = ref(false)
const refetchStatus = vi.fn(async () => ({ data: status.value }))
const send = vi.fn()
const resend = vi.fn()
const confirm = vi.fn()

vi.mock('../../composables/queries/use-email-verification-status', () => ({
  useEmailVerificationStatusQuery: () => ({
    data: status,
    isPending: statusPending,
    isError: statusError,
    isFetching: ref(false),
    refetch: refetchStatus,
  }),
}))
vi.mock('../../composables/mutations/use-send-email-verification', () => ({
  useSendEmailVerification: () => ({ mutateAsync: send, isPending: ref(false) }),
}))
vi.mock('../../composables/mutations/use-resend-email-verification', () => ({
  useResendEmailVerification: () => ({ mutateAsync: resend, isPending: ref(false) }),
}))
vi.mock('../../composables/mutations/use-confirm-email-verification', () => ({
  useConfirmEmailVerification: () => ({ mutateAsync: confirm, isPending: ref(false) }),
}))

const MINUTE = 60_000
const pending = (
  overrides: Partial<IApiEmailVerificationStatus> = {},
): IApiEmailVerificationStatus => ({
  pending: true,
  expired: false,
  purpose: 'verify_current',
  maskedTargetEmail: 'a•••@correo.com',
  expiresAt: new Date(Date.now() + 10 * MINUTE).toISOString(),
  attemptsRemaining: 5,
  ...overrides,
})

function apiError(status: number, messageKey = '', message = '') {
  const response = {
    status,
    data: { error: { messageKey, message } },
    headers: {},
    config: {},
  } as AxiosResponse
  return new AxiosError('failed', 'ERR_BAD_REQUEST', undefined, undefined, response)
}

const Stub = { render: () => null }
const mounted: { unmount(): void }[] = []

async function mountView(path = '/account/verify-email') {
  const router = createRouter({
    history: createMemoryHistory(),
    routes: [
      { path: '/', component: Stub },
      { path: '/account/verify-email', component: VerifyEmailView },
      { path: '/account/profile', name: 'account-profile', component: Stub },
      { path: '/:any(.*)*', component: Stub },
    ],
  })
  await router.push(path)
  mounted.push(
    mount(
      { template: '<RouterView />' },
      { attachTo: document.body, global: { plugins: [router] } },
    ),
  )
  await flushPromises()
  return { wrapper: new DOMWrapper(document.body), router }
}

type Wrapper = DOMWrapper<Element>
const buttonNamed = (wrapper: Wrapper, name: string) =>
  wrapper.findAll('button, a').find((each) => each.text().replace(/\s+/g, ' ').trim() === name)
const boxes = (wrapper: Wrapper) => wrapper.findAll('input[aria-label^="Dígito"]')

async function typeCode(wrapper: Wrapper, code: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
    clipboardData: { getData: () => string }
  }
  event.clipboardData = { getData: () => code }
  boxes(wrapper)[0]!.element.dispatchEvent(event)
  await flushPromises()
}

describe('VerifyEmailView', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
    document.body.innerHTML = ''
    status.value = pending()
    statusPending.value = false
    statusError.value = false
    refetchStatus.mockClear()
    send.mockReset()
    resend.mockReset()
    confirm.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
    vi.useRealTimers()
  })

  it('asks for the six digits sent to the masked email, and says how long they last', async () => {
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Revisa tu correo')
    expect(wrapper.text().replace(/\s+/g, ' ')).toContain(
      'Te enviamos un código de 6 dígitos a a•••@correo.com.',
    )
    expect(boxes(wrapper)).toHaveLength(6)
    expect(wrapper.text()).toContain('El código vence en 15 minutos.')
    expect(wrapper.text()).toContain('¿No te llega? Escríbenos a info@titantv.com.ec')
    expect(wrapper.text()).not.toContain('Estás cambiando tu correo')
  })

  it('warns when the code confirms a change of email', async () => {
    status.value = pending({ purpose: 'change_email' })
    const { wrapper } = await mountView()

    expect(wrapper.text()).toContain('Estás cambiando tu correo')
  })

  it('confirms the code and continues to the way back', async () => {
    confirm.mockResolvedValue(undefined)
    const { wrapper, router } = await mountView('/account/verify-email?redirect=/checkout/abc')

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    expect(confirm).toHaveBeenCalledTimes(1)
    expect(confirm).toHaveBeenCalledWith({ code: '123456' })
    expect(wrapper.get('h1').text()).toBe('Correo confirmado')
    expect(wrapper.text()).toContain('Tu cuenta está lista.')
    await buttonNamed(wrapper, 'Continuar')!.trigger('click')
    await flushPromises()
    expect(router.currentRoute.value.fullPath).toBe('/checkout/abc')
  })

  it('continues home when the way back points outside', async () => {
    confirm.mockResolvedValue(undefined)
    const { wrapper, router } = await mountView('/account/verify-email?redirect=//otro.sitio')

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()
    await buttonNamed(wrapper, 'Continuar')!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/')
  })

  it('says a wrong code is wrong, with the tries left, and starts the boxes over', async () => {
    confirm.mockRejectedValue(apiError(422, 'auth.email_verification_invalid'))
    const { wrapper } = await mountView()
    status.value = pending({ attemptsRemaining: 2 })

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    const alert = wrapper.get('[role="alert"]')
    expect(alert.text()).toContain('Código incorrecto')
    expect(alert.text()).toContain('Revisa el correo e intenta de nuevo.')
    expect(alert.text()).toContain('Te quedan 2 intentos.')
    expect(
      boxes(wrapper)
        .map((box) => (box.element as HTMLInputElement).value)
        .join(''),
    ).toBe('')
    expect(document.activeElement).toBe(boxes(wrapper)[0]!.element)
  })

  it('does not count tries the api did not give', async () => {
    confirm.mockRejectedValue(apiError(422, 'auth.email_verification_invalid'))
    const { wrapper } = await mountView()
    status.value = pending({ attemptsRemaining: null })

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).not.toContain('intento')
  })

  it('keeps "Pedir código nuevo" off, with the seconds left, while the minute after the last code lasts', async () => {
    status.value = pending({ expiresAt: new Date(Date.now() + 15 * MINUTE - 5_000).toISOString() })
    confirm.mockRejectedValue(apiError(422, 'auth.email_verification_no_attempts_left'))
    const { wrapper } = await mountView()

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    const waiting = wrapper
      .findAll('button')
      .find((each) => /Pedir código nuevo en \d+ s/.test(each.text()))
    expect(waiting?.attributes('disabled')).toBeDefined()

    await vi.advanceTimersByTimeAsync(60_000)
    expect(buttonNamed(wrapper, 'Pedir código nuevo')?.attributes('disabled')).toBeUndefined()
  })

  it('says the tries ran out, and offers a new code', async () => {
    confirm.mockRejectedValue(apiError(422, 'auth.email_verification_no_attempts_left'))
    send.mockResolvedValue(undefined)
    const { wrapper } = await mountView()

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    expect(wrapper.get('h1').text()).toBe('Se agotaron los intentos')
    await buttonNamed(wrapper, 'Pedir código nuevo')!.trigger('click')
    await flushPromises()
    expect(send).toHaveBeenCalledTimes(1)
  })

  it('leads back to the profile when the tries of an email change ran out', async () => {
    status.value = pending({ purpose: 'change_email' })
    confirm.mockRejectedValue(apiError(422, 'auth.email_verification_no_attempts_left'))
    const { wrapper } = await mountView()

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()

    expect(buttonNamed(wrapper, 'Volver al perfil')).toBeDefined()
  })

  it('says the code expired, with the real length, and sends another one', async () => {
    status.value = pending({ pending: false, expired: true })
    resend.mockResolvedValue(undefined)
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('El código venció')
    expect(wrapper.text()).toContain(
      'Los códigos duran 15 minutos. Pide uno nuevo y usa el del correo más reciente.',
    )
    await buttonNamed(wrapper, 'Reenviar código')!.trigger('click')
    await flushPromises()
    expect(resend).toHaveBeenCalledTimes(1)
  })

  it('sends a new code once, then waits a minute before allowing another', async () => {
    status.value = pending({ expiresAt: new Date(Date.now() + 10 * MINUTE).toISOString() })
    resend.mockResolvedValue(undefined)
    const { wrapper } = await mountView()

    await buttonNamed(wrapper, 'Reenviar código')!.trigger('click')
    await flushPromises()

    expect(resend).toHaveBeenCalledTimes(1)
    expect(wrapper.text()).toContain('Te enviamos un código nuevo')
    expect(wrapper.text()).toContain('El anterior ya no sirve: usa el del correo más reciente.')
    const waiting = wrapper.findAll('button').find((each) => /Reenviar en \d+ s/.test(each.text()))
    expect(waiting?.attributes('disabled')).toBeDefined()
  })

  it('waits for the minute after a code that was just sent', async () => {
    status.value = pending({ expiresAt: new Date(Date.now() + 15 * MINUTE - 5_000).toISOString() })
    const { wrapper } = await mountView()

    const waiting = wrapper.findAll('button').find((each) => /Reenviar en \d+ s/.test(each.text()))
    expect(waiting?.attributes('disabled')).toBeDefined()
  })

  it('says to wait when too many codes were asked for', async () => {
    resend.mockRejectedValue(apiError(429))
    const { wrapper } = await mountView()

    await buttonNamed(wrapper, 'Reenviar código')!.trigger('click')
    await flushPromises()

    expect(wrapper.get('[role="alert"]').text()).toContain(
      'Demasiados intentos. Espera unos minutos antes de pedir otro código.',
    )
  })

  it('offers to send a code when none is pending', async () => {
    status.value = pending({ pending: false, expired: false, maskedTargetEmail: null })
    send.mockResolvedValue(undefined)
    const { wrapper } = await mountView()

    expect(wrapper.get('h1').text()).toBe('Verifiquemos tu correo')
    expect(wrapper.text()).toContain(
      'Confirma tu dirección y ahí te avisamos de tus compras y tus facturas.',
    )
    expect(buttonNamed(wrapper, 'Ahora no')?.attributes('href')).toBe('/')
    await buttonNamed(wrapper, 'Enviar código')!.trigger('click')
    await flushPromises()

    expect(send).toHaveBeenCalledTimes(1)
  })

  it('returns to the contract once confirmed', async () => {
    confirm.mockResolvedValue(undefined)
    const { wrapper, router } = await mountView('/account/verify-email?redirect=/contracts/c1')

    await typeCode(wrapper, '123456')
    await buttonNamed(wrapper, 'Confirmar código')?.trigger('click')
    await flushPromises()
    await buttonNamed(wrapper, 'Volver al contrato')!.trigger('click')
    await flushPromises()

    expect(router.currentRoute.value.fullPath).toBe('/contracts/c1')
  })

  it('offers to retry when the state could not be loaded', async () => {
    status.value = undefined
    statusError.value = true
    const { wrapper } = await mountView()

    await buttonNamed(wrapper, 'Reintentar')!.trigger('click')
    expect(refetchStatus).toHaveBeenCalled()
  })
})
