import { ref } from 'vue'

export function useFileDropZone(acceptTypes: string, onFile: (file: File) => void) {
  const isDragging = ref(false)
  const fileInput = ref<HTMLInputElement | null>(null)

  function triggerFileInput() {
    fileInput.value?.click()
  }

  function handleFileChange(e: Event) {
    const file = (e.target as HTMLInputElement).files?.[0]
    if (!file) return
    onFile(file)
    if (fileInput.value) fileInput.value.value = ''
  }

  function handleDrop(e: DragEvent) {
    isDragging.value = false
    const file = e.dataTransfer?.files[0]
    if (!file) return
    if (!acceptTypes.split(',').includes(file.type)) return
    onFile(file)
  }

  function handleDragOver(e: DragEvent) {
    e.preventDefault()
    isDragging.value = true
  }

  function handleDragLeave() {
    isDragging.value = false
  }

  return {
    isDragging,
    fileInput,
    triggerFileInput,
    handleFileChange,
    handleDrop,
    handleDragOver,
    handleDragLeave,
  }
}
