import { describe, expect, it, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { NModal } from 'naive-ui'
import VerifyEmailPrompt from './VerifyEmailPrompt.vue'

const push = vi.fn()
const currentRouteName = ref<string>('some-other-route')
vi.mock('vue-router', () => ({
  useRouter: () => ({ push }),
  useRoute: () => ({
    get name() {
      return currentRouteName.value
    },
  }),
}))

const authState = reactive({
  currentUser: { pendingPrompts: ['email_verification'] } as { pendingPrompts: string[] } | null,
})
vi.mock('@/core/auth/stores/session.store', () => ({
  useSessionStore: () => authState,
}))

const mutate = vi.fn()
const isPending = { value: false }
vi.mock('../../../composables/mutations/use-snooze-prompt', () => ({
  useSnoozePrompt: () => ({ mutate, isPending }),
}))

const modalStub = {
  props: ['show'],
  template: '<div v-if="show"><slot /><slot name="footer" /></div>',
}

function mountPrompt() {
  return mount(VerifyEmailPrompt, { global: { stubs: { Modal: modalStub } } })
}

beforeEach(() => {
  push.mockClear()
  mutate.mockClear()
  currentRouteName.value = 'some-other-route'
  authState.currentUser = { pendingPrompts: ['email_verification'] }
})

describe('VerifyEmailPrompt', () => {
  it('shows when the key is in pendingPrompts', () => {
    const w = mountPrompt()
    expect(w.text()).toContain('Verificar ahora')
  })

  it('does not show when the key is not in pendingPrompts', () => {
    authState.currentUser = { pendingPrompts: [] }
    const w = mountPrompt()
    expect(w.text()).not.toContain('Verificar ahora')
  })

  it('does not show when the key is present but not first in pendingPrompts', () => {
    authState.currentUser = { pendingPrompts: ['personal_profile', 'email_verification'] }
    const w = mountPrompt()
    expect(w.text()).not.toContain('Verificar ahora')
  })

  it.each([['cart-checkout'], ['payment-box'], ['payment-return'], ['account-verify-email']])(
    'does not show on the %s route',
    (routeName) => {
      currentRouteName.value = routeName
      const w = mountPrompt()
      expect(w.text()).not.toContain('Verificar ahora')
    },
  )

  it('calls the snooze mutation and hides when "Más tarde" is clicked', async () => {
    const w = mountPrompt()
    const laterButton = w.findAll('button').find((b) => b.text().includes('Más tarde'))
    await laterButton!.trigger('click')

    expect(mutate).toHaveBeenCalledWith('email_verification')
    expect(w.text()).not.toContain('Verificar ahora')
  })

  it('navigates to the verification page when "Verificar ahora" is clicked', async () => {
    const w = mountPrompt()
    const verifyButton = w.findAll('button').find((b) => b.text().includes('Verificar ahora'))
    await verifyButton!.trigger('click')

    expect(push).toHaveBeenCalledWith({ name: 'account-verify-email' })
  })

  it('does not snooze when the modal is closed without a deliberate "Más tarde" click', async () => {
    const w = mountPrompt()
    await w.findComponent(NModal).vm.$emit('close')

    expect(mutate).not.toHaveBeenCalled()
    expect(w.text()).not.toContain('Verificar ahora')
  })
})
