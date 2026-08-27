import type { GalleryBibFilter, IGalleryFilterState } from '../types/gallery-filters.types'

const BIB_LABELS: Record<GalleryBibFilter, string> = {
  none: 'sin dorsal',
  any: 'con dorsal',
  doubtful: 'con dorsal dudoso',
  corrected: 'con dorsal corregido a mano',
}

export function galleryPhrase(
  f: IGalleryFilterState,
  categories: Array<{ id: number; name: string }>,
): string {
  const bib = f.bib ? BIB_LABELS[f.bib] : undefined

  const matchedCategory = f.photoCategoryId
    ? categories.find((c) => c.id === f.photoCategoryId)
    : undefined

  const category = f.uncategorized
    ? 'sin categoría'
    : matchedCategory
      ? `de ${matchedCategory.name}`
      : undefined

  const sale = f.sale === 'sold' ? 'ya vendidas' : f.sale === 'unsold' ? 'sin vender' : undefined

  const search = f.plateNumber
    ? `con dorsal ${f.bibMatch === 'exact' ? '' : 'que contiene '}${f.plateNumber}`
    : undefined

  const parts = [bib, category, sale, search].filter(Boolean)
  return parts.length ? `fotos ${parts.join(', ')}` : 'fotos del evento'
}
