<script setup lang="ts">
import { computed } from 'vue'

import { ROUTE_NAMES } from '@/core/navigation/route-names'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { checkoutProblemText, type CheckoutProblem } from '@/shared/utils/checkout-error'

// What stopped the order, next to the button that tried it, with the way out when there is one.
// The look is the form alert's, like every other inline problem of the client.
const props = defineProps<{
  problem: CheckoutProblem
  /** Gallery of the event, to add the photos again. */
  galleryPath: string
}>()

const text = computed(() => checkoutProblemText(props.problem))
// It did not get there (amber), or the server turned it down (red).
const tone = computed(() => (props.problem === 'network' ? 'warn' : 'bad'))
</script>

<template>
  <FormAlert :tone="tone" :title="text.title" :text="text.text" data-test="checkout-problem">
    <template v-if="problem === 'cart-missing'" #actions>
      <RouterLink :to="{ name: ROUTE_NAMES.ACCOUNT_ORDERS }">Ir a Mis fotos</RouterLink>
      <RouterLink :to="galleryPath">Volver a la galería</RouterLink>
    </template>
    <template v-else-if="problem === 'profile'" #actions>
      <RouterLink :to="{ name: ROUTE_NAMES.ACCOUNT_PROFILE }">Completar mi perfil</RouterLink>
    </template>
  </FormAlert>
</template>
