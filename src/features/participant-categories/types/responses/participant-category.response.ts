/** API projection from GET /participant-categories?eventTypeId=X */
export interface IApiParticipantCategory {
  id: number
  name: string
}

/** Frontend domain type */
export interface IParticipantCategory {
  id: number
  name: string
}
