export interface IApiCurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  pendingConsents?: string[]
  permissions?: string[]
  tenantId?: string | null
  isPlatform?: boolean
  emailVerified?: boolean
  pendingPrompts?: string[]
}

export interface ICurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  pendingConsents: string[]
  permissions: string[]
  tenantId: string | null
  isPlatform: boolean
  emailVerified: boolean
  pendingPrompts: string[]
}
