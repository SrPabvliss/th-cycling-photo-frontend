/** API projection from GET /events/:id/operators — already camelCase */
export interface IApiEventOperator {
  id: string
  eventId: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  assignedAt: string
}

/** Frontend domain type */
export interface IEventOperator {
  id: string
  eventId: string
  userId: string
  email: string
  firstName: string | null
  lastName: string | null
  assignedAt: Date
}

/** API projection from GET /users — for operator selector */
export interface IApiUserListItem {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string
  isActive: boolean
  roles: string[]
  createdAt: string
}

export interface IUserListItem {
  id: string
  email: string
  firstName: string | null
  lastName: string | null
  avatarUrl: string
  roles: string[]
}
