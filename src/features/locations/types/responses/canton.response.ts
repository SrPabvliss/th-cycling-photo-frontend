/** API projection from GET /locations/provinces/:id/cantons */
export interface IApiCanton {
  id: number
  name: string
  provinceId: number
}
