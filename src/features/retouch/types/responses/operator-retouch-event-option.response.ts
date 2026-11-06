/** API projection from GET /operator/retouch/events — active events the user retouches, sorted by name */
export interface IApiOperatorRetouchEventOption {
  id: string
  slug: string
  name: string
}

export interface IOperatorRetouchEventOption {
  id: string
  slug: string
  name: string
}
