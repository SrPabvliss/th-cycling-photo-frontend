import type {
  IApiOrganizersStats,
  IOrganizersStats,
} from '../types/responses/organizers-stats.response'

export function toOrganizersStats(api: IApiOrganizersStats): IOrganizersStats {
  return {
    active: api.active,
    noQuota: api.noQuota,
    expiring: api.expiring,
    pending: api.pending,
    tabs: {
      all: api.tabs.all,
      active: api.tabs.active,
      noQuota: api.tabs.noQuota,
      expiring: api.tabs.expiring,
      invitations: api.tabs.invitations,
    },
  }
}
