import { ref, type MaybeRefOrGetter, toValue } from 'vue'

import type { EventAssetType } from '../types/asset-type'
import type { IEventAsset } from '../types/responses/event-asset.response'

export interface IFocalPoint {
  focalX: number
  focalY: number
}

const CENTRE: IFocalPoint = { focalX: 0.5, focalY: 0.5 }

export function useLocalAssetPreviews(
  existingAssets?: MaybeRefOrGetter<IEventAsset[] | undefined>,
) {
  const pendingFiles = ref<Map<EventAssetType, File>>(new Map())
  const localPreviews = ref<Map<EventAssetType, string>>(new Map())
  const removedTypes = ref<Set<EventAssetType>>(new Set())
  const focalPoints = ref<Map<EventAssetType, IFocalPoint>>(new Map())

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
    focalPoints.value.set(assetType, { ...CENTRE })
  }

  function getFocalPoint(assetType: EventAssetType): IFocalPoint {
    const pending = focalPoints.value.get(assetType)
    if (pending) return pending

    const assets = toValue(existingAssets)
    const existing = assets?.find((a) => a.assetType === assetType)
    return existing ? { focalX: existing.focalX, focalY: existing.focalY } : { ...CENTRE }
  }

  function setFocalPoint(assetType: EventAssetType, point: IFocalPoint) {
    focalPoints.value.set(assetType, point)
  }

  function removeFile(assetType: EventAssetType) {
    pendingFiles.value.delete(assetType)
    const preview = localPreviews.value.get(assetType)
    if (preview) URL.revokeObjectURL(preview)
    localPreviews.value.delete(assetType)
    focalPoints.value.delete(assetType)
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

  function getPendingFocalPoints(): Map<EventAssetType, IFocalPoint> | undefined {
    return focalPoints.value.size > 0 ? focalPoints.value : undefined
  }

  return {
    getAssetUrl,
    addFile,
    removeFile,
    getFocalPoint,
    setFocalPoint,
    getPendingFiles,
    getPendingFocalPoints,
    getPendingRemovals,
  }
}
