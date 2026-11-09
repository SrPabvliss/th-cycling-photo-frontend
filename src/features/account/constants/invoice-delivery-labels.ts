export const DELIVERY_OUTCOME_LABELS: Record<string, string> = {
  accepted: 'Enviado',
  rejected: 'Rechazado por el correo',
  failed: 'No se pudo enviar',
}

export const DELIVERY_KIND_LABELS: Record<string, string> = {
  automatic: 'Envío automático',
  resend: 'Reenvío',
}

export const DELIVERY_REQUESTER_LABELS: Record<string, string> = {
  operator: 'Admin',
  buyer: 'Comprador',
}

export function labelOf(labels: Record<string, string>, value: string): string {
  return labels[value] ?? value
}
