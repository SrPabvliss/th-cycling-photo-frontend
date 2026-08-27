import type { Ref } from 'vue'

import type { IEventCreationSubmitContext } from '../types/event-creation.types'
import type { IEventFormExtra } from '../types/event-form.types'
import type { IConfirmationResourceState } from '../types/event-wizard.types'

type UploadAssets = (input: {
  eventId: string
  assetFiles: NonNullable<IEventFormExtra['assetFiles']>
}) => Promise<unknown>
type AssignCategories = (input: { eventId: string; categoryIds: number[] }) => Promise<unknown>

export async function uploadCoverResource(params: {
  extra: IEventFormExtra
  eventId: string
  uploadAssets: UploadAssets
  coverImage: Ref<IConfirmationResourceState>
  creatingStep: Ref<number | null>
}): Promise<void> {
  const { extra, eventId, uploadAssets, coverImage, creatingStep } = params
  const assetFiles = extra.assetFiles
  const cover = assetFiles?.get('cover_image')
  if (!assetFiles || !cover) {
    coverImage.value = { status: 'skipped' }
    return
  }

  creatingStep.value = 1
  try {
    await uploadAssets({ eventId, assetFiles })
    coverImage.value = { status: 'ok', detail: cover.name }
  } catch {
    coverImage.value = { status: 'bad' }
  }
}

export async function createCategoriesResource(params: {
  extra: IEventFormExtra
  eventId: string
  context: IEventCreationSubmitContext
  assignCategories: AssignCategories
  categories: Ref<IConfirmationResourceState>
  creatingStep: Ref<number | null>
}): Promise<void> {
  const { extra, eventId, context, assignCategories, categories, creatingStep } = params
  const categoryIds = extra.categoryIds ?? []
  if (categoryIds.length === 0) {
    categories.value = { status: 'skipped' }
    return
  }

  creatingStep.value = 2
  try {
    await assignCategories({ eventId, categoryIds })
    const described = context.describeCategories?.(categoryIds) ?? ''
    categories.value = {
      status: 'ok',
      detail: described === '' ? `${categoryIds.length} categorías` : described,
    }
  } catch {
    categories.value = { status: 'bad' }
  }
}
