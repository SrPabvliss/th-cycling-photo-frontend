# Sprint 6: Commercial Flow — Frontend Overview

> Summary for Claude Code. Full ADRs in claude.ai project knowledge (ADR-004, ADR-005).

## What This Sprint Adds

The commercial flow replaces Titan TV's manual WhatsApp + OneDrive process. The frontend implements:

- Admin views: preview builder, orders management, customers list
- Public views: client gallery (watermarked), delivery page (original quality)
- Real-time: WebSocket notifications for admin

## New Public Routes (outside AppLayout, no auth)

| Route              | View           | Purpose                                        |
| ------------------ | -------------- | ---------------------------------------------- |
| `/preview/:token`  | Client Gallery | Watermarked photos + selection + contact modal |
| `/delivery/:token` | Delivery Page  | Original photos + download                     |

These routes are standalone (like login, 404) — declared outside AppLayout in router.ts.

## New Admin Routes (inside AppLayout, auth required)

| Route              | View                         | Role  |
| ------------------ | ---------------------------- | ----- |
| `/admin/orders`    | Orders Management            | admin |
| `/admin/customers` | Customers List               | admin |
| Preview builder    | Accessible from event detail | admin |

## Watermarked Photo URLs

For the client gallery, the backend returns photo URLs pointing to the Cloudflare Watermark Worker — NOT direct B2 URLs. The frontend just uses whatever URL the backend provides. Example:

```
// Backend response for GET /preview/:token
{
  photos: [
    { id: "...", url: "https://photos.domain.com/photos/watermarked/events/event1/photo.jpg" }
  ]
}
```

The frontend renders `<img :src="photo.url" />` — no URL construction needed.

## Presigned Download URLs

For the delivery page, the backend returns presigned B2 URLs (1h expiry). The frontend triggers downloads using these URLs. On each page access, the backend generates fresh presigned URLs.

## WebSocket Notifications

Connect to Socket.io `/notifications` namespace after auth rehydration.

```typescript
// Connection
const socket = io('https://api.domain.com/notifications', {
  auth: { token: accessToken }
});

// Events
socket.on('preview:viewed', (payload) => { ... });
socket.on('order:created', (payload) => { ... });
socket.on('order:paid', (payload) => { ... });
```

Disconnect on logout. Auto-reconnect on connection loss.

State: Pinia store or composable refs (NOT TanStack Query — this is client-only state that resets on refresh). Max 50 notifications in memory (FIFO).

## WhatsApp URL Pattern

The frontend builds `wa.me` URLs for admin actions:

```typescript
const whatsappUrl = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`
window.open(whatsappUrl, '_blank')
```

The backend may return pre-built WhatsApp URLs in responses, OR the frontend builds them from templates + data. Both approaches are valid — check what the backend returns.

## Contact Modal (Client Gallery)

Fields: first_name (required), last_name (required), whatsapp (required), email (optional).
Submit: POST /api/v1/preview/:token/orders with { photo_ids, first_name, last_name, whatsapp, email }.
The backend handles Customer find-or-create — the frontend just sends the form data.

## Design References

All views have designs from Sprint 4 (TTV-66). Before implementing ANY view, ask Pablo for the design image. Do NOT assume the layout.

## Architecture Reminders

- Composables call httpClient directly (NO service layer)
- TanStack Query for all server state; Pinia only for client state (auth, notifications)
- Screaming architecture: one file per query/mutation/mapper/response type
- `I` prefix for interfaces, kebab-case TypeScript filenames
- Mappers handle snake_case → camelCase transformation
