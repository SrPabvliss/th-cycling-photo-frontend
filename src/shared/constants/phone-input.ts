export const DEFAULT_COUNTRY_ISO = 'EC'

export const PHONE_PRIORITY_ISOS = ['ec', 'co', 'pe', 'cl', 'ar', 'mx']

export const PHONE_INPUT_OPTIONS = {
  initialCountry: DEFAULT_COUNTRY_ISO.toLowerCase(),
  separateDialCode: true,
  strictMode: true,
  countryOrder: PHONE_PRIORITY_ISOS,
  i18n: { searchPlaceholder: 'Buscar país...' },
}
