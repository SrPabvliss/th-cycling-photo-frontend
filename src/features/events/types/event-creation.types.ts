import type { ConfigurationItemId, IConfigurationItem } from './configuration-item.types'
import type { IEventConfigurationSelectionRequest } from './requests/event-configuration.request'

export interface IEventCreationSubmitContext {
  items: () => IConfigurationItem[]
  toSelection: () => IEventConfigurationSelectionRequest
  openItem: (id: ConfigurationItemId) => void
  goToConfiguration: () => void
  describeCategories?: (ids: number[]) => string
}

export interface ISavedPayoutMethod {
  id: string
  fingerprint: string
}
