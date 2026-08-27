<script setup lang="ts">
import { computed, ref } from 'vue'
import { NCollapse, NCollapseItem, NIcon, NTabPane, NTabs } from 'naive-ui'
import { CheckmarkCircleOutline, WarningOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { useMyPhonesQuery } from '@/features/account/composables/queries/use-my-phones'
import { usePayoutMethods } from '@/features/tenant-profile/composables/queries/use-payout-methods'
import { useMyContracts } from '@/features/tenant-profile/composables/queries/use-my-contracts'
import type { IMyProfile } from '@/features/account/types/responses/my-profile.response'
import type { TenantProfileResponse } from '@/features/tenant-profile/types/responses/tenant-profile.response'

import ProfileForm from '@/features/account/presentation/components/ProfileForm/ProfileForm.vue'
import PhoneList from '@/features/account/presentation/components/PhoneList/PhoneList.vue'
import EmailSection from '@/features/account/presentation/components/EmailSection/EmailSection.vue'
import PasswordForm from '@/features/account/presentation/components/PasswordForm/PasswordForm.vue'
import BrandSection from '@/features/tenant-profile/presentation/sections/BrandSection.vue'
import ContactSection from '@/features/tenant-profile/presentation/sections/ContactSection.vue'
import PayoutSection from '@/features/tenant-profile/presentation/sections/PayoutSection.vue'
import ContractsSection from '@/features/tenant-profile/presentation/sections/ContractsSection.vue'

import ProfileIdentityStrip from '../ProfileIdentityStrip/ProfileIdentityStrip.vue'
import ProfileBlockIcon from '../ProfileBlockIcon/ProfileBlockIcon.vue'
import { useProfileCompleteness } from '../../composables/use-profile-completeness'

const props = defineProps<{
  myProfile: IMyProfile
  tenantProfile: TenantProfileResponse
}>()

const { currentUser } = useAuth()
const { data: phones } = useMyPhonesQuery()
const { data: payoutMethods } = usePayoutMethods()
const { data: contracts } = useMyContracts()

const myProfileRef = computed(() => props.myProfile)
const tenantProfileRef = computed(() => props.tenantProfile)

const { pendingItems, accountPending, businessPending, hasVerifiedPayphone } =
  useProfileCompleteness({
    currentUser,
    myProfile: myProfileRef,
    tenantProfile: tenantProfileRef,
    payoutMethods,
    isOperator: computed(() => true),
  })

const displayName = computed(() => {
  const parts = [props.myProfile.firstName, props.myProfile.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : props.myProfile.email
})

type TabKey = 'account' | 'business'
const activeTab = ref<TabKey>('account')

const accountExpanded = ref<string[]>(['personal-info'])
const businessExpanded = ref<string[]>([])

const personalInfoComplete = computed(
  () =>
    Boolean(props.myProfile.firstName) &&
    Boolean(props.myProfile.lastName) &&
    Boolean(props.myProfile.countryId),
)

const phoneCount = computed(() => phones.value?.length ?? 0)
const phoneCountLabel = computed(() => String(phoneCount.value))

const configuredPayoutSlots = computed(() => {
  const methods = payoutMethods.value ?? []
  const hasPayphone = methods.some((method) => method.provider === 'payphone')
  const hasBank = methods.some((method) => method.provider === 'bank_transfer')
  return [hasPayphone, hasBank].filter(Boolean).length
})

const acceptedContracts = computed(() =>
  (contracts.value ?? []).filter((contract) => contract.status === 'accepted'),
)

const contractsLabel = computed(() => {
  if (acceptedContracts.value.length === 0) return 'Sin contratos'
  const eventsLeft = acceptedContracts.value.reduce(
    (sum, contract) => sum + Math.max(contract.eventsTotal - contract.eventsUsed, 0),
    0,
  )
  return `${eventsLeft} eventos libres`
})

const brandPending = computed(() => pendingItems.value.filter((item) => item.section === 'brand'))
const brandMetaLabel = computed(() =>
  brandPending.value.length > 0
    ? brandPending.value.map((item) => item.label).join(' · ')
    : (tenantProfileRef.value.publicName ?? ''),
)
</script>

<template>
  <div class="profile-organizer-mobile">
    <ProfileIdentityStrip
      :name="displayName"
      :email="currentUser?.email ?? myProfile.email"
      :email-verified="currentUser?.emailVerified ?? false"
      :pending="pendingItems"
      compact
    />

    <NTabs
      v-model:value="activeTab"
      type="segment"
      size="small"
      class="profile-organizer-mobile__tabs"
    >
      <NTabPane name="account">
        <template #tab>
          <span class="profile-organizer-mobile__tab">
            Tu cuenta
            <NIcon
              v-if="accountPending.length > 0"
              :size="13"
              :component="WarningOutline"
              class="profile-organizer-mobile__tab-warn"
            />
          </span>
        </template>

        <NCollapse v-model:expanded-names="accountExpanded" class="profile-organizer-mobile__card">
          <NCollapseItem name="personal-info">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="user" />
                <b>Datos personales</b>
              </span>
            </template>
            <template v-if="!personalInfoComplete" #header-extra>
              <span class="profile-organizer-mobile__meta is-warn">
                Incompleto
                <NIcon :size="12" :component="WarningOutline" />
              </span>
            </template>
            <ProfileForm :profile="myProfile" />
          </NCollapseItem>

          <NCollapseItem name="phones">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="phone" />
                <b>Teléfonos</b>
              </span>
            </template>
            <template #header-extra>
              <span class="profile-organizer-mobile__meta" :class="{ 'is-warn': phoneCount === 0 }">
                {{ phoneCountLabel }}
                <NIcon v-if="phoneCount === 0" :size="12" :component="WarningOutline" />
              </span>
            </template>
            <PhoneList />
          </NCollapseItem>

          <NCollapseItem name="email">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="mail" />
                <b>Correo</b>
              </span>
            </template>
            <template #header-extra>
              <span
                class="profile-organizer-mobile__meta"
                :class="currentUser?.emailVerified ? 'is-ok' : 'is-warn'"
              >
                {{ currentUser?.emailVerified ? 'Verificado' : 'Sin verificar' }}
                <NIcon
                  :size="12"
                  :component="currentUser?.emailVerified ? CheckmarkCircleOutline : WarningOutline"
                />
              </span>
            </template>
            <EmailSection />
          </NCollapseItem>

          <NCollapseItem name="password">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="lock" />
                <b>Contraseña</b>
              </span>
            </template>
            <PasswordForm />
          </NCollapseItem>
        </NCollapse>
      </NTabPane>

      <NTabPane name="business">
        <template #tab>
          <span class="profile-organizer-mobile__tab">
            Tu negocio
            <NIcon
              v-if="businessPending.length > 0"
              :size="13"
              :component="WarningOutline"
              class="profile-organizer-mobile__tab-warn"
            />
          </span>
        </template>

        <NCollapse v-model:expanded-names="businessExpanded" class="profile-organizer-mobile__card">
          <NCollapseItem name="brand">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="img" />
                <b>Marca</b>
              </span>
            </template>
            <template v-if="brandMetaLabel" #header-extra>
              <span
                class="profile-organizer-mobile__meta"
                :class="{ 'is-warn': brandPending.length > 0 }"
              >
                {{ brandMetaLabel }}
                <NIcon v-if="brandPending.length > 0" :size="12" :component="WarningOutline" />
              </span>
            </template>
            <BrandSection :profile="tenantProfile" />
          </NCollapseItem>

          <NCollapseItem name="contact">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="wa" />
                <b>Contacto comercial</b>
              </span>
            </template>
            <template #header-extra>
              <span
                class="profile-organizer-mobile__meta"
                :class="{ 'is-warn': !tenantProfile.whatsappNumber }"
              >
                {{ tenantProfile.whatsappNumber ?? 'Sin definir' }}
                <NIcon
                  v-if="!tenantProfile.whatsappNumber"
                  :size="12"
                  :component="WarningOutline"
                />
              </span>
            </template>
            <ContactSection :profile="tenantProfile" />
          </NCollapseItem>

          <NCollapseItem name="payouts">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="card" />
                <b>Cobros</b>
              </span>
            </template>
            <template #header-extra>
              <span
                class="profile-organizer-mobile__meta"
                :class="{ 'is-warn': !hasVerifiedPayphone }"
              >
                {{ configuredPayoutSlots }} de 2
                <NIcon v-if="!hasVerifiedPayphone" :size="12" :component="WarningOutline" />
              </span>
            </template>
            <PayoutSection :whatsapp-number="tenantProfile.whatsappNumber" />
          </NCollapseItem>

          <NCollapseItem name="contracts">
            <template #header>
              <span class="profile-organizer-mobile__row-head">
                <ProfileBlockIcon icon="doc" />
                <b>Contratos con TitanTV</b>
              </span>
            </template>
            <template #header-extra>
              <span
                class="profile-organizer-mobile__meta"
                :class="{ 'is-warn': acceptedContracts.length === 0 }"
              >
                {{ contractsLabel }}
                <NIcon
                  v-if="acceptedContracts.length === 0"
                  :size="12"
                  :component="WarningOutline"
                />
              </span>
            </template>
            <ContractsSection />
          </NCollapseItem>
        </NCollapse>
      </NTabPane>
    </NTabs>
  </div>
</template>

<style scoped src="./profile-organizer-mobile.css"></style>
