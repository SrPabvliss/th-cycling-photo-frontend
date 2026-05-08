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

## Galería Evento — Categorías de fotos con etiqueta de día

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventGalleryView.vue`
El filter bar muestra chips de categorías (Entrenamiento, Podio, Track walk, Social) con una etiqueta de día encima (ej. "Jue 23", "Sáb 25"). Actualmente se usan categorías mockeadas porque el endpoint `GET /public/events/:slug` devuelve `photoCategories: []` vacío o sin el campo `dayLabel`. Requiere:

1. Que el endpoint devuelva las categorías del evento con sus fotos contadas.
2. Que cada categoría incluya un campo `dayLabel: string` (ej. `"Jue 23"`) indicando el día al que pertenece.
3. Extender `IApiPublicPhotoCategory` e `IPublicPhotoCategory` con `dayLabel: string` y actualizar el mapper.
   Cuando el backend envíe datos reales, eliminar `MOCK_CATEGORIES` en `PublicEventGalleryView.vue`.

---

## Cart Drawer — Bib tag y hora de foto en el grid

**Archivo:** `src/features/cart/presentation/components/CartDrawer/CartDrawer.vue`
El grid de fotos del drawer solo muestra los primeros 8 caracteres del `id`. El mockup muestra también el número de dorsal (`bib`) y la hora de captura (`time`). Requiere agregar `bibs: string[]` y `capturedAt: string` a `IApiCartPhoto`, `ICartPhoto` y el mapper.

---

## Cart Drawer — "Ver galería" del evento

**Archivo:** `src/features/cart/presentation/components/CartDrawer/CartDrawer.vue`
El enlace "Ver galería" dentro de cada grupo del drawer navega a `/gallery` (lista de eventos) como fallback porque `ICartGroup` no incluye el slug del evento. Requiere agregar `eventSlug: string` a `IApiCartGroup`, `ICartGroup` y el mapper para poder construir la ruta `/gallery/:slug`.

---

## Lista Eventos — Ordenar "Próximos a expirar"

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventListView.vue`
La opción "Próximos a expirar" del select Orden está implementada en UI pero ordena por fecha ascendente como aproximación. Para que sea real requiere que el endpoint `GET /public/events` devuelva un campo `expiresAt: string | null` por evento, y actualizar `IApiPublicEventListItem`, `IPublicEventListItem` y el mapper con dicho campo. El sort entonces ordenará `expiresAt asc` poniendo primero los que expiran antes.

---

## Lista Eventos — Botón "Cargar más eventos"

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventListView.vue`
El botón "Cargar más eventos →" está mockeado (sin handler). Requiere que el endpoint `GET /public/events` soporte paginación (cursor o page/limit) y que se implemente `useInfiniteQuery` con `fetchNextPage` conectado al botón. El botón debería ocultarse cuando no haya más páginas (`!hasNextPage`).

---

## Checkout — Campo "Sesiones" por evento

**Archivos:** `src/features/cart/presentation/components/CheckoutEventSection/CheckoutEventSection.vue` · `src/features/cart/presentation/views/CheckoutView.vue`
El formulario por evento tiene un select de sesión comentado, y el bloque de estadísticas del paso de revisión muestra "Sesiones: —" hardcodeado. Requiere agregar `sessions: string[]` a `IApiCartGroup`, `ICartGroup` y el mapper. Con los datos reales, activar el select en el formulario y mostrar el conteo real en la revisión.

---

## Checkout Review — WhatsApp pre-llenado desde el perfil

**Archivo:** `src/features/cart/presentation/views/CheckoutView.vue`
El campo "WhatsApp para este pedido" en el paso de revisión siempre aparece vacío. Debería pre-llenarse desde el usuario autenticado. Requiere agregar `whatsapp: string | null` a `ICurrentUser` (respuesta del endpoint de perfil) y enlazarlo con `v-model` al `contactWhatsapp` ref cuando el valor exista.

---

## Cart Drawer — "Quitar todas" hace N llamadas individuales

**Archivo:** `src/features/cart/presentation/components/CartDrawer/CartDrawer.vue`
El botón "Quitar todas" dentro de cada grupo del drawer llama `removeFromCart` una vez por foto (N requests), igual que el "Vaciar" de la barra de la galería. Requiere el mismo endpoint `DELETE /cart/events/:eventId` descrito en la entrada de la galería para reemplazar ambos con una sola llamada.

---

## Galería Evento — Búsqueda por dorsal + tag de dorsal en foto

**Archivo:** `src/features/public-gallery/presentation/views/PublicEventGalleryView.vue`, `PublicPhotoGrid.vue`
(1) El input de búsqueda por dorsal es solo UI — no filtra. (2) El tag de dorsal (`#045`) en la esquina inferior derecha de cada foto no se muestra. `IPublicPhoto` solo tiene `id` y `publicSlug`. Para que ambos funcionen requiere: que el endpoint `GET /public/events/:slug/photos` acepte un query param `bib` y que la respuesta incluya los dorsales detectados por foto (`bibs: string[]`). Luego agregar el param a `usePublicEventPhotosInfinite` y el tag al componente.
