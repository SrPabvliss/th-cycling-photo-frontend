import { describe, expect, it } from 'vitest'

import { groupPhotoCategories } from './group-photo-categories'
import type { IPhotoCategory } from '../types/responses/photo-category.response'

const cat = (id: number, name: string, scope: IPhotoCategory['scope']): IPhotoCategory => ({
  id,
  name,
  scope,
  photoCount: 0,
})

describe('groupPhotoCategories', () => {
  it('puts base categories first and the organizer’s own after', () => {
    const groups = groupPhotoCategories([
      cat(1, 'Competencia', 'base'),
      cat(9, 'Best Trick Contest', 'own'),
      cat(2, 'Premiación', 'base'),
    ])

    expect(groups.map((g) => [g.label, g.items.map((c) => c.name)])).toEqual([
      ['Base', ['Competencia', 'Premiación']],
      ['Mías', ['Best Trick Contest']],
    ])
  })

  it('leaves out a group with no categories', () => {
    expect(groupPhotoCategories([cat(1, 'Competencia', 'base')]).map((g) => g.key)).toEqual([
      'base',
    ])
  })
})
