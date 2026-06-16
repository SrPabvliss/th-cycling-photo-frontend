import type PhotoSwipe from 'photoswipe'
import type PhotoSwipeLightbox from 'photoswipe/lightbox'

const CART_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 4h2l2.4 12.2a2 2 0 0 0 2 1.6h8.2a2 2 0 0 0 2-1.6L21.5 8H6"/>
    <circle cx="10" cy="20" r="1.4"/>
    <circle cx="17" cy="20" r="1.4"/>
  </svg>`

const CHECK_ICON = `
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M5 12l4.5 4.5L20 6"/>
  </svg>`

const ADD_LABEL = 'Agregar'
const SELECTED_LABEL = 'Seleccionada'

function buttonHtml(selected: boolean): string {
  const icon = selected ? CHECK_ICON : CART_ICON
  const label = selected ? SELECTED_LABEL : ADD_LABEL
  return `<span class="pswp__cart-icon">${icon}</span><span class="pswp__cart-label">${label}</span>`
}

function photoIdOf(pswp: PhotoSwipe | null | undefined): string | null {
  const data = pswp?.currSlide?.data as { photoId?: string } | undefined
  return data?.photoId ?? null
}

export interface ICartToggleOptions {
  isSelected: (photoId: string) => boolean
  onToggle: (photoId: string) => void
  /** Returns the live PhotoSwipe instance (used to sync on external changes). */
  getPswp: () => PhotoSwipe | null
}

/**
 * Add/remove-from-cart button rendered inside the PhotoSwipe toolbar.
 * Self-contained: owns its icons, labels and DOM wiring. Only used by the
 * gallery (`actions="select"`); the cart/checkout view-only lightbox skips it.
 */
export function useCartToggle(options: ICartToggleOptions) {
  function paint(btn: HTMLElement, photoId: string) {
    const selected = options.isSelected(photoId)
    btn.dataset.selected = selected ? 'true' : 'false'
    const title = selected ? 'Quitar del carrito' : 'Agregar al carrito'
    btn.setAttribute('title', title)
    btn.setAttribute('aria-label', title)
    btn.innerHTML = buttonHtml(selected)
  }

  function register(lightbox: PhotoSwipeLightbox) {
    lightbox.on('uiRegister', () => {
      const livePswp = lightbox.pswp
      livePswp?.ui?.registerElement({
        name: 'cart-toggle',
        order: 9,
        isButton: true,
        tagName: 'button',
        html: buttonHtml(false),
        appendTo: 'bar',
        onInit: (el) => {
          el.classList.add('pswp__cart-toggle')
          const sync = () => {
            const id = photoIdOf(lightbox.pswp)
            if (id) paint(el, id)
          }
          livePswp?.on('change', sync)
          livePswp?.on('afterInit', sync)
          sync()
        },
        onClick: (_e, el) => {
          const id = photoIdOf(lightbox.pswp)
          if (!id) return
          options.onToggle(id)
          paint(el, id)
        },
      })
    })
  }

  /** Repaints the current button when selection changes outside the lightbox. */
  function syncCurrent() {
    const pswp = options.getPswp()
    if (!pswp) return
    const el = pswp.element?.querySelector<HTMLElement>('.pswp__cart-toggle')
    const id = photoIdOf(pswp)
    if (el && id) paint(el, id)
  }

  return { register, syncCurrent }
}
