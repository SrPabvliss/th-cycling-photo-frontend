import type { AnyFieldApi } from '@tanstack/vue-form'

/**
 * Bridge TanStack Form error format (unknown[]) to Naive UI NFormItem feedback (string | undefined).
 * TanStack Form stores field errors as unknown[] — this flattens and joins them
 * into a single string suitable for NFormItem's :feedback prop.
 */
export function getFieldErrors(errors: unknown[]): string | undefined {
  const messages = [
    ...new Set(
      errors
        .filter(Boolean)
        .flat()
        .map((e) =>
          typeof e === 'string' ? e : ((e as { message?: string }).message ?? String(e)),
        ),
    ),
  ]
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

/**
 * The message a client form field shows: its first error, once it was touched or the form was
 * sent. Null otherwise.
 */
export function fieldErrorText(field: AnyFieldApi, submitted = false): string | null {
  const { isTouched, errors } = field.state.meta
  if (!isTouched && !submitted) return null
  return getFieldErrors(errors.slice(0, 1)) ?? null
}

/** After sending with errors, the focus goes to the first field marked invalid in `root`. */
export function focusFirstInvalid(root: HTMLElement | null | undefined): void {
  root?.querySelector<HTMLElement>('[aria-invalid="true"]')?.focus()
}
