import { describe, expect, it } from 'vitest'
import { mount } from '@vue/test-utils'

import TtSkeleton from './TtSkeleton.vue'

describe('TtSkeleton', () => {
  it('is hidden from assistive technology', () => {
    expect(mount(TtSkeleton).attributes('aria-hidden')).toBe('true')
  })

  it('takes the size it is given', () => {
    const wrapper = mount(TtSkeleton, { props: { width: '40%', height: '2em' } })

    expect(wrapper.attributes('style')).toContain('width: 40%')
    expect(wrapper.attributes('style')).toContain('height: 2em')
  })

  it('uses the small radius unless told otherwise', () => {
    expect(mount(TtSkeleton).classes()).toContain('tt-skeleton--s')
    expect(mount(TtSkeleton, { props: { radius: 'pill' } }).classes()).toContain(
      'tt-skeleton--pill',
    )
  })
})
