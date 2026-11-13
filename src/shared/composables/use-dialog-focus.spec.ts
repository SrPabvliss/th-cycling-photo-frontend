import { afterEach, describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import { useDialogFocus } from './use-dialog-focus'

const Dialog = defineComponent({
  props: { open: Boolean },
  emits: ['close'],
  setup(props, { emit }) {
    const panel = ref<HTMLElement | null>(null)
    useDialogFocus(
      panel,
      () => props.open,
      () => emit('close'),
    )
    return () =>
      props.open
        ? h('div', { ref: panel, tabindex: -1 }, [
            h('button', { id: 'first' }, 'uno'),
            h('button', { id: 'last' }, 'dos'),
          ])
        : null
  },
})

function mountWithTrigger(open = false) {
  document.body.innerHTML = '<button id="trigger">abrir</button>'
  const trigger = document.getElementById('trigger') as HTMLButtonElement
  trigger.focus()
  const wrapper = mount(Dialog, { props: { open }, attachTo: document.body })
  return { wrapper, trigger }
}

const press = (key: string, shiftKey = false) =>
  document.dispatchEvent(
    new KeyboardEvent('keydown', { key, shiftKey, bubbles: true, cancelable: true }),
  )

describe('useDialogFocus', () => {
  afterEach(() => {
    document.body.innerHTML = ''
    document.documentElement.style.overflow = ''
  })

  it('moves the focus into the dialog when it opens', async () => {
    const { wrapper } = mountWithTrigger()

    await wrapper.setProps({ open: true })
    await nextTick()

    expect(document.activeElement?.id).toBe('first')
  })

  it('gives the focus back to what opened it when it closes', async () => {
    const { wrapper, trigger } = mountWithTrigger()
    await wrapper.setProps({ open: true })
    await nextTick()

    await wrapper.setProps({ open: false })
    await nextTick()

    expect(document.activeElement).toBe(trigger)
  })

  it('asks to close on Escape, only while open', async () => {
    const { wrapper } = mountWithTrigger()
    press('Escape')
    expect(wrapper.emitted('close')).toBeUndefined()

    await wrapper.setProps({ open: true })
    await nextTick()
    press('Escape')

    expect(wrapper.emitted('close')).toHaveLength(1)
  })

  it('keeps Tab inside, around both ends', async () => {
    const { wrapper } = mountWithTrigger()
    await wrapper.setProps({ open: true })
    await nextTick()

    document.getElementById('last')!.focus()
    press('Tab')
    expect(document.activeElement?.id).toBe('first')

    press('Tab', true)
    expect(document.activeElement?.id).toBe('last')
  })

  it('stops the page behind from scrolling while open, and lets it go after', async () => {
    const { wrapper } = mountWithTrigger()
    await wrapper.setProps({ open: true })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('hidden')

    await wrapper.setProps({ open: false })
    await nextTick()
    expect(document.documentElement.style.overflow).toBe('')
  })

  it('lets the page go when it is removed while open', async () => {
    const { wrapper } = mountWithTrigger(true)
    await nextTick()

    wrapper.unmount()

    expect(document.documentElement.style.overflow).toBe('')
  })
})
