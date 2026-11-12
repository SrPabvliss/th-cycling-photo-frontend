<script setup lang="ts">
import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'

const CONTACT_EMAIL = 'info@titantv.com.ec'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="client-footer">
    <div class="client-footer__inner">
      <span>© {{ year }} Titan TV. Todos los derechos reservados.</span>
      <nav class="client-footer__links" aria-label="Enlaces del pie de página">
        <RouterLink :to="ROUTE_PATHS.PUBLIC_GALLERY">Eventos</RouterLink>
        <RouterLink :to="{ name: ROUTE_NAMES.ACCOUNT_ORDERS }">Mis fotos</RouterLink>
        <RouterLink :to="ROUTE_PATHS.TERMS">Términos</RouterLink>
        <RouterLink :to="ROUTE_PATHS.PRIVACY">Privacidad</RouterLink>
        <a :href="`mailto:${CONTACT_EMAIL}`">Contacto</a>
      </nav>
    </div>
  </footer>
</template>

<style scoped>
.client-footer {
  flex: none;
  padding: var(--tt-space-5) var(--tt-space-4) var(--tt-space-6);
  border-block-start: thin solid color-mix(in srgb, var(--tt-on-navy) 12%, transparent);
  background: var(--tt-navy);
  color: var(--tt-on-navy-muted);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
}

.client-footer__inner,
.client-footer__links {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--tt-space-2) var(--tt-space-5);
}

.client-footer__inner {
  max-inline-size: var(--tt-container-max);
  margin-inline: auto;
}

.client-footer__links a {
  display: inline-flex;
  align-items: center;
  min-block-size: var(--tt-space-6);
  color: var(--tt-on-navy);
  text-decoration: none;
  font-weight: var(--tt-type-title-weight);
}

.client-footer__links a:hover {
  text-decoration: underline;
}

@media (min-width: 768px) {
  .client-footer {
    padding: var(--tt-space-5) var(--tt-space-6) var(--tt-space-6);
  }
}
</style>
