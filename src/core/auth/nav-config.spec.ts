import { describe, expect, it } from 'vitest'

import { PERMISSIONS } from './permissions'
import { getHomePath, getNavLinks, getPrincipalLabel } from './nav-config'

const TENANT_PERMISSIONS = [PERMISSIONS.EVENT_READ, PERMISSIONS.PHOTO_READ, PERMISSIONS.ORDER_READ]

const PLATFORM_PERMISSIONS = [
  ...TENANT_PERMISSIONS,
  PERMISSIONS.PHOTO_RETOUCH_READ,
  PERMISSIONS.BUYER_READ,
]

describe('getNavLinks', () => {
  it('gives a tenant only events and orders', () => {
    const labels = getNavLinks(TENANT_PERMISSIONS).map((l) => l.label)
    expect(labels).toEqual(['Eventos', 'Pedidos'])
  })

  it('gives a platform principal every link', () => {
    const labels = getNavLinks(PLATFORM_PERMISSIONS).map((l) => l.label)
    expect(labels).toEqual(['Eventos', 'Pedidos', 'Retoque', 'Compradores'])
  })

  it('gives a buyer nothing', () => {
    expect(getNavLinks([])).toEqual([])
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
  it('labels a platform principal', () => {
    expect(getPrincipalLabel({ isPlatform: true, tenantId: 't-1' })).toBe('TitanTV')
  })

  it('labels a tenant principal', () => {
    expect(getPrincipalLabel({ isPlatform: false, tenantId: 't-2' })).toBe('Organizador')
  })

  it('labels a buyer', () => {
    expect(getPrincipalLabel({ isPlatform: false, tenantId: null })).toBe('Cliente')
  })

  it('labels a missing user as a buyer', () => {
    expect(getPrincipalLabel(null)).toBe('Cliente')
  })
})
