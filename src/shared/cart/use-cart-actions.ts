import { useQueryClient, type QueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { h, reactive } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { httpClient } from '@/core/http/axios-client'
import { message } from '@/core/ui/discrete-api'
import { CART_QUERY_KEYS } from '@/shared/constants/cart-query-keys'
import { quotePhotos } from '@/shared/pricing/quote'
import { formatMoney } from '@/shared/pricing/tier-cards'
import { PRICING_TIERS_QUERY_KEY, type IPricingTiers } from '@/shared/pricing/use-pricing-tiers'
import { useCartStore } from '@/shared/stores/cart.store'
import type { ICartGroup } from '@/shared/types/cart.types'
import {
  countOf,
  findPhoto,
  withoutPhoto,
  withPhoto,
  withPhotoBack,
  type ICartPhotoInput,
  type ICartRemoval,
} from './cart-groups'
import { createCartQueue, type ICartQueue } from './cart-queue'

export type { ICartPhotoInput } from './cart-groups'

export interface ICartActions {
  /** Adds the photo, or takes it out if it is in the cart. The screen changes at once. */
  toggle(photo: ICartPhotoInput): void
  /** Takes a photo out knowing only its id, as the cart itself does. */
  remove(photoId: string): void
  /** True while a change of this photo is still on its way to the server. */
  isBusy(photoId: string): boolean
}

/** What the changes of one cart share: their order, and which change of a photo is the last. */
interface ICartEngine {
  queue: ICartQueue
  lastChangeOf: Map<string, number>
  busy: Map<string, number>
  changes: number
}

const engines = new WeakMap<QueryClient, ICartEngine>()

function engineOf(queryClient: QueryClient): ICartEngine {
  let engine = engines.get(queryClient)
  if (!engine) {
    engine = {
      queue: createCartQueue(),
      lastChangeOf: new Map(),
      busy: reactive(new Map<string, number>()),
      changes: 0,
    }
    engines.set(queryClient, engine)
  }
  return engine
}

/** How a change ended: on the server, undone on screen, or failed with a later tap in charge. */
type ChangeOutcome = 'done' | 'undone' | 'superseded'

// The server answers this when there is no cart to take the photo from: it is not in the cart,
// which is what the person asked for.
const NO_CART = 'cart.no_active_cart'

function isAlreadyOut(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  return error.response?.status === 404 || error.response?.data?.error?.code === NO_CART
}

/**
 * Changes to the cart that show at once and reach the server in order.
 *
 * Each tap changes the cached cart right away and queues its request. If the request fails, only
 * that change is undone and reported, and only if no later tap touched the same photo: the last
 * tap decides, and a failure it already made up for is not worth a message.
 * Once the queue is empty the cart is read again, once, so the screen ends on what the server has.
 */
export function useCartActions(): ICartActions {
  const queryClient = useQueryClient()
  const cartStore = useCartStore()
  const engine = engineOf(queryClient)
  const cartKey = CART_QUERY_KEYS.cart()

  const readCart = () => queryClient.getQueryData<ICartGroup[]>(cartKey) ?? []

  function writeCart(change: (groups: ICartGroup[]) => ICartGroup[]) {
    // A refresh still on its way was asked before this change: its answer would undo it.
    void queryClient.cancelQueries({ queryKey: cartKey })
    const next = change(readCart())
    queryClient.setQueryData(cartKey, next)
    cartStore.setGroups(next)
  }

  /** Unit price of an order of `count` photos, or null when the tiers cannot tell. */
  function unitPriceFor(count: number): { price: number; currency: string } | null {
    const tiers = queryClient.getQueryData<IPricingTiers>(PRICING_TIERS_QUERY_KEY)
    const quote = tiers ? quotePhotos(tiers.tiers, count) : null
    return quote && tiers ? { price: quote.unitPrice, currency: tiers.currency } : null
  }

  function run(photoId: string, request: () => Promise<unknown>, undo: () => void) {
    const change = ++engine.changes
    engine.lastChangeOf.set(photoId, change)
    engine.busy.set(photoId, (engine.busy.get(photoId) ?? 0) + 1)

    return engine.queue
      .run(request)
      .then(
        (): ChangeOutcome => 'done',
        (error: unknown): ChangeOutcome => {
          if (isAlreadyOut(error)) return 'done'
          // A later tap on the same photo already decided where it ends: leave it there, and say
          // nothing, since what the person sees is what they asked for last.
          if (engine.lastChangeOf.get(photoId) !== change) return 'superseded'
          undo()
          return 'undone'
        },
      )
      .finally(() => {
        const left = (engine.busy.get(photoId) ?? 1) - 1
        if (left > 0) engine.busy.set(photoId, left)
        else engine.busy.delete(photoId)

        if (engine.queue.isIdle()) void queryClient.invalidateQueries({ queryKey: cartKey })
      })
  }

  function add(photo: ICartPhotoInput) {
    const before = unitPriceFor(countOf(readCart(), photo.event.id))
    writeCart((groups) => withPhoto(groups, photo))
    const after = unitPriceFor(countOf(readCart(), photo.event.id))

    void run(
      photo.id,
      () =>
        httpClient.post(
          API_ROUTES.CART.ADD_ITEM,
          { photoId: photo.id, sessionId: cartStore.sessionId },
          { silent: true },
        ),
      () => writeCart((groups) => withoutPhoto(groups, photo.id)),
    ).then((outcome) => {
      if (outcome === 'superseded') return
      if (outcome === 'undone') {
        return void message.error('No pudimos agregar la foto. Intenta de nuevo.')
      }

      if (before && after && after.price < before.price) {
        const price = formatMoney(after.price, after.currency)
        return void message.success(`Bajaste de precio: todas tus fotos a ${price} c/u.`)
      }
      message.success(() =>
        h('span', [
          'Foto agregada al carrito.',
          h(
            'button',
            {
              type: 'button',
              style: {
                marginInlineStart: 'var(--tt-space-3)',
                padding: '0',
                border: '0',
                background: 'none',
                color: 'var(--tt-primary-ink)',
                font: 'inherit',
                fontWeight: 'var(--tt-type-title-weight)',
                textDecoration: 'underline',
                cursor: 'pointer',
              },
              onClick: () => cartStore.setDrawerOpen(true),
            },
            'Ver carrito',
          ),
        ]),
      )
    })
  }

  function takeOut(removal: ICartRemoval) {
    const photoId = removal.photo.id
    const eventId = removal.group.eventId
    const before = unitPriceFor(countOf(readCart(), eventId))
    writeCart((groups) => withoutPhoto(groups, photoId))
    const after = unitPriceFor(countOf(readCart(), eventId))

    void run(
      photoId,
      () =>
        httpClient.delete(API_ROUTES.CART.REMOVE_ITEM(photoId), {
          params: { sessionId: cartStore.sessionId },
          silent: true,
        }),
      () => writeCart((groups) => withPhotoBack(groups, removal)),
    ).then((outcome) => {
      if (outcome === 'superseded') return
      if (outcome === 'undone') {
        return void message.error('No pudimos quitar la foto. Intenta de nuevo.')
      }

      if (before && after && after.price > before.price) {
        const price = formatMoney(after.price, after.currency)
        return void message.info(`Foto quitada. Tus fotos vuelven a ${price} c/u.`)
      }
      message.info('Foto quitada del carrito.')
    })
  }

  function remove(photoId: string) {
    const removal = findPhoto(readCart(), photoId)
    if (removal) takeOut(removal)
  }

  function toggle(photo: ICartPhotoInput) {
    const removal = findPhoto(readCart(), photo.id)
    if (removal) takeOut(removal)
    else add(photo)
  }

  return { toggle, remove, isBusy: (photoId) => engine.busy.has(photoId) }
}
