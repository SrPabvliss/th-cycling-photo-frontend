# B2 Upload Client — Infrastructure

> Instancia axios dedicada exclusivamente a uploads directos a B2 vía presigned URLs.
> Separada del httpClient del app (que tiene baseURL, auth headers, interceptores).

## Setup

```typescript
// src/core/http/b2-upload-client.ts
import axios from 'axios'

export const b2UploadClient = axios.create({
  timeout: 300_000, // 5 min por foto de 10MB
})

// ⚠️ CRÍTICO: eliminar Authorization header
// Presigned URLs llevan firma en query params.
// Un header Authorization extra = signature mismatch = 403.
delete b2UploadClient.defaults.headers.common['Authorization']
```

## Uso en upload

```typescript
await b2UploadClient.put(presignedUrl, file, {
  headers: { 'Content-Type': file.type },
  signal: abortController.signal,
  onUploadProgress: (e) => {
    if (e.lengthComputable) {
      onProgress(file.id, e.loaded!, e.total!)
    }
  },
})
```

## Por qué NO fetch()

`fetch()` no tiene `onUploadProgress`. Axios sí (vía XMLHttpRequest internamente).
Necesario para barras de progreso por foto.

## Por qué instancia separada

| Aspecto       | httpClient (app)              | b2UploadClient                      |
| ------------- | ----------------------------- | ----------------------------------- |
| baseURL       | `/api`                        | ninguna (URL completa en presigned) |
| Authorization | Bearer token                  | ❌ NO (causa 403)                   |
| Interceptores | Error handling, refresh token | Ninguno                             |
| Timeout       | 30s                           | 300s (5 min)                        |
| Content-Type  | application/json              | image/\* (por foto)                 |

## Errores comunes

| Error            | Causa                          | Fix                                   |
| ---------------- | ------------------------------ | ------------------------------------- |
| 403 constante    | Authorization header presente  | Verificar que se eliminó del instance |
| 403 intermitente | Presigned URL expirada (>5min) | p-retry pide nueva URL                |
| Timeout          | Foto grande + red lenta        | 300s es suficiente para 25MB en 3G    |
| CORS error       | B2 bucket sin CORS rules       | Configurar en B2 (tarea backend)      |
