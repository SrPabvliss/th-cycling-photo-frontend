<script setup lang="ts">
import TitanLogo from './TitanLogo.vue'
import { LEGAL_PATHS } from '@/features/legal/routes'
</script>

<template>
  <footer class="public-footer">
    <div class="public-footer-inner">
      <div class="public-footer-brand">
        <TitanLogo :size="28" />
        <span class="public-footer-title">TITAN TV</span>
      </div>
      <p class="public-footer-quote">
        "Poderosos dioses que gobiernan las montañas de los Andes Ecuatorianos con sus caballos de
        acero."
      </p>
      <div class="public-footer-meta">
        <nav class="public-footer-links">
          <RouterLink :to="LEGAL_PATHS.PRIVACY">Privacidad</RouterLink>
          <RouterLink :to="LEGAL_PATHS.TERMS">Términos</RouterLink>
          <a href="mailto:info@titantv.com.ec">Contacto</a>
        </nav>
        <p class="public-footer-copy">&copy; 2026 Titan TV. Todos los derechos reservados.</p>
      </div>
    </div>
  </footer>
</template>

<style scoped src="./styles/public-footer.css" />
