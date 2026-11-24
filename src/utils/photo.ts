import type { PhotoShape } from '../types/card'

export interface ProcessedPhoto {
  dataUrl: string
  origWidth: number
  origHeight: number
}

/**
 * 업로드된 프로필 사진을 명함 인쇄용 고해상도 PNG(투명 배경 크롭)로 변환합니다.
 * - rounded: 3:4 비율 (600x800px), 둥근 모서리
 * - circle: 1:1 비율 (640x640px), 원형
 */
export function processProfilePhoto(
  file: File,
  shape: PhotoShape
): Promise<ProcessedPhoto> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('Failed to read image file'))
    reader.onload = () => {
      const img = new Image()
      img.onerror = () => reject(new Error('Invalid image file'))
      img.onload = () => {
        const targetW = shape === 'circle' ? 640 : 600
        const targetH = shape === 'circle' ? 640 : 800
        const targetAspect = targetW / targetH

        const canvas = document.createElement('canvas')
        canvas.width = targetW
        canvas.height = targetH
        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context unavailable'))
          return
        }

        ctx.clearRect(0, 0, targetW, targetH)
        ctx.save()

        if (shape === 'circle') {
          ctx.beginPath()
          ctx.arc(targetW / 2, targetH / 2, targetW / 2, 0, Math.PI * 2)
          ctx.closePath()
          ctx.clip()
        } else {
          const r = 56
          ctx.beginPath()
          ctx.moveTo(r, 0)
          ctx.lineTo(targetW - r, 0)
          ctx.quadraticCurveTo(targetW, 0, targetW, r)
          ctx.lineTo(targetW, targetH - r)
          ctx.quadraticCurveTo(targetW, targetH, targetW - r, targetH)
          ctx.lineTo(r, targetH)
          ctx.quadraticCurveTo(0, targetH, 0, targetH - r)
          ctx.lineTo(0, r)
          ctx.quadraticCurveTo(0, 0, r, 0)
          ctx.closePath()
          ctx.clip()
        }

        // Center-crop (object-fit: cover)
        const srcAspect = img.width / img.height
        let sx = 0
        let sy = 0
        let sw = img.width
        let sh = img.height
        if (srcAspect > targetAspect) {
          sw = img.height * targetAspect
          sx = (img.width - sw) / 2
        } else {
          sh = img.width / targetAspect
          sy = (img.height - sh) / 2
        }

        ctx.drawImage(img, sx, sy, sw, sh, 0, 0, targetW, targetH)
        ctx.restore()

        resolve({
          dataUrl: canvas.toDataURL('image/png'),
          origWidth: img.width,
          origHeight: img.height,
        })
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  })
}
