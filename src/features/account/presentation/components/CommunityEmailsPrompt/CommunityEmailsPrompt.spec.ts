import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { reactive, ref } from 'vue'
import { NModal } from 'naive-ui'
import CommunityEmailsPrompt from './CommunityEmailsPrompt.vue'

const currentRouteName = ref<string>('some-other-route')
vi.mock('vue-router', () => ({
  useRoute: () => ({
    get name() {
      return currentRouteName.value
    },
  }),
}))

type User = { pendingPrompts: string[]; communityEmailsAvailable: boolean }
const authState = reactive({ currentUser: null as User | null })
vi.mock('@/core/auth/stores/session.store', () => ({
  useSessionStore: () => authState,
}))

const snooze = vi.fn()
vi.mock('../../../composables/mutations/use-snooze-prompt', () => ({
  useSnoozePrompt: () => ({ mutate: snooze, isPending: { value: false } }),
}))

const activate = vi.fn()
const isActivating = ref(false)
vi.mock('../../../composables/mutations/use-set-community-emails', () => ({
  useSetCommunityEmails: () => ({ mutateAsync: activate, isPending: isActivating }),
}))

const modalStub = {
  name: 'Modal',
  props: ['show', 'closable'],
  template: '<div v-if="show"><slot name="header-extra" /><slot /><slot name="footer" /></div>',
}

const TEXT = 'La carrera termina en la meta, pero la comunidad sigue.'

function mountPrompt() {
  return mount(CommunityEmailsPrompt, { global: { stubs: { Modal: modalStub } } })
}
const button = (wrapper: ReturnType<typeof mountPrompt>, name: string) =>
  wrapper.findAll('button').find((each) => each.text().trim() === name)!

beforeEach(() => {
  snooze.mockClear()
  activate.mockReset().mockResolvedValue(undefined)
  isActivating.value = false
  currentRouteName.value = 'some-other-route'
  authState.currentUser = { pendingPrompts: ['community_emails'], communityEmailsAvailable: true }
})

describe('CommunityEmailsPrompt', () => {
  it('asks when community_emails is the first pending prompt', () => {
    const wrapper = mountPrompt()

    expect(wrapper.text()).toContain(TEXT)
    expect(button(wrapper, 'Quiero ser parte').exists()).toBe(true)
    expect(button(wrapper, 'Ahora no').exists()).toBe(true)
  })

  it('waits for the prompts that go before it', () => {
    authState.currentUser = {
      pendingPrompts: ['email_verification', 'community_emails'],
      communityEmailsAvailable: true,
    }
    expect(mountPrompt().text()).not.toContain(TEXT)
  })

  it('never asks someone the api does not offer them to', () => {
    authState.currentUser = {
      pendingPrompts: ['community_emails'],
      communityEmailsAvailable: false,
    }
    expect(mountPrompt().text()).not.toContain(TEXT)
  })

  it('does not ask without a session', () => {
    authState.currentUser = null
    expect(mountPrompt().text()).not.toContain(TEXT)
  })

  it.each([['cart-checkout'], ['payment-box'], ['account-email-unsubscribe']])(
    'does not ask on the %s route',
    (routeName) => {
      currentRouteName.value = routeName
      expect(mountPrompt().text()).not.toContain(TEXT)
    },
  )

  it('turns them on and closes when "Quiero ser parte" is pressed', async () => {
    const wrapper = mountPrompt()

    await button(wrapper, 'Quiero ser parte').trigger('click')
    await flushPromises()

    expect(activate).toHaveBeenCalledWith(true)
    expect(snooze).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain(TEXT)
  })

  it('stays open when turning them on fails, to try again', async () => {
    activate.mockRejectedValue(new Error('down'))
    const wrapper = mountPrompt()

    await button(wrapper, 'Quiero ser parte').trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain(TEXT)
  })

  it('snoozes and closes when "Ahora no" is pressed', async () => {
    const wrapper = mountPrompt()

    await button(wrapper, 'Ahora no').trigger('click')

    expect(snooze).toHaveBeenCalledWith('community_emails')
    expect(activate).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain(TEXT)
  })

  it('closes without snoozing from the close button or the mask', async () => {
    const wrapper = mountPrompt()

    await wrapper.findComponent(NModal).vm.$emit('close')

    expect(snooze).not.toHaveBeenCalled()
    expect(activate).not.toHaveBeenCalled()
    expect(wrapper.text()).not.toContain(TEXT)
  })
})
