<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { LEGAL_PATHS } from '@/features/legal/routes'
import { NSwitch, useMessage } from 'naive-ui'

import { useSessionStore } from '@/core/auth/stores/session.store'
import { useFormProblem } from '@/shared/composables/use-form-problem'
import FormAlert from '@/shared/components/form/FormAlert/FormAlert.vue'
import { generalProblem } from '@/shared/utils/form-problem'
import { useSetCommunityEmails } from '../../../composables/mutations/use-set-community-emails'

const session = useSessionStore()
const message = useMessage()
const setCommunityEmails = useSetCommunityEmails({ silent: true })
const problem = useFormProblem()

const stored = computed(() => session.currentUser?.communityEmails ?? false)
// The switch is the consent of the session. What was saved shows at once, even if reading the
// session again fails.
const enabled = ref(stored.value)
watch(stored, (value) => {
  enabled.value = value
})

// The api says who can have them (not minors). One who already has them on can still turn them off.
const isShown = computed(
  () => (session.currentUser?.communityEmailsAvailable ?? false) || enabled.value,
)

async function toggle(next: boolean) {
  if (setCommunityEmails.isPending.value) return
  problem.value = null
  try {
    await setCommunityEmails.mutateAsync(next)
    enabled.value = next
    message.success(
      next
        ? 'Activamos los correos de fechas especiales.'
        : 'Desactivamos los correos de fechas especiales.',
    )
  } catch (error) {
    problem.value = generalProblem(error)
  }
}
</script>

<template>
  <div v-if="isShown" class="community-emails">
    <div class="community-emails__row">
      <div class="community-emails__words">
        <span id="community-emails-label" class="community-emails__label">
          Correos de fechas especiales
        </span>
        <span id="community-emails-help" class="community-emails__help">
          Celebremos juntos tus días importantes. Lo desactivas cuando quieras.
          <RouterLink :to="`${LEGAL_PATHS.PRIVACY}#fechas-especiales`" target="_blank">
            Cómo usamos tus datos
          </RouterLink>
        </span>
      </div>
      <NSwitch
        data-test="community-emails-switch"
        aria-labelledby="community-emails-label"
        aria-describedby="community-emails-help"
        :value="enabled"
        :loading="setCommunityEmails.isPending.value"
        :disabled="setCommunityEmails.isPending.value"
        @update:value="toggle"
      />
    </div>

    <FormAlert
      v-if="problem"
      :tone="problem.tone ?? 'bad'"
      :title="problem.title"
      :text="problem.text"
    />
  </div>
</template>

<style scoped>
.community-emails__help a {
  color: var(--tt-primary);
}

.community-emails {
  display: flex;
  flex-direction: column;
  gap: var(--tt-space-3);
  font-family: var(--tt-font-sans);
}

.community-emails__row {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: var(--tt-space-4);
}

.community-emails__words {
  display: flex;
  flex-direction: column;
  gap: calc(var(--tt-space-1) / 2);
}

.community-emails__label {
  color: var(--tt-ink);
  font-size: var(--tt-type-title-size);
  line-height: var(--tt-type-title-line);
  font-weight: var(--tt-type-title-weight);
}

.community-emails__help {
  color: var(--tt-ink-muted);
  font-size: var(--tt-type-body-s-size);
  line-height: var(--tt-type-body-s-line);
}
</style>
