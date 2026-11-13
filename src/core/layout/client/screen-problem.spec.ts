import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'
import { defineComponent, h, nextTick, ref } from 'vue'

import { hasScreenProblem, useScreenProblem } from './screen-problem'

const Problem = defineComponent({
  props: { active: { type: Boolean, default: true } },
  setup(props) {
    const root = ref<HTMLElement | null>(null)
    useScreenProblem(root, () => props.active)
    return () => h('div', { ref: root }, 'No pudimos cargar esto')
  },
})

function mountIn(className: string, props: Record<string, unknown> = {}) {
  const host = document.createElement('main')
  host.className = className
  document.body.appendChild(host)
  return mount(Problem, { props, attachTo: host })
}

describe('screen problem', () => {
  it('counts a problem shown in the client main area while it is on screen', async () => {
    const wrapper = mountIn('client-layout__main')
    await nextTick()
    expect(hasScreenProblem.value).toBe(true)

    wrapper.unmount()
    expect(hasScreenProblem.value).toBe(false)
  })

  it('does not count one shown elsewhere (the panel, a drawer over the page)', async () => {
    const wrapper = mountIn('app-layout__main')
    await nextTick()

    expect(hasScreenProblem.value).toBe(false)
    wrapper.unmount()
  })

  it('follows a state that turns into a problem and back', async () => {
    const wrapper = mountIn('client-layout__main', { active: false })
    await nextTick()
    expect(hasScreenProblem.value).toBe(false)

    await wrapper.setProps({ active: true })
    expect(hasScreenProblem.value).toBe(true)

    await wrapper.setProps({ active: false })
    expect(hasScreenProblem.value).toBe(false)
    wrapper.unmount()
  })
})
