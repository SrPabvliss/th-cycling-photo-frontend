import { describe, expect, it, vi, beforeEach, afterEach } from 'vitest'

import { validateWatermarkFile } from './watermark-file.utils'

const PNG_SIGNATURE = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]

function buildFile(bytes: number[], size?: number): File {
  const padding = size ? new Uint8Array(Math.max(0, size - bytes.length)) : new Uint8Array(0)
  return new File([new Uint8Array(bytes), padding], 'logo.png', { type: 'image/png' })
}

function buildPng(size?: number): File {
  return buildFile(PNG_SIGNATURE, size)
}

function stubDecodedImage(width: number, height = width): void {
  vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:watermark')
  vi.spyOn(window.URL, 'revokeObjectURL').mockImplementation(() => {})

  Object.defineProperty(window.Image.prototype, 'src', {
    configurable: true,
    set(this: HTMLImageElement) {
      Object.defineProperty(this, 'width', { configurable: true, value: width })
      Object.defineProperty(this, 'height', { configurable: true, value: height })
      setTimeout(() => this.onload?.(new Event('load')), 0)
    },
  })
}

function stubCanvasAlpha(alpha: number): void {
  const pixels = new Uint8ClampedArray(
    Array.from({ length: 16 }, (_, index) => (index % 4 === 3 ? alpha : 120)),
  )

  vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
    drawImage: () => {},
    getImageData: () => ({ data: pixels }),
  } as unknown as CanvasRenderingContext2D)
}

describe('validateWatermarkFile', () => {
  beforeEach(() => {
    stubCanvasAlpha(0)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('rejects a file that is not a real PNG', async () => {
    const jpegRenamed = buildFile([0xff, 0xd8, 0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46])

    await expect(validateWatermarkFile(jpegRenamed)).resolves.toMatch(/no es un PNG real/)
  })

  it('rejects a PNG heavier than the limit', async () => {
    const heavy = buildPng(3 * 1024 * 1024)

    await expect(validateWatermarkFile(heavy)).resolves.toMatch(/máximo es 2 MB/)
  })

  it('rejects an image narrower than the tile it is drawn at', async () => {
    stubDecodedImage(120)

    await expect(validateWatermarkFile(buildPng())).resolves.toMatch(/borrosa/)
  })

  it('rejects an image wider than the limit', async () => {
    stubDecodedImage(5000)

    await expect(validateWatermarkFile(buildPng())).resolves.toMatch(/máximo es 4000 px/)
  })

  it('rejects a fully opaque PNG that would cover the photo', async () => {
    stubDecodedImage(800)
    stubCanvasAlpha(255)

    await expect(validateWatermarkFile(buildPng())).resolves.toMatch(/fondo transparente/)
  })

  it('accepts a transparent PNG within the limits', async () => {
    stubDecodedImage(800)

    await expect(validateWatermarkFile(buildPng())).resolves.toBeNull()
  })
})
