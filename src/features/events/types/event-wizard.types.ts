export type EventWizardRole = 'organizer' | 'titan'

export interface IWizardStep {
  id: string
  label: string
  hint: string
}

export interface IConfirmationResourceState {
  status: 'ok' | 'bad' | 'skipped'
  detail?: string
}
