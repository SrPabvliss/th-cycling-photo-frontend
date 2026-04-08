export type UserRole = 'admin' | 'operator' | 'customer'

export const USER_ROLES = {
  ADMIN: 'admin',
  OPERATOR: 'operator',
  CUSTOMER: 'customer',
} as const satisfies Record<string, UserRole>
