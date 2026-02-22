import type { Component } from 'vue'

export type StatCardColor = 'blue' | 'green' | 'amber' | 'gray'

export interface IStatCard {
  icon: Component
  color: StatCardColor
  label: string
  value: string | number
  description?: string
}
