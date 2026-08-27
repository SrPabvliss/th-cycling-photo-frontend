<script setup lang="ts">
import { useClipboard } from '@vueuse/core'
import { NButton, NIcon, NModal } from 'naive-ui'
import {
  ChevronForwardOutline,
  CopyOutline,
  LinkOutline,
  MailOutline,
  WarningOutline,
} from '@vicons/ionicons5'

const props = withDefaults(
  defineProps<{
    show?: boolean
    url: string
    commercialName?: string | null
    holderName?: string | null
    holderEmail?: string | null
    resend?: boolean
  }>(),
  { show: true, commercialName: null, holderName: null, holderEmail: null, resend: false },
)

const emit = defineEmits<{
  'update:show': [value: boolean]
}>()

const { copy, copied } = useClipboard({ source: () => props.url })
</script>

<template>
  <NModal
    :show="show"
    @update:show="(v: boolean) => emit('update:show', v)"
    preset="card"
    :title="resend ? 'Enlace reenviado' : 'Contrato emitido'"
    style="width: 520px"
  >
    <template v-if="commercialName" #header-extra>
      {{ commercialName }}<template v-if="holderName"> · {{ holderName }}</template>
    </template>

    <div class="lrm-body">
      <div class="lrm-once">
        <div class="lrm-once__head">
          <NIcon :component="LinkOutline" :size="15" />
          <b>Enlace de aceptación</b>
          <span class="lrm-once__badge">Se muestra una sola vez</span>
        </div>
        <div class="lrm-once__link">
          <code data-test="contract-link">{{ url }}</code>
          <NButton size="small" type="primary" data-test="copy-link" @click="copy()">
            <template #icon><NIcon :component="CopyOutline" /></template>
            {{ copied ? 'Copiado' : 'Copiar' }}
          </NButton>
        </div>
        <span class="lrm-once__note">
          Al cerrar esta ventana el enlace deja de ser visible: se guarda hasheado, así que no hay
          forma de recuperarlo, ni para Titan TV.
        </span>
      </div>

      <div class="lrm-notice lrm-notice--blue">
        <NIcon :component="MailOutline" :size="16" />
        <div>
          <b>Ya se envió por correo{{ holderEmail ? ` a ${holderEmail}` : '' }}.</b>
          <span
            >Cópialo solo si necesitas hacerlo llegar por otra vía, por si el correo no
            aparece.</span
          >
        </div>
      </div>

      <div v-if="resend" class="lrm-notice lrm-notice--amber">
        <NIcon :component="WarningOutline" :size="16" />
        <div>
          <b>El enlace anterior dejó de funcionar.</b>
          <span>Si alguien lo tenía guardado, ya no le sirve.</span>
        </div>
      </div>

      <ul class="lrm-steps">
        <li>
          <NIcon :component="ChevronForwardOutline" :size="13" />El titular abre el enlace, lee los
          términos y acepta.
        </li>
        <li>
          <NIcon :component="ChevronForwardOutline" :size="13" />
          {{ resend ? 'La invitación sigue' : 'Aparecerá' }} en <b>Invitaciones</b> hasta que la
          acepte.
        </li>
        <li>
          <NIcon :component="ChevronForwardOutline" :size="13" />Al aceptar se creará el organizador
          con su cupo.
        </li>
      </ul>
    </div>

    <template #footer>
      <div class="lrm-footer">
        <NButton type="primary" @click="emit('update:show', false)">Entendido, cerrar</NButton>
      </div>
    </template>
  </NModal>
</template>

<style scoped src="./link-result-modal.css" />
