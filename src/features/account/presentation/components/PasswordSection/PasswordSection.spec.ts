import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { AxiosError, type AxiosResponse } from 'axios'
import { ref } from 'vue'

import PasswordSection from './PasswordSection.vue'

const change = vi.fn()
const success = vi.fn()

vi.mock('../../../composables/mutations/use-change-password', () => ({
  useChangePassword: () => ({ mutateAsync: change, isPending: ref(false) }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success }),
}))

const mounted: { unmount(): void }[] = []
async function mountSection() {
  mounted.push(mount(PasswordSection, { attachTo: document.body }))
  await flushPromises()
  return new DOMWrapper(document.body)
}
const value = (wrapper: DOMWrapper<Element>, id: string) =>
  (wrapper.get(`#${id}`).element as HTMLInputElement).value
const errorOf = (wrapper: DOMWrapper<Element>, id: string) => {
  const errorId = (wrapper.get(`#${id}`).attributes('aria-describedby') ?? '')
    .split(' ')
    .find((each) => each.endsWith('-error'))
  return errorId ? (document.getElementById(errorId)?.textContent?.trim() ?? null) : null
}

async function fill(
  wrapper: DOMWrapper<Element>,
  current = 'vieja1234',
  next = 'ñandú2026',
  repeat = next,
) {
  await wrapper.get('#clave-actual').setValue(current)
  await wrapper.get('#clave-nueva').setValue(next)
  await wrapper.get('#clave-repite').setValue(repeat)
  await wrapper.get('form').trigger('submit')
  await flushPromises()
}

describe('PasswordSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    change.mockReset()
    success.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('names what is missing', async () => {
    const wrapper = await mountSection()

    await wrapper.get('form').trigger('submit')
    await flushPromises()

    expect(errorOf(wrapper, 'clave-actual')).toBe('Escribe tu contraseña actual.')
    expect(errorOf(wrapper, 'clave-nueva')).toBe('La contraseña no cumple los requisitos.')
    expect(errorOf(wrapper, 'clave-repite')).toBe('Repite la contraseña nueva.')
  })

  it('says when the current password is not the right one, keeping the new one', async () => {
    const response = {
      status: 422,
      data: { error: { messageKey: 'auth.current_password_invalid' } },
      headers: {},
      config: {},
    } as AxiosResponse
    change.mockRejectedValue(new AxiosError('x', 'ERR_BAD_REQUEST', undefined, undefined, response))
    const wrapper = await mountSection()

    await fill(wrapper)

    expect(errorOf(wrapper, 'clave-actual')).toBe('La contraseña actual no coincide.')
    expect(value(wrapper, 'clave-nueva')).toBe('ñandú2026')
    expect(success).not.toHaveBeenCalled()
  })

  it('changes it, says so and empties the fields', async () => {
    change.mockResolvedValue(null)
    const wrapper = await mountSection()

    await fill(wrapper)

    expect(change).toHaveBeenCalledWith({ currentPassword: 'vieja1234', newPassword: 'ñandú2026' })
    expect(success).toHaveBeenCalledWith('Contraseña actualizada.')
    expect(value(wrapper, 'clave-actual')).toBe('')
    expect(value(wrapper, 'clave-nueva')).toBe('')
    expect(value(wrapper, 'clave-repite')).toBe('')
  })
})
