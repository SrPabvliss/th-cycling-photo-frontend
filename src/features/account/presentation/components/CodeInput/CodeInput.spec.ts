import { afterEach, describe, expect, it } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { ref } from 'vue'

import CodeInput from './CodeInput.vue'

let wrapper: VueWrapper | null = null

function mountInput(initial = '') {
  const model = ref(initial)
  wrapper = mount(CodeInput, {
    attachTo: document.body,
    props: {
      modelValue: model.value,
      'onUpdate:modelValue': (value: string) => {
        model.value = value
        void wrapper!.setProps({ modelValue: value })
      },
    },
  })
  const boxes = () => wrapper!.findAll('input')
  const values = () =>
    boxes()
      .map((box) => (box.element as HTMLInputElement).value)
      .join('')
  return { model, boxes, values }
}

function paste(target: Element, text: string) {
  const event = new Event('paste', { bubbles: true, cancelable: true }) as Event & {
    clipboardData: { getData: () => string }
  }
  event.clipboardData = { getData: () => text }
  target.dispatchEvent(event)
}

afterEach(() => {
  wrapper?.unmount()
  wrapper = null
})

describe('CodeInput', () => {
  it('has six labelled single-digit boxes, the first one for the one-time code', () => {
    const { boxes } = mountInput()

    expect(boxes()).toHaveLength(6)
    expect(boxes().map((box) => box.attributes('aria-label'))).toEqual([
      'Dígito 1',
      'Dígito 2',
      'Dígito 3',
      'Dígito 4',
      'Dígito 5',
      'Dígito 6',
    ])
    expect(boxes()[0]!.attributes('autocomplete')).toBe('one-time-code')
    expect(boxes().every((box) => box.attributes('inputmode') === 'numeric')).toBe(true)
  })

  it.each(['123456', '123 456', '123-456'])('spreads a pasted %j and completes', async (text) => {
    const { model, values } = mountInput()

    paste(wrapper!.findAll('input')[0]!.element, text)
    await wrapper!.vm.$nextTick()

    expect(values()).toBe('123456')
    expect(model.value).toBe('123456')
    expect(wrapper!.emitted('complete')).toEqual([['123456']])
  })

  it('keeps only the digits of a paste', async () => {
    const { model } = mountInput()

    paste(wrapper!.findAll('input')[0]!.element, '12ab')
    await wrapper!.vm.$nextTick()

    expect(model.value).toBe('12')
    expect(wrapper!.emitted('complete')).toBeUndefined()
  })

  it('moves on as digits are typed and ignores anything else', async () => {
    const { boxes, model } = mountInput()

    await boxes()[0]!.setValue('4')
    expect(document.activeElement).toBe(boxes()[1]!.element)
    await boxes()[1]!.setValue('x')
    expect(model.value).toBe('4')
    expect(document.activeElement).toBe(boxes()[1]!.element)
  })

  it('goes back and clears the previous box on backspace in an empty one', async () => {
    const { boxes, model } = mountInput('12')
    ;(boxes()[2]!.element as HTMLInputElement).focus()

    await boxes()[2]!.trigger('keydown', { key: 'Backspace' })

    expect(document.activeElement).toBe(boxes()[1]!.element)
    expect(model.value).toBe('1')
  })

  it('moves with the arrow keys', async () => {
    const { boxes } = mountInput('123')
    ;(boxes()[1]!.element as HTMLInputElement).focus()

    await boxes()[1]!.trigger('keydown', { key: 'ArrowRight' })
    expect(document.activeElement).toBe(boxes()[2]!.element)
    await boxes()[2]!.trigger('keydown', { key: 'ArrowLeft' })
    expect(document.activeElement).toBe(boxes()[1]!.element)
  })

  it('marks every box invalid when told', () => {
    wrapper = mount(CodeInput, { props: { modelValue: '', invalid: true } })

    expect(wrapper.findAll('input').every((box) => box.attributes('aria-invalid') === 'true')).toBe(
      true,
    )
  })
})
