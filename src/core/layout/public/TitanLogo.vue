<script setup lang="ts">
withDefaults(
  defineProps<{
    size?: number
  }>(),
  { size: 48 },
)
</script>

<template>
  <svg
    :width="size"
    :height="size"
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <!-- Rounded dark background -->
    <rect width="48" height="48" rx="12" fill="#1A1F2C" />
    <!-- Helmet base -->
    <path
      d="M14 30C14 30 15 32 24 32C33 32 34 30 34 30V27C34 27 33 28 24 28C15 28 14 27 14 27V30Z"
      fill="white"
    />
    <!-- Helmet dome -->
    <path
      d="M16 27C16 22 19 18 24 18C29 18 32 22 32 27C32 27 29 28 24 28C19 28 16 27 16 27Z"
      fill="white"
    />
    <!-- Helmet ridge -->
    <rect x="22" y="12" width="4" height="8" rx="2" fill="#105080" />
  </svg>
</template>
