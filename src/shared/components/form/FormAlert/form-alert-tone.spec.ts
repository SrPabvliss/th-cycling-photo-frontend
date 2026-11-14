import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// The tone rule: what could not load or send (network, server, slowness) is amber; red is for
// what the server refused. An alert that offers "Reintentar" is about something that did not
// load, so it is never red.
const root = join(process.cwd(), 'src')

function vueFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return vueFiles(path)
    return name.endsWith('.vue') ? [path] : []
  })
}

const alertsWithRetry = vueFiles(root).flatMap((file) =>
  [...readFileSync(file, 'utf8').matchAll(/<FormAlert\b[^>]*>/g)]
    .map((match) => match[0])
    .filter((tag) => /@retry=|:on-retry=|:onRetry=/.test(tag))
    .map((tag) => ({ file: relative(root, file), tag })),
)

describe('form alert tones', () => {
  it('finds the alerts that offer a retry', () => {
    expect(alertsWithRetry.length).toBeGreaterThan(5)
  })

  it.each(alertsWithRetry)('$file: a retry means it did not load, never red', ({ tag }) => {
    expect(tag).not.toMatch(/\btone="bad"/)
  })
})
