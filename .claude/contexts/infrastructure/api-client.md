# API Client & Backend Integration

## Location

API client lives in `core/http/`, NOT in `shared/services/`.

## Backend Response Format (ADR-002)

The backend (NestJS) returns ALL responses in this envelope:

```typescript
// core/http/http-response.interface.ts

// Successful response
export interface ApiSuccessResponse<T> {
  data: T;
  meta: {
    message?: string;
    requestId: string;
    timestamp: string;
    pagination?: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  };
}

// Error response
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    shouldThrow: boolean;
    details?: unknown;
  };
  meta: {
    requestId: string;
    timestamp: string;
    path: string;
  };
}
```

## HTTP Handler Interface

```typescript
// core/http/http-handler.interface.ts
import type { AxiosRequestConfig } from 'axios';
import type { ApiSuccessResponse } from './http-response.interface';

export interface IHttpHandler {
  get<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>>;
  post<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>>;
  put<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>>;
  patch<T>(url: string, data?: unknown, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>>;
  delete<T>(url: string, config?: AxiosRequestConfig): Promise<ApiSuccessResponse<T>>;
}
```

## API Client (AxiosClient Singleton)

```typescript
// core/http/http-client.ts
import axios from 'axios';
import type { IHttpHandler } from './http-handler.interface';
// Interceptors registered in separate files

class AxiosClient implements IHttpHandler {
  // Singleton pattern
  // Axios instance with baseURL from env
  // Interceptors for auth (JWT injection) and error handling
  // Methods return ApiSuccessResponse<T> (unwrapped from AxiosResponse)
}

export const httpClient: IHttpHandler = AxiosClient.getInstance();
```

## Interceptors

### Auth Interceptor (`core/http/interceptors/auth.interceptor.ts`)
- Reads JWT from auth Pinia store
- Injects `Authorization: Bearer {token}` header

### Error Interceptor (`core/http/interceptors/error.interceptor.ts`)
- **On error:** Toast with `error.message` from backend (already translated)
- **On 401:** Clear auth store, redirect to login
- **On success (non-GET):** Toast with `meta.message` when present
- **Critical:** Errors are THROWN, never swallowed. TanStack Query catches them naturally.

## API Routes (DRY)

```typescript
// core/api/api-routes.ts
const EVENTS_BASE = '/events';
const PHOTOS_BASE = '/photos';

export const API_ROUTES = {
  EVENTS: {
    BASE: EVENTS_BASE,                                    // Used by query keys
    GET_ALL: EVENTS_BASE,
    GET_BY_ID: (id: string) => `${EVENTS_BASE}/${id}`,
    CREATE: EVENTS_BASE,
    UPDATE: (id: string) => `${EVENTS_BASE}/${id}`,
  },
  PHOTOS: {
    BASE: PHOTOS_BASE,
    GET_BY_EVENT: (eventId: string) => `${EVENTS_BASE}/${eventId}/photos`,
    UPLOAD: `${PHOTOS_BASE}/upload`,
  },
} as const;
```

One base constant per module. Change it once → all routes and query keys update.

## Data Flow (No Services Layer)

Composables call `httpClient` directly — there is NO service/datasource layer.

```
Query composable → httpClient.get<IApiType>() → mapper transforms → TanStack Query caches
Mutation composable → httpClient.post() → onSuccess invalidates → auto refetch
```

## Environment Variables

```
VITE_API_BASE_URL=http://localhost:3000/api
```

Access in code: `import.meta.env.VITE_API_BASE_URL`
Prefix with `VITE_` for client-side exposure.
