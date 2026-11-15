/** The blocks a phone mockup is drawn with: plain shapes, never a real screen. */
export type PhoneBlock =
  | { kind: 'bar' }
  | { kind: 'row' }
  | { kind: 'big' }
  | { kind: 'field'; text: string }
  /** The highlighted piece: a band (2:1), a strip, or a wide one (32:5). */
  | { kind: 'mark'; shape: 'band' | 'strip' | 'wide'; text: string }
  /** Photo cells, three per row; `markAt` puts the highlighted piece in place of one. */
  | { kind: 'grid'; cells: number; markAt?: number; markText?: string }
