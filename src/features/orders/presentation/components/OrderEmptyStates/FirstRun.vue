<script setup lang="ts">
import { NIcon } from 'naive-ui'
import { CardOutline } from '@vicons/ionicons5'
</script>

<template>
  <div class="oes-empty oes-empty--tall" data-test="first-run">
    <span class="oes-empty__icon">
      <NIcon :component="CardOutline" :size="22" />
    </span>
    <b>Todavía no hay pedidos</b>
    <span class="oes-empty__hint">
      Los pedidos nacen en el carrito del comprador, nunca desde aquí. Cuando alguien termine su
      compra en una galería con fotos publicadas, aparecerá en esta lista para cobrar y entregar.
    </span>
  </div>
</template>

<style scoped src="./order-empty-states.css" />
