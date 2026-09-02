import { mount } from '@vue/test-utils'
import { describe, expect, it } from 'vitest'

import SaveToProfileCheck from './SaveToProfileCheck.vue'

function noteOf(modelValue: boolean, hasProfileValue: boolean): string {
  return mount(SaveToProfileCheck, { props: { modelValue, hasProfileValue } })
    .find('[data-test="save-to-profile-note"]')
    .text()
}

describe('SaveToProfileCheck', () => {
  it('tells the organizer the value will also reach the profile once it is ticked', () => {
    expect(noteOf(true, false)).toContain('Se guardará')
  })

  it('warns that ticking it overwrites the profile value the organizer already had', () => {
    expect(noteOf(true, true)).toContain('reemplazará')
  })

  it('says the value stays with this event while it is unticked', () => {
    expect(noteOf(false, true)).toContain('solo para este evento')
  })

  it('does not describe the box as unticked when it is ticked', () => {
    expect(noteOf(true, true)).not.toContain('Desactivado')
  })
})
