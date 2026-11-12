// Copies the illustrations of the redesign demo into this repo, with every color taken from a
// token so they follow the light and dark schemes.
//
//   node scripts/sync-illustrations.mjs [ilu.json]
//
// The source is the demo's ilu.json (awana/.harness/legacy-client-redesign/demo). The color map is
// the one the demo applies in its build.py.

import { existsSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_SOURCE = join(
  homedir(),
  'dev/titantv/awana/.harness/legacy-client-redesign/demo/ilu.json',
)
const TARGET = resolve(
  dirname(fileURLToPath(import.meta.url)),
  '../src/shared/components/empty-state/illustrations.ts',
)

const HASH = '#'
const TOKEN_BY_COLOR = {
  E8F1FA: 'var(--tt-primary-soft)',
  B9D3EC: 'var(--tt-primary-soft-border)',
  FFFFFF: 'var(--tt-ilu-paper)',
  '0A1E34': 'var(--tt-ilu-ink)',
  '0E5A9C': 'var(--tt-primary)',
  '1C6B35': 'var(--tt-success-ink)',
  A12A2A: 'var(--tt-danger-fill)',
}
const VIEW_BOX = '0 0 160 128'

function fail(message) {
  console.error(`sync-illustrations: ${message}`)
  process.exit(1)
}

function toInnerMarkup(key, svg) {
  const open = svg.match(/^\s*<svg\b[^>]*>/)
  if (!open || !svg.trim().endsWith('</svg>')) fail(`"${key}" no es un <svg> completo`)
  if (!open[0].includes(`viewBox="${VIEW_BOX}"`)) fail(`"${key}" no usa el viewBox ${VIEW_BOX}`)

  let inner = svg
    .trim()
    .slice(open[0].length, -'</svg>'.length)
    .replace(/\s*\n\s*/g, '')

  for (const [color, token] of Object.entries(TOKEN_BY_COLOR)) {
    inner = inner.replace(new RegExp(`"${HASH}${color}"`, 'gi'), `"${token}"`)
  }

  const leftover = inner.match(new RegExp(`${HASH}[0-9a-fA-F]{3,8}\\b|rgba?\\(`))
  if (leftover) fail(`"${key}" tiene un color sin token: ${leftover[0]}`)

  return inner
}

const source = resolve(process.argv[2] ?? DEFAULT_SOURCE)
if (!existsSync(source)) {
  fail(
    `no encuentro ${source}. Pasa la ruta del ilu.json del demo: ` +
      'node scripts/sync-illustrations.mjs <ilu.json>',
  )
}

const illustrations = JSON.parse(readFileSync(source, 'utf8'))
const entries = Object.entries(illustrations).map(
  ([key, svg]) => `  ${key}:\n    ${JSON.stringify(toInnerMarkup(key, svg))},`,
)

const today = new Date().toISOString().slice(0, 10)
const file = `// GENERADO por scripts/sync-illustrations.mjs. No editar: se regenera con pnpm illustrations:sync.
// Origen: ilu.json del demo del rediseño de cliente, copiado el ${today}.
// prettier-ignore
export const ILLUSTRATIONS = {
${entries.join('\n')}
} as const

export type IllustrationKey = keyof typeof ILLUSTRATIONS

/** Every illustration is drawn on this canvas. */
export const ILLUSTRATION_VIEW_BOX = '${VIEW_BOX}'
`

writeFileSync(TARGET, file)
console.log(`sync-illustrations: ${entries.length} ilustraciones copiadas a ${TARGET}`)
