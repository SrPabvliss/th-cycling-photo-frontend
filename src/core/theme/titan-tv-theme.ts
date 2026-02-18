import type { GlobalThemeOverrides } from 'naive-ui'

export const PRIMARY = '#105080'
export const PRIMARY_DARK = '#005080'
export const PRIMARY_LIGHT = '#406090'
export const NEUTRAL_DARK = '#1A1F2C'
export const SIDEBAR_ACCENT = '#141821'
export const NEUTRAL_MID = '#808080'
export const NEUTRAL_LIGHT = '#C0C0C0'
export const BACKGROUND = '#F5F5F7'
export const SURFACE = '#FFFFFF'
export const SUCCESS = '#22C55E'
export const WARNING = '#F59E0B'
export const ERROR = '#EF4444'

export const titanTvTheme: GlobalThemeOverrides = {
  common: {
    primaryColor: PRIMARY,
    primaryColorHover: PRIMARY_DARK,
    primaryColorPressed: PRIMARY_DARK,
    primaryColorSuppl: PRIMARY_LIGHT,

    successColor: SUCCESS,
    successColorHover: '#16A34A',
    successColorPressed: '#15803D',

    warningColor: WARNING,
    warningColorHover: '#D97706',
    warningColorPressed: '#B45309',

    errorColor: ERROR,
    errorColorHover: '#DC2626',
    errorColorPressed: '#B91C1C',

    infoColor: PRIMARY_LIGHT,
    infoColorHover: PRIMARY,
    infoColorPressed: PRIMARY_DARK,

    textColorBase: NEUTRAL_DARK,
    bodyColor: BACKGROUND,
    cardColor: SURFACE,
    modalColor: SURFACE,
    popoverColor: SURFACE,

    borderColor: NEUTRAL_LIGHT,
    dividerColor: NEUTRAL_LIGHT,

    borderRadius: '8px',
    borderRadiusSmall: '6px',

    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
  },

  Button: {
    fontWeightStrong: '600',
    heightMedium: '38px',
    paddingMedium: '0 20px',
    borderRadiusMedium: '8px',
  },

  Card: {
    borderRadius: '12px',
    paddingMedium: '20px',
    borderColor: NEUTRAL_LIGHT,
  },

  Tag: {
    borderRadius: '6px',
    heightMedium: '28px',
  },

  Input: {
    heightMedium: '38px',
    borderRadius: '8px',
  },

  DataTable: {
    thColor: BACKGROUND,
    thTextColor: NEUTRAL_MID,
    thFontWeight: '600',
    tdColorStriped: '#FAFAFA',
    borderRadius: '8px',
  },

  Breadcrumb: {
    itemTextColor: NEUTRAL_MID,
    itemTextColorActive: NEUTRAL_DARK,
    separatorColor: NEUTRAL_LIGHT,
    fontSize: '14px',
  },

  Menu: {
    itemHeight: '40px',
    borderRadius: '6px',
    fontSize: '14px',
    groupTextColorInverted: '#6B7280',
    itemTextColorInverted: '#9CA3AF',
    itemTextColorHoverInverted: '#FFFFFF',
    itemTextColorActiveInverted: '#FFFFFF',
    itemColorActiveInverted: 'rgba(16, 80, 128, 0.3)',
    itemColorHoverInverted: 'rgba(255, 255, 255, 0.06)',
  },
}
