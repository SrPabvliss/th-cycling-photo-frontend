# Funcionalidades pendientes de backend

Elementos implementados visualmente que requieren lógica de backend o integración real.

---

## Register — ¿Cómo nos conociste?

**Archivo:** `src/features/auth/presentation/components/RegisterForm/RegisterForm.vue`
Campo `<select>` con opciones estáticas (Instagram, Facebook, YouTube, etc.). El valor seleccionado no se envía al backend en el request de registro. Requiere agregar el campo al `IRegisterFormData`, al schema de validación y al mapper.

---

## Landing — Countdown próximo evento

**Archivo:** `src/features/landing/presentation/views/LandingView.vue`
La fecha `2026-05-17` está hardcodeada. Requiere un endpoint que devuelva el próximo evento con su fecha para que el countdown sea dinámico.

---

## Landing — Form "Notificarme"

**Archivo:** `src/features/landing/presentation/views/LandingView.vue`
El form de email solo muestra un toast. Requiere un endpoint para guardar el correo y enviar notificación cuando se publique la galería.

---

## Landing — Imagen del próximo evento

**Archivo:** `src/features/landing/presentation/views/styles/landing-view.css`
La imagen de la sección upcoming está hardcodeada (Unsplash). Requiere que el endpoint del próximo evento devuelva un `coverSlug`.

---

## Topbar — Datos de temporada y evento activo

**Archivo:** `src/core/layout/public/PublicTopbar.vue`
"Temporada 2026" y "Papallacta Downhill Open · 23–26 Abr" están hardcodeados. Requiere un endpoint de configuración global o del evento activo.

---

## Galería Evento — Cart bar "Vaciar" usa N llamadas individuales

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventGalleryView.vue`
El botón "Vaciar" llama `removeFromCart` por cada foto seleccionada del evento (N requests). Para optimizar requiere un endpoint `DELETE /cart/events/:eventId` que vacíe todas las fotos de un evento en una sola llamada.

---

## Galería Evento — Búsqueda por dorsal + tag de dorsal en foto

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventGalleryView.vue`, `PublicPhotoGrid.vue`
(1) El input de búsqueda por dorsal es solo UI — no filtra. (2) El tag de dorsal (`#045`) en la esquina inferior derecha de cada foto no se muestra. `IPublicPhoto` solo tiene `id` y `publicSlug`. Para que ambos funcionen requiere: que el endpoint `GET /public/events/:slug/photos` acepte un query param `bib` y que la respuesta incluya los dorsales detectados por foto (`bibs: string[]`). Luego agregar el param a `usePublicEventPhotosInfinite` y el tag al componente.
