<script setup lang="ts">
import { computed, nextTick, ref } from 'vue'

const LENGTH = 6

const props = defineProps<{
  invalid?: boolean
}>()

const model = defineModel<string>({ required: true })

const emit = defineEmits<{
  complete: [code: string]
}>()

const boxes = ref<HTMLInputElement[]>([])
const digits = computed(() =>
  Array.from({ length: LENGTH }, (_, index) => model.value[index] ?? ''),
)

function focusBox(index: number) {
  void nextTick(() => boxes.value[Math.max(0, Math.min(LENGTH - 1, index))]?.focus())
}

function setCode(code: string) {
  // The model updates through the parent: decide on the value just written, not on the prop.
  const next = code.slice(0, LENGTH)
  model.value = next
  if (next.length === LENGTH) emit('complete', next)
}

/** Focus the first box; the parent calls it to start over after a wrong code. */
function focusFirst() {
  focusBox(0)
}
defineExpose({ focusFirst })

function onInput(event: Event, index: number) {
  const target = event.target as HTMLInputElement
  const digit = target.value.replace(/\D/g, '').slice(-1)
  if (!digit) {
    target.value = digits.value[index] ?? ''
    return
  }
  const chars = digits.value.slice()
  chars[index] = digit
  // Only the run of digits from the start counts: a gap would send a wrong code.
  const code = chars.join('')
  setCode(code)
  target.value = digit
  focusBox(index + 1)
}

function onKeydown(event: KeyboardEvent, index: number) {
  if (event.key === 'Backspace') {
    if (digits.value[index]) {
      event.preventDefault()
      setCode(model.value.slice(0, index) + model.value.slice(index + 1))
      return
    }
    event.preventDefault()
    if (index > 0) {
      setCode(model.value.slice(0, index - 1) + model.value.slice(index))
      focusBox(index - 1)
    }
    return
  }
  if (event.key === 'ArrowLeft') {
    event.preventDefault()
    focusBox(index - 1)
  } else if (event.key === 'ArrowRight') {
    event.preventDefault()
    focusBox(index + 1)
  }
}

// A pasted code fills every box: spaces, dashes and anything else are dropped.
function onPaste(event: ClipboardEvent) {
  event.preventDefault()
  const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '')
  if (!pasted) return
  setCode(pasted)
  focusBox(Math.min(pasted.length, LENGTH - 1))
}
</script>

<template>
  <div class="code-input" :class="{ 'code-input--invalid': props.invalid }">
    <input
      v-for="(digit, index) in digits"
      :key="index"
      ref="boxes"
      class="code-input__box"
      type="text"
      inputmode="numeric"
      maxlength="2"
      :autocomplete="index === 0 ? 'one-time-code' : 'off'"
      :aria-label="`Dígito ${index + 1}`"
      :aria-invalid="props.invalid ? true : undefined"
      :value="digit"
      @input="onInput($event, index)"
      @keydown="onKeydown($event, index)"
      @paste="onPaste"
      @focus="($event.target as HTMLInputElement).select()"
    />
  </div>
</template>

<style scoped>
.code-input {
  display: flex;
  justify-content: center;
  gap: var(--tt-space-2);
}

.code-input__box {
  inline-size: calc(var(--tt-control-m) + var(--tt-space-1) / 2);
  block-size: calc(var(--tt-control-l) + var(--tt-space-1));
  padding: 0;
  border: thin solid var(--tt-line);
  border-radius: var(--tt-radius-m);
  background: var(--tt-surface-raised);
  color: var(--tt-ink);
  text-align: center;
  font-family: var(--tt-type-number-family);
  font-stretch: var(--tt-number-stretch);
  font-size: var(--tt-type-heading-l-size);
  font-weight: var(--tt-type-number-weight);
  outline: none;
}

.code-input__box:focus {
  border-color: var(--tt-primary);
  box-shadow: 0 0 0 var(--tt-space-1) var(--tt-primary-soft);
}

.code-input--invalid .code-input__box {
  border-color: var(--tt-danger-ink);
}
</style>
