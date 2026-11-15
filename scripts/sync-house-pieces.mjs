// Turns the house banner pieces of the design (the demo's banners.js) into one file per format
// for the app. Run with: pnpm pieces:sync [path/to/banners.js]
//
// banners.js holds `const BN = {...};` as plain JSON: it is parsed, never run. The output can be
// put into the page with v-html, so this script refuses anything that could act: links,
// addresses, scripts, event handlers, focusable elements, or a {{marker}} the copy does not fill.
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'
import { homedir } from 'node:os'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

import { PIECE_COPY } from '../src/features/house-spots/pieces/piece-copy.ts'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const SOURCE =
  process.argv[2] ??
  resolve(homedir(), 'dev/titantv/awana/.harness/legacy-client-redesign/demo/banners.js')
const OUT = resolve(ROOT, 'src/features/house-spots/pieces')
const HEADER = 'generado, no editar: pnpm pieces:sync'
const STYLES = ['topo', 'casco', 'textura', 'facetado']
const STRUCTURAL = /^(d\d+|slides|maskUrl)$/
const FORBIDDEN = [
  [/<a[\s>]/i, 'a link'],
  [/href/i, 'an address'],
  [/<script/i, 'a script'],
  [/javascript:/i, 'a javascript: address'],
  [/\son[a-z]+\s*=/i, 'an event handler'],
  [/tabindex|<button|<input|<select|<textarea/i, 'a focusable element'],
]

function fail(message) {
  console.error(`sync-house-pieces: ${message}`)
  process.exit(1)
}

function readPieces(path) {
  const source = readFileSync(path, 'utf8').trim()
  const prefix = 'const BN = '
  if (!source.startsWith(prefix)) fail(`${path} does not start with "${prefix}"`)
  return JSON.parse(source.slice(prefix.length).replace(/;\s*$/, ''))
}

// Links become plain boxes; what made them links or named them goes.
function clean(html) {
  return html
    .replace(/<a(\s)/g, '<div$1')
    .replace(/<\/a>/g, '</div>')
    .replace(/\s(?:data-act|href|aria-label|role)="[^"]*"/g, '')
    .replace(/img\/helmet-mask\.webp/g, '{{maskUrl}}')
}

function check(name, html, format) {
  for (const [pattern, what] of FORBIDDEN) {
    if (pattern.test(html)) fail(`${name} has ${what}`)
  }
  const known = new Set(
    format ? Object.values(PIECE_COPY[format]).flatMap((copy) => Object.keys(copy)) : [],
  )
  for (const [, marker] of html.matchAll(/\{\{(\w+)\}\}/g)) {
    if (!known.has(marker) && !STRUCTURAL.test(marker)) fail(`${name} has an unknown {{${marker}}}`)
  }
  return html
}

function styles(source, name, format) {
  return Object.fromEntries(
    STYLES.map((style) => [style, check(`${name}.${style}`, clean(source[style]), format)]),
  )
}

const BN = readPieces(SOURCE)
const files = {}

for (const format of ['A', 'B', 'C', 'D']) {
  const file = { $generated: HEADER, styles: styles(BN[format], format, format) }
  // The 2:1 piece in its light styles: the organizer title pushed the button out (adFit).
  if (format === 'A') {
    file.organizer = Object.fromEntries(
      ['casco', 'facetado'].map((style) => [
        style,
        file.styles[style].replace('font-size: 7.2cqw', 'font-size: 5.6cqw'),
      ]),
    )
  }
  files[`${format.toLowerCase()}.json`] = file
}

for (const [variant, name] of [
  ['n', 'narrow'],
  ['w', 'wide'],
]) {
  files[`season-${name}.json`] = {
    $generated: HEADER,
    // The bar keeps exactly the height the app reserves for it: its bottom border goes inside.
    frame: check(
      `T.${variant}`,
      clean(BN.T[variant]).replace(
        /height: (\d+)px; overflow: hidden;/,
        'height: $1px; box-sizing: border-box; overflow: hidden;',
      ),
      null,
    ),
    styles: styles(BN.E[variant], `E.${variant}`, 'E'),
  }
  files[`presenter-${name}.json`] = {
    $generated: HEADER,
    html: check(`S.${variant}`, clean(BN.S[variant]), null),
  }
}

mkdirSync(OUT, { recursive: true })
for (const [file, content] of Object.entries(files)) {
  const json = JSON.stringify(content)
  writeFileSync(resolve(OUT, file), `${json}\n`)
  console.log(`${file} ${(json.length / 1024).toFixed(1)} kB`)
}
