/**
 * Anatomical region a detected color belongs to. Mirrors the BE enum used in
 * `photo_colors.region`. The order here drives the UI section order in the
 * attributes panel (helmet → clothes → bicycle).
 */
export type ColorRegion = 'helmet' | 'cyclist_clothes' | 'bicycle'
