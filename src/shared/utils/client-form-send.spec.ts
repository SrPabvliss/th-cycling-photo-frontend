import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

// Every client form goes out through sendClientForm, so a send always checks every field again.
// The organizer panel and the organizer profile keep their own forms as they are.
const PANEL_AND_ORGANIZER_FORMS = [
  'src/features/orders/presentation/components/OrderDetailPanel/BillingCorrectionForm.vue',
  'src/features/account/presentation/components/EmailSection/EmailSection.vue',
  'src/features/account/presentation/components/PasswordForm/PasswordForm.vue',
  'src/features/account/presentation/components/ProfileForm/ProfileForm.vue',
  'src/features/events/presentation/components/EventForm/EventForm.vue',
]

function sourceFiles(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) return sourceFiles(path)
    return /\.(vue|ts)$/.test(name) && !name.endsWith('.spec.ts') ? [path] : []
  })
}

describe('client form sends', () => {
  it('never call handleSubmit by hand outside the panel and the organizer profile', () => {
    const root = process.cwd()
    const direct = sourceFiles(join(root, 'src'))
      .map((path) => relative(root, path))
      .filter((path) => path !== 'src/shared/utils/form.utils.ts')
      .filter((path) => readFileSync(join(root, path), 'utf8').includes('handleSubmit()'))

    expect(direct.sort()).toEqual([...PANEL_AND_ORGANIZER_FORMS].sort())
  })
})
