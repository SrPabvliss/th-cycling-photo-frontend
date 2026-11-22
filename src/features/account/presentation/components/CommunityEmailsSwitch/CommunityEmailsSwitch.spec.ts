import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { AxiosError } from 'axios'
import { createPinia, setActivePinia } from 'pinia'
import { ref } from 'vue'

import { toCurrentUser } from '@/core/auth/current-user.mapper'
import { useSessionStore } from '@/core/auth/stores/session.store'
import CommunityEmailsSwitch from './CommunityEmailsSwitch.vue'

const success = vi.fn()
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success }),
}))

const setCommunityEmails = vi.fn()
const isPending = ref(false)
vi.mock('../../../composables/mutations/use-set-community-emails', () => ({
  useSetCommunityEmails: () => ({ mutateAsync: setCommunityEmails, isPending }),
}))

function signIn(user: { communityEmails: boolean; communityEmailsAvailable: boolean }) {
  useSessionStore().setSession(
    'token',
    toCurrentUser({
      id: 'u1',
      email: 'ana@correo.com',
      firstName: 'Ana',
      lastName: null,
      role: 'customer',
      ...user,
    } as never),
  )
}

const toggle = (wrapper: ReturnType<typeof mount>) =>
  wrapper.get('[data-test="community-emails-switch"]')

describe('CommunityEmailsSwitch', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    success.mockReset()
    setCommunityEmails.mockReset().mockResolvedValue(undefined)
    isPending.value = false
  })

  it('names the switch, says what it sends and shows the saved consent', () => {
    signIn({ communityEmails: true, communityEmailsAvailable: true })
    const wrapper = mount(CommunityEmailsSwitch)

    expect(wrapper.text()).toContain('Correos de fechas especiales')
    expect(wrapper.text()).toContain(
      'Celebremos juntos tus días importantes. Lo desactivas cuando quieras.',
    )
    expect(toggle(wrapper).attributes('role')).toBe('switch')
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect(toggle(wrapper).attributes('aria-labelledby')).toBe('community-emails-label')
  })

  it('turns them on', async () => {
    signIn({ communityEmails: false, communityEmailsAvailable: true })
    const wrapper = mount(CommunityEmailsSwitch)

    await toggle(wrapper).trigger('click')
    await flushPromises()

    expect(setCommunityEmails).toHaveBeenCalledWith(true)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
    expect(success).toHaveBeenCalledWith('Activamos los correos de fechas especiales.')
  })

  it('turns them off', async () => {
    signIn({ communityEmails: true, communityEmailsAvailable: true })
    const wrapper = mount(CommunityEmailsSwitch)

    await toggle(wrapper).trigger('click')
    await flushPromises()

    expect(setCommunityEmails).toHaveBeenCalledWith(false)
    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    expect(success).toHaveBeenCalledWith('Desactivamos los correos de fechas especiales.')
  })

  it('keeps the saved value and says so when it could not be changed', async () => {
    signIn({ communityEmails: false, communityEmailsAvailable: true })
    setCommunityEmails.mockRejectedValue(new AxiosError('Network Error', 'ERR_NETWORK'))
    const wrapper = mount(CommunityEmailsSwitch)

    await toggle(wrapper).trigger('click')
    await flushPromises()

    expect(toggle(wrapper).attributes('aria-checked')).toBe('false')
    expect(wrapper.find('[role="alert"], [role="status"]').exists()).toBe(true)
    expect(success).not.toHaveBeenCalled()
  })

  it('is not offered to someone the api does not offer it to', () => {
    signIn({ communityEmails: false, communityEmailsAvailable: false })
    const wrapper = mount(CommunityEmailsSwitch)

    expect(wrapper.find('[data-test="community-emails-switch"]').exists()).toBe(false)
  })

  it('still lets turn them off when they are on', () => {
    signIn({ communityEmails: true, communityEmailsAvailable: false })
    const wrapper = mount(CommunityEmailsSwitch)

    expect(toggle(wrapper).attributes('aria-checked')).toBe('true')
  })
})
