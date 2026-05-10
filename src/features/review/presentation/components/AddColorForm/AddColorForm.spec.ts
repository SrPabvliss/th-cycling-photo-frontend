import { describe, expect, it, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import AddColorForm from './AddColorForm.vue'

const mutate = vi.fn((_input, opts?: { onSuccess?: () => void }) => opts?.onSuccess?.())
vi.mock('../../../composables/mutations/use-add-photo-color', () => ({
  useAddPhotoColor: () => ({ mutate, isPending: { value: false } }),
}))

describe('AddColorForm', () => {
  const baseProps = { photoId: 'p-1', photoSlug: 's-1', region: 'helmet' as const }

  it('renders the form directly (parent controls visibility)', () => {
    const w = mount(AddColorForm, { props: baseProps })
    expect(w.text()).toContain('Primario')
    expect(w.text()).toContain('Secundario')
  })

  it('shows error when primary is missing on submit', async () => {
    const w = mount(AddColorForm, { props: baseProps })
    const saveBtn = w.findAll('button').find((b) => b.text() === 'Guardar')
    await saveBtn?.trigger('click')
    expect(w.text()).toContain('color primario')
    expect(mutate).not.toHaveBeenCalled()
  })

  it('triggers mutation with chosen primary color and emits done', async () => {
    mutate.mockClear()
    const w = mount(AddColorForm, { props: baseProps })
    const pickers = w.findAllComponents({ name: 'ColorPalettePicker' })
    pickers[0]?.vm.$emit('update:value', 'rojo')
    await flushPromises()
    const saveBtn = w.findAll('button').find((b) => b.text() === 'Guardar')
    await saveBtn?.trigger('click')
    await flushPromises()
    expect(mutate).toHaveBeenCalledWith(
      {
        photoId: 'p-1',
        photoSlug: 's-1',
        region: 'helmet',
        primaryColor: 'rojo',
        secondaryColor: null,
      },
      expect.any(Object),
    )
    expect(w.emitted('done')).toBeTruthy()
  })

  it('cancel emits cancel without mutation', async () => {
    mutate.mockClear()
    const w = mount(AddColorForm, { props: baseProps })
    const cancelBtn = w.findAll('button').find((b) => b.text() === 'Cancelar')
    await cancelBtn?.trigger('click')
    expect(mutate).not.toHaveBeenCalled()
    expect(w.emitted('cancel')).toBeTruthy()
  })
})
