<script setup lang="ts">
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { NButton } from 'naive-ui'

import { problemKind } from '@/core/http/problem-kind'
import { canOperate } from '@/core/auth/capabilities'
import { useSessionStore } from '@/core/auth/stores/session.store'
import { useLogoutMutation } from '@/core/auth/use-logout'
import { ROUTE_PATHS } from '@/core/navigation/route-paths'
import { ErrorState, TtSkeleton, useDelayedFlag } from '@/shared/components/loading'
import { useMyBillingAccountsQuery } from '../../composables/queries/use-my-billing-accounts'
import { useMyProfileQuery } from '../../composables/queries/use-my-profile'
import BillingSection from '../components/BillingSection/BillingSection.vue'
import AccountEmailSection from '../components/AccountEmailSection/AccountEmailSection.vue'
import PasswordSection from '../components/PasswordSection/PasswordSection.vue'
import PersonalDataSection from '../components/PersonalDataSection/PersonalDataSection.vue'
import PhonesSection from '../components/PhonesSection/PhonesSection.vue'
import ProfileHeader from '../components/ProfileHeader/ProfileHeader.vue'
import ProfileSection from '../components/ProfileSection/ProfileSection.vue'
import ProfileContent from './ProfileContent.vue'

type SectionKey = 'datos' | 'tels' | 'correo' | 'clave' | 'fact'
const SECTION_KEYS: readonly SectionKey[] = ['datos', 'tels', 'correo', 'clave', 'fact']
const SKELETON_ROWS = 5

const route = useRoute()
const router = useRouter()
const session = useSessionStore()

// The organizer keeps the profile it had; this page is the buyer's.
const isOperator = computed(() => canOperate(session.currentUser?.permissions ?? []))

const { status, data: profile, error, isFetching, refetch } = useMyProfileQuery()
const { data: billing } = useMyBillingAccountsQuery({ enabled: () => !isOperator.value })
const showSkeleton = useDelayedFlag(computed(() => status.value === 'pending'))
const { mutateAsync: logout, isPending: isLoggingOut } = useLogoutMutation({
  redirectTo: ROUTE_PATHS.LANDING,
})

// One section open at a time, kept in the address so the checkout can link to one.
const openSection = computed<SectionKey | null>(() => {
  const raw = route.query.seccion
  return typeof raw === 'string' && (SECTION_KEYS as readonly string[]).includes(raw)
    ? (raw as SectionKey)
    : null
})

function setOpen(key: SectionKey, open: boolean) {
  const query = { ...route.query }
  if (open) query.seccion = key
  else delete query.seccion
  void router.replace({ query })
}

const fullName = computed(() =>
  [profile.value?.firstName, profile.value?.lastName].filter(Boolean).join(' ').trim(),
)
const emailVerified = computed(() => session.currentUser?.emailVerified ?? false)
const phoneCount = computed(() => profile.value?.phones.length ?? 0)
const billingCount = computed(() => billing.value?.accounts.length ?? 0)
const plural = (count: number, one: string, many: string) => `${count} ${count === 1 ? one : many}`
</script>

<template>
  <div v-if="isOperator" class="profile-view-organizer">
    <ProfileContent />
  </div>

  <div v-else class="profile">
    <div class="profile__title-row">
      <RouterLink class="profile__back" :to="ROUTE_PATHS.LANDING" aria-label="Volver al inicio">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M15 6l-6 6 6 6" /></svg>
      </RouterLink>
      <h1 class="profile__title">Mi perfil</h1>
    </div>

    <div v-if="showSkeleton" class="profile__skeleton" aria-label="Cargando tu perfil">
      <div class="profile__skeleton-head">
        <TtSkeleton
          width="calc(var(--tt-control-l) + var(--tt-space-3))"
          height="calc(var(--tt-control-l) + var(--tt-space-3))"
          radius="pill"
        />
        <div class="profile__skeleton-lines">
          <TtSkeleton width="60%" height="var(--tt-space-4)" radius="text" />
          <TtSkeleton width="45%" height="var(--tt-space-3)" radius="text" />
        </div>
      </div>
      <TtSkeleton
        v-for="row in SKELETON_ROWS"
        :key="row"
        height="calc(var(--tt-control-l) + var(--tt-space-2))"
        radius="m"
      />
    </div>

    <template v-else-if="status === 'pending'" />

    <ErrorState
      v-else-if="!profile"
      what="tu perfil"
      :kind="problemKind(error)"
      stacked
      :retrying="isFetching"
      @retry="refetch()"
    />

    <template v-else>
      <ProfileHeader :name="fullName" :email="profile.email" :email-verified="emailVerified" />

      <div class="profile__sections">
        <ProfileSection
          id="datos"
          title="Datos personales"
          icon="user"
          :open="openSection === 'datos'"
          @update:open="setOpen('datos', $event)"
        >
          <PersonalDataSection :profile="profile" />
        </ProfileSection>
        <ProfileSection
          id="tels"
          title="Teléfonos"
          icon="phone"
          :meta="plural(phoneCount, 'número', 'números')"
          :open="openSection === 'tels'"
          @update:open="setOpen('tels', $event)"
        >
          <PhonesSection />
        </ProfileSection>
        <ProfileSection
          id="correo"
          title="Correo"
          icon="mail"
          :meta="emailVerified ? 'Verificado' : 'Sin verificar'"
          :meta-tone="emailVerified ? 'ok' : 'warn'"
          :open="openSection === 'correo'"
          @update:open="setOpen('correo', $event)"
        >
          <AccountEmailSection />
        </ProfileSection>
        <ProfileSection
          id="clave"
          title="Contraseña"
          icon="lock"
          :open="openSection === 'clave'"
          @update:open="setOpen('clave', $event)"
        >
          <PasswordSection />
        </ProfileSection>
        <ProfileSection
          id="fact"
          title="Datos de facturación"
          icon="docu"
          :meta="billingCount ? plural(billingCount, 'guardado', 'guardados') : 'Ninguno'"
          :open="openSection === 'fact'"
          @update:open="setOpen('fact', $event)"
        >
          <BillingSection />
        </ProfileSection>
      </div>

      <NButton
        class="profile__logout"
        size="large"
        :loading="isLoggingOut"
        :disabled="isLoggingOut"
        @click="logout()"
      >
        Cerrar sesión
      </NButton>
    </template>
  </div>
</template>

<style scoped src="./styles/profile-view.css"></style>

<style src="./organizer-profile-bridge.css"></style>
