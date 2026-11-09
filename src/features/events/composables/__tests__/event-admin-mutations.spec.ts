import { describe, expect, it, vi, beforeEach } from 'vitest'

const patch = vi.fn()
const invalidateQueries = vi.fn()

vi.mock('@/core/http/axios-client', () => ({
  httpClient: {
    patch: (...args: unknown[]) => patch(...args),
  },
}))

vi.mock('@tanstack/vue-query', () => ({
  useMutation: (options: { mutationFn: (v: unknown) => unknown; onSuccess?: () => void }) => ({
    mutateAsync: async (v: unknown) => {
      const result = await options.mutationFn(v)
      options.onSuccess?.()
      return result
    },
  }),
  useQueryClient: () => ({ invalidateQueries }),
}))

import { useArchiveEvent } from '../mutations/use-archive-event'
import { useRestoreEvent } from '../mutations/use-restore-event'
import { useUpdateEventPhotoQuota } from '../mutations/use-update-event-photo-quota'

describe('event administration mutations', () => {
  beforeEach(() => {
    patch.mockReset()
    patch.mockResolvedValue({ data: { id: 'e1' } })
    invalidateQueries.mockReset()
  })

  it('archives through PATCH /events/:id/archive with no body', async () => {
    await useArchiveEvent('e1').mutateAsync()

    expect(patch).toHaveBeenCalledWith('/events/e1/archive')
  })

  it('restores through PATCH /events/:id/restore with no body', async () => {
    await useRestoreEvent('e1').mutateAsync()

    expect(patch).toHaveBeenCalledWith('/events/e1/restore')
  })

  it('sends the new quota as a number', async () => {
    await useUpdateEventPhotoQuota('e1').mutateAsync(5000)

    expect(patch).toHaveBeenCalledWith('/events/e1/photo-quota', { quota: 5000 })
  })

  it('sends null to remove the limit rather than omitting the field', async () => {
    await useUpdateEventPhotoQuota('e1').mutateAsync(null)

    expect(patch).toHaveBeenCalledWith('/events/e1/photo-quota', { quota: null })
  })

  it('archive invalidates the event cache', async () => {
    await useArchiveEvent('e1').mutateAsync()

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
  })

  it('restore invalidates the event cache', async () => {
    await useRestoreEvent('e1').mutateAsync()

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
  })

  it('photo quota update invalidates the event cache', async () => {
    await useUpdateEventPhotoQuota('e1').mutateAsync(10)

    expect(invalidateQueries).toHaveBeenCalledTimes(1)
  })

  it('does not invalidate cache when archive request fails', async () => {
    patch.mockRejectedValueOnce(new Error('Network error'))

    try {
      await useArchiveEvent('e1').mutateAsync()
    } catch {
    }

    expect(invalidateQueries).not.toHaveBeenCalled()
  })
})
