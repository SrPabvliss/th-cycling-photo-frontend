import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

import { BANNER_COPY } from './banner-copy'

const DIR = resolve(process.cwd(), 'src/features/ads/banners')
const FILES = [
  'a.json',
  'b.json',
  'c.json',
  'd.json',
  'season-narrow.json',
  'season-wide.json',
  'sponsor-narrow.json',
  'sponsor-wide.json',
]
const STYLES = ['topo', 'casco', 'textura', 'facetado']
const FORMAT_OF: Record<string, keyof typeof BANNER_COPY | null> = {
  'a.json': 'A',
  'b.json': 'B',
  'c.json': 'C',
  'd.json': 'D',
  'season-narrow.json': 'E',
  'season-wide.json': 'E',
  'sponsor-narrow.json': null,
  'sponsor-wide.json': null,
}
// Markers that are not words: animation delays, the slides of the season bar and the mask image.
const STRUCTURAL = /^(d\d+|slides|maskUrl)$/

const read = (file: string) => JSON.parse(readFileSync(resolve(DIR, file), 'utf8'))
const strings = (value: unknown): string[] =>
  typeof value === 'string'
    ? [value]
    : value && typeof value === 'object'
      ? Object.values(value).flatMap(strings)
      : []

describe('generated house banners', () => {
  it('has one file per format', () => {
    for (const file of FILES) expect(existsSync(resolve(DIR, file)), file).toBe(true)
  })

  it('has the four styles in every carousel format', () => {
    for (const file of [
      'a.json',
      'b.json',
      'c.json',
      'd.json',
      'season-narrow.json',
      'season-wide.json',
    ]) {
      expect(Object.keys(read(file).styles).sort(), file).toEqual([...STYLES].sort())
    }
  })

  it.each(FILES)('%s has no link, script, handler or address', (file) => {
    for (const html of strings(read(file))) {
      expect(html).not.toMatch(/<a[\s>]/i)
      expect(html).not.toMatch(/href/i)
      expect(html).not.toMatch(/<script/i)
      expect(html).not.toMatch(/javascript:/i)
      expect(html).not.toMatch(/\son[a-z]+\s*=/i)
      expect(html).not.toMatch(/tabindex|<button|<input|<select|<textarea/i)
    }
  })

  it.each(FILES)('%s only uses markers the copy defines', (file) => {
    const format = FORMAT_OF[file]
    const known = new Set(
      format ? Object.values(BANNER_COPY[format]).flatMap((copy) => Object.keys(copy)) : [],
    )
    for (const html of strings(read(file))) {
      for (const [, name] of html.matchAll(/\{\{(\w+)\}\}/g)) {
        expect(known.has(name!) || STRUCTURAL.test(name!), `${file}: {{${name}}}`).toBe(true)
      }
    }
  })

  it('shrinks the organizer title of the 2:1 piece in its light styles', () => {
    const a = read('a.json')
    expect(a.organizer.casco).toContain('5.6cqw')
    expect(a.organizer.facetado).toContain('5.6cqw')
    expect(a.styles.casco).toContain('7.2cqw')
  })

  it('says it is generated', () => {
    for (const file of FILES) expect(read(file).$generated, file).toMatch(/generado, no editar/)
  })
})
