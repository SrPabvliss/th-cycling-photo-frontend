import type {
  IApiEventOperator,
  IApiUserListItem,
  IEventOperator,
  IUserListItem,
} from '../types/responses/event-operator.response'

export function toEventOperator(api: IApiEventOperator): IEventOperator {
  return {
    id: api.id,
    eventId: api.eventId,
    userId: api.userId,
    email: api.email,
    firstName: api.firstName,
    lastName: api.lastName,
    assignedAt: new Date(api.assignedAt),
  }
}

export function toEventOperators(items: IApiEventOperator[]): IEventOperator[] {
  return items.map(toEventOperator)
}

export function toUserListItem(api: IApiUserListItem): IUserListItem {
  return {
    id: api.id,
    email: api.email,
    firstName: api.firstName,
    lastName: api.lastName,
    avatarUrl: api.avatarUrl,
    roles: api.roles,
  }
}

export function toUserListItems(items: IApiUserListItem[]): IUserListItem[] {
  return items.map(toUserListItem)
}
