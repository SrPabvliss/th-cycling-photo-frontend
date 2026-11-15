/** The blocks a phone mockup is drawn with: plain shapes, never a real screen. */
export type PhoneBlock =
  | { kind: 'bar' }
  | { kind: 'row' }
  | { kind: 'big' }
  /** The picture on top of a screen: a third of its height. */
  | { kind: 'cover' }
  /** A list item: a small picture and a line. */
  | { kind: 'item' }
  | { kind: 'field'; text: string }
  /**
   * The highlighted piece: a band (2:1), a strip, or a wide one (32:5). `short` is what it says
   * on a phone too narrow for `text`; the screen that draws it decides when.
   */
  | { kind: 'mark'; shape: 'band' | 'strip' | 'wide'; text: string; short?: string }
  /** Photo cells, three per row; `markAt` puts the highlighted piece in place of one. */
  | { kind: 'grid'; cells: number; markAt?: number; markText?: string }
