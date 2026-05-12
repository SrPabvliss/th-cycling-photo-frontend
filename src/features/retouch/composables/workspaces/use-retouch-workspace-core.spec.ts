import { describe, expect, it, vi, beforeEach } from 'vitest'
import { computed, ref } from 'vue'
import { useRetouchWorkspaceCore } from './use-retouch-workspace-core'

// Mock the workspace core to avoid deep dependency on photo queries/mutations
vi.mock('@/features/workspace/composables/use-workspace-core', () => ({
  useReviewWorkspaceCore: vi.fn(() => ({
    queueItems: computed(() => []),
    totalCount: computed(() => 0),
    reviewedCount: computed(() => 0),
    isQueuePending: computed(() => false),
    photo: computed(() => null),
    isPhotoPending: computed(() => false),
    currentSlug: ref(null),
    currentIndex: computed(() => -1),
    hasNext: computed(() => false),
    hasPrev: computed(() => false),
    goNext: vi.fn(),
    goPrev: vi.fn(),
    selectSlug: vi.fn(),
    cardNav: {
      activeIndex: ref(-1),
      cards: ref([]),
      next: vi.fn(),
      prev: vi.fn(),
      reset: vi.fn(),
      register: vi.fn(),
      unregister: vi.fn(),
      getActiveSection: vi.fn(),
    },
    mobileSheet: ref(null),
    openSheet: vi.fn(),
    closeSheet: vi.fn(),
    showCheatsheet: ref(false),
    onlyPending: ref(true),
    saveAndAdvance: vi.fn(),
    mode: 'retouch' as const,
  })),
}))

// Mock the order detail query to control photo list reactively
const mockPhotos = ref<
  {
    photoId: string
    publicSlug: string
    filename: string
    thumbnailUrl: string
    isRetouched: boolean
  }[]
>([])
const mockIsPending = ref(false)

vi.mock('../queries/use-operator-retouch-order-detail', () => ({
  useOperatorRetouchOrderDetailQuery: vi.fn(() => ({
    data: computed(() =>
      mockPhotos.value.length > 0
        ? {
            orderId: 'o1',
            buyerName: 'Buyer',
            eventId: 'e1',
            eventName: 'Event',
            createdAt: new Date(),
            photos: mockPhotos.value,
          }
        : undefined,
    ),
    isPending: mockIsPending,
    refetch: vi.fn(),
  })),
}))

function makeOrders(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    orderId: `order-${i + 1}`,
    buyerName: `Buyer ${i + 1}`,
    eventName: `Event ${i + 1}`,
    pendingPhotosCount: 3,
  }))
}

function makePhoto(id: string) {
  return {
    photoId: id,
    publicSlug: `slug-${id}`,
    filename: `${id}.jpg`,
    thumbnailUrl: `https://cdn/${id}.jpg`,
    isRetouched: false,
  }
}

beforeEach(() => {
  mockPhotos.value = []
  mockIsPending.value = false
})

describe('useRetouchWorkspaceCore', () => {
  describe('auto-selección de orden inicial', () => {
    it('selecciona el primer orden cuando no se provee initialOrderId', () => {
      const orders = computed(() => makeOrders(3))
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.orderId.value).toBe('order-1')
    })

    it('respeta el initialOrderId provisto', () => {
      const orders = computed(() => makeOrders(3))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-2', orders })
      expect(core.orderId.value).toBe('order-2')
    })

    it('no modifica orderId si la lista está vacía', () => {
      const orders = computed(() => [] as ReturnType<typeof makeOrders>)
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.orderId.value).toBeNull()
    })
  })

  describe('toggleMode', () => {
    it('empieza en modo retouch', () => {
      const orders = computed(() => makeOrders(1))
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.workspaceMode.value).toBe('retouch')
    })

    it('alterna entre retouch y review', () => {
      const orders = computed(() => makeOrders(1))
      const core = useRetouchWorkspaceCore({ orders })
      core.toggleMode()
      expect(core.workspaceMode.value).toBe('review')
      core.toggleMode()
      expect(core.workspaceMode.value).toBe('retouch')
    })
  })

  describe('orderMeta', () => {
    it('devuelve null cuando no hay orden activo', () => {
      const orders = computed(() => [] as ReturnType<typeof makeOrders>)
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.orderMeta.value).toBeNull()
    })

    it('refleja los datos del orden activo', () => {
      const orders = computed(() => makeOrders(2))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-1', orders })
      const meta = core.orderMeta.value
      expect(meta).not.toBeNull()
      expect(meta?.orderId).toBe('order-1')
      expect(meta?.buyerName).toBe('Buyer 1')
      expect(meta?.eventName).toBe('Event 1')
      expect(meta?.totalCount).toBe(3)
    })
  })

  describe('nextOrder', () => {
    it('devuelve el siguiente orden en la lista', () => {
      const orders = computed(() => makeOrders(3))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-1', orders })
      expect(core.nextOrder.value?.orderId).toBe('order-2')
    })

    it('devuelve null cuando está en el último orden', () => {
      const orders = computed(() => makeOrders(3))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-3', orders })
      expect(core.nextOrder.value).toBeNull()
    })

    it('devuelve null cuando la lista está vacía', () => {
      const orders = computed(() => [] as ReturnType<typeof makeOrders>)
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.nextOrder.value).toBeNull()
    })
  })

  describe('advanceToNextOrder', () => {
    it('avanza al siguiente orden', () => {
      const orders = computed(() => makeOrders(3))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-1', orders })
      core.advanceToNextOrder()
      expect(core.orderId.value).toBe('order-2')
    })

    it('establece orderId en null cuando está en el último orden', () => {
      const orders = computed(() => makeOrders(2))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-2', orders })
      core.advanceToNextOrder()
      expect(core.orderId.value).toBeNull()
    })

    it('resetea orderCompleted al avanzar', () => {
      const orders = computed(() => makeOrders(2))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-1', orders })
      core.orderCompleted.value = true
      core.advanceToNextOrder()
      expect(core.orderCompleted.value).toBe(false)
    })
  })

  describe('orderCompleted', () => {
    it('inicia en false', () => {
      const orders = computed(() => makeOrders(1))
      const core = useRetouchWorkspaceCore({ orders })
      expect(core.orderCompleted.value).toBe(false)
    })

    it('acknowledgeOrderCompleted resetea la bandera', () => {
      const orders = computed(() => makeOrders(1))
      const core = useRetouchWorkspaceCore({ orders })
      core.orderCompleted.value = true
      core.acknowledgeOrderCompleted()
      expect(core.orderCompleted.value).toBe(false)
    })

    it('se activa cuando las fotos pasan de N a 0 con un orden activo', async () => {
      mockPhotos.value = [makePhoto('p1'), makePhoto('p2')]
      const orders = computed(() => makeOrders(2))
      const core = useRetouchWorkspaceCore({ initialOrderId: 'order-1', orders })

      // Simula que se retocaron todas las fotos
      mockPhotos.value = []

      // Esperar un tick para que los watchers reactivos se procesen
      await new Promise((resolve) => setTimeout(resolve, 0))

      expect(core.orderCompleted.value).toBe(true)
    })
  })
})
