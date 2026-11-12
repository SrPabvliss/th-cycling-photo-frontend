import type { GlobalThemeOverrides } from 'naive-ui'

import tokens from './awana-tokens.json'

export type ColorScheme = 'light' | 'dark'

const { radius, size, fontFamily, typeStyles } = tokens

/**
 * Naive theme of the client area, read from the awana tokens. Naive derives hover, pressed and
 * translucent colors by computing on the values it gets, so it needs the literals from the JSON
 * rather than the CSS variables.
 */
export function buildClientTheme(scheme: ColorScheme): GlobalThemeOverrides {
  const colors = tokens.colors[scheme]

  return {
    common: {
      primaryColor: colors.primary,
      primaryColorHover: colors.primaryHover,
      primaryColorPressed: colors.primaryHover,
      primaryColorSuppl: colors.primary,

      infoColor: colors.primary,
      infoColorHover: colors.primaryHover,
      infoColorPressed: colors.primaryHover,

      successColor: colors.successInk,
      successColorHover: colors.successInk,
      successColorPressed: colors.successInk,
      successColorSuppl: colors.successInk,

      warningColor: colors.warningInk,
      warningColorHover: colors.warningInk,
      warningColorPressed: colors.warningInk,
      warningColorSuppl: colors.warningInk,

      errorColor: colors.dangerFill,
      errorColorSuppl: colors.dangerFill,
      errorColorHover: colors.dangerFillHover,
      errorColorPressed: colors.dangerFillHover,

      textColorBase: colors.ink,
      textColor1: colors.ink,
      textColor2: colors.ink,
      textColor3: colors.inkMuted,
      placeholderColor: colors.inkMuted,

      bodyColor: colors.surface,
      cardColor: colors.surfaceRaised,
      modalColor: colors.surfaceRaised,
      popoverColor: colors.surfaceRaised,
      tableColor: colors.surfaceRaised,
      inputColor: colors.surfaceRaised,
      actionColor: colors.surfaceSunken,
      hoverColor: colors.surfaceSunken,
      tableHeaderColor: colors.surfaceSunken,

      borderColor: colors.line,
      dividerColor: colors.lineSubtle,

      borderRadius: radius.radiusM,
      borderRadiusSmall: radius.radiusS,

      fontFamily: fontFamily.sans,
      fontSize: typeStyles.body.fontSize,
      fontSizeMedium: typeStyles.body.fontSize,

      heightSmall: size.controlS,
      heightMedium: size.controlM,
      heightLarge: size.controlL,
    },

    Button: {
      textColorPrimary: colors.onPrimary,
      textColorHoverPrimary: colors.onPrimary,
      textColorPressedPrimary: colors.onPrimary,
      textColorFocusPrimary: colors.onPrimary,

      textColorError: colors.onDangerFill,
      textColorHoverError: colors.onDangerFill,
      textColorPressedError: colors.onDangerFill,
      textColorFocusError: colors.onDangerFill,

      borderRadiusSmall: radius.radiusM,
      borderRadiusMedium: radius.radiusM,
      borderRadiusLarge: radius.radiusM,

      fontWeightStrong: String(typeStyles.title.fontWeight),
    },

    Card: {
      borderRadius: radius.radiusL,
      borderColor: colors.line,
    },

    Dialog: {
      borderRadius: radius.radiusL,
    },

    Input: {
      borderRadius: radius.radiusM,
    },

    Tag: {
      borderRadius: radius.radiusPill,
    },

    Drawer: {
      color: colors.surfaceRaised,
    },

    Skeleton: {
      color: colors.primarySoft,
    },
  }
}
