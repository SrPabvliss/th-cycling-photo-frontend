<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton, NIcon, NResult, NSpin } from 'naive-ui'
import { AddOutline } from '@vicons/ionicons5'

import { dialog } from '@/core/ui/discrete-api'
import { PERMISSIONS } from '@/core/auth/permissions'
import { usePermissions } from '@/core/auth/use-permissions'
import PageHeader from '@/shared/components/PageHeader.vue'
import { useInfiniteScrollTrigger } from '@/shared/composables/use-infinite-scroll-trigger'
import { useOrganizersListQuery } from '../../composables/queries/use-organizers-list'
import { useOrganizersStatsQuery } from '../../composables/queries/use-organizers-stats'
import {
  ORGANIZER_FILTER_STATE_KEY,
  organizerFiltersToQuery,
  seedOrganizerFiltersFromQuery,
  useOrganizerFilters,
} from '../../composables/use-organizer-filters'
import { useRevokeContract } from '@/features/contracts/composables/mutations/use-revoke-contract'
import { ORGANIZER_ROUTE_NAMES } from '../../routes'
import type {
  IInvitationCard,
  IOrganizerCard,
  IOrganizerRow,
} from '../../types/responses/organizer-list.response'
import type { IContractIssued } from '@/features/contracts/types/responses/contract-issued.response'
import type { IPickableOrganizer } from '../../types/responses/pickable-person.response'
import IssueContractModal from '../modals/IssueContractModal.vue'
import LinkResultModal from '../modals/LinkResultModal.vue'
import ResendConfirmModal from '../modals/ResendConfirmModal.vue'
import OrganizerCard from '../components/OrganizerCard/OrganizerCard.vue'
import InvitationCard from '../components/InvitationCard/InvitationCard.vue'
import OrganizerStatsCards from '../components/OrganizerStatsCards/OrganizerStatsCards.vue'
import OrganizerTabs from '../components/OrganizerTabs/OrganizerTabs.vue'
import OrganizerFilterBar from '../components/OrganizerFilterBar/OrganizerFilterBar.vue'
import FirstRun from '../components/OrganizerEmptyStates/FirstRun.vue'
import NoResults from '../components/OrganizerEmptyStates/NoResults.vue'
import HeadsUp from '../components/OrganizerEmptyStates/HeadsUp.vue'
import { formatNumber, pluralize } from '@/shared/utils/format.utils'

const LIMIT = 20

const route = useRoute()
const router = useRouter()
const { has } = usePermissions()
const canIssueContract = computed(() => has(PERMISSIONS.CONTRACT_ISSUE))
const canRevokeContract = computed(() => has(PERMISSIONS.CONTRACT_REVOKE))

const filterState = useOrganizerFilters()
provide(ORGANIZER_FILTER_STATE_KEY, filterState)
const { filters, clearAll } = filterState

seedOrganizerFiltersFromQuery(filterState, route.query)

watch(
  filters,
  (value) => {
    router.replace({ query: organizerFiltersToQuery(value) })
  },
  { deep: true },
)

const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
  useOrganizersListQuery(filters, LIMIT)

const { data: stats } = useOrganizersStatsQuery(filters)

const rows = computed<IOrganizerRow[]>(() => data.value?.pages.flatMap((page) => page.items) ?? [])
const resultsCount = computed(() => {
  const pages = data.value?.pages
  const lastPage = pages && pages.length > 0 ? pages[pages.length - 1] : undefined
  return lastPage ? lastPage.pagination.total : null
})

const hasActiveFilters = computed(
  () => filters.value.search !== null || filters.value.tab !== 'all',
)

const onlyInvitationsAccepted = computed(
  () => rows.value.length > 0 && rows.value.every((row) => row.kind === 'invitation'),
)

const isCrisis = computed(() => {
  if (!stats.value) return false
  return stats.value.noQuota > 0 && stats.value.noQuota > stats.value.active
})

const sentinelRef = useInfiniteScrollTrigger(() => fetchNextPage(), {
  isBusy: computed(() => isFetchingNextPage.value),
  canLoadMore: computed(() => hasNextPage.value ?? false),
})

const { mutate: revokeContract } = useRevokeContract()

const issueMode = ref<'new' | 'renew'>('new')
const renewSource = ref<IPickableOrganizer | null>(null)
const issueSearchSeed = ref('')
const showIssueModal = ref(false)

const resendTarget = ref<IInvitationCard | null>(null)
const showResendModal = ref(false)

const linkResult = ref<IContractIssued | null>(null)
const linkIsResend = ref(false)
const showLinkModal = ref(false)

function handleIssue() {
  issueMode.value = 'new'
  renewSource.value = null
  issueSearchSeed.value = ''
  showIssueModal.value = true
}

function handleOpenOrganizer(organizer: IOrganizerCard) {
  router.push({ name: ORGANIZER_ROUTE_NAMES.DETAIL, params: { id: organizer.id } })
}

function handleRenew(organizer: IOrganizerCard) {
  issueMode.value = 'renew'
  renewSource.value = organizer
  issueSearchSeed.value = ''
  showIssueModal.value = true
}

function handleReissue(invitation: IInvitationCard) {
  issueMode.value = 'new'
  renewSource.value = null
  issueSearchSeed.value = invitation.holderEmail
  showIssueModal.value = true
}

function handleResend(invitation: IInvitationCard) {
  resendTarget.value = invitation
  showResendModal.value = true
}

function handleRevoke(invitation: IInvitationCard) {
  dialog.warning({
    title: 'Revocar invitación',
    content: `La invitación de ${invitation.holderName} dejará de ser válida. Esta acción no se puede deshacer.`,
    positiveText: 'Revocar',
    negativeText: 'Cancelar',
    onPositiveClick: () => revokeContract(invitation.id),
  })
}

function showIssuedLink(result: IContractIssued, isResend: boolean) {
  linkResult.value = result
  linkIsResend.value = isResend
  showLinkModal.value = true
}
</script>

<template>
  <div class="page-view">
    <div class="page-view__content organizers-content">
      <PageHeader title="Organizadores" subtitle="Quién puede publicar eventos y con cuánto cupo">
        <NButton
          v-if="canIssueContract"
          type="primary"
          data-test="issue-contract-header"
          @click="handleIssue"
        >
          <template #icon><NIcon :component="AddOutline" /></template>
          Emitir contrato
        </NButton>
      </PageHeader>

      <OrganizerStatsCards :stats="stats" />

      <div class="organizers-panel">
        <OrganizerTabs
          :active="filterState.tab.value"
          :counts="stats?.tabs"
          @update:active="(tab) => (filterState.tab.value = tab)"
        />
        <OrganizerFilterBar />

        <div v-if="resultsCount != null" class="organizers-result-line">
          <b>{{ formatNumber(resultsCount) }}</b>
          {{ pluralize(resultsCount, 'resultado', 'resultados') }}
          <span class="organizers-result-line__sub">
            · las invitaciones pendientes van siempre primero · desplaza para cargar más
          </span>
        </div>
        <div v-else class="organizers-result-line">
          <span class="organizers-result-line__sub">Cargando organizadores…</span>
        </div>

        <div v-if="isPending" class="organizers-loading">
          <NSpin size="medium" />
        </div>

        <NResult
          v-else-if="isError"
          status="error"
          title="Error al cargar organizadores"
          description="No se pudo obtener la lista de organizadores."
        >
          <template #footer>
            <NButton @click="refetch()">Reintentar</NButton>
          </template>
        </NResult>

        <FirstRun
          v-else-if="rows.length === 0 && !hasActiveFilters"
          :can-issue="canIssueContract"
          @issue="handleIssue"
        />

        <NoResults v-else-if="rows.length === 0" @clear="clearAll()" />

        <template v-else>
          <HeadsUp v-if="onlyInvitationsAccepted" variant="only-invites" />
          <HeadsUp v-else-if="isCrisis" variant="crisis" />

          <div class="organizers-grid">
            <template v-for="row in rows" :key="row.id">
              <OrganizerCard
                v-if="row.kind === 'organizer'"
                :organizer="row"
                @open="handleOpenOrganizer(row)"
                @renew="handleRenew"
              />
              <InvitationCard
                v-else
                :invitation="row"
                :can-issue="canIssueContract"
                :can-revoke="canRevokeContract"
                @resend="handleResend"
                @revoke="handleRevoke"
                @reissue="handleReissue"
              />
            </template>
          </div>

          <div ref="sentinelRef" class="organizers-sentinel" aria-hidden="true" />

          <div v-if="isFetchingNextPage" class="organizers-loading-more">
            <NSpin :size="20" /> <span>Cargando más organizadores…</span>
          </div>
        </template>
      </div>
    </div>

    <IssueContractModal
      v-model:show="showIssueModal"
      :mode="issueMode"
      :organizer="renewSource"
      :initial-search="issueSearchSeed"
      @issued="(result) => showIssuedLink(result, false)"
    />

    <ResendConfirmModal
      v-if="resendTarget"
      v-model:show="showResendModal"
      :invitation="resendTarget"
      @resent="(result) => showIssuedLink(result, true)"
    />

    <LinkResultModal
      v-if="linkResult"
      v-model:show="showLinkModal"
      :url="linkResult.url"
      :resend="linkIsResend"
    />
  </div>
</template>

<style scoped src="./organizers-list-view.css" />
