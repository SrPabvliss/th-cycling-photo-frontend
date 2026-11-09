<script setup lang="ts">
import { computed } from 'vue'
import { NTag } from 'naive-ui'

import { useAuth } from '@/features/auth/composables/use-auth'
import { useMyPhonesQuery } from '@/features/account/composables/queries/use-my-phones'
import type { IMyProfile } from '@/features/account/types/responses/my-profile.response'

import ProfileForm from '@/features/account/presentation/components/ProfileForm/ProfileForm.vue'
import PhoneList from '@/features/account/presentation/components/PhoneList/PhoneList.vue'
import EmailSection from '@/features/account/presentation/components/EmailSection/EmailSection.vue'
import PasswordForm from '@/features/account/presentation/components/PasswordForm/PasswordForm.vue'

import ProfileIdentityStrip from '../ProfileIdentityStrip/ProfileIdentityStrip.vue'
import ProfileBlockCard from '../ProfileBlockCard/ProfileBlockCard.vue'
import {
  useProfileCompleteness,
  type IProfilePendingItem,
  type ProfilePendingSection,
} from '../../composables/use-profile-completeness'
import { useProfileBlockNavigation } from '../../composables/use-profile-block-navigation'

const props = defineProps<{
  myProfile: IMyProfile
}>()

const { currentUser } = useAuth()
const { data: phones } = useMyPhonesQuery()

const myProfileRef = computed(() => props.myProfile)

const { pendingItems } = useProfileCompleteness({
  currentUser,
  myProfile: myProfileRef,
  tenantProfile: computed(() => undefined),
  payoutMethods: computed(() => undefined),
  isOperator: computed(() => false),
})

const displayName = computed(() => {
  const parts = [props.myProfile.firstName, props.myProfile.lastName].filter(Boolean)
  return parts.length > 0 ? parts.join(' ') : props.myProfile.email
})

const phoneCount = computed(() => phones.value?.length ?? 0)

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
  <div class="profile-buyer-desktop">
    <ProfileIdentityStrip
      :name="displayName"
      :email="currentUser?.email ?? myProfile.email"
      :email-verified="currentUser?.emailVerified ?? false"
      :pending="pendingItems"
      :reachable-sections="registeredSections"
      @select="onSelectPending"
    />

    <div class="profile-buyer-desktop__grid">
      <div class="profile-buyer-desktop__col">
        <ProfileBlockCard
          :ref="bindSection('personal-info')"
          icon="user"
          title="Datos personales"
          subtitle="Nombre, ubicación y fecha de nacimiento."
          :highlighted="highlighted === 'personal-info'"
        >
          <ProfileForm :profile="myProfile" :columns="3" />
        </ProfileBlockCard>

        <ProfileBlockCard
          :ref="bindSection('phones')"
          icon="phone"
          title="Teléfonos"
          subtitle="Para que TitanTV te contacte si hay algo con tu pedido."
          :highlighted="highlighted === 'phones'"
        >
          <template #aside>
            <span class="profile-buyer-desktop__count">{{ phoneCount }}</span>
          </template>
          <PhoneList />
        </ProfileBlockCard>
      </div>

      <div class="profile-buyer-desktop__col">
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
    </div>
  </div>
</template>

<style scoped src="./profile-buyer-desktop.css"></style>
