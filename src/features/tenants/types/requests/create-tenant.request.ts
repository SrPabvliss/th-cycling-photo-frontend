export interface ICreateTenantRequest {
  name: string
  eventQuota: number
  adminEmail: string
  adminPassword: string
  adminFirstName: string
  adminLastName: string
}
