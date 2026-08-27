import type {
  IApiPickablePerson,
  IPickableOrganizer,
  IPickablePerson,
} from '../types/responses/pickable-person.response'

function toName(person: IApiPickablePerson): string {
  const parts = [person.firstName, person.lastName].filter((part): part is string => !!part)
  return parts.length > 0 ? parts.join(' ') : person.email
}

export function toPickablePerson(person: IApiPickablePerson): IPickablePerson {
  return {
    id: person.id,
    name: toName(person),
    email: person.email,
    since: new Date(person.createdAt),
    emailVerified: person.emailVerified,
    hasOrganizer: person.organizerId !== null,
    organizerName: person.organizerName,
  }
}

export function toPickablePeople(people: IApiPickablePerson[]): IPickablePerson[] {
  return people.map(toPickablePerson)
}

export function toPickablePersonFromOrganizer(
  organizer: IPickableOrganizer | null,
): IPickablePerson | null {
  if (!organizer) return null
  return {
    id: organizer.id,
    name: organizer.holderName,
    email: organizer.holderEmail,
    since: organizer.createdAt,
    emailVerified: organizer.holderEmailVerified,
    hasOrganizer: true,
    organizerName: organizer.name,
  }
}
