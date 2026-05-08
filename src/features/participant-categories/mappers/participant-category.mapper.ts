import type {
  IApiParticipantCategory,
  IParticipantCategory,
} from '../types/responses/participant-category.response'

export function toParticipantCategory(api: IApiParticipantCategory): IParticipantCategory {
  return {
    id: api.id,
    name: api.name,
  }
}

export function toParticipantCategories(items: IApiParticipantCategory[]): IParticipantCategory[] {
  return items.map(toParticipantCategory)
}
