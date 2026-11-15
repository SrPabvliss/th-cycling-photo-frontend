import { beforeEach, describe, expect, it, vi } from 'vitest'
import { flushPromises, mount } from '@vue/test-utils'
import { QueryClient, VueQueryPlugin } from '@tanstack/vue-query'
import { defineComponent } from 'vue'

import { useEmailVerificationStatusQuery } from './use-email-verification-status'
import { useMyBillingAccountsQuery } from './use-my-billing-accounts'
import { useMyProfileQuery } from './use-my-profile'

// These reads have their own message on the screen that asks for them. A toast on top would say
// the same thing twice.
const get = vi.fn()
vi.mock('@/core/http/axios-client', () => ({
  httpClient: { get: (...args: unknown[]) => get(...args) },
}))

function run(use: () => unknown) {
  mount(defineComponent({ setup: () => (use(), () => null) }), {
    global: {
      plugins: [
        [
          VueQueryPlugin,
          { queryClient: new QueryClient({ defaultOptions: { queries: { retry: false } } }) },
        ],
      ],
    },
  })
  return flushPromises()
}

describe('screen queries', () => {
  beforeEach(() => {
    get.mockReset().mockRejectedValue(new Error('down'))
  })

  it.each([
    ['profile', useMyProfileQuery],
    ['billing accounts', useMyBillingAccountsQuery],
    ['email verification status', useEmailVerificationStatusQuery],
  ] as const)('reads the %s without a toast', async (_, use) => {
    await run(() => use())

    expect(get).toHaveBeenCalled()
    expect(get.mock.calls[0]![1]).toMatchObject({ silent: true })
  })
})
