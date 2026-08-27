<script setup lang="ts">
import { computed, ref } from 'vue'
import { NCollapse, NCollapseItem, NIcon } from 'naive-ui'
import { CheckmarkCircleOutline, WarningOutline } from '@vicons/ionicons5'

import { useAuth } from '@/features/auth/composables/use-auth'
import { useMyPhonesQuery } from '@/features/account/composables/queries/use-my-phones'
import type { IMyProfile } from '@/features/account/types/responses/my-profile.response'

import ProfileForm from '@/features/account/presentation/components/ProfileForm/ProfileForm.vue'
import PhoneList from '@/features/account/presentation/components/PhoneList/PhoneList.vue'
import EmailSection from '@/features/account/presentation/components/EmailSection/EmailSection.vue'
import PasswordForm from '@/features/account/presentation/components/PasswordForm/PasswordForm.vue'

import ProfileIdentityStrip from '../ProfileIdentityStrip/ProfileIdentityStrip.vue'
import ProfileBlockIcon from '../ProfileBlockIcon/ProfileBlockIcon.vue'
import { useProfileCompleteness } from '../../composables/use-profile-completeness'

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

const expanded = ref<string[]>(['personal-info'])

const personalInfoComplete = computed(
  () =>
    Boolean(props.myProfile.firstName) &&
    Boolean(props.myProfile.lastName) &&
    Boolean(props.myProfile.countryId),
)

const phoneCount = computed(() => phones.value?.length ?? 0)
const phoneCountLabel = computed(() => String(phoneCount.value))
</script>

<template>
  <div class="profile-buyer-mobile">
    <ProfileIdentityStrip
      :name="displayName"
      :email="currentUser?.email ?? myProfile.email"
      :email-verified="currentUser?.emailVerified ?? false"
      :pending="pendingItems"
      compact
    />

    <NCollapse v-model:expanded-names="expanded" class="profile-buyer-mobile__card">
      <NCollapseItem name="personal-info">
        <template #header>
          <span class="profile-buyer-mobile__row-head">
            <ProfileBlockIcon icon="user" />
            <b>Datos personales</b>
          </span>
        </template>
        <template v-if="!personalInfoComplete" #header-extra>
          <span class="profile-buyer-mobile__meta is-warn">
            Incompleto
            <NIcon :size="12" :component="WarningOutline" />
          </span>
        </template>
        <ProfileForm :profile="myProfile" />
      </NCollapseItem>

      <NCollapseItem name="phones">
        <template #header>
          <span class="profile-buyer-mobile__row-head">
            <ProfileBlockIcon icon="phone" />
            <b>Teléfonos</b>
          </span>
        </template>
        <template #header-extra>
          <span class="profile-buyer-mobile__meta" :class="{ 'is-warn': phoneCount === 0 }">
            {{ phoneCountLabel }}
            <NIcon v-if="phoneCount === 0" :size="12" :component="WarningOutline" />
          </span>
        </template>
        <PhoneList />
      </NCollapseItem>

      <NCollapseItem name="email">
        <template #header>
          <span class="profile-buyer-mobile__row-head">
            <ProfileBlockIcon icon="mail" />
            <b>Correo</b>
          </span>
        </template>
        <template #header-extra>
          <span
            class="profile-buyer-mobile__meta"
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
          <span class="profile-buyer-mobile__row-head">
            <ProfileBlockIcon icon="lock" />
            <b>Contraseña</b>
          </span>
        </template>
        <PasswordForm />
      </NCollapseItem>
    </NCollapse>
  </div>
</template>

<style scoped src="./profile-buyer-mobile.css"></style>
