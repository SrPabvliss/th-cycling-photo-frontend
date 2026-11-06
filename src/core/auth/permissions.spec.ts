import { describe, expect, it } from 'vitest'

import { holdsPermission } from './permissions'

const EVENT_A = '481aa47a-f83e-45cc-beae-a083f84efed9'
const EVENT_B = '21864d8d-5e2c-485e-ace0-45229f98aec5'

const staff = {
  permissions: ['event.read', 'photo.read'],
  eventPermissions: { [EVENT_A]: ['photo.retouch.read', 'photo.retouch.upload'] },
}

describe('holdsPermission', () => {
  it('honours a global permission for any event', () => {
    expect(holdsPermission(staff, 'photo.read', EVENT_B)).toBe(true)
  })

  it('honours a grant only on the event it was given for', () => {
    expect(holdsPermission(staff, 'photo.retouch.upload', EVENT_A)).toBe(true)
    expect(holdsPermission(staff, 'photo.retouch.upload', EVENT_B)).toBe(false)
  })

  it('counts a grant on any event when no event is named', () => {
    expect(holdsPermission(staff, 'photo.retouch.read')).toBe(true)
    expect(holdsPermission(staff, 'order.gift')).toBe(false)
  })

  it('refuses everything without a session', () => {
    expect(holdsPermission(null, 'photo.read')).toBe(false)
  })
})
