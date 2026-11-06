import { computed, ref, watch } from 'vue'

import { useSessionStore } from '@/core/auth/stores/session.store'
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
    if (choice.makeDefault) await setDefaultBillingAccount(choice.id)
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

  return {
    billingAccounts,
    needsInvoiceConsent,
    selectedBillingAccountId,
    invoiceConsentChecked,
    billingSheet,
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
