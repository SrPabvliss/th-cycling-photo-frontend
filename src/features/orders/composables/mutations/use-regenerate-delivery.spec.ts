import { describe, expect, it, vi } from 'vitest'

import { httpClient } from '@/core/http/axios-client'
import { useRegenerateDelivery } from './use-regenerate-delivery'

vi.mock('@/core/http/axios-client', () => ({
  httpClient: { post: vi.fn(), patch: vi.fn() },
}))
vi.mock('@tanstack/vue-query', () => ({
  useMutation: (options: { mutationFn: (id: string) => unknown }) => options,
  useQueryClient: () => ({ invalidateQueries: vi.fn() }),
}))

describe('useRegenerateDelivery', () => {
  it('posts, because the backend exposes regenerate-delivery as POST and PATCH is a 404', async () => {
    vi.mocked(httpClient.post).mockResolvedValue({
      data: { orderId: 'order-1', deliveryUrl: 'https://x/y', whatsappTemplate: 'hola' },
    } as never)

    await (
      useRegenerateDelivery() as unknown as { mutationFn: (id: string) => Promise<unknown> }
    ).mutationFn('order-1')

    expect(httpClient.post).toHaveBeenCalledWith('/orders/order-1/regenerate-delivery')
    expect(httpClient.patch).not.toHaveBeenCalled()
  })
})
