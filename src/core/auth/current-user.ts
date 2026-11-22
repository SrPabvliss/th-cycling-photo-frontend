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
  /** The community_emails consent is active. */
  communityEmails?: boolean
  /** Community emails can be offered (false for minors by birth date). */
  communityEmailsAvailable?: boolean
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
  communityEmails: boolean
  communityEmailsAvailable: boolean
}
