import type { ICartGroup, ICartPhoto } from '@/shared/types/cart.types'

/** A photo to put in the cart, with what the cart shows of its event. */
export interface ICartPhotoInput {
  id: string
  publicSlug: string
  event: { id: string; name: string; slug: string; startDate: Date; endDate: Date }
}

/** Where a photo sat before it was taken out, to put it back in the same place. */
export interface ICartRemoval {
  photo: ICartPhoto
  photoIndex: number
  group: ICartGroup
  groupIndex: number
}

export function findPhoto(groups: ICartGroup[], photoId: string): ICartRemoval | null {
  for (const [groupIndex, group] of groups.entries()) {
    const photoIndex = group.photos.findIndex((photo) => photo.id === photoId)
    if (photoIndex !== -1)
      return { photo: group.photos[photoIndex]!, photoIndex, group, groupIndex }
  }
  return null
}

export const countOf = (groups: ICartGroup[], eventId: string) =>
  groups.find((group) => group.eventId === eventId)?.photos.length ?? 0

/** The cart with the photo added at the end of its event; unchanged if it was already there. */
export function withPhoto(groups: ICartGroup[], input: ICartPhotoInput): ICartGroup[] {
  if (findPhoto(groups, input.id)) return groups

  const photo: ICartPhoto = { id: input.id, publicSlug: input.publicSlug }
  if (!groups.some((group) => group.eventId === input.event.id)) {
    return [
      ...groups,
      {
        eventId: input.event.id,
        eventName: input.event.name,
        eventSlug: input.event.slug,
        startDate: input.event.startDate,
        endDate: input.event.endDate,
        photos: [photo],
      },
    ]
  }

  return groups.map((group) =>
    group.eventId === input.event.id ? { ...group, photos: [...group.photos, photo] } : group,
  )
}

/** The cart without the photo. An event left with no photos goes too. */
export function withoutPhoto(groups: ICartGroup[], photoId: string): ICartGroup[] {
  return groups
    .map((group) =>
      group.photos.some((photo) => photo.id === photoId)
        ? { ...group, photos: group.photos.filter((photo) => photo.id !== photoId) }
        : group,
    )
    .filter((group) => group.photos.length > 0)
}

/** The cart with a removed photo back where it was; unchanged if it is there again already. */
export function withPhotoBack(groups: ICartGroup[], removal: ICartRemoval): ICartGroup[] {
  if (findPhoto(groups, removal.photo.id)) return groups

  const insert = (photos: ICartPhoto[]) => {
    const next = [...photos]
    next.splice(Math.min(removal.photoIndex, next.length), 0, removal.photo)
    return next
  }

  if (groups.some((group) => group.eventId === removal.group.eventId)) {
    return groups.map((group) =>
      group.eventId === removal.group.eventId ? { ...group, photos: insert(group.photos) } : group,
    )
  }

  const next = [...groups]
  next.splice(Math.min(removal.groupIndex, next.length), 0, {
    ...removal.group,
    photos: [removal.photo],
  })
  return next
}
