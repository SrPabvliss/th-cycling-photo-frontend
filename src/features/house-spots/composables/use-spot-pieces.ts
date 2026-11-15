import { ref, type Ref } from 'vue'

import {
  PIECE_LOADERS,
  loadMaskUrl,
  type PieceFileKey,
  type IPieceFile,
} from '../pieces/piece-loaders'

// One download per format and visit, shared by every slot; a failed one is not tried again.
const cache = new Map<PieceFileKey, Promise<IPieceFile>>()

/** For tests: forget what was downloaded. */
export function resetPieceCache() {
  cache.clear()
}

export interface ISpotPieces {
  piece: Readonly<Ref<IPieceFile | null>>
  failed: Readonly<Ref<boolean>>
  load(): void
}

export function useSpotPieces(format: PieceFileKey): ISpotPieces {
  const piece = ref<IPieceFile | null>(null)
  const failed = ref(false)

  function load() {
    let pending = cache.get(format)
    if (!pending) {
      pending = Promise.all([PIECE_LOADERS[format](), loadMaskUrl()]).then(([module, maskUrl]) => ({
        ...module.default,
        maskUrl,
      }))
      cache.set(format, pending)
    }
    pending.then(
      (file) => (piece.value = file),
      () => (failed.value = true),
    )
  }

  return { piece, failed, load }
}
