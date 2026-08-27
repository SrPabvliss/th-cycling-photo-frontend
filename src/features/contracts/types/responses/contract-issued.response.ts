/** API projection from POST /contracts. `url` carries the one-time token and is never shown again. */
export interface IApiContractIssued {
  id: string
  url: string
}

/** Frontend domain type — no transformation needed, both fields are strings */
export interface IContractIssued {
  id: string
  url: string
}
