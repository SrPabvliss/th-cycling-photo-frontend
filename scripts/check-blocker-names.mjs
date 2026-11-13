// Fails when a file emitted by the build, or a class in its CSS, carries an ad blocker word
// (see blocker-terms.mjs). Runs after every `vite build`.
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

import { emittedName, hasBlockerTerm, KNOWN_OUTSIDE } from './blocker-terms.mjs'

const DIST = resolve(process.argv[2] ?? 'dist')

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    return statSync(path).isDirectory() ? walk(path) : [path]
  })
}

const files = walk(DIST)
const badFiles = files.filter((path) => hasBlockerTerm(emittedName(basename(path))))
const classes = new Set()
for (const path of files.filter((each) => each.endsWith('.css'))) {
  for (const [, name] of readFileSync(path, 'utf8').matchAll(/\.(-?[_a-zA-Z][\w-]*)/g)) {
    classes.add(name)
  }
}
const badClasses = [...classes].filter((name) => hasBlockerTerm(name) && !(name in KNOWN_OUTSIDE))
const kept = [...classes].filter((name) => name in KNOWN_OUTSIDE)

console.log(`check-blocker-names: ${files.length} files, ${classes.size} CSS classes in ${DIST}`)
for (const name of kept) console.log(`  kept ${name}: ${KNOWN_OUTSIDE[name]}`)
if (badFiles.length || badClasses.length) {
  for (const path of badFiles) console.error(`  file  ${path}`)
  for (const name of badClasses) console.error(`  class .${name}`)
  console.error('check-blocker-names: ad blocker words found (see scripts/blocker-terms.mjs)')
  process.exit(1)
}
console.log('check-blocker-names: none found')
