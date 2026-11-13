<script setup lang="ts">
import { computed } from 'vue'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import { checkoutProblemText, type CheckoutProblem } from '@/shared/utils/checkout-error'

// What stopped the order, next to the button that tried it, with the way out when there is one.
const props = defineProps<{
  problem: CheckoutProblem
  /** Gallery of the event, to add the photos again. */
  galleryPath: string
}>()

const text = computed(() => checkoutProblemText(props.problem))
</script>

<template>
  <div class="checkout-problem" role="alert" data-test="checkout-problem">
    <strong>{{ text.title }}</strong>
    <p>{{ text.text }}</p>
    <div v-if="problem === 'cart-missing'" class="checkout-problem__links">
      <RouterLink :to="{ name: ROUTE_NAMES.ACCOUNT_ORDERS }">Ir a Mis fotos</RouterLink>
      <RouterLink :to="galleryPath">Volver a la galería</RouterLink>
    </div>
    <RouterLink v-else-if="problem === 'profile'" :to="{ name: ROUTE_NAMES.ACCOUNT_PROFILE }">
      Completar mi perfil
    </RouterLink>
  </div>
</template>

<style scoped>
.checkout-problem {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  padding: var(--tt-space-4);
  border-radius: var(--tt-radius-m);
  background: var(--tt-danger-soft);
  color: var(--tt-danger-ink);
  font-family: var(--tt-font-sans);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}

.checkout-problem p {
  margin: 0;
}

.checkout-problem a {
  color: inherit;
  font-weight: var(--tt-type-title-weight);
}

.checkout-problem__links {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tt-space-4);
}
</style>
