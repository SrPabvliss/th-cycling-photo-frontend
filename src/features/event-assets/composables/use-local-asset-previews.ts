import { ref, type MaybeRefOrGetter, toValue } from 'vue'

import type { EventAssetType } from '../types/asset-type'
import type { IEventAsset } from '../types/responses/event-asset.response'

export function useLocalAssetPreviews(
  existingAssets?: MaybeRefOrGetter<IEventAsset[] | undefined>,
) {
  const pendingFiles = ref<Map<EventAssetType, File>>(new Map())
  const localPreviews = ref<Map<EventAssetType, string>>(new Map())
  const removedTypes = ref<Set<EventAssetType>>(new Set())

  function getAssetUrl(assetType: EventAssetType): string | null {
    if (localPreviews.value.has(assetType)) return localPreviews.value.get(assetType)!
    if (removedTypes.value.has(assetType)) return null
    const assets = toValue(existingAssets)
    const existing = assets?.find((a) => a.assetType === assetType)
    return existing?.url ?? null
  }

  function addFile(assetType: EventAssetType, file: File) {
    pendingFiles.value.set(assetType, file)
    removedTypes.value.delete(assetType)
    const oldPreview = localPreviews.value.get(assetType)
    if (oldPreview) URL.revokeObjectURL(oldPreview)
    localPreviews.value.set(assetType, URL.createObjectURL(file))
  }

  function removeFile(assetType: EventAssetType) {
    pendingFiles.value.delete(assetType)
    const preview = localPreviews.value.get(assetType)
    if (preview) URL.revokeObjectURL(preview)
    localPreviews.value.delete(assetType)
    removedTypes.value.add(assetType)
  }

  function getPendingFiles(): Map<EventAssetType, File> | undefined {
    return pendingFiles.value.size > 0 ? pendingFiles.value : undefined
  }

  function getPendingRemovals(): EventAssetType[] {
    const assets = toValue(existingAssets)
    if (!assets) return []
    return Array.from(removedTypes.value).filter((type) => assets.some((a) => a.assetType === type))
  }

  return { getAssetUrl, addFile, removeFile, getPendingFiles, getPendingRemovals }
}
