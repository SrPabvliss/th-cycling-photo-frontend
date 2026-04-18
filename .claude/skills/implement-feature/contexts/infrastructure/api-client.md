# API Client & Backend Integration

## Location

API client lives in `core/http/`, NOT in `shared/services/`.

## Backend Response Format (ADR-002)

The backend (NestJS) returns ALL responses in this envelope:

```typescript
// core/http/http-response.interface.ts

export interface IApiSuccessResponse<T> {
  data: T
  meta: IApiMeta
}

export interface IApiMeta {
  requestId: string
  timestamp: string
  message?: string
  path?: string
  pagination?: IApiPagination
}

export interface IApiPagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export interface IApiErrorResponse {
  error: IApiError
  meta: IApiMeta
}

export interface IApiError {
  code: string // VALIDATION_FAILED | NOT_FOUND | BUSINESS_RULE | EXTERNAL_SERVICE | INTERNAL
  message: string // Already i18n-translated by backend
  shouldThrow: boolean
  fields?: Record<string, string[]> // Field-level validation errors
  details?: unknown
}
```

## HTTP Handler Interface (decoupled from Axios)

The interface uses its own `IHttpRequestConfig` — NOT `AxiosRequestConfig`:

```typescript
// core/http/http-handler.interface.ts

export interface IHttpRequestConfig {
  params?: Record<string, unknown>
  headers?: Record<string, string>
  signal?: AbortSignal
}

export interface IHttpHandler {
  get<T>(url: string, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  post<T>(url: string, data?: unknown, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  put<T>(url: string, data?: unknown, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
  patch<T>(
    url: string,
    data?: unknown,
    config?: IHttpRequestConfig,
  ): Promise<IApiSuccessResponse<T>>
  delete<T>(url: string, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>>
}
```

Axios is an **implementation detail** of `AxiosClient` — the interface is framework-agnostic.

## API Client (AxiosClient Singleton)

```typescript
// core/http/axios-client.ts
import axios from 'axios'
import type { AxiosInstance } from 'axios'
import type { IHttpHandler, IHttpRequestConfig } from './http-handler.interface'

class AxiosClient implements IHttpHandler {
  private static instance: AxiosClient
  private readonly axios: AxiosInstance

  private constructor() {
    this.axios = axios.create({ baseURL: env.VITE_API_BASE_URL })
    registerAuthInterceptor(this.axios)
    registerSuccessInterceptor(this.axios)
    registerErrorInterceptor(this.axios)
  }

  static getInstance(): AxiosClient { ... }

  async get<T>(url: string, config?: IHttpRequestConfig): Promise<IApiSuccessResponse<T>> {
    const response = await this.axios.get<IApiSuccessResponse<T>>(url, config)
    return response.data  // unwrap AxiosResponse → IApiSuccessResponse
  }
  // post, put, patch, delete follow same pattern
}

export const httpClient: IHttpHandler = AxiosClient.getInstance()
```

## Interceptors

### Auth Interceptor (`interceptors/auth.interceptor.ts`)

- Reads JWT from auth Pinia store
- Injects `Authorization: Bearer {token}` header

### Success Interceptor (`interceptors/success.interceptor.ts`)

- On non-GET success: toast with `meta.message` when present

### Error Interceptor (`interceptors/error.interceptor.ts`)

- Toast with `error.message` from backend (already translated)
- On 401: clear auth store, redirect to login
- **Critical:** Errors are THROWN, never swallowed. TanStack Query catches them naturally.

## API Routes (DRY)

```typescript
// core/api/api-routes.ts
const EVENTS_BASE = '/events'

export const API_ROUTES = {
  EVENTS: {
    BASE: EVENTS_BASE, // feeds query keys
    GET_ALL: EVENTS_BASE,
    GET_BY_ID: (id: string) => `${EVENTS_BASE}/${id}`,
    CREATE: EVENTS_BASE,
    UPDATE: (id: string) => `${EVENTS_BASE}/${id}`,
    DELETE: (id: string) => `${EVENTS_BASE}/${id}`,
  },
} as const
```

One base constant per module. Change it once → all routes and query keys update.

## Data Flow (No Services Layer)

```
View → Query composable → httpClient.get<IApiType>() → mapper → TanStack Query cache
View → Mutation composable → httpClient.post() → onSuccess invalidates → auto refetch
```

## Usage in Composables

```typescript
// Paginated query with params
const response = await httpClient.get<IApiEventListItem[]>(API_ROUTES.EVENTS.GET_ALL, {
  params: { page: page.value, limit },
})
// response.data → IApiEventListItem[] (the payload)
// response.meta.pagination → IApiPagination (page, limit, total, totalPages)
```
