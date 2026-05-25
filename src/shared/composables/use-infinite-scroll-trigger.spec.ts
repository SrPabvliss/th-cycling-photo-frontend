import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { mount } from '@vue/test-utils'

import { useInfiniteScrollTrigger } from './use-infinite-scroll-trigger'

class FakeIO {
  static instances: FakeIO[] = []
  cb: IntersectionObserverCallback
  constructor(cb: IntersectionObserverCallback) {
    this.cb = cb
    FakeIO.instances.push(this)
  }
  observe = vi.fn()
  unobserve = vi.fn()
  disconnect = vi.fn()
  trigger(isIntersecting: boolean) {
    this.cb(
      [{ isIntersecting } as IntersectionObserverEntry],
      this as unknown as IntersectionObserver,
    )
  }
}

beforeEach(() => {
  FakeIO.instances = []
  ;(globalThis as unknown as { IntersectionObserver: typeof FakeIO }).IntersectionObserver = FakeIO
})

afterEach(() => {
  delete (globalThis as unknown as { IntersectionObserver?: unknown }).IntersectionObserver
})

describe('useInfiniteScrollTrigger', () => {
  it('fires callback when sentinel becomes visible and not busy', async () => {
    const cb = vi.fn()
    const isBusy = ref(false)
    const canLoadMore = ref(true)

    const Comp = defineComponent({
      setup() {
        const sentinel = useInfiniteScrollTrigger(cb, { isBusy, canLoadMore })
        return () => h('div', { ref: sentinel })
      },
    })

    mount(Comp)
    await nextTick()
    FakeIO.instances[0]!.trigger(true)
    expect(cb).toHaveBeenCalledTimes(1)
  })

  it('does not fire when isBusy is true', async () => {
    const cb = vi.fn()
    const isBusy = ref(true)
    const canLoadMore = ref(true)
    const Comp = defineComponent({
      setup() {
        const sentinel = useInfiniteScrollTrigger(cb, { isBusy, canLoadMore })
        return () => h('div', { ref: sentinel })
      },
    })
    mount(Comp)
    await nextTick()
    FakeIO.instances[0]!.trigger(true)
    expect(cb).not.toHaveBeenCalled()
  })

  it('does not fire when canLoadMore is false', async () => {
    const cb = vi.fn()
    const Comp = defineComponent({
      setup() {
        const sentinel = useInfiniteScrollTrigger(cb, {
          isBusy: ref(false),
          canLoadMore: ref(false),
        })
        return () => h('div', { ref: sentinel })
      },
    })
    mount(Comp)
    await nextTick()
    FakeIO.instances[0]!.trigger(true)
    expect(cb).not.toHaveBeenCalled()
  })

  it('does not fire on isIntersecting=false', async () => {
    const cb = vi.fn()
    const Comp = defineComponent({
      setup() {
        const sentinel = useInfiniteScrollTrigger(cb, {
          isBusy: ref(false),
          canLoadMore: ref(true),
        })
        return () => h('div', { ref: sentinel })
      },
    })
    mount(Comp)
    await nextTick()
    FakeIO.instances[0]!.trigger(false)
    expect(cb).not.toHaveBeenCalled()
  })

  it('fires again after isBusy toggles false→true→false and re-intersects', async () => {
    const cb = vi.fn()
    const isBusy = ref(false)
    const Comp = defineComponent({
      setup() {
        const sentinel = useInfiniteScrollTrigger(cb, {
          isBusy,
          canLoadMore: ref(true),
        })
        return () => h('div', { ref: sentinel })
      },
    })
    mount(Comp)
    await nextTick()
    FakeIO.instances[0]!.trigger(true)
    expect(cb).toHaveBeenCalledTimes(1)
    isBusy.value = true
    FakeIO.instances[0]!.trigger(true)
    expect(cb).toHaveBeenCalledTimes(1)
    isBusy.value = false
    FakeIO.instances[0]!.trigger(true)
    expect(cb).toHaveBeenCalledTimes(2)
  })
})
