// Copies awana's generated design tokens into this repo, scoped to the client area.
//
//   node scripts/sync-awana-tokens.mjs [dir]
//
// `dir` is awana's packages/tokens/src/generated. The JSON is copied as is. In the CSS every
// selector is rewritten so the tokens only apply under [data-tt-area='client'], which leaves the
// organizer panel with its own variables.

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const DEFAULT_SOURCE = join(homedir(), 'dev/titantv/awana/packages/tokens/src/generated')
const TARGET = resolve(dirname(fileURLToPath(import.meta.url)), '../src/core/theme/client')

const CLIENT = "[data-tt-area='client']"
const CLIENT_DARK = `${CLIENT}[data-tt-scheme='dark']`
const ROOT_SELECTOR = ':' + 'root'
const FORBIDDEN = [ROOT_SELECTOR, 'mantine']

function fail(message) {
  console.error(`sync-awana-tokens: ${message}`)
  process.exit(1)
}

function scopeSelectors(selectorList) {
  if (selectorList.includes("data-tt-scheme='dark'")) return CLIENT_DARK

  const selectors = selectorList.split(',').map((selector) => selector.trim())
  if (selectors.every((selector) => selector === ROOT_SELECTOR)) return CLIENT

  fail(`selector no reconocido en tokens.css: "${selectorList.trim()}"`)
}

function scopeCss(source) {
  const withoutComments = source.replace(/\/\*[\s\S]*?\*\//g, '')
  return withoutComments
    .replace(
      /(\s*)([^{}]+)\{/g,
      (_match, leading, selectorList) => `${leading}${scopeSelectors(selectorList)} {`,
    )
    .trim()
}

function awanaCommit(dir) {
  try {
    return execFileSync('git', ['-C', dir, 'rev-parse', '--short', 'HEAD'], {
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
    }).trim()
  } catch {
    return 'desconocido'
  }
}

const sourceDir = resolve(process.argv[2] ?? DEFAULT_SOURCE)
const cssPath = join(sourceDir, 'tokens.css')
const jsonPath = join(sourceDir, 'tokens.json')

if (!existsSync(cssPath) || !existsSync(jsonPath)) {
  fail(
    `no encuentro tokens.css y tokens.json en ${sourceDir}. ` +
      'Pasa la ruta de awana/packages/tokens/src/generated: ' +
      'node scripts/sync-awana-tokens.mjs <dir>',
  )
}

const scoped = scopeCss(readFileSync(cssPath, 'utf8'))

for (const word of FORBIDDEN) {
  if (scoped.includes(word)) fail(`el CSS reescrito todavía contiene "${word}"`)
}

const today = new Date().toISOString().slice(0, 10)
const header =
  `/* GENERADO por scripts/sync-awana-tokens.mjs. No editar: se regenera con pnpm tokens:sync.\n` +
  ` * Origen: awana packages/tokens, commit ${awanaCommit(sourceDir)}, copiado el ${today}. */\n`

mkdirSync(TARGET, { recursive: true })
writeFileSync(join(TARGET, 'awana-tokens.css'), `${header}${scoped}\n`)
writeFileSync(join(TARGET, 'awana-tokens.json'), readFileSync(jsonPath, 'utf8'))

console.log(`sync-awana-tokens: tokens copiados de ${sourceDir} a ${TARGET}`)
