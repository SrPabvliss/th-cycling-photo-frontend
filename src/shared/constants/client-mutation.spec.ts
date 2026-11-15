import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

import { CLIENT_MUTATION } from './client-mutation'

// Without network vue-query pauses a mutation and sends it on its own when the network is back:
// "add to cart" or "save" would happen later, unseen. The client's mutations fail at once
// instead, and say so next to the action.
const CLIENT_FEATURES = ['account', 'auth', 'payments'].map((name) =>
  join(process.cwd(), 'src/features', name),
)

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sources(path)
    return /\.(ts|vue)$/.test(name) && !name.includes('.spec.') ? [path] : []
  })
}

const mutations = CLIENT_FEATURES.flatMap(sources)
  .map((file) => ({ file: relative(process.cwd(), file), code: readFileSync(file, 'utf8') }))
  .filter(({ code }) => code.includes('useMutation('))

describe('client mutations', () => {
  it('fail at once without network', () => {
    expect(CLIENT_MUTATION).toEqual({ networkMode: 'always' })
  })

  it('finds them', () => {
    expect(mutations.length).toBeGreaterThanOrEqual(26)
  })

  it.each(mutations)('$file does not wait for the network', ({ code }) => {
    const calls = code.split('useMutation(').length - 1
    const spread = code.split('...CLIENT_MUTATION').length - 1
    expect(spread).toBe(calls)
  })
})
