<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'

import { formatDate } from '@/shared/utils/date.utils'
import { useAuth } from '@/features/auth/composables/use-auth'
import { useCartStore } from '../../stores/cart.store'
import { useCartQuery } from '../../composables/queries/use-cart'
import { useMergeCart } from '../../composables/mutations/use-merge-cart'
import { useCheckout } from '../../composables/mutations/use-checkout'
import { useCheckoutStepper, type IEventFormData } from '../../composables/use-checkout-stepper'
import type { ICheckoutEventItem, ICheckoutOrderResult } from '../../types/requests/cart.request'
import CheckoutStepper from '../components/CheckoutStepper/CheckoutStepper.vue'
import CheckoutEventSection from '../components/CheckoutEventSection/CheckoutEventSection.vue'

const router = useRouter()
const cartStore = useCartStore()
const { isAuthenticated, currentUser } = useAuth()
const { isPending: isCartLoading } = useCartQuery()
const { mutateAsync: mergeCart } = useMergeCart()
const { mutateAsync: checkout, isPending: isCheckingOut } = useCheckout()

const {
  currentStep,
  totalSteps,
  currentGroup,
  isLastStep,
  getForm,
  isStepComplete,
  validateCurrent,
  goNext,
  goPrev,
  handleTabClick,
  eventForms,
} = useCheckoutStepper()

function handleFormUpdate(eventId: string, form: IEventFormData) {
  eventForms.value.set(eventId, form)
}

// ── Review step ──
const showReview = ref(false)
const contactWhatsapp = ref('')
const contactNote = ref('')

const userInitials = computed(() => {
  const f = currentUser.value?.firstName?.[0] ?? ''
  const l = currentUser.value?.lastName?.[0] ?? ''
  return (f + l).toUpperCase() || '?'
})

function handleFormComplete() {
  showReview.value = true
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function handleGoBackFromReview() {
  showReview.value = false
}

function onStepperTabClick(index: number) {
  if (index === cartStore.groups.length) {
    if (allEventsComplete.value) showReview.value = true
  } else {
    showReview.value = false
    handleTabClick(index)
  }
}

const allEventsComplete = computed(() => cartStore.groups.every((g) => isStepComplete(g.eventId)))

const isLargeOrder = computed(() => cartStore.totalCount > 20 || cartStore.eventCount > 3)

// ── Local order reference (pre-checkout, frontend-generated) ──
const ORDER_REF_KEY = 'titan_checkout_ref'
function generateOrderRef(): string {
  return (
    'TT-' + new Date().getFullYear() + '-' + Math.random().toString(36).slice(2, 7).toUpperCase()
  )
}
const localOrderRef = ref(
  sessionStorage.getItem(ORDER_REF_KEY) ??
    (() => {
      const ref = generateOrderRef()
      sessionStorage.setItem(ORDER_REF_KEY, ref)
      return ref
    })(),
)

// ── Checkout submission ──
const orderResults = ref<ICheckoutOrderResult[] | null>(null)

const totalOrderPhotos = computed(
  () => orderResults.value?.reduce((a, r) => a + r.photoCount, 0) ?? 0,
)

async function handleCheckout() {
  if (!validateCurrent()) return

  if (!isAuthenticated.value) {
    router.push({ path: '/login', query: { redirect: '/checkout' } })
    return
  }

  try {
    await mergeCart()
  } catch {
    /* already merged */
  }

  const items: ICheckoutEventItem[] = cartStore.groups.map((g) => {
    const form = getForm(g.eventId)
    return {
      eventId: g.eventId,
      bibNumber: form.bibNumber || undefined,
      snapCategoryName: form.categoryName || undefined,
    }
  })

  orderResults.value = await checkout({ items })
  sessionStorage.removeItem(ORDER_REF_KEY)
}

onMounted(() => {
  document.documentElement.style.overflowY = 'auto'
  document.documentElement.style.height = '100%'
  document.body.style.height = 'auto'
  document.body.style.overflow = 'visible'
  const app = document.getElementById('app')
  if (app) {
    app.style.height = 'auto'
    app.style.overflow = 'visible'
  }
})

onUnmounted(() => {
  document.documentElement.style.overflowY = ''
  document.documentElement.style.height = ''
  document.body.style.height = ''
  document.body.style.overflow = ''
  const app = document.getElementById('app')
  if (app) {
    app.style.height = ''
    app.style.overflow = ''
  }
})
</script>

<template>
  <div class="ck-page">
    <!-- ── NAV ── -->
    <header class="ck-nav">
      <RouterLink to="/" class="ck-nav-brand">
        <img src="/titan-logo.png" alt="Titan TV" class="ck-nav-logo" />
        <div class="ck-nav-wordmark">
          TITAN TV
          <small>DOWNHILL MEDIA · EC</small>
        </div>
      </RouterLink>
      <button class="ck-nav-back" @click="router.back()">
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="2.5"
        >
          <path d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        Volver a la galería
      </button>
    </header>

    <!-- ── SUCCESS ── -->
    <template v-if="orderResults">
      <div class="ck-success-outer">
        <div class="ck-success">
          <div class="ck-success-stamp">Pedido enviado</div>
          <h2 class="ck-success-title">¡Listo!<br />Tu pedido está<br />en manos de Titan TV.</h2>
          <p class="ck-success-desc">
            Revisaremos las fotos que seleccionaste y te contactaremos por
            <strong>WhatsApp</strong> en menos de 24 horas para coordinar el pago y los detalles de
            entrega.
          </p>
          <div class="ck-success-order">
            <div>
              <div class="ck-s-k">Orden</div>
              <div class="ck-s-v">{{ orderResults[0]?.orderId.slice(0, 8).toUpperCase() }}</div>
            </div>
            <div>
              <div class="ck-s-k">Fotos</div>
              <div class="ck-s-v">{{ totalOrderPhotos }}</div>
            </div>
            <div>
              <div class="ck-s-k">Eventos</div>
              <div class="ck-s-v">{{ orderResults.length }}</div>
            </div>
          </div>
          <div class="ck-success-actions">
            <button class="ck-btn ck-btn--light" @click="router.push('/gallery')">
              Empezar otro pedido
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2.5"
              >
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
            <button class="ck-btn ck-btn--ghost-inv" @click="router.push('/')">
              Volver al inicio
            </button>
          </div>
        </div>
        <div class="ck-footer-strip">
          <div>Titan TV · Checkout</div>
          <button class="ck-footer-back" @click="router.push('/')">← Inicio</button>
        </div>
      </div>
    </template>

    <!-- ── CHECKOUT WIZARD ── -->
    <template v-else>
      <div class="ck-outer">
        <!-- Page head -->
        <div class="ck-page-head">
          <div>
            <div class="ck-eyebrow">Checkout · Confirma tu selección</div>
            <h1 class="ck-title">Confirma tu <em>pedido.</em></h1>
          </div>
          <div class="ck-meta-line">
            <span
              >Orden <strong>{{ localOrderRef }}</strong></span
            ><br />
            <strong>{{ formatDate(new Date()) }}</strong>
          </div>
        </div>

        <!-- Loading state -->
        <div v-if="isCartLoading" class="ck-empty">
          <div class="ck-empty-icon skeleton-bg" style="border: none" />
          <h3 class="ck-empty-title" style="opacity: 0.4">Cargando tu pedido…</h3>
        </div>

        <!-- Empty state -->
        <div v-else-if="cartStore.totalCount === 0" class="ck-empty">
          <div class="ck-empty-icon">
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="1.5"
            >
              <rect x="3" y="3" width="18" height="18" rx="1" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <path d="M21 15l-5-5L5 21" />
            </svg>
          </div>
          <h3 class="ck-empty-title">No hay nada en tu pedido</h3>
          <p class="ck-empty-desc">Primero elige algunas fotos en la galería del evento.</p>
          <button class="ck-empty-btn" @click="router.push('/gallery')">
            Ir a eventos
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
            >
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        </div>

        <template v-else>
          <CheckoutStepper
            :groups="cartStore.groups"
            :current-step="currentStep"
            :is-step-complete="isStepComplete"
            :show-review="showReview"
            @tab-click="onStepperTabClick"
          />

          <!-- ── REVIEW STEP ── -->
          <template v-if="showReview">
            <section class="ck-panel">
              <!-- Head -->
              <div class="ck-form-head">
                <div class="ck-form-eyebrow">Último paso · <strong>Revisar y enviar</strong></div>
                <h2 class="ck-form-title">Revisa tu pedido</h2>
                <p class="ck-form-sub">
                  Si todo está correcto, envíalo. El equipo de Titan TV te escribirá por WhatsApp en
                  menos de 24 horas para coordinar el pago y la entrega.
                </p>
              </div>

              <!-- Body -->
              <div class="ck-form-body">
                <!-- Stats block (large orders: >20 fotos o >3 eventos) -->
                <div v-if="isLargeOrder" class="ck-review-stats">
                  <div>
                    <div class="ck-rs-k">Total fotos</div>
                    <div class="ck-rs-v">{{ cartStore.totalCount }}</div>
                  </div>
                  <div>
                    <div class="ck-rs-k">Eventos</div>
                    <div class="ck-rs-v">{{ cartStore.eventCount }}</div>
                  </div>
                  <!-- TODO(PENDING_BACKEND): sesiones requiere campo sessions[] en ICartGroup -->
                  <div>
                    <div class="ck-rs-k">Sesiones</div>
                    <div class="ck-rs-v">—</div>
                  </div>
                </div>

                <!-- Review group per event -->
                <div v-for="group in cartStore.groups" :key="group.eventId" class="ck-review-group">
                  <div class="ck-review-head">
                    <div>
                      <div class="ck-review-title">{{ group.eventName }}</div>
                      <div class="ck-review-sub">{{ formatDate(group.eventDate) }}</div>
                    </div>
                    <div class="ck-review-count">
                      {{ group.photos.length }} {{ group.photos.length === 1 ? 'foto' : 'fotos' }}
                    </div>
                    <button class="ck-review-edit" @click="handleGoBackFromReview">Editar</button>
                  </div>
                  <div class="ck-review-body">
                    <div>
                      <div class="ck-rv-k">Categoría</div>
                      <div class="ck-rv-v" :class="{ empty: !getForm(group.eventId).categoryName }">
                        {{ getForm(group.eventId).categoryName || 'Sin definir' }}
                      </div>
                    </div>
                    <div>
                      <div class="ck-rv-k">Dorsal</div>
                      <div class="ck-rv-v" :class="{ empty: !getForm(group.eventId).bibNumber }">
                        {{ getForm(group.eventId).bibNumber || 'Sin definir' }}
                      </div>
                    </div>
                    <div v-if="getForm(group.eventId).notes" style="grid-column: 1 / -1">
                      <div class="ck-rv-k">Observaciones</div>
                      <div class="ck-rv-v soft">{{ getForm(group.eventId).notes }}</div>
                    </div>
                  </div>
                </div>

                <!-- Contact section -->
                <div class="ck-review-group">
                  <div class="ck-review-head">
                    <div>
                      <div class="ck-review-title">Contacto</div>
                      <div class="ck-review-sub">
                        Datos de tu cuenta · Titan TV te escribirá por WhatsApp
                      </div>
                    </div>
                    <div />
                    <div />
                  </div>
                  <div class="ck-contact-row">
                    <div class="ck-avatar">{{ userInitials }}</div>
                    <div>
                      <div class="ck-contact-name">
                        {{ currentUser?.firstName }} {{ currentUser?.lastName }}
                      </div>
                      <div class="ck-contact-email">{{ currentUser?.email }}</div>
                    </div>
                  </div>
                  <div class="ck-contact-fields">
                    <div class="ck-fgrid">
                      <div class="ck-fld">
                        <label>
                          WhatsApp para este pedido
                          <span class="ck-req">*</span>
                        </label>
                        <!-- TODO(PENDING_BACKEND): pre-llenar desde ICurrentUser cuando el backend incluya whatsapp -->
                        <input
                          v-model="contactWhatsapp"
                          type="tel"
                          placeholder="+593 98 123 4567"
                        />
                        <span class="ck-fld-hint">
                          Se usará para coordinar el pago y la entrega.
                        </span>
                      </div>
                      <div class="ck-fld">
                        <label>
                          Nota al equipo
                          <span class="ck-opt">(opcional)</span>
                        </label>
                        <textarea
                          v-model="contactNote"
                          maxlength="500"
                          placeholder="¿Algún detalle especial? ¿Regalo? ¿Entrega para otra persona?"
                          rows="3"
                        />
                        <span class="ck-char-count">{{ contactNote.length }} / 500</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Total card -->
                <div class="ck-total-card">
                  <div>
                    <div class="ck-total-lbl">Total del pedido</div>
                    <div class="ck-total-big">
                      <em>{{ cartStore.totalCount }}</em>
                      foto{{ cartStore.totalCount !== 1 ? 's' : '' }} ·
                      {{ cartStore.eventCount }}
                      evento{{ cartStore.eventCount !== 1 ? 's' : '' }}
                    </div>
                    <div class="ck-total-note">
                      No hay pagos online. El equipo de Titan TV te contactará por WhatsApp con los
                      valores exactos y te acompañará hasta la entrega.
                    </div>
                  </div>
                  <!-- TODO(PENDING_BACKEND): ref. de orden disponible solo tras el envío -->
                  <div class="ck-total-ref">
                    <div class="ck-total-ref-lbl">Ref.</div>
                    <div class="ck-total-ref-val">—</div>
                  </div>
                </div>
              </div>

              <!-- Foot -->
              <div class="ck-form-foot">
                <div class="ck-foot-note">
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2.5"
                  >
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Al enviar, guardamos tu pedido y te contactamos por WhatsApp.
                </div>
                <div class="ck-foot-actions">
                  <button class="ck-btn ck-btn--ghost" @click="handleGoBackFromReview">
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M19 12H5M11 18l-6-6 6-6" />
                    </svg>
                    Editar eventos
                  </button>
                  <button
                    class="ck-btn ck-btn--send"
                    :disabled="isCheckingOut"
                    @click="handleCheckout"
                  >
                    Enviar pedido a Titan TV
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2.5"
                    >
                      <path d="M5 12h14M13 6l6 6-6 6" />
                    </svg>
                  </button>
                </div>
              </div>
            </section>
          </template>

          <!-- ── EVENT FORM STEP ── -->
          <CheckoutEventSection
            v-else-if="currentGroup"
            :group="currentGroup"
            :form="getForm(currentGroup.eventId)"
            :is-first="currentStep === 0"
            :is-last="isLastStep"
            :step-index="currentStep"
            :total-steps="totalSteps"
            :is-checking-out="isCheckingOut"
            @update:form="(f) => handleFormUpdate(currentGroup!.eventId, f)"
            @prev="goPrev"
            @next="goNext"
            @checkout="handleFormComplete"
          />
        </template>
        <div class="ck-footer-strip">
          <div>Titan TV · Checkout</div>
          <button class="ck-footer-back" @click="router.push('/')">← Inicio</button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped src="./checkout-view.css" />
