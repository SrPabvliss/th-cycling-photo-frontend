import { h, type FunctionalComponent } from 'vue'

export interface ICardBrandMark {
  name: string
  Icon: FunctionalComponent
}

const brandSvgProps = (label: string) => ({
  viewBox: '0 0 48 20',
  width: 40,
  height: 18,
  role: 'img' as const,
  'aria-label': label,
})

const wordmarkText = (label: string, fill: string, fontSize: number, italic = false) =>
  h(
    'text',
    {
      x: 24,
      y: 14,
      'text-anchor': 'middle',
      fill,
      'font-size': fontSize,
      'font-weight': 700,
      'font-family': 'Arial, sans-serif',
      'font-style': italic ? 'italic' : 'normal',
    },
    label,
  )

const VisaIcon: FunctionalComponent = () =>
  h('svg', brandSvgProps('Visa'), [
    h('rect', { width: 48, height: 20, rx: 4, fill: '#1A1F71' }),
    wordmarkText('VISA', '#ffffff', 10, true),
  ])

const MastercardIcon: FunctionalComponent = () =>
  h('svg', brandSvgProps('Mastercard'), [
    h('circle', { cx: 19, cy: 10, r: 9, fill: '#EB001B' }),
    h('circle', { cx: 29, cy: 10, r: 9, fill: '#F79E1B', 'fill-opacity': 0.85 }),
  ])

const DinersClubIcon: FunctionalComponent = () =>
  h('svg', brandSvgProps('Diners Club'), [
    h('rect', { width: 48, height: 20, rx: 4, fill: '#0079BE' }),
    wordmarkText('DINERS', '#ffffff', 7),
  ])

const DiscoverIcon: FunctionalComponent = () =>
  h('svg', brandSvgProps('Discover'), [
    h('rect', {
      x: 0.5,
      y: 0.5,
      width: 47,
      height: 19,
      rx: 4,
      fill: '#f5f5f5',
      stroke: '#FF6000',
    }),
    wordmarkText('DISCOVER', '#FF6000', 6.5),
  ])

export const CARD_BRANDS: ICardBrandMark[] = [
  { name: 'Visa', Icon: VisaIcon },
  { name: 'Mastercard', Icon: MastercardIcon },
  { name: 'Diners Club', Icon: DinersClubIcon },
  { name: 'Discover', Icon: DiscoverIcon },
]
