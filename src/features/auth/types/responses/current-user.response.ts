export interface IApiCurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  pendingConsents?: string[]
}

export interface ICurrentUser {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  role: string
  pendingConsents: string[]
}
