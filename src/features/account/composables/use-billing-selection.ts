import { computed, ref, watch } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { problemKind } from '@/core/http/problem-kind'
import { useOnline } from '@/core/network/use-online'
import { loadProblemCopy } from '@/shared/components/loading'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useSetDefaultBillingAccount } from './mutations/use-set-default-billing-account'
import { useRecordInvoiceConsent } from './mutations/use-record-invoice-consent'
import { useMyBillingAccountsQuery } from './queries/use-my-billing-accounts'

export type BillingSheet = 'form' | 'picker' | null

/**
 * Billing step shared by every place that places an order (cart checkout and
 * the client preview): which billing account the invoice goes to, the
 * electronic-invoice consent and the add/pick sheet. Pair it with BillingCard,
 * BillingAccountForm and BillingAccountPicker.
 */
export function useBillingSelection(enabled: () => boolean) {
  const session = useSessionStore()

  const billingQuery = useMyBillingAccountsQuery({ enabled })
  const { mutateAsync: setDefaultBillingAccount, isPending: isSettingDefault } =
    useSetDefaultBillingAccount()
  const { mutateAsync: recordInvoiceConsent, isPending: isRecordingConsent } =
    useRecordInvoiceConsent()

  const billingAccounts = computed(() => billingQuery.data.value?.accounts ?? [])
  const needsInvoiceConsent = computed(
    () => billingQuery.data.value !== undefined && !billingQuery.data.value.invoiceConsentGiven,
  )
  const selectedBillingAccountId = ref<string | null>(null)
  const invoiceConsentChecked = ref(false)
  const billingSheet = ref<BillingSheet>(null)
  /** Why the last pick did not go through, said in the picker above its button. */
  const pickProblem = ref<IFormProblem | null>(null)
  watch(billingSheet, () => (pickProblem.value = null))

  watch(
    billingAccounts,
    (accounts) => {
      if (accounts.some((account) => account.id === selectedBillingAccountId.value)) return
      selectedBillingAccountId.value =
        accounts.find((account) => account.isDefault)?.id ?? accounts[0]?.id ?? null
    },
    { immediate: true },
  )

  const billingPrefill = computed(() => ({
    legalName: [session.currentUser?.firstName, session.currentUser?.lastName]
      .filter(Boolean)
      .join(' ')
      .trim(),
    email: session.currentUser?.email ?? '',
  }))

  const isBillingReady = computed(
    () =>
      selectedBillingAccountId.value !== null &&
      (!needsInvoiceConsent.value || invoiceConsentChecked.value),
  )

  function handleBillingSaved(billingAccountId: string) {
    selectedBillingAccountId.value = billingAccountId
    invoiceConsentChecked.value = false
    billingSheet.value = null
  }

  async function handleBillingChosen(choice: { id: string; makeDefault: boolean }) {
    selectedBillingAccountId.value = choice.id
    pickProblem.value = null
    if (choice.makeDefault) {
      try {
        await setDefaultBillingAccount(choice.id)
      } catch (error) {
        pickProblem.value = generalProblem(error)
        return
      }
    }
    billingSheet.value = null
  }

  /** Re-reads accounts and consent after the server rejected them as stale. */
  function refreshBilling() {
    invoiceConsentChecked.value = false
    return billingQuery.refetch()
  }

  /** Records the electronic-invoice consent when the buyer still owes it. */
  async function ensureInvoiceConsent() {
    if (needsInvoiceConsent.value) await recordInvoiceConsent()
  }

  /** Asks for the billing data again after it failed to load. */
  function retryBilling() {
    return billingQuery.refetch()
  }

  // Without network the read waits (pending, paused) instead of failing: not "no data" either.
  const online = useOnline()
  const isWaitingForNetwork = computed(
    () => !online.value && billingQuery.status.value === 'pending',
  )

  return {
    /** The billing data was read: from here on, no account means the buyer has none. */
    isBillingLoaded: computed(() => billingQuery.isSuccess.value),
    /** It could not be read and nothing was before: say so instead of offering to add some. */
    billingProblem: computed(
      () =>
        (billingQuery.status.value === 'error' || isWaitingForNetwork.value) &&
        billingQuery.data.value === undefined,
    ),
    /** The words of that problem, by its cause: no connection, slowness, or a failure. */
    billingProblemCopy: computed(() =>
      loadProblemCopy(
        isWaitingForNetwork.value ? 'offline' : problemKind(billingQuery.error.value),
        'tus datos de factura',
        {
          title: 'No pudimos mostrar tus datos de factura',
          text: 'Los necesitamos para crear tu pedido.',
        },
      ),
    ),
    isBillingRetrying: computed(() => billingQuery.isFetching.value),
    retryBilling,
    billingAccounts,
    needsInvoiceConsent,
    selectedBillingAccountId,
    invoiceConsentChecked,
    billingSheet,
    pickProblem,
    billingPrefill,
    isBillingReady,
    isSettingDefault,
    isRecordingConsent,
    handleBillingSaved,
    handleBillingChosen,
    ensureInvoiceConsent,
    refreshBilling,
  }
}
