/** API projection from GET /preview/:token/customer?whatsapp=... */
export interface IApiCustomerLookup {
  firstName: string
  lastName: string
  whatsapp: string
  email: string | null
}

export interface ICustomerLookup {
  firstName: string
  lastName: string
  whatsapp: string
  email: string | null
}
