import allCountries from 'intl-tel-input/data'
import { computed, ref, type ComputedRef, type Ref } from 'vue'

/** "+593" for "EC", from the phone input's own country data. Null when not known. */
export function dialCodeOf(iso: string | null | undefined): string | null {
  if (!iso) return null
  const country = allCountries.find((each) => each.iso2 === iso.toLowerCase())
  return country ? `+${country.dialCode}` : null
}

export interface IPhonePrefix {
  /** The code the number goes with. */
  prefix: ComputedRef<string>
  /** The country the phone input should show while it follows residence; null once picked. */
  following: ComputedRef<string | null>
  setByUser(value: string): void
}

/**
 * The phone code follows the country of residence ("Dónde te encontramos") until the buyer picks
 * another one by hand: someone living in Ecuador may have a Colombian number.
 */
export function usePhonePrefix(country: Ref<string | null>): IPhonePrefix {
  const picked = ref<string | null>(null)

  return {
    prefix: computed(() => picked.value ?? dialCodeOf(country.value) ?? ''),
    following: computed(() => (picked.value ? null : country.value)),
    setByUser: (value: string) => {
      picked.value = value
    },
  }
}
