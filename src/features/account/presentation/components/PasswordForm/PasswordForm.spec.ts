import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import PasswordForm from './PasswordForm.vue'

const mutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
const isPending = { value: false }
vi.mock('../../../composables/mutations/use-change-password', () => ({
  useChangePassword: () => ({ mutate, isPending }),
}))

async function fillAndSubmit(w: ReturnType<typeof mount>, values: string[]) {
  const inputs = w.findAll('input')
  await inputs[0]!.setValue(values[0])
  await inputs[1]!.setValue(values[1])
  await inputs[2]!.setValue(values[2])
  await w.find('form').trigger('submit')
  await flushPromises()
}

describe('PasswordForm', () => {
  it('does not submit when confirmation does not match the new password', async () => {
    mutate.mockClear()
    const w = mount(PasswordForm)
    await fillAndSubmit(w, ['CurrentPass1', 'NewPassword1', 'DifferentPassword1'])
    expect(mutate).not.toHaveBeenCalled()
  })

  it('submits the mutation with the current and new password on valid input', async () => {
    mutate.mockClear()
    const w = mount(PasswordForm)
    await fillAndSubmit(w, ['CurrentPass1', 'NewPassword1', 'NewPassword1'])
    expect(mutate).toHaveBeenCalledWith(
      { currentPassword: 'CurrentPass1', newPassword: 'NewPassword1' },
      expect.any(Object),
    )
  })

  it('keeps the fields filled when the server rejects the change', async () => {
    mutate.mockClear()
    mutate.mockImplementationOnce(() => {})
    const w = mount(PasswordForm)
    await fillAndSubmit(w, ['WrongCurrent1', 'NewPassword1', 'NewPassword1'])
    const inputs = w.findAll('input')
    expect((inputs[0]!.element as HTMLInputElement).value).toBe('WrongCurrent1')
    expect((inputs[1]!.element as HTMLInputElement).value).toBe('NewPassword1')
    expect((inputs[2]!.element as HTMLInputElement).value).toBe('NewPassword1')
  })
})
