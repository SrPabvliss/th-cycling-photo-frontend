import { watch, type Ref } from 'vue'

interface PhoneInputRef {
  instance: { setCountry: (iso2: string) => void } | null | undefined
}

export function useCountryPhoneSync(
  selectedIso: Ref<string | null>,
  phoneInputRef: Ref<PhoneInputRef | null>,
) {
  watch(selectedIso, (iso) => {
    if (!iso) return
    phoneInputRef.value?.instance?.setCountry(iso.toLowerCase())
  })
}
