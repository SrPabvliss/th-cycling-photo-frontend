const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
const MAX_FILE_BYTES = 2 * 1024 * 1024
const MIN_WIDTH = 200
const MAX_WIDTH = 4000
const OPAQUE_ALPHA = 250
const ALPHA_SAMPLE_SIZE = 200

export const WATERMARK_RULES = {
  maxFileBytes: MAX_FILE_BYTES,
  minWidth: MIN_WIDTH,
  maxWidth: MAX_WIDTH,
}

function readHeader(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(new Error('read_failed'))
    reader.readAsArrayBuffer(file.slice(0, PNG_SIGNATURE.length))
  })
}

async function hasPngSignature(file: File): Promise<boolean> {
  const header = await readHeader(file)
  return PNG_SIGNATURE.every((byte, index) => header[index] === byte)
}

function loadBitmap(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      URL.revokeObjectURL(url)
      resolve(image)
    }
    image.onerror = () => {
      URL.revokeObjectURL(url)
      reject(new Error('decode_failed'))
    }
    image.src = url
  })
}

function hasTransparentPixels(image: HTMLImageElement): boolean {
  const scale = Math.min(1, ALPHA_SAMPLE_SIZE / Math.max(image.width, image.height))
  const width = Math.max(1, Math.round(image.width * scale))
  const height = Math.max(1, Math.round(image.height * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height

  const context = canvas.getContext('2d')
  if (!context) return true

  context.drawImage(image, 0, 0, width, height)
  const { data } = context.getImageData(0, 0, width, height)

  return data.some((value, index) => index % 4 === 3 && value < OPAQUE_ALPHA)
}

export async function validateWatermarkFile(file: File): Promise<string | null> {
  if (file.size > MAX_FILE_BYTES) {
    return `El archivo pesa ${(file.size / 1024 / 1024).toFixed(1)} MB. El máximo es 2 MB.`
  }

  if (!(await hasPngSignature(file))) {
    return 'El archivo no es un PNG real. Cambiarle la extensión a otro formato no funciona.'
  }

  let image: HTMLImageElement
  try {
    image = await loadBitmap(file)
  } catch {
    return 'No se pudo leer la imagen. Puede estar dañada.'
  }

  if (image.width < MIN_WIDTH) {
    return `La imagen mide ${image.width} px de ancho y se vería borrosa. El mínimo es ${MIN_WIDTH} px.`
  }

  if (image.width > MAX_WIDTH) {
    return `La imagen mide ${image.width} px de ancho. El máximo es ${MAX_WIDTH} px.`
  }

  if (!hasTransparentPixels(image)) {
    return 'El PNG no tiene fondo transparente y taparía las fotos. Exporta el logo con transparencia.'
  }

  return null
}
