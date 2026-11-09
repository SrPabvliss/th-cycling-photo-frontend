/** API projection from GET /buyers/stats */
export interface IApiBuyersStats {
  totalBuyers: number
  boughtCount: number
  boughtPercent: number
  recurrentCount: number
  newLast30Days: number
  /** Decimal-formatted, kept as a string end to end */
  averageTicket: string
  tabs: {
    all: number
    bought: number
    never: number
    recurrent: number
  }
}
