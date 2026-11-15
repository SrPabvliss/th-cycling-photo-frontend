import { readonly, ref } from 'vue'

// One sheet for the whole client area, mounted once by the layout. Whoever wants to explain the
// prices opens it from here: the gallery bar, the cart, the home band.
const isOpen = ref(false)
const quantity = ref(0)

export function usePriceSheet() {
  return {
    isOpen: readonly(isOpen),
    /** Photos of the event at hand in the cart: the sheet points at their price. */
    quantity: readonly(quantity),
    open(photosInCart = 0) {
      quantity.value = photosInCart
      isOpen.value = true
    },
    close() {
      isOpen.value = false
    },
  }
}
