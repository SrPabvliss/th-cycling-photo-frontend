import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { reactive } from 'vue'
import EmailSection from './EmailSection.vue'

const push = vi.fn()
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
}))

const authState = reactive({
  currentUser: { email: 'ana@example.com', emailVerified: false } as {
    email: string
    emailVerified: boolean
  } | null,
})
vi.mock('@/features/auth/stores/auth.store', () => ({
  useAuthStore: () => authState,
}))

const mutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const isPending = { value: false }
vi.mock('../../../composables/mutations/use-change-email', () => ({
  useChangeEmail: () => ({ mutate, isPending }),
}))

function mountSection() {
  return mount(EmailSection, {
    global: { stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
}

async function openChangeForm(w: ReturnType<typeof mount>) {
  const trigger = w.findAll('button').find((b) => b.text().includes('Cambiar correo'))
  await trigger!.trigger('click')
}

async function fillAndSubmit(w: ReturnType<typeof mount>, newEmail: string, password: string) {
  await openChangeForm(w)
  const inputs = w.findAll('input')
  await inputs[0]!.setValue(newEmail)
  await inputs[1]!.setValue(password)
  await w.find('form').trigger('submit')
  await flushPromises()
}

describe('EmailSection', () => {
  it('requests the change with both values and navigates to the verification page', async () => {
    mutate.mockClear()
    push.mockClear()
    const w = mountSection()
    await fillAndSubmit(w, 'nueva@example.com', 'CurrentPass1')

    expect(mutate).toHaveBeenCalledWith(
      { newEmail: 'nueva@example.com', currentPassword: 'CurrentPass1' },
      expect.any(Object),
    )
    expect(push).toHaveBeenCalledWith({ name: 'account-verify-email' })
  })

  it('keeps the password out of sight until the change is requested', () => {
    const w = mountSection()

    expect(w.findAll('input')).toHaveLength(0)
    expect(w.text()).not.toContain('Contraseña actual')
  })

  it('shows the verified badge when the session says the email is verified', () => {
    authState.currentUser = { email: 'ana@example.com', emailVerified: true }
    const w = mountSection()

    expect(w.text()).toContain('Verificado')
    expect(w.text()).not.toContain('Sin verificar')
  })

  it('shows a calm pending state with a link when the email is not verified', () => {
    authState.currentUser = { email: 'ana@example.com', emailVerified: false }
    const w = mountSection()

    expect(w.text()).toContain('Todavía sin verificar')
    expect(w.text()).toContain('Verificar ahora')
    expect(w.text()).toContain('ana@example.com')
  })
})
