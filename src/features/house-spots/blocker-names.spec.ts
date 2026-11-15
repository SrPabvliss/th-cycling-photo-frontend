import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// @ts-expect-error plain ESM helper shared with the build check, without types
import { emittedName, hasBlockerTerm } from '../../../scripts/blocker-terms.mjs'

const ROOT = resolve(process.cwd())
const FEATURE = resolve(ROOT, 'src/features/house-spots')

const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? [path, ...walk(path)] : [path]
  })

// Class names written in templates, CSS and the generated pieces.
function classesIn(text: string): string[] {
  const fromAttributes = [...text.matchAll(/class(?:=\\?"|: ')([^"'\\]+)/g)].flatMap(([, list]) =>
    list!.split(/\s+/),
  )
  const fromSelectors = [...text.matchAll(/(?:^|[\s,{}>+~(])\.(-?[_a-zA-Z][\w-]*)/gm)].map(
    ([, name]) => name!,
  )
  return [...fromAttributes, ...fromSelectors].filter(Boolean)
}

describe('house spots names', () => {
  it('flags the words blocker lists match, and only as words or segments', () => {
    expect(hasBlockerTerm('ad-slot')).toBe(true)
    expect(hasBlockerTerm('AdSlot.vue')).toBe(true)
    expect(hasBlockerTerm('sponsor-wide-x1.js')).toBe(true)
    expect(hasBlockerTerm('gallery-banner__cover')).toBe(true)
    expect(hasBlockerTerm('house-spot__frame')).toBe(false)
    expect(hasBlockerTerm('padding-shadow-radius')).toBe(false)
    expect(hasBlockerTerm('AddressForm')).toBe(false)
  })

  it('reads an emitted file by its name, not by the random hash the build adds', () => {
    expect(emittedName('use-my-contracts-CQ740DAd.js')).toBe('use-my-contracts')
    expect(hasBlockerTerm(emittedName('use-my-contracts-CQ740DAd.js'))).toBe(false)
    expect(emittedName('sponsor-wide-DWO7KJoV.js')).toBe('sponsor-wide')
    expect(hasBlockerTerm(emittedName('sponsor-wide-DWO7KJoV.js'))).toBe(true)
    expect(emittedName('helmet-mask-LKA4CEnS.webp')).toBe('helmet-mask')
  })

  it('keeps every folder and file of the feature, and the mask, clear of them', () => {
    const paths = [...walk(FEATURE), resolve(ROOT, 'src/assets/brand/helmet-mask.webp')]
    const flagged = paths
      .map((path) => relative(resolve(ROOT, 'src/features'), path))
      .filter((path) => path.split('/').some(hasBlockerTerm))

    expect(flagged).toEqual([])
  })

  it('keeps every class of the feature and of its generated pieces clear of them', () => {
    const files = walk(FEATURE).filter((path) => /\.(vue|css|json)$/.test(path))
    const flagged = files.flatMap((path) =>
      classesIn(readFileSync(path, 'utf8'))
        .filter(hasBlockerTerm)
        .map((name) => `${relative(FEATURE, path)}: ${name}`),
    )

    expect(flagged).toEqual([])
  })
})
