<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { NAvatar, NButton, NIcon, NInput, NSpin } from 'naive-ui'
import { PersonAddOutline, CloseCircleOutline, SearchOutline } from '@vicons/ionicons5'
import { refDebounced } from '@vueuse/core'

import CollapsibleCard from '@/shared/components/CollapsibleCard.vue'
import { formatRelativeTime } from '@/shared/utils/date.utils'
import { useEventOperatorsQuery } from '../../../composables/queries/use-event-operators'
import { useOperatorUsersQuery } from '../../../composables/queries/use-users-list'
import { useAssignOperator } from '../../../composables/mutations/use-assign-operator'
import { useUnassignOperator } from '../../../composables/mutations/use-unassign-operator'

const props = defineProps<{
  eventId: string
}>()

const showSelector = ref(false)
const searchInput = ref('')
const searchDebounced = refDebounced(searchInput, 300)

const { data: operators, isLoading } = useEventOperatorsQuery(computed(() => props.eventId))

const { data: candidates, isFetching: isSearching } = useOperatorUsersQuery(
  searchDebounced,
  showSelector,
)

const { mutateAsync: assign, isPending: isAssigning } = useAssignOperator()
const { mutateAsync: unassign, isPending: isUnassigning } = useUnassignOperator()

const filteredCandidates = computed(() => {
  if (!candidates.value) return []
  const assignedIds = new Set(operators.value?.map((o) => o.userId) ?? [])
  return candidates.value.filter((u) => !assignedIds.has(u.id))
})

watch(showSelector, (show) => {
  if (!show) searchInput.value = ''
})

async function handleAssign(userId: string) {
  await assign({ eventId: props.eventId, userId })
  showSelector.value = false
}

async function handleUnassign(userId: string) {
  await unassign({ eventId: props.eventId, userId })
}

function getInitials(firstName: string | null, lastName: string | null, email: string): string {
  if (firstName) {
    return ((firstName.charAt(0) ?? '') + (lastName?.charAt(0) ?? '')).toUpperCase()
  }
  return email.charAt(0).toUpperCase()
}

function getDisplayName(firstName: string | null, lastName: string | null): string | null {
  if (firstName) return [firstName, lastName].filter(Boolean).join(' ')
  return null
}
</script>

<template>
  <CollapsibleCard
    title="Operador Asignado"
    subtitle="Persona encargada de clasificación y retoque"
  >
    <NSpin :show="isLoading" size="small">
      <div class="op-card">
        <!-- Assigned operators -->
        <div v-if="operators && operators.length > 0" class="op-card__list">
          <div v-for="op in operators" :key="op.id" class="op-card__user">
            <NAvatar :size="40" round class="op-card__avatar">
              {{ getInitials(op.firstName, op.lastName, op.email) }}
            </NAvatar>
            <div class="op-card__details">
              <span class="op-card__name">
                {{ getDisplayName(op.firstName, op.lastName) ?? op.email }}
              </span>
              <span v-if="getDisplayName(op.firstName, op.lastName)" class="op-card__email">
                {{ op.email }}
              </span>
              <span class="op-card__since"> Asignado {{ formatRelativeTime(op.assignedAt) }} </span>
            </div>
            <NButton
              text
              type="error"
              size="tiny"
              :loading="isUnassigning"
              title="Desasignar"
              @click="handleUnassign(op.userId)"
            >
              <template #icon><NIcon :component="CloseCircleOutline" :size="16" /></template>
            </NButton>
          </div>
        </div>

        <!-- Empty state: dashed silhouette -->
        <div v-else class="op-card__empty">
          <div class="op-card__empty-avatar" />
          <div class="op-card__empty-lines">
            <div class="op-card__empty-line op-card__empty-line--long" />
            <div class="op-card__empty-line op-card__empty-line--short" />
          </div>
        </div>

        <!-- Search & select -->
        <div v-if="showSelector" class="op-card__selector">
          <NInput
            v-model:value="searchInput"
            placeholder="Buscar operador por nombre o email..."
            size="small"
            clearable
          >
            <template #prefix>
              <NIcon :component="SearchOutline" />
            </template>
          </NInput>

          <NSpin v-if="isSearching" size="small" class="op-card__searching" />

          <div v-else-if="filteredCandidates.length > 0" class="op-card__candidates">
            <div
              v-for="user in filteredCandidates"
              :key="user.id"
              class="op-card__candidate"
              @click="handleAssign(user.id)"
            >
              <NAvatar :size="32" round class="op-card__avatar">
                {{ getInitials(user.firstName, user.lastName, user.email) }}
              </NAvatar>
              <div class="op-card__details">
                <span class="op-card__name">
                  {{ getDisplayName(user.firstName, user.lastName) ?? user.email }}
                </span>
                <span v-if="getDisplayName(user.firstName, user.lastName)" class="op-card__email">
                  {{ user.email }}
                </span>
              </div>
            </div>
          </div>

          <div v-else class="op-card__no-results">No se encontraron operadores</div>

          <NButton size="small" block @click="showSelector = false">Cancelar</NButton>
        </div>

        <NButton
          v-else
          size="small"
          dashed
          block
          :loading="isAssigning"
          @click="showSelector = true"
        >
          <template #icon><NIcon :component="PersonAddOutline" /></template>
          Asignar operador
        </NButton>
      </div>
    </NSpin>
  </CollapsibleCard>
</template>

<style scoped src="./event-operator-card.css" />
