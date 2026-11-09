import { useMutation } from '@tanstack/vue-query'

import { useConfirmWatermark } from './use-confirm-watermark'
import { usePresignAndUploadWatermark } from './use-presign-and-upload-watermark'

export function useUploadTenantWatermark() {
  const { mutateAsync: presignAndUpload } = usePresignAndUploadWatermark()
  const { mutateAsync: confirmWatermark } = useConfirmWatermark()

  return useMutation({
    mutationFn: async (file: File) => {
      const storageKey = await presignAndUpload(file)
      await confirmWatermark(storageKey)
    },
  })
}
