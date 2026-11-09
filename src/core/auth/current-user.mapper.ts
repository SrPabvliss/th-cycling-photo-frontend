import type { IApiCurrentUser, ICurrentUser } from './current-user'

export function toCurrentUser(api: IApiCurrentUser): ICurrentUser {
  return {
    id: api.id,
    email: api.email,
    firstName: api.firstName,
    lastName: api.lastName,
    role: api.role,
    pendingConsents: api.pendingConsents ?? [],
    permissions: api.permissions ?? [],
    eventPermissions: api.eventPermissions ?? {},
    tenantId: api.tenantId ?? null,
    isPlatform: api.isPlatform ?? false,
    permissionTemplate: api.permissionTemplate ?? null,
    tenantName: api.tenantName ?? null,
    emailVerified: api.emailVerified ?? false,
    pendingPrompts: api.pendingPrompts ?? [],
  }
}
