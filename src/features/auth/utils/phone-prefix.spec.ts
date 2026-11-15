import { describe, expect, it } from 'vitest'
import { nextTick, ref } from 'vue'

import { dialCodeOf, usePhonePrefix } from './phone-prefix'

describe('dialCodeOf', () => {
  it.each([
    ['EC', '+593'],
    ['co', '+57'],
    ['ES', '+34'],
  ])('gives %s the code %s', (iso, code) => {
    expect(dialCodeOf(iso)).toBe(code)
  })

  it('gives nothing for an unknown country', () => {
    expect(dialCodeOf('XX')).toBeNull()
    expect(dialCodeOf(null)).toBeNull()
  })
})

describe('usePhonePrefix', () => {
  it('follows the country of residence', async () => {
    const country = ref<string | null>('EC')
    const { prefix, following } = usePhonePrefix(country)
    expect(prefix.value).toBe('+593')
    expect(following.value).toBe('EC')

    country.value = 'CO'
    await nextTick()
    expect(prefix.value).toBe('+57')
    expect(following.value).toBe('CO')
  })

  it('stops following once the buyer picks a code', async () => {
    const country = ref<string | null>('EC')
    const { prefix, following, setByUser } = usePhonePrefix(country)

    setByUser('+34')
    country.value = 'CO'
    await nextTick()

    expect(prefix.value).toBe('+34')
    expect(following.value).toBeNull()
  })
})
