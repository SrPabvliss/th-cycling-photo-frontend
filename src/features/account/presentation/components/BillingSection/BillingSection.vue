<script setup lang="ts">
import { computed, ref } from 'vue'
import { NButton, useMessage } from 'naive-ui'
import { isAxiosError } from 'axios'

import { useSessionStore } from '@/core/auth/stores/session.store'
import BillingSheet from '@/shared/components/BillingSheet/BillingSheet.vue'
import ConfirmDialog from '@/shared/components/confirm-dialog/ConfirmDialog.vue'
import { EmptyState } from '@/shared/components/empty-state'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { ErrorState, TtSkeleton } from '@/shared/components/loading'
import { generalProblem, type IFormProblem } from '@/shared/utils/form-problem'
import { useDeleteBillingAccount } from '../../../composables/mutations/use-delete-billing-account'
import { useSetDefaultBillingAccount } from '../../../composables/mutations/use-set-default-billing-account'
import {
  billingChanges,
  useUpdateBillingAccount,
} from '../../../composables/mutations/use-update-billing-account'
import { useMyBillingAccountsQuery } from '../../../composables/queries/use-my-billing-accounts'
import { BILLING_ID_TYPE_OPTIONS } from '../../../constants/billing-account-form.schema'
import type { ICreateBillingAccountRequest } from '../../../types/requests/billing-account.request'
import type { IBillingAccount } from '../../../types/responses/billing-account.response'
import {
  readBillingServerError,
  type IBillingServerError,
} from '../../../utils/billing-server-error'
import BillingAccountForm from '../BillingAccountForm/BillingAccountForm.vue'

const SAVE_FALLBACK = 'No pudimos guardar tus datos de facturación. Intenta de nuevo.'
const IDENTIFICATION_REJECTED = 'No pudimos validar ese número. Revísalo.'
const SKELETON_ROWS = 2

const message = useMessage()
const session = useSessionStore()
const { data, status, isFetching, refetch } = useMyBillingAccountsQuery()
const setDefault = useSetDefaultBillingAccount()
const deleteAccount = useDeleteBillingAccount()
const updateAccount = useUpdateBillingAccount()

const accounts = computed(() => data.value?.accounts ?? [])
const needsConsent = computed(() => data.value?.invoiceConsentGiven === false)
const idTypeLabel = (account: IBillingAccount) =>
  BILLING_ID_TYPE_OPTIONS.find((option) => option.value === account.idType)?.label ?? ''
const prefill = computed(() => ({
  legalName: [session.currentUser?.firstName, session.currentUser?.lastName]
    .filter(Boolean)
    .join(' '),
  email: session.currentUser?.email ?? '',
}))

// --- One sheet to add or edit; deleting is confirmed in a dialog that starts on keeping ---
const sheet = ref<'closed' | 'add' | 'edit'>('closed')
const target = ref<IBillingAccount | null>(null)
const serverError = ref<IBillingServerError | null>(null)
const busyId = ref<string | null>(null)
const deleting = ref<IBillingAccount | null>(null)
// What a failed action on the list (delete, make default) has to say, above it.
const listProblem = ref<IFormProblem | null>(null)

function open(kind: 'add' | 'edit', account: IBillingAccount | null = null) {
  target.value = account
  serverError.value = null
  sheet.value = kind
}

function close() {
  sheet.value = 'closed'
}

function askDelete(account: IBillingAccount) {
  listProblem.value = null
  deleting.value = account
}

const isGone = (error: unknown) => isAxiosError(error) && error.response?.status === 404

// Gone already (deleted elsewhere): read the list again so it leaves the screen.
async function forgetGone() {
  close()
  deleting.value = null
  message.info('Esos datos ya no existen.')
  await refetch()
}

function onSaved() {
  close()
  message.success('Datos de facturación guardados.')
}

async function saveEdit(request: ICreateBillingAccountRequest) {
  const account = target.value
  if (!account || updateAccount.isPending.value) return
  const changes = billingChanges(account, request)
  if (Object.keys(changes).length === 0) {
    close()
    return
  }
  serverError.value = null
  try {
    await updateAccount.mutateAsync({ id: account.id, changes })
  } catch (error) {
    if (isGone(error)) return forgetGone()
    const read = readBillingServerError(error, SAVE_FALLBACK)
    serverError.value =
      read.messageKey === 'billing.identification_invalid'
        ? { ...read, message: IDENTIFICATION_REJECTED, fields: null }
        : read
    return
  }
  onSaved()
}

async function confirmDelete() {
  const account = deleting.value
  if (!account || deleteAccount.isPending.value) return
  try {
    await deleteAccount.mutateAsync(account.id)
  } catch (error) {
    if (isGone(error)) return forgetGone()
    // The data stays: say why, next to the list.
    deleting.value = null
    listProblem.value = generalProblem(error)
    return
  }
  deleting.value = null
  message.success('Datos de facturación eliminados.')
}

async function makeDefault(account: IBillingAccount) {
  if (busyId.value) return
  busyId.value = account.id
  listProblem.value = null
  try {
    await setDefault.mutateAsync(account.id)
  } catch (error) {
    if (isGone(error)) await forgetGone()
    // The default stays as it was: say why, next to the list, like a failed delete.
    else listProblem.value = generalProblem(error)
  } finally {
    busyId.value = null
  }
}

const editInitial = computed<ICreateBillingAccountRequest | undefined>(() =>
  target.value
    ? {
        idType: target.value.idType,
        idNumber: target.value.idNumber,
        legalName: target.value.legalName,
        email: target.value.email,
        ...(target.value.address ? { address: target.value.address } : {}),
      }
    : undefined,
)
</script>

<template>
  <div class="billing-section">
    <div v-if="status === 'pending'" class="billing-section__list">
      <TtSkeleton
        v-for="row in SKELETON_ROWS"
        :key="row"
        height="calc(var(--tt-control-l) * 2)"
        radius="m"
      />
    </div>

    <ErrorState
      v-else-if="status === 'error'"
      title="No pudimos cargar tus datos de facturación"
      :retrying="isFetching"
      @retry="refetch()"
    />

    <EmptyState
      v-else-if="accounts.length === 0"
      title="Todavía no tienes datos de facturación"
      text="Los necesitas para confirmar un pedido."
    >
      <template #actions>
        <NButton type="primary" @click="open('add')">Agregar datos de facturación</NButton>
      </template>
    </EmptyState>

    <template v-else>
      <FormAlert
        v-if="listProblem"
        tone="bad"
        :title="listProblem.title"
        :text="listProblem.text"
      />
      <ul class="billing-section__list">
        <li v-for="account in accounts" :key="account.id" class="billing-section__card">
          <div class="billing-section__head">
            <strong class="billing-section__name">{{ account.legalName }}</strong>
            <span v-if="account.isDefault" class="billing-section__pill">Predeterminada</span>
          </div>
          <span class="billing-section__line"
            >{{ idTypeLabel(account) }} {{ account.idNumber }}</span
          >
          <span class="billing-section__line">{{ account.email }}</span>
          <span v-if="account.address" class="billing-section__line">{{ account.address }}</span>
          <div class="billing-section__actions">
            <button type="button" class="billing-section__action" @click="open('edit', account)">
              Editar
            </button>
            <button
              v-if="!account.isDefault"
              type="button"
              class="billing-section__action"
              :disabled="busyId === account.id"
              :aria-busy="busyId === account.id ? 'true' : undefined"
              @click="makeDefault(account)"
            >
              Usar como predeterminada
            </button>
            <button
              type="button"
              class="billing-section__action billing-section__action--danger"
              @click="askDelete(account)"
            >
              Eliminar
            </button>
          </div>
        </li>
      </ul>
      <NButton class="billing-section__add" @click="open('add')">
        Agregar datos de facturación
      </NButton>
    </template>

    <ConfirmDialog
      :open="!!deleting"
      title="¿Eliminar estos datos?"
      text="Tus pedidos anteriores conservan los datos con los que se hicieron."
      confirm-label="Eliminar"
      keep-label="Conservar"
      :busy="deleteAccount.isPending.value"
      @confirm="confirmDelete"
      @keep="deleting = null"
    />

    <BillingSheet v-if="sheet !== 'closed'" title="Datos de facturación" @close="close">
      <BillingAccountForm
        v-if="sheet === 'edit'"
        mode="edit"
        :needs-consent="false"
        :prefill="prefill"
        :initial="editInitial"
        submit-label="Guardar cambios"
        :submitting="updateAccount.isPending.value"
        :server-error="serverError"
        @submit="saveEdit"
        @cancel="close"
      />

      <BillingAccountForm
        v-else
        mode="create"
        :needs-consent="needsConsent"
        :prefill="prefill"
        submit-label="Guardar"
        @saved="onSaved"
        @cancel="close"
      />
    </BillingSheet>
  </div>
</template>

<style scoped>
.billing-section,
.billing-section__list {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  margin: 0;
  padding: 0;
  list-style: none;
}

.billing-section__card {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-1);
  padding: var(--tt-space-3) var(--tt-space-4);
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
}

.billing-section__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--tt-space-2);
}

.billing-section__name {
  min-inline-size: 0;
  overflow-wrap: anywhere;
}

.billing-section__pill {
  flex: none;
  padding: 0 var(--tt-space-2);
  border-radius: var(--tt-radius-pill);
  background: var(--tt-primary-soft);
  color: var(--tt-primary-ink);
  font-size: var(--tt-type-label-size);
  font-weight: var(--tt-type-title-weight);
}

.billing-section__line {
  margin: 0;
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-caption-size);
  line-height: var(--tt-type-caption-line);
  overflow-wrap: anywhere;
}

.billing-section__actions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--tt-space-1) var(--tt-space-4);
  margin-block-start: var(--tt-space-1);
}

.billing-section__action {
  min-block-size: var(--tt-control-s);
  padding: 0;
  border: 0;
  background: none;
  color: var(--tt-primary-ink);
  font: inherit;
  font-size: var(--tt-type-body-s-medium-size);
  font-weight: var(--tt-type-title-weight);
  cursor: pointer;
}

.billing-section__action:disabled {
  color: var(--tt-ink-muted);
  cursor: default;
}

.billing-section__action--danger {
  color: var(--tt-danger-ink);
}

@media (min-width: 768px) {
  .billing-section__add {
    align-self: flex-start;
  }
}
</style>
