import type { IApiBuyersStats } from '../types/responses/buyers-stats.response'

export function toBuyersStats(api: IApiBuyersStats): IApiBuyersStats {
  return {
    totalBuyers: api.totalBuyers,
    boughtCount: api.boughtCount,
    boughtPercent: api.boughtPercent,
    recurrentCount: api.recurrentCount,
    newLast30Days: api.newLast30Days,
    averageTicket: api.averageTicket,
    tabs: { ...api.tabs },
  }
}
