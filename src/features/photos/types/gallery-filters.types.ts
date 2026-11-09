export type GalleryBibFilter = 'none' | 'any' | 'doubtful' | 'corrected'
export type GallerySaleFilter = 'sold' | 'unsold'
export type GallerySort = 'recent' | 'no_bib_first' | 'bib_asc' | 'filename'
export type BibMatchMode = 'exact' | 'contains'

export interface IGalleryFilterState {
  eventId: string
  bib: GalleryBibFilter | null
  photoCategoryId: number | null
  uncategorized: boolean
  sale: GallerySaleFilter | null
  plateNumber: string
  bibMatch: BibMatchMode
  sort: GallerySort
}
