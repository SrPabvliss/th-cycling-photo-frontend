import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

// The client area takes its colors from the awana tokens, in light and dark. The variables of the
// old theme (theme-vars.css) only stay as the panel's value behind a client token, never alone.
const ROOT = resolve(process.cwd())
const CLIENT = [
  'src/features/landing',
  'src/features/public-gallery',
  'src/features/cart',
  'src/features/payments',
  'src/features/pricing',
  'src/features/client-gallery',
  'src/features/delivery',
  'src/features/account',
  'src/features/auth',
  'src/features/legal',
  'src/features/house-spots',
  'src/core/layout/client',
  'src/core/views',
  'src/shared/components/BillingSheet',
  'src/assets/styles/payphone-box.css',
]
// Still on the old theme on purpose: the organizer profile keeps its look; its bridge is scoped
// to its own container.
const WAITING_FOR_DECISION = [
  /account\/presentation\/components\/(Profile(BlockCard|BlockIcon|Form|IdentityStrip|OrganizerDesktop|OrganizerMobile|PaneHeader)|EmailSection|PhoneList|InvoiceCard)\//,
  /account\/presentation\/views\/(profile-content\.css|organizer-profile-bridge\.css)$/,
  /account\/constants\/invoice-state-config\.ts$/,
]
const OLD =
  /var\(--tt-(neutral-dark|neutral-mid|neutral-light|background|primary-dark|primary-light|success|warning|error|primary-rgb|primary-dark-rgb)\)/g

const files = (path: string): string[] =>
  statSync(path).isDirectory()
    ? readdirSync(path).flatMap((name) => files(join(path, name)))
    : /\.(vue|css)$/.test(path) && !path.endsWith('.spec.ts')
      ? [path]
      : []

const clientFiles = CLIENT.flatMap((path) => files(resolve(ROOT, path)))
  .map((path) => relative(ROOT, path))
  .filter((path) => !WAITING_FOR_DECISION.some((pattern) => pattern.test(path)))

describe('client colors', () => {
  it('no longer needs the bridge of old variables', () => {
    expect(existsSync(resolve(ROOT, 'src/core/theme/client/legacy-bridge.css'))).toBe(false)
    expect(readFileSync(resolve(ROOT, 'src/app/main.ts'), 'utf8')).not.toContain('legacy-bridge')
  })

  it('uses an old variable only as the panel value behind a client token', () => {
    const alone = clientFiles.flatMap((path) =>
      [...readFileSync(resolve(ROOT, path), 'utf8').matchAll(OLD)]
        .filter((match) => !/,\s*$/.test(match.input!.slice(0, match.index)))
        .map((match) => `${path}: ${match[0]}`),
    )

    expect(alone).toEqual([])
  })

  it('writes no color of its own in the screens only the client shows', () => {
    const literal = /#[0-9a-fA-F]{3,8}\b|rgba?\(/g
    const clientOnly = clientFiles.filter((path) => !path.startsWith('src/shared/'))
    const found = clientOnly.flatMap((path) =>
      [...readFileSync(resolve(ROOT, path), 'utf8').matchAll(literal)]
        // A literal behind a client token is the panel's value for a piece both areas show.
        .filter((match) => !/var\(--tt-[\w-]+,[^;)]*$/.test(match.input!.slice(0, match.index)))
        .map((match) => `${path}: ${match[0]}`),
    )

    expect(found).toEqual([])
  })

  it('follows the client tokens in the billing sheet, keeping the panel value behind them', () => {
    const sheet = readFileSync(
      resolve(ROOT, 'src/shared/components/BillingSheet/billing-sheet.css'),
      'utf8',
    )
    const bare = [...sheet.matchAll(/#[0-9a-fA-F]{3,8}\b|rgba?\(/g)].filter(
      (match) => !/var\(--tt-[\w-]+,[^;)]*$/.test(match.input!.slice(0, match.index)),
    )

    expect(bare.map((match) => match[0])).toEqual([])
  })
})
