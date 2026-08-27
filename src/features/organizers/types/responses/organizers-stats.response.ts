export interface IApiOrganizersStats {
  active: number
  noQuota: number
  expiring: number
  pending: number
  tabs: {
    all: number
    active: number
    noQuota: number
    expiring: number
    invitations: number
  }
}

export interface IOrganizersStats {
  active: number
  noQuota: number
  expiring: number
  pending: number
  tabs: {
    all: number
    active: number
    noQuota: number
    expiring: number
    invitations: number
  }
}
