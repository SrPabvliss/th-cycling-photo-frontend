import { describe, expect, it } from 'vitest'

import { PERMISSIONS } from './permissions'
import { getHomePath, getNavLinks, getPrincipalLabel } from './nav-config'

const TENANT_PERMISSIONS = [PERMISSIONS.EVENT_READ, PERMISSIONS.PHOTO_READ, PERMISSIONS.ORDER_READ]

const PLATFORM_PERMISSIONS = [
  ...TENANT_PERMISSIONS,
  PERMISSIONS.PHOTO_RETOUCH_READ,
  PERMISSIONS.BUYER_READ,
  PERMISSIONS.TENANT_READ,
]

describe('getNavLinks', () => {
  it('gives a tenant only events and orders', () => {
    const labels = getNavLinks(TENANT_PERMISSIONS).map((l) => l.label)
    expect(labels).toEqual(['Eventos', 'Pedidos'])
  })

  it('gives a platform principal every link', () => {
    const labels = getNavLinks(PLATFORM_PERMISSIONS).map((l) => l.label)
    expect(labels).toEqual(['Eventos', 'Pedidos', 'Retoque', 'Compradores', 'Organizadores'])
  })

  it('shows Organizadores to somebody holding tenant.read', () => {
    const labels = getNavLinks([PERMISSIONS.TENANT_READ]).map((l) => l.label)
    expect(labels).toEqual(['Organizadores'])
  })

  it('shows nothing without it', () => {
    expect(getNavLinks([PERMISSIONS.ORDER_READ]).map((l) => l.label)).not.toContain('Organizadores')
  })

  it('gives a buyer nothing', () => {
    expect(getNavLinks([])).toEqual([])
  })

  it('gives a tenant profile-only principal the profile link', () => {
    const labels = getNavLinks([PERMISSIONS.TENANT_PROFILE_READ]).map((l) => l.label)
    expect(labels).toEqual(['Mi perfil'])
  })
})

describe('getHomePath', () => {
  it('sends a tenant to its first reachable link', () => {
    expect(getHomePath(TENANT_PERMISSIONS)).toBe('/events')
  })

  it('falls back to the landing page when nothing is reachable', () => {
    expect(getHomePath([])).toBe('/')
  })
})

describe('getPrincipalLabel', () => {
  it('says Cliente while the shopping hat is on', () => {
    expect(getPrincipalLabel('shopping', false)).toBe('Cliente')
  })

  it('says Organizador while the operating hat is on', () => {
    expect(getPrincipalLabel('operating', false)).toBe('Organizador')
  })

  it('says TitanTV for a platform principal, whatever the hat', () => {
    expect(getPrincipalLabel('operating', true)).toBe('TitanTV')
    expect(getPrincipalLabel('shopping', true)).toBe('TitanTV')
  })
})
