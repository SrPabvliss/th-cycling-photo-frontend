export interface IApiMeta {
  requestId: string
  timestamp: string
  message?: string
  path?: string
}

export interface IApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface IApiSuccessResponse<T> {
  data: T
  meta: IApiMeta
}

export interface IApiError {
  code: string
  message: string
  shouldThrow: boolean
  fields?: Record<string, string[]>
  details?: unknown
}

export interface IApiErrorResponse {
  error: IApiError
  meta: IApiMeta
}
