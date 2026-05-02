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
