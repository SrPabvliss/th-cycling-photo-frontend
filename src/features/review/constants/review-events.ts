/**
 * Window-level custom events the review workspace dispatches/listens to.
 * Cards fire `SHOW_CROP` with `{src, alt}`; the global `A` shortcut fires
 * `ADD_MANUAL` and the focused panel decides what add form to open.
 */
export const REVIEW_EVENTS = {
  SHOW_CROP: 'review:show-crop',
  ADD_MANUAL: 'review:add-manual',
} as const

export interface IShowCropDetail {
  src: string
  alt: string
}
