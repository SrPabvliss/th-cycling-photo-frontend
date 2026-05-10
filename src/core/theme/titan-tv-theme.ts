import type { GlobalThemeOverrides } from 'naive-ui'

export const PRIMARY = '#2080F0'
export const PRIMARY_DARK = '#1668CC'
export const PRIMARY_LIGHT = '#4DA0F5'
export const NEUTRAL_DARK = '#1A1F2C'
export const SIDEBAR_ACCENT = '#141821'
export const NEUTRAL_MID = '#808080'
export const NEUTRAL_LIGHT = '#E6E7EB'
export const BACKGROUND = '#F6F4EF'
export const SURFACE = '#FFFFFF'
export const SUCCESS = '#18A058'
export const WARNING = '#D99E0B'
export const ERROR = '#D03050'

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

    borderRadius: '10px',
    borderRadiusSmall: '6px',

    fontFamily:
      'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
    fontSize: '14px',
  },

  Button: {
    fontWeightStrong: '600',
    heightMedium: '38px',
    paddingMedium: '0 20px',
    borderRadiusMedium: '10px',
  },

  Card: {
    borderRadius: '14px',
    paddingMedium: '16px',
    borderColor: NEUTRAL_LIGHT,
    boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    titleFontWeight: '600',
    titleFontSizeMedium: '15px',
    titleTextColor: '#0A0A0A',
  },

  Tag: {
    borderRadius: '6px',
    heightMedium: '28px',
    heightSmall: '22px',
    fontSizeSmall: '12px',
  },

  Input: {
    heightMedium: '38px',
    borderRadius: '10px',
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
