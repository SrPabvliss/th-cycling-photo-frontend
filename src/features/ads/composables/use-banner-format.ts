import { ref, type Ref } from 'vue'

import {
  BANNER_LOADERS,
  loadMaskUrl,
  type BannerFileKey,
  type IBannerFile,
} from '../banners/banner-loaders'

// One download per format and visit, shared by every slot; a failed one is not tried again.
const cache = new Map<BannerFileKey, Promise<IBannerFile>>()

/** For tests: forget what was downloaded. */
export function resetBannerCache() {
  cache.clear()
}

export interface IBannerFormat {
  banner: Readonly<Ref<IBannerFile | null>>
  failed: Readonly<Ref<boolean>>
  load(): void
}

export function useBannerFormat(format: BannerFileKey): IBannerFormat {
  const banner = ref<IBannerFile | null>(null)
  const failed = ref(false)

  function load() {
    let pending = cache.get(format)
    if (!pending) {
      pending = Promise.all([BANNER_LOADERS[format](), loadMaskUrl()]).then(
        ([module, maskUrl]) => ({ ...module.default, maskUrl }),
      )
      cache.set(format, pending)
    }
    pending.then(
      (file) => (banner.value = file),
      () => (failed.value = true),
    )
  }

  return { banner, failed, load }
}
