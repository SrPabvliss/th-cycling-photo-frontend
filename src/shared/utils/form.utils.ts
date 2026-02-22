import type { AnyFieldApi } from '@tanstack/vue-form'

/**
 * Bridge TanStack Form error format (unknown[]) to Naive UI NFormItem feedback (string | undefined).
 * TanStack Form stores field errors as unknown[] — this flattens and joins them
 * into a single string suitable for NFormItem's :feedback prop.
 */
export function getFieldErrors(errors: unknown[]): string | undefined {
  const messages = errors.filter(Boolean).flat()
  return messages.length > 0 ? messages.join(', ') : undefined
}

/**
 * Returns NFormItem props for validation display.
 * Use with v-bind: `<NFormItem v-bind="fieldStatus(field)">`
 */
export function fieldStatus(field: AnyFieldApi) {
  const { isTouched, isValid, errors } = field.state.meta
  return {
    validationStatus: isTouched && !isValid ? ('error' as const) : undefined,
    feedback: isTouched ? getFieldErrors(errors) : undefined,
  }
}

/**
 * Returns value + event bindings for Naive UI input components.
 * Use with v-bind: `<NInput v-bind="fieldInput(field)">`
 */
export function fieldInput(field: AnyFieldApi) {
  return {
    value: field.state.value,
    'onUpdate:value': field.handleChange,
    onBlur: field.handleBlur,
  }
}
