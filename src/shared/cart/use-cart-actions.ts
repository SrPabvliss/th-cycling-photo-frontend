import { useQueryClient, type QueryClient } from '@tanstack/vue-query'
import { isAxiosError } from 'axios'
import { h, reactive } from 'vue'

import { API_ROUTES } from '@/core/api/api-routes'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { httpClient } from '@/core/http/axios-client'
import { problemKind } from '@/core/http/problem-kind'
import { isSessionExpired, SessionExpiredError } from '@/core/http/session-expired'
import { ROUTE_NAMES } from '@/core/navigation/route-names'
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
  /** The expired session was already reported: the changes behind it fail without a word. */
  expiryReported: boolean
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
      expiryReported: false,
    }
    engines.set(queryClient, engine)
  }
  return engine
}

/**
 * How a change ended: on the server, undone on screen, failed with a later tap in charge, or cut
 * short because the session expired (the cart on screen is no longer the one it changed).
 */
type ChangeOutcome = 'done' | 'undone' | 'superseded' | 'expired'

const SESSION_EXPIRED = 'Tu sesión se cerró. Inicia sesión de nuevo para continuar.'

// The server answers this when there is no cart to take the photo from (it was ordered in
// another tab, say): the photo is not in the cart, which is what the person asked for. The api
// names the reason in `messageKey`; `code` is its family (BUSINESS_RULE).
const NO_CART = 'cart.no_active_cart'

// Refusals with a reason the person can act on: each one says it instead of "try again".
const ALREADY_BOUGHT = 'cart.photo_already_purchased'
const EVENT_OUT_OF_SALE = 'cart.event_not_available'

function refusalOf(error: unknown): string | undefined {
  return isAxiosError(error) ? error.response?.data?.error?.messageKey : undefined
}

/** A toast text followed by one way out, drawn as a link-like button. */
function withWayOut(text: string, label: string, onClick: () => unknown) {
  return () =>
    h('span', [
      text,
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
          onClick,
        },
        label,
      ),
    ])
}

async function openMyPhotos() {
  const { default: router } = await import('@/app/router')
  await router.push({ name: ROUTE_NAMES.ACCOUNT_ORDERS })
}

function isAlreadyOut(error: unknown): boolean {
  if (!isAxiosError(error)) return false
  const reason = error.response?.data?.error
  return (
    error.response?.status === 404 || reason?.messageKey === NO_CART || reason?.code === NO_CART
  )
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
  const session = useSessionStore()
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

  function run(
    photoId: string,
    request: () => Promise<unknown>,
    undo: () => void,
  ): Promise<{ outcome: ChangeOutcome; failure?: unknown }> {
    const change = ++engine.changes
    engine.lastChangeOf.set(photoId, change)
    engine.busy.set(photoId, (engine.busy.get(photoId) ?? 0) + 1)
    if (session.isAuthenticated) engine.expiryReported = false

    // A change asked inside a session is not sent once that session expired: it would land on the
    // anonymous cart instead.
    const signedIn = session.isAuthenticated
    const send = () =>
      signedIn && session.expired ? Promise.reject(new SessionExpiredError()) : request()

    return engine.queue
      .run(send)
      .then(
        () => ({ outcome: 'done' as ChangeOutcome }),
        (error: unknown) => {
          // Neither done nor refused: the session ended, and with it the cart that was on screen.
          if (isSessionExpired(error)) return { outcome: 'expired' as ChangeOutcome }
          if (isAlreadyOut(error)) return { outcome: 'done' as ChangeOutcome }
          // A later tap on the same photo already decided where it ends: leave it there, and say
          // nothing, since what the person sees is what they asked for last.
          if (engine.lastChangeOf.get(photoId) !== change) {
            return { outcome: 'superseded' as ChangeOutcome }
          }
          undo()
          return { outcome: 'undone' as ChangeOutcome, failure: error }
        },
      )
      .finally(() => {
        const left = (engine.busy.get(photoId) ?? 1) - 1
        if (left > 0) engine.busy.set(photoId, left)
        else engine.busy.delete(photoId)

        // The outcome is told once the cart was read again: what it says about prices has to
        // hold for the cart the server has, not for the one this tab still showed.
        if (engine.queue.isIdle()) return queryClient.invalidateQueries({ queryKey: cartKey })
      })
  }

  /** Says once that the session expired, for all the changes it cut short. */
  function reportExpiry() {
    if (engine.expiryReported) return
    engine.expiryReported = true
    message.warning(SESSION_EXPIRED)
  }

  function add(photo: ICartPhotoInput) {
    const before = unitPriceFor(countOf(readCart(), photo.event.id))
    writeCart((groups) => withPhoto(groups, photo))
    const expected = countOf(readCart(), photo.event.id)
    const after = unitPriceFor(expected)

    void run(
      photo.id,
      () =>
        httpClient.post(
          API_ROUTES.CART.ADD_ITEM,
          { photoId: photo.id, sessionId: cartStore.sessionId },
          { silent: true },
        ),
      () => writeCart((groups) => withoutPhoto(groups, photo.id)),
    ).then(({ outcome, failure }) => {
      if (outcome === 'superseded') return
      if (outcome === 'expired') return reportExpiry()
      if (outcome === 'undone') {
        const refusal = refusalOf(failure)
        if (refusal === ALREADY_BOUGHT) {
          return void message.error(
            withWayOut(
              'Ya compraste esta foto. La encuentras en Mis fotos.',
              'Ir a Mis fotos',
              openMyPhotos,
            ),
          )
        }
        // No network: amber, with the cause; the photo was not added and the strip says why.
        if (problemKind(failure) === 'offline') {
          return void message.warning('Sin conexión a internet. La foto no se agregó.')
        }
        if (refusal === EVENT_OUT_OF_SALE) {
          return void message.error('Las fotos de este evento no están disponibles para la compra.')
        }
        return void message.error('No pudimos agregar la foto. Intenta de nuevo.')
      }

      // Another tab may have changed the cart meanwhile: no price it no longer has.
      const agrees = countOf(readCart(), photo.event.id) === expected
      if (agrees && before && after && after.price < before.price) {
        const price = formatMoney(after.price, after.currency)
        return void message.success(`Bajaste de precio: todas tus fotos a ${price} c/u.`)
      }
      message.success(
        withWayOut('Foto agregada al carrito.', 'Ver carrito', () => cartStore.setDrawerOpen(true)),
      )
    })
  }

  function takeOut(removal: ICartRemoval) {
    const photoId = removal.photo.id
    const eventId = removal.group.eventId
    const before = unitPriceFor(countOf(readCart(), eventId))
    writeCart((groups) => withoutPhoto(groups, photoId))
    const expected = countOf(readCart(), eventId)
    const after = unitPriceFor(expected)

    void run(
      photoId,
      () =>
        httpClient.delete(API_ROUTES.CART.REMOVE_ITEM(photoId), {
          params: { sessionId: cartStore.sessionId },
          silent: true,
        }),
      () => writeCart((groups) => withPhotoBack(groups, removal)),
    ).then(({ outcome }) => {
      if (outcome === 'superseded') return
      if (outcome === 'expired') return reportExpiry()
      if (outcome === 'undone') {
        return void message.error('No pudimos quitar la foto. Intenta de nuevo.')
      }

      // Another tab may have ordered these photos meanwhile: no price the cart no longer has.
      const agrees = countOf(readCart(), eventId) === expected
      if (agrees && before && after && after.price > before.price) {
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
