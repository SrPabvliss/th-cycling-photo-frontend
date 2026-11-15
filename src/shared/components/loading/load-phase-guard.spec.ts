import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// One rule for when a load shows its skeleton and when it waits for the network: `useLoadPhase`
// (LoadBoundary uses it too). A screen that times its own skeleton would stay in it forever
// without network.
const root = join(process.cwd(), 'src')
const LOADING = join(root, 'shared/components/loading')

function sources(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return path === LOADING ? [] : sources(path)
    return /\.(ts|vue)$/.test(name) && !name.includes('.spec.') ? [path] : []
  })
}

describe('load phase', () => {
  it('is decided by useLoadPhase, never by a skeleton timed on its own', () => {
    const own = sources(root)
      .filter((file) => readFileSync(file, 'utf8').includes('useDelayedFlag('))
      .map((file) => relative(root, file))

    expect(own).toEqual([])
  })
})
