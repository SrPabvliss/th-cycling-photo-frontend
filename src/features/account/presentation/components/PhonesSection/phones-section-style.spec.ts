import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The phone widget keeps its own markup, so its field takes the focus and error borders of every
// other client field by hand, as the register form does.
const source = readFileSync(
  resolve(
    process.cwd(),
    'src/features/account/presentation/components/PhonesSection/PhonesSection.vue',
  ),
  'utf8',
)

const ruleFor = (selector: string) =>
  source.match(new RegExp(`${selector.replace(/[[\]().]/g, '\\$&')}\\s*\\{([^}]*)\\}`))?.[1] ?? ''

describe('phones section look', () => {
  it('marks the phone field in focus and in error like the other fields', () => {
    expect(ruleFor('.phones-section__phone :deep(.iti input:focus)')).toMatch(
      /border-color: var\(--tt-primary\)/,
    )
    expect(ruleFor(".phones-section__phone :deep(.iti input[aria-invalid='true'])")).toMatch(
      /border-color: var\(--tt-danger-ink\)/,
    )
  })
})
