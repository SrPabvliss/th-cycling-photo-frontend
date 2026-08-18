export interface IPayphoneBoxInstance {
  render: (containerId: string) => void
  destroy?: () => void
}

export type PayphoneBoxConstructor = new (params: Record<string, unknown>) => IPayphoneBoxInstance
