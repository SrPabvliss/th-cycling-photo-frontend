import { useCartState } from '@/shared/cart'

/**
 * Loads the cart and keeps the store in step. The query itself lives in shared/cart, where the
 * optimistic changes also write; this name stays for the header button, which only needs the cart
 * to be loaded.
 */
export function useCartQuery() {
  return useCartState()
}
