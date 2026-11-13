import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DOMWrapper, flushPromises, mount } from '@vue/test-utils'
import { computed, defineComponent, h, ref } from 'vue'

import type { IUserPhone } from '../../../types/responses/user-phone.response'
import PhonesSection from './PhonesSection.vue'

const phones = ref<IUserPhone[]>([])
const remove = vi.fn()
const add = vi.fn()
const success = vi.fn()

vi.mock('../../../composables/queries/use-my-phones', () => ({
  useMyPhonesQuery: () => ({
    data: computed(() => phones.value),
    status: computed(() => 'success'),
    isFetching: ref(false),
    refetch: vi.fn(),
  }),
}))
vi.mock('../../../composables/mutations/use-add-phone', () => ({
  useAddPhone: () => ({ mutateAsync: add, isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-update-phone', () => ({
  useUpdatePhone: () => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-delete-phone', () => ({
  useDeletePhone: () => ({ mutateAsync: remove, isPending: ref(false) }),
}))
vi.mock('../../../composables/mutations/use-set-primary-phone', () => ({
  useSetPrimaryPhone: () => ({ mutateAsync: vi.fn(), isPending: ref(false) }),
}))
vi.mock('naive-ui', async (original) => ({
  ...(await original<typeof import('naive-ui')>()),
  useMessage: () => ({ success }),
}))
vi.mock('intl-tel-input/styles', () => ({}))
vi.mock('intl-tel-input/vueWithUtils', () => ({
  default: defineComponent({
    props: { inputProps: { type: Object, default: () => ({}) }, options: Object },
    emits: ['changeNumber', 'changeValidity'],
    setup(props, { emit }) {
      return () =>
        h('input', {
          ...props.inputProps,
          type: 'tel',
          onInput: (event: Event) => {
            const digits = (event.target as HTMLInputElement).value.replace(/\D/g, '')
            emit('changeNumber', digits ? `+593${digits}` : '')
            emit('changeValidity', digits.length === 9)
          },
        })
    },
  }),
}))

const phone = (id: string, isPrimary: boolean, isWhatsapp = true): IUserPhone => ({
  id,
  phoneNumber: `+59399${id.padStart(7, '0')}`,
  label: id === 'p1' ? 'Personal' : null,
  isWhatsapp,
  isPrimary,
})

const mounted: { unmount(): void }[] = []
async function mountSection() {
  mounted.push(mount(PhonesSection, { attachTo: document.body }))
  await flushPromises()
  return new DOMWrapper(document.body)
}
const buttonNamed = (wrapper: DOMWrapper<Element>, name: string) =>
  wrapper.findAll('button').find((each) => each.text().replace(/\s+/g, ' ').trim() === name)

describe('PhonesSection', () => {
  beforeEach(() => {
    document.body.innerHTML = ''
    phones.value = [phone('p1', true), phone('p2', false, false)]
    remove.mockReset()
    add.mockReset()
    success.mockReset()
  })
  afterEach(() => {
    while (mounted.length) mounted.pop()!.unmount()
  })

  it('lists each number with its label, the main one and WhatsApp', async () => {
    const wrapper = await mountSection()

    const rows = wrapper.findAll('.phones-section__row')
    expect(rows).toHaveLength(2)
    expect(rows[0]!.text()).toContain('Principal')
    expect(rows[0]!.text()).toContain('Personal · Recibe WhatsApp')
    expect(rows[1]!.text()).toContain('Sin WhatsApp')
  })

  it('does not offer to delete the only number', async () => {
    phones.value = [phone('p1', true)]
    const wrapper = await mountSection()

    await wrapper.findAll('.phones-section__row')[0]!.trigger('click')
    await flushPromises()

    expect(buttonNamed(wrapper, 'Eliminar')).toBeUndefined()
  })

  it('asks before deleting, and says it was deleted', async () => {
    remove.mockResolvedValue({ id: 'p2' })
    const wrapper = await mountSection()

    await wrapper.findAll('.phones-section__row')[1]!.trigger('click')
    await flushPromises()
    await buttonNamed(wrapper, 'Eliminar')!.trigger('click')
    await flushPromises()

    expect(remove).not.toHaveBeenCalled()
    expect(wrapper.text()).toContain('¿Eliminar este teléfono?')
    await buttonNamed(wrapper, 'Eliminar teléfono')!.trigger('click')
    await flushPromises()

    expect(remove).toHaveBeenCalledWith('p2')
    expect(success).toHaveBeenCalledWith('Teléfono eliminado.')
  })

  it('adds a number with its code', async () => {
    add.mockResolvedValue({ id: 'p3' })
    const wrapper = await mountSection()

    await buttonNamed(wrapper, 'Agregar teléfono')!.trigger('click')
    await flushPromises()
    await wrapper.get('#telefono-numero').setValue('987654321')
    await wrapper.get('#telefono-numero').trigger('input')
    await buttonNamed(wrapper, 'Guardar teléfono')!.trigger('click')
    await flushPromises()

    expect(add).toHaveBeenCalledWith({
      phoneNumber: '+593987654321',
      label: undefined,
      isWhatsapp: true,
    })
    expect(success).toHaveBeenCalledWith('Teléfono guardado.')
  })

  it('names an empty number', async () => {
    const wrapper = await mountSection()

    await buttonNamed(wrapper, 'Agregar teléfono')!.trigger('click')
    await flushPromises()
    await buttonNamed(wrapper, 'Guardar teléfono')!.trigger('click')
    await flushPromises()

    expect(wrapper.text()).toContain('Escribe tu número.')
    expect(add).not.toHaveBeenCalled()
  })
})
