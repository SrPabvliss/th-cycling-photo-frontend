import { flushPromises, mount } from '@vue/test-utils'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

vi.mock('@/core/layout/public/PublicLayout.vue', () => ({
  default: { name: 'PublicLayout', template: '<div><slot /></div>' },
}))

vi.mock('@vueuse/core', () => ({
  useIntervalFn: () => ({ pause: vi.fn(), resume: vi.fn() }),
}))

type EmailVerificationStatus = {
  pending: boolean
  expired: boolean
  purpose: 'verify_current' | 'change_email' | null
  maskedTargetEmail: string | null
  expiresAt: string | null
  attemptsRemaining: number | null
}

const statusData = ref<EmailVerificationStatus | null>(null)
const isStatusPending = ref(false)
const isStatusError = ref(false)
const refetchStatus = vi.fn(async () => ({ data: statusData.value }))

vi.mock('../../composables/queries/use-email-verification-status', () => ({
  useEmailVerificationStatusQuery: () => ({
    data: statusData,
    isPending: isStatusPending,
    isError: isStatusError,
    refetch: refetchStatus,
  }),
}))

const sendMutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const sendIsPending = ref(false)
vi.mock('../../composables/mutations/use-send-email-verification', () => ({
  useSendEmailVerification: () => ({ mutate: sendMutate, isPending: sendIsPending }),
}))

const resendMutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const resendIsPending = ref(false)
vi.mock('../../composables/mutations/use-resend-email-verification', () => ({
  useResendEmailVerification: () => ({ mutate: resendMutate, isPending: resendIsPending }),
}))

type ConfirmMutateOpts = { onSuccess?: () => void; onError?: () => void }
const confirmMutate = vi.fn((_input: { code: string }, opts?: ConfirmMutateOpts) =>
  opts?.onSuccess?.(),
)
const confirmIsPending = ref(false)
const confirmIsError = ref(false)
const confirmReset = vi.fn(() => {
  confirmIsError.value = false
})
vi.mock('../../composables/mutations/use-confirm-email-verification', () => ({
  useConfirmEmailVerification: () => ({
    mutate: confirmMutate,
    isPending: confirmIsPending,
    isError: confirmIsError,
    reset: confirmReset,
  }),
}))

import VerifyEmailView from './VerifyEmailView.vue'

function mountView() {
  return mount(VerifyEmailView)
}

const pendingVerifyCurrent: EmailVerificationStatus = {
  pending: true,
  expired: false,
  purpose: 'verify_current',
  maskedTargetEmail: 'ej***@gmail.com',
  expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
  attemptsRemaining: 5,
}

const expiredChangeEmail: EmailVerificationStatus = {
  pending: false,
  expired: true,
  purpose: 'change_email',
  maskedTargetEmail: 'nu***@gmail.com',
  expiresAt: new Date(Date.now() - 60_000).toISOString(),
  attemptsRemaining: 5,
}

beforeEach(() => {
  push.mockClear()
  sendMutate.mockClear()
  resendMutate.mockClear()
  confirmMutate.mockClear()
  refetchStatus.mockClear()
  confirmReset.mockClear()
  statusData.value = null
  isStatusPending.value = false
  isStatusError.value = false
  sendIsPending.value = false
  resendIsPending.value = false
  confirmIsPending.value = false
  confirmIsError.value = false
  confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => opts?.onSuccess?.())
})

describe('VerifyEmailView', () => {
  it('offers to send a code when nothing is pending', async () => {
    statusData.value = {
      pending: false,
      expired: false,
      purpose: null,
      maskedTargetEmail: null,
      expiresAt: null,
      attemptsRemaining: null,
    }

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('Enviar código')
    const button = w.findAll('button').find((b) => b.text().includes('Enviar código'))
    expect(button).toBeTruthy()
    await button!.trigger('click')
    expect(sendMutate).toHaveBeenCalled()
  })

  it('shows the form when there is a valid pending code', async () => {
    statusData.value = { ...pendingVerifyCurrent }

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('ej***@gmail.com')
    expect(w.find('input').exists()).toBe(true)
    expect(w.text()).toContain('Confirmar código')
  })

  it('calls the confirm mutation with the entered code', async () => {
    statusData.value = { ...pendingVerifyCurrent }

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('123456')

    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')

    expect(confirmMutate).toHaveBeenCalledWith({ code: '123456' }, expect.any(Object))
  })

  it('does not clear the code field when the confirmation fails', async () => {
    statusData.value = { ...pendingVerifyCurrent, attemptsRemaining: 4 }
    confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => {
      opts?.onError?.()
    })

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('111111')

    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')
    await flushPromises()

    expect((w.find('input').element as HTMLInputElement).value).toBe('111111')
  })

  it('shows the exhausted screen when a failed confirm makes the status stop being pending', async () => {
    statusData.value = { ...pendingVerifyCurrent, attemptsRemaining: 1 }
    confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => {
      statusData.value = {
        pending: false,
        expired: false,
        purpose: null,
        maskedTargetEmail: null,
        expiresAt: null,
        attemptsRemaining: null,
      }
      opts?.onError?.()
    })

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('999999')
    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')
    await flushPromises()

    expect(refetchStatus).toHaveBeenCalled()
    expect(w.text()).toContain('Se agotaron los intentos')
    expect(w.text()).toContain('Pedir código nuevo')
  })

  it('does not claim attempts ran out when the code merely expired', async () => {
    statusData.value = { ...pendingVerifyCurrent, attemptsRemaining: 1 }
    confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => {
      statusData.value = { ...pendingVerifyCurrent, pending: false, expired: true }
      opts?.onError?.()
    })

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('999999')
    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')
    await flushPromises()

    expect(w.text()).not.toContain('Se agotaron los intentos')
    expect(w.text()).toContain('Reenviar código')
  })

  it('offers a way back to the profile when attempts run out on a change_email flow', async () => {
    statusData.value = {
      pending: true,
      expired: false,
      purpose: 'change_email',
      maskedTargetEmail: 'nu***@gmail.com',
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      attemptsRemaining: 1,
    }
    confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => {
      statusData.value = {
        pending: false,
        expired: false,
        purpose: null,
        maskedTargetEmail: null,
        expiresAt: null,
        attemptsRemaining: null,
      }
      opts?.onError?.()
    })

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('888888')
    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')
    await flushPromises()

    expect(w.text()).toContain('Se agotaron los intentos')
    expect(w.text()).toContain('Volver al perfil')
    expect(w.text()).not.toContain('Pedir código nuevo')

    const profileButton = w.findAll('button').find((b) => b.text().includes('Volver al perfil'))
    await profileButton!.trigger('click')
    expect(push).toHaveBeenCalled()
  })

  it('offers a way back to the profile when a change_email confirmation fails without exhausting attempts', async () => {
    statusData.value = {
      pending: true,
      expired: false,
      purpose: 'change_email',
      maskedTargetEmail: 'nu***@gmail.com',
      expiresAt: new Date(Date.now() + 10 * 60_000).toISOString(),
      attemptsRemaining: 3,
    }
    confirmMutate.mockImplementation((_input, opts?: ConfirmMutateOpts) => {
      confirmIsError.value = true
      opts?.onError?.()
    })

    const w = mountView()
    await flushPromises()

    const input = w.find('input')
    await input.setValue('222222')
    const confirmButton = w.findAll('button').find((b) => b.text().includes('Confirmar código'))
    await confirmButton!.trigger('click')
    await flushPromises()

    expect(w.text()).toContain('Volver al perfil')
    const profileLink = w.findAll('a').find((a) => a.text().includes('Volver al perfil'))
    await profileLink!.trigger('click')
    expect(push).toHaveBeenCalled()
  })

  it('shows the expired screen with a resend action when the backend reports an expired code, preserving the change_email target', async () => {
    statusData.value = { ...expiredChangeEmail }

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('El código venció')
    expect(w.text()).toContain('nu***@gmail.com')
    expect(w.text()).toContain('pasa a ser con la que inicias sesión')

    const resendButton = w.findAll('button').find((b) => b.text().includes('Reenviar código'))
    expect(resendButton).toBeTruthy()
    await resendButton!.trigger('click')

    expect(resendMutate).toHaveBeenCalled()
    expect(sendMutate).not.toHaveBeenCalled()
  })

  it('stays on the offer screen when nothing is pending and nothing is expired', async () => {
    statusData.value = {
      pending: false,
      expired: false,
      purpose: null,
      maskedTargetEmail: null,
      expiresAt: null,
      attemptsRemaining: null,
    }

    const w = mountView()
    await flushPromises()

    expect(w.text()).toContain('Verifiquemos tu correo')
    expect(w.text()).not.toContain('El código venció')
  })

  it('tells the user the previous code stopped working after a resend', async () => {
    statusData.value = { ...pendingVerifyCurrent }

    const w = mountView()
    await flushPromises()

    const resendButton = w.findAll('button').find((b) => b.text().includes('Reenviar código'))
    await resendButton!.trigger('click')
    await flushPromises()

    expect(w.text()).toContain('ya no sirve')
  })
})
