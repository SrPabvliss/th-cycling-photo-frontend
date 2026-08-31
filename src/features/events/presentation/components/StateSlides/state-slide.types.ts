import type { Component } from 'vue'

export interface IStateSlide {
  icons: Component[]
  tone: 'blocked' | 'allowed'
  title: string
  description: string
  items: string[]
}
