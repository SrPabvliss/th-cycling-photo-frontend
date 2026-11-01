import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'
import ClassificationFailuresBanner from './ClassificationFailuresBanner.vue'

describe('ClassificationFailuresBanner', () => {
  it('renders the count and emits retry-all', async () => {
    const wrapper = mount(ClassificationFailuresBanner, {
      props: { failedCount: 12, loading: false },
    })

    expect(wrapper.text()).toContain('12 fotos no se pudieron clasificar')
    await wrapper.find('[data-test="retry-all-classification"]').trigger('click')
    expect(wrapper.emitted('retry-all')).toHaveLength(1)
  })

  it('uses the singular for one photo', () => {
    const wrapper = mount(ClassificationFailuresBanner, {
      props: { failedCount: 1, loading: false },
    })
    expect(wrapper.text()).toContain('1 foto no se pudo clasificar')
  })

  it('renders nothing with zero', () => {
    const wrapper = mount(ClassificationFailuresBanner, {
      props: { failedCount: 0, loading: false },
    })
    expect(wrapper.find('[data-test="classification-failures-banner"]').exists()).toBe(false)
  })

  it('disables the button while retrying', () => {
    const wrapper = mount(ClassificationFailuresBanner, {
      props: { failedCount: 3, loading: true },
    })
    expect(
      wrapper.find('[data-test="retry-all-classification"]').attributes('disabled'),
    ).toBeDefined()
  })
})
