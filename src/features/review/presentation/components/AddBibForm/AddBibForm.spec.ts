import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddBibForm from './AddBibForm.vue'

const mutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
vi.mock('../../../composables/mutations/use-add-photo-bib', () => ({
  useAddPhotoBib: () => ({ mutate, isPending: { value: false } }),
}))

describe('AddBibForm', () => {
  it('renders the input panel directly (parent controls visibility)', () => {
    const w = mount(AddBibForm, { props: { photoId: 'p-1', photoSlug: 's-1' } })
    expect(w.find('input').exists()).toBe(true)
  })

  it('rejects invalid digits with error message', async () => {
    const w = mount(AddBibForm, { props: { photoId: 'p-1', photoSlug: 's-1' } })
    await w.find('input').setValue('abc')
    const buttons = w.findAll('button')
    const saveBtn = buttons.find((b) => b.text() === 'Guardar')
    await saveBtn?.trigger('click')
    expect(w.text()).toContain('Dígitos')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('triggers mutation with valid digits and emits done on success', async () => {
    mutate.mockClear()
    const w = mount(AddBibForm, { props: { photoId: 'p-1', photoSlug: 's-1' } })
    await w.find('input').setValue('42')
    const saveBtn = w.findAll('button').find((b) => b.text() === 'Guardar')
    await saveBtn?.trigger('click')
    await flushPromises()
    expect(mutate).toHaveBeenCalledWith(
      { photoId: 'p-1', photoSlug: 's-1', digits: '42' },
      expect.any(Object),
    )
    expect(w.emitted('done')).toBeTruthy()
  })

  it('cancel emits cancel without firing mutation', async () => {
    mutate.mockClear()
    const w = mount(AddBibForm, { props: { photoId: 'p-1', photoSlug: 's-1' } })
    const cancelBtn = w.findAll('button').find((b) => b.text() === 'Cancelar')
    await cancelBtn?.trigger('click')
    expect(mutate).not.toHaveBeenCalled()
    expect(w.emitted('cancel')).toBeTruthy()
  })
})
