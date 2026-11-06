export type PermissionTemplate = 'platform_admin' | 'platform_staff' | 'tenant' | 'customer'

export interface IApiCurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  pendingConsents?: string[]
  permissions?: string[]
  eventPermissions?: Record<string, string[]>
  tenantId?: string | null
  isPlatform?: boolean
  permissionTemplate?: PermissionTemplate | null
  tenantName?: string | null
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
  eventPermissions: Record<string, string[]>
  tenantId: string | null
  isPlatform: boolean
  permissionTemplate: PermissionTemplate | null
  tenantName: string | null
  emailVerified: boolean
  pendingPrompts: string[]
}
