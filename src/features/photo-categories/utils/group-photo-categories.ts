import type { IPhotoCategory } from '../types/responses/photo-category.response'

export interface IPhotoCategoryGroup {
  key: 'base' | 'own'
  label: string
  items: IPhotoCategory[]
}

/** «Base» first, then «Mías»; empty groups are left out. Keeps the API order inside each. */
export function groupPhotoCategories(categories: IPhotoCategory[]): IPhotoCategoryGroup[] {
  const groups: IPhotoCategoryGroup[] = [
    { key: 'base', label: 'Base', items: categories.filter((c) => c.scope === 'base') },
    { key: 'own', label: 'Mías', items: categories.filter((c) => c.scope === 'own') },
  ]
  return groups.filter((group) => group.items.length > 0)
}
