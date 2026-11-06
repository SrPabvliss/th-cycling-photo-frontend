export interface ICreatePhotoCategoryRequest {
  name: string
  /** true creates a global base category (needs photo_category.base.manage). */
  base?: boolean
}
