<template>
  <div class="public-topbar">
    <div class="public-topbar-ticker">
      <!-- TODO: hardcoded — backend debe proveer temporada activa y nombre/fechas del evento activo (endpoint configuración global) -->
      <span class="public-topbar-season">Temporada 2026</span>
      <span>Papallacta Downhill Open · 23–26 Abr</span>
    </div>
    <div class="public-topbar-socials">
      <a href="#" aria-label="Instagram">
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2"
        >
          <rect x="2" y="2" width="20" height="20" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
        </svg>
      </a>
      <a href="#" aria-label="Facebook">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M9 8H6v4h3v12h5V12h3.6l.4-4h-4V6.3c0-1 .2-1.3 1.2-1.3H18V0h-3.9C10.4 0 9 1.6 9 4.7V8z"
          />
        </svg>
      </a>
      <a href="#" aria-label="YouTube">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
          <path
            d="M23 7.1c-.3-1-1-1.8-2.1-2.1C19 4.5 12 4.5 12 4.5s-7 0-8.9.5c-1 .3-1.8 1-2.1 2.1C.5 9 .5 12 .5 12s0 3 .5 4.9c.3 1 1 1.8 2.1 2.1C5 19.5 12 19.5 12 19.5s7 0 8.9-.5c1-.3 1.8-1 2.1-2.1.5-1.9.5-4.9.5-4.9s0-3-.5-4.9zM9.7 15.6V8.4l6.3 3.6-6.3 3.6z"
          />
        </svg>
      </a>
    </div>
  </div>
</template>

<style scoped src="./styles/public-topbar.css" />
