import axios from 'axios'

/**
 * Dedicated axios instance for direct-to-B2 uploads via presigned URLs.
 *
 * Differences from the app httpClient:
 * - No baseURL (presigned URLs are absolute)
 * - No Authorization header (presigned URLs carry auth in query params — extra header = 403)
 * - No interceptors (no error toast, no envelope unwrap — raw B2 responses)
 * - 5 min timeout (large files on slow connections)
 */
export const b2UploadClient = axios.create({
  timeout: 300_000,
})

// CRITICAL: Remove Authorization header.
// Presigned URLs carry their own signature in query params.
// An extra Authorization header causes a signature mismatch → 403.
delete b2UploadClient.defaults.headers.common['Authorization']
