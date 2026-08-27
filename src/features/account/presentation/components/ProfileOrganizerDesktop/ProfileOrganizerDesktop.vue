<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

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
import ProfilePaneHeader from '../ProfilePaneHeader/ProfilePaneHeader.vue'
import ProfileBlockCard from '../ProfileBlockCard/ProfileBlockCard.vue'
import {
  useProfileCompleteness,
  type IProfilePendingItem,
  type ProfilePendingSection,
} from '../../composables/use-profile-completeness'
import { useProfileBlockNavigation } from '../../composables/use-profile-block-navigation'
import { pluralize } from '@/shared/utils/format.utils'

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

const { accountPending, businessPending, pendingItems } = useProfileCompleteness({
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

const accountStatusLabel = computed(() =>
  accountPending.value.length === 0
    ? 'Al día'
    : `${accountPending.value.length} ${pluralize(accountPending.value.length, 'pendiente', 'pendientes')}`,
)
const businessStatusLabel = computed(() =>
  businessPending.value.length === 0
    ? 'Al día'
    : `${businessPending.value.length} ${pluralize(businessPending.value.length, 'pendiente', 'pendientes')}`,
)

const phoneCount = computed(() => phones.value?.length ?? 0)
const contractCount = computed(() => contracts.value?.length ?? 0)

const { registerSection, registeredSections, scrollToSection, highlighted } =
  useProfileBlockNavigation()

function bindSection(section: ProfilePendingSection) {
  return (el: Element | { $el?: Element } | null) => {
    const node = el && '$el' in el ? (el.$el ?? null) : el
    registerSection(section, node as Element | null)
  }
}

function onSelectPending(item: IProfilePendingItem) {
  scrollToSection(item.section)
}
</script>

<template>
  <div class="profile-organizer-desktop">
    <ProfileIdentityStrip
      :name="displayName"
      :email="currentUser?.email ?? myProfile.email"
      :email-verified="currentUser?.emailVerified ?? false"
      :pending="pendingItems"
      :reachable-sections="registeredSections"
      @select="onSelectPending"
    />

    <div class="profile-organizer-desktop__panes">
      <div class="profile-organizer-desktop__pane">
        <ProfilePaneHeader
          badge="A"
          title="Tu cuenta"
          tag="Privado · solo lo ve TitanTV"
          :status-label="accountStatusLabel"
          :status-tone="accountPending.length === 0 ? 'ok' : 'warn'"
        />

        <ProfileBlockCard
          :ref="bindSection('personal-info')"
          icon="user"
          title="Datos personales"
          subtitle="Nombre, ubicación y fecha de nacimiento."
          :highlighted="highlighted === 'personal-info'"
        >
          <ProfileForm :profile="myProfile" />
        </ProfileBlockCard>

        <ProfileBlockCard
          :ref="bindSection('phones')"
          icon="phone"
          title="Teléfonos"
          subtitle="Para que TitanTV te contacte."
          :highlighted="highlighted === 'phones'"
        >
          <template #aside>
            <span class="profile-organizer-desktop__count">{{ phoneCount }}</span>
          </template>
          <PhoneList />
        </ProfileBlockCard>

        <ProfileBlockCard
          :ref="bindSection('email')"
          icon="mail"
          title="Correo"
          :highlighted="highlighted === 'email'"
        >
          <template #aside>
            <NTag :type="currentUser?.emailVerified ? 'success' : 'warning'" size="small">
              {{ currentUser?.emailVerified ? 'Verificado' : 'Sin verificar' }}
            </NTag>
          </template>
          <EmailSection />
        </ProfileBlockCard>

        <ProfileBlockCard icon="lock" title="Contraseña">
          <PasswordForm />
        </ProfileBlockCard>
      </div>

      <div class="profile-organizer-desktop__pane profile-organizer-desktop__pane--biz">
        <ProfilePaneHeader
          badge="B"
          title="Tu negocio"
          tag="Público · lo ve el comprador"
          :status-label="businessStatusLabel"
          :status-tone="businessPending.length === 0 ? 'ok' : 'warn'"
        />

        <ProfileBlockCard
          :ref="bindSection('brand')"
          icon="img"
          title="Marca"
          subtitle="Con qué cara apareces en la galería."
          :highlighted="highlighted === 'brand'"
        >
          <BrandSection :profile="tenantProfile" />
        </ProfileBlockCard>

        <ProfileBlockCard
          :ref="bindSection('contact')"
          icon="wa"
          title="Contacto comercial"
          :highlighted="highlighted === 'contact'"
        >
          <ContactSection :profile="tenantProfile" />
        </ProfileBlockCard>

        <ProfileBlockCard
          :ref="bindSection('payouts')"
          icon="card"
          title="Cobros"
          subtitle="Dos métodos posibles: Payphone y transferencia bancaria."
          :highlighted="highlighted === 'payouts'"
        >
          <PayoutSection :whatsapp-number="tenantProfile.whatsappNumber" />
        </ProfileBlockCard>

        <ProfileBlockCard icon="doc" title="Contratos con TitanTV" subtitle="Solo lectura.">
          <template v-if="contractCount > 0" #aside>
            <span class="profile-organizer-desktop__count">{{ contractCount }}</span>
          </template>
          <ContractsSection />
        </ProfileBlockCard>
      </div>
    </div>
  </div>
</template>

<style scoped src="./profile-organizer-desktop.css"></style>
