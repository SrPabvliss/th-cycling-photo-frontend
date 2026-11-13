import { ref, type Ref } from 'vue'

import { BANNER_LOADERS, type IBannerFile } from '../banners/banner-loaders'
import type { AdFormat } from '../ads-config'

// One download per format and visit, shared by every slot; a failed one is not tried again.
const cache = new Map<AdFormat, Promise<IBannerFile>>()

/** For tests: forget what was downloaded. */
export function resetBannerCache() {
  cache.clear()
}

export interface IBannerFormat {
  banner: Readonly<Ref<IBannerFile | null>>
  failed: Readonly<Ref<boolean>>
  load(): void
}

export function useBannerFormat(format: AdFormat): IBannerFormat {
  const banner = ref<IBannerFile | null>(null)
  const failed = ref(false)

  function load() {
    let pending = cache.get(format)
    if (!pending) {
      pending = BANNER_LOADERS[format]().then((module) => module.default)
      cache.set(format, pending)
    }
    pending.then(
      (file) => (banner.value = file),
      () => (failed.value = true),
    )
  }

  return { banner, failed, load }
}
