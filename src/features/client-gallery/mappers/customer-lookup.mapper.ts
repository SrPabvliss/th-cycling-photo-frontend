import type {
  IApiCustomerLookup,
  ICustomerLookup,
} from '../types/responses/customer-lookup.response'

export function toCustomerLookup(api: IApiCustomerLookup): ICustomerLookup {
  return {
    firstName: api.firstName,
    lastName: api.lastName,
    whatsapp: api.whatsapp,
    email: api.email,
  }
}
