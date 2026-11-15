import { afterEach, describe, expect, it, vi } from 'vitest'

import { sendClientForm } from './form.utils'

function fakeForm(state: { canSubmit: boolean; isValid: boolean }) {
  const calls: string[] = []
  return {
    calls,
    form: {
      state,
      validateAllFields: vi.fn(async () => void calls.push('validate')),
      handleSubmit: vi.fn(async () => void calls.push('submit')),
    },
  }
}

describe('sendClientForm', () => {
  afterEach(() => {
    document.body.innerHTML = ''
  })

  it('checks every field again before sending a form that was left invalid', async () => {
    const { form, calls } = fakeForm({ canSubmit: false, isValid: true })

    await sendClientForm(form, null)

    expect(calls).toEqual(['validate', 'submit'])
  })

  it('only sends a form with nothing pending', async () => {
    const { form, calls } = fakeForm({ canSubmit: true, isValid: true })

    await sendClientForm(form, null)

    expect(calls).toEqual(['submit'])
  })

  it('puts the focus on the first field in error when the form stays invalid', async () => {
    document.body.innerHTML =
      '<form><input id="ok" /><input id="bad" aria-invalid="true" /><input aria-invalid="true" /></form>'
    const { form } = fakeForm({ canSubmit: false, isValid: false })

    await sendClientForm(form, document.querySelector('form'))

    expect(document.activeElement?.id).toBe('bad')
  })
})
