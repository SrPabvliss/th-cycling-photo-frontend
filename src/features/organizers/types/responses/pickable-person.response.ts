export interface IApiPickablePerson {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  createdAt: string
  emailVerified: boolean
  organizerId: string | null
  organizerName: string | null
}

export interface IPickablePerson {
  id: string
  name: string
  email: string
  since: Date
  emailVerified: boolean
  hasOrganizer: boolean
  organizerName: string | null
}

export interface IPickableOrganizer {
  id: string
  name: string
  holderName: string
  holderEmail: string
  holderEmailVerified: boolean
  createdAt: Date
}
