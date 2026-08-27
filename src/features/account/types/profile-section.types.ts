import type { Component } from 'vue'

export type ProfileBlockIconName =
  | 'user'
  | 'wa'
  | 'phone'
  | 'mail'
  | 'lock'
  | 'img'
  | 'card'
  | 'doc'

export interface ProfileSectionDef {
  key: string
  label: string
  icon: ProfileBlockIconName
  subtitle?: string
  group: 'account'
  component: Component
}
