import { io, type Socket } from 'socket.io-client'

import { env } from '@/core/config/env'

let socket: Socket | null = null

/**
 * Derives the WebSocket base URL from the API URL.
 * API: "http://localhost:3000/api/v1" → WS: "http://localhost:3000"
 */
function getSocketBaseUrl(): string {
  const url = new URL(env.VITE_API_BASE_URL)
  return url.origin
}

/**
 * Connects to the /notifications WebSocket namespace with JWT auth.
 * If already connected, disconnects first and reconnects with the new token.
 */
export function connectSocket(token: string): Socket {
  if (socket?.connected) {
    socket.disconnect()
  }

  socket = io(`${getSocketBaseUrl()}/notifications`, {
    auth: { token },
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: Infinity,
    reconnectionDelay: 1000,
    reconnectionDelayMax: 10000,
  })

  return socket
}

/**
 * Disconnects the active socket connection.
 */
export function disconnectSocket(): void {
  if (socket) {
    socket.disconnect()
    socket = null
  }
}

/**
 * Returns the current socket instance (may be null if not connected).
 */
export function getSocket(): Socket | null {
  return socket
}
