import { describe, expect, it } from 'vitest'

import { contactRequestFormSchema } from '../contact-request-form.schema'

const valid = {
  reason: 'more_quota' as const,
  eventsWanted: 3,
  message: 'Viene la Copa Andina en marzo.',
}

describe('contactRequestFormSchema', () => {
  it('accepts a request for more quota with a count', () => {
    expect(contactRequestFormSchema.safeParse(valid).success).toBe(true)
  })

  it('asks for the count when the reason is more quota', () => {
    const result = contactRequestFormSchema.safeParse({ ...valid, eventsWanted: null })
    expect(result.success).toBe(false)
    expect(result.error?.issues[0]?.path).toEqual(['eventsWanted'])
  })

  it('does not ask for a count on a renewal', () => {
    const result = contactRequestFormSchema.safeParse({
      ...valid,
      reason: 'renewal',
      eventsWanted: null,
    })
    expect(result.success).toBe(true)
  })

  it('keeps the count between 1 and 100', () => {
    expect(contactRequestFormSchema.safeParse({ ...valid, eventsWanted: 0 }).success).toBe(false)
    expect(contactRequestFormSchema.safeParse({ ...valid, eventsWanted: 101 }).success).toBe(false)
  })

  it('needs a message of at least 10 characters once trimmed', () => {
    expect(contactRequestFormSchema.safeParse({ ...valid, message: '   corto   ' }).success).toBe(
      false,
    )
  })
})
