import { PDFDocument, rgb } from 'pdf-lib'
import fontkit from '@pdf-lib/fontkit'
import type { CardData, CustomFontState } from '../types/card'
import {
  ASSET_META,
  BLEED_MM,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  buildBackLayout,
  buildFrontLayout,
  type AssetKey,
  type CardSideLayout,
} from './cardLayout'
import { buildQrPayload } from './formatters'
import { generateQrDataUrl } from './qr'

const MM_TO_PT = 72 / 25.4

function mm(val: number): number {
  return val * MM_TO_PT
}

function parseColor(color: string): { r: number; g: number; b: number; a: number } {
  if (color.startsWith('rgba(')) {
    const nums = color
      .slice(5, -1)
      .split(',')
      .map((s) => parseFloat(s.trim()))
    return {
      r: (nums[0] ?? 0) / 255,
      g: (nums[1] ?? 0) / 255,
      b: (nums[2] ?? 0) / 255,
      a: nums[3] ?? 1,
    }
  }
  const hex = color.replace('#', '')
  const r = parseInt(hex.slice(0, 2), 16) / 255
  const g = parseInt(hex.slice(2, 4), 16) / 255
  const b = parseInt(hex.slice(4, 6), 16) / 255
  return { r, g, b, a: 1 }
}

const binaryCache = new Map<string, ArrayBuffer>()

async function fetchBinary(url: string): Promise<ArrayBuffer> {
  const cached = binaryCache.get(url)
  if (cached) return cached
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Failed to fetch asset: ${url}`)
  const buf = await res.arrayBuffer()
  binaryCache.set(url, buf)
  return buf
}

function dataUrlToUint8Array(dataUrl: string): Uint8Array {
  const base64 = dataUrl.split(',')[1]
  const bin = atob(base64)
  const arr = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) {
    arr[i] = bin.charCodeAt(i)
  }
  return arr
}

export interface PdfExportOptions {
  withBleed: boolean
  fileName?: string
  photoDataUrl?: string | null
}

/**
 * 100% 브라우저 내부에서 벡터 텍스트 + 공식 고해상도 SKKU 로고로 인쇄용 PDF 생성
 * - 표준 90x50mm 또는 도련 2mm + 재단선(Crop Marks) 포함 94x54mm
 */
export async function exportCardPdf(
  data: CardData,
  customFonts: CustomFontState,
  options: PdfExportOptions
): Promise<void> {
  const pdfDoc = await PDFDocument.create()
  pdfDoc.registerFontkit(fontkit)
  pdfDoc.setTitle('SKKU Business Card')
  pdfDoc.setCreator('SKKU Business Card Studio (Client-side)')

  const front = buildFrontLayout(data, true)
  const back = buildBackLayout(data, true)
  const sides = back ? [front, back] : [front]

  // Embed full TrueType/OpenType glyph tables (subset: false avoids @pdf-lib/fontkit CJK subsetting corruption)
  const embedFontSafe = async (bytes: ArrayBuffer) => {
    return await pdfDoc.embedFont(bytes, { subset: false })
  }

  const useSerif = data.fontStyle === 'serif'
  const useCustom = data.fontStyle === 'custom' && customFonts.regular !== null

  let needsRegular = false
  let needsMedium = false
  let needsBold = false
  let needsSerifRole = false
  for (const side of sides) {
    for (const op of side.ops) {
      if (op.type !== 'text') continue
      if (op.fontRole === 'serif') needsSerifRole = true
      else if (op.weight === 'bold') needsBold = true
      else if (op.weight === 'medium') needsMedium = true
      else needsRegular = true
    }
  }

  const regBytes =
    needsRegular || useSerif || (!needsMedium && !needsBold)
      ? useCustom
        ? customFonts.regular!.bytes
        : await fetchBinary(
            useSerif ? './fonts/GowunBatang-Regular.ttf' : './fonts/Pretendard-Regular.ttf'
          )
      : null

  const fontRegular = regBytes ? await embedFontSafe(regBytes) : null

  const medBytes = needsMedium
    ? useCustom
      ? (customFonts.bold?.bytes ?? customFonts.regular!.bytes)
      : await fetchBinary(
          useSerif ? './fonts/GowunBatang-Regular.ttf' : './fonts/Pretendard-Medium.ttf'
        )
    : null

  const boldBytes = needsBold
    ? useCustom
      ? (customFonts.bold?.bytes ?? customFonts.regular!.bytes)
      : await fetchBinary(
          useSerif ? './fonts/GowunBatang-Bold.ttf' : './fonts/Pretendard-Bold.ttf'
        )
    : null

  const fontMedium =
    medBytes === regBytes && fontRegular
      ? fontRegular
      : medBytes
      ? await embedFontSafe(medBytes)
      : fontRegular!

  const fontBold =
    boldBytes === regBytes && fontRegular
      ? fontRegular
      : boldBytes
      ? await embedFontSafe(boldBytes)
      : fontRegular!

  const fontSerif = needsSerifRole
    ? useSerif && fontRegular
      ? fontRegular
      : await embedFontSafe(await fetchBinary('./fonts/GowunBatang-Regular.ttf'))
    : fontRegular!

  let fontHanjaFallback: Awaited<ReturnType<typeof embedFontSafe>> | null = null
  const getHanjaFallback = async () => {
    if (fontHanjaFallback) return fontHanjaFallback
    if (!useSerif && !useCustom && boldBytes) {
      fontHanjaFallback = fontBold
    } else {
      fontHanjaFallback = await embedFontSafe(await fetchBinary('./fonts/Pretendard-Bold.ttf'))
    }
    return fontHanjaFallback
  }

  const hasAllGlyphs = (font: typeof fontRegular, text: string): boolean => {
    try {
      const inner = (font as unknown as { embedder?: { font?: { hasGlyphForCodePoint?: (cp: number) => boolean } } }).embedder?.font
      if (!inner?.hasGlyphForCodePoint) return true
      for (const ch of text) {
        if (ch === ' ') continue
        const cp = ch.codePointAt(0)
        if (cp !== undefined && !inner.hasGlyphForCodePoint(cp)) return false
      }
      return true
    } catch {
      return true
    }
  }

  // Collect and embed required PNG assets
  const neededAssets = new Set<AssetKey>()
  let needsQr = false
  for (const side of sides) {
    for (const op of side.ops) {
      if (op.type === 'image') neededAssets.add(op.asset)
      if (op.type === 'qr') needsQr = true
    }
  }

  const embeddedImages = new Map<AssetKey, Awaited<ReturnType<typeof pdfDoc.embedPng>>>()
  await Promise.all(
    Array.from(neededAssets).map(async (key) => {
      const bytes = await fetchBinary(ASSET_META[key].path)
      const img = await pdfDoc.embedPng(bytes)
      embeddedImages.set(key, img)
    })
  )

  let qrPdfImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null
  if (needsQr) {
    const payload = buildQrPayload(data)
    const qrDataUrl = await generateQrDataUrl(payload, '#072A60', '#FFFFFF')
    if (qrDataUrl) {
      qrPdfImage = await pdfDoc.embedPng(dataUrlToUint8Array(qrDataUrl))
    }
  }

  let photoPdfImage: Awaited<ReturnType<typeof pdfDoc.embedPng>> | null = null
  if (options.photoDataUrl) {
    photoPdfImage = await pdfDoc.embedPng(dataUrlToUint8Array(options.photoDataUrl))
  }

  const bleed = options.withBleed ? BLEED_MM : 0
  const pageW = CARD_WIDTH_MM + bleed * 2
  const pageH = CARD_HEIGHT_MM + bleed * 2

  for (const side of sides) {
    const page = pdfDoc.addPage([mm(pageW), mm(pageH)])

    // Full bleed background
    const bgCol = parseColor(side.background)
    page.drawRectangle({
      x: 0,
      y: 0,
      width: mm(pageW),
      height: mm(pageH),
      color: rgb(bgCol.r, bgCol.g, bgCol.b),
    })

    for (const op of side.ops) {
      if (op.type === 'rect') {
        const c = parseColor(op.fill)
        // Extend edge-touching accent bars into bleed area
        const extendX = op.x === 0 && op.w === CARD_WIDTH_MM ? bleed : 0
        const extendY = op.y === 0 ? bleed : 0
        page.drawRectangle({
          x: mm(bleed + op.x - extendX),
          y: mm(pageH - (bleed + op.y + op.h)),
          width: mm(op.w + extendX * 2),
          height: mm(op.h + extendY),
          color: rgb(c.r, c.g, c.b),
          opacity: c.a,
        })
      } else if (op.type === 'line') {
        const c = parseColor(op.stroke)
        page.drawLine({
          start: { x: mm(bleed + op.x1), y: mm(pageH - (bleed + op.y1)) },
          end: { x: mm(bleed + op.x2), y: mm(pageH - (bleed + op.y2)) },
          thickness: mm(op.strokeWidth),
          color: rgb(c.r, c.g, c.b),
          opacity: c.a,
        })
      } else if (op.type === 'image') {
        const img = embeddedImages.get(op.asset)
        if (!img) continue
        page.drawImage(img, {
          x: mm(bleed + op.x),
          y: mm(pageH - (bleed + op.y + op.h)),
          width: mm(op.w),
          height: mm(op.h),
        })
      } else if (op.type === 'photo' && photoPdfImage) {
        page.drawImage(photoPdfImage, {
          x: mm(bleed + op.x),
          y: mm(pageH - (bleed + op.y + op.h)),
          width: mm(op.w),
          height: mm(op.h),
        })
      } else if (op.type === 'qr' && qrPdfImage) {
        if (op.withFrame) {
          const pad = 0.8
          page.drawRectangle({
            x: mm(bleed + op.x - pad),
            y: mm(pageH - (bleed + op.y + op.size + pad)),
            width: mm(op.size + pad * 2),
            height: mm(op.size + pad * 2),
            color: rgb(1, 1, 1),
          })
        }
        page.drawImage(qrPdfImage, {
          x: mm(bleed + op.x),
          y: mm(pageH - (bleed + op.y + op.size)),
          width: mm(op.size),
          height: mm(op.size),
        })
      } else if (op.type === 'text') {
        const preferredFont =
          op.fontRole === 'serif'
            ? fontSerif
            : op.weight === 'bold'
            ? fontBold
            : op.weight === 'medium'
            ? fontMedium
            : fontRegular!
        const font = hasAllGlyphs(preferredFont, op.text)
          ? preferredFont
          : await getHanjaFallback()

        let fontSize = op.sizePt
        let textWidthPt = font.widthOfTextAtSize(op.text, fontSize)
        if (op.maxWidthMm && textWidthPt > mm(op.maxWidthMm)) {
          fontSize = fontSize * (mm(op.maxWidthMm) / textWidthPt)
          textWidthPt = font.widthOfTextAtSize(op.text, fontSize)
        }

        let drawX = mm(bleed + op.x)
        if (op.align === 'center') drawX -= textWidthPt / 2
        else if (op.align === 'right') drawX -= textWidthPt

        const c = parseColor(op.color)
        const textY = mm(pageH - (bleed + op.y))
        const color = rgb(c.r, c.g, c.b)

        // Draw character-by-character when '-' or '+' is present to prevent
        // pdf-lib/fontkit CID width/GPOS spacing glitches around hyphens & plus signs.
        if (op.text.includes('-') || op.text.includes('+')) {
          let cursorX = drawX
          for (const ch of op.text) {
            page.drawText(ch, {
              x: cursorX,
              y: textY,
              size: fontSize,
              font,
              color,
              opacity: c.a,
            })
            cursorX += font.widthOfTextAtSize(ch, fontSize)
          }
        } else {
          page.drawText(op.text, {
            x: drawX,
            y: textY,
            size: fontSize,
            font,
            color,
            opacity: c.a,
          })
        }
      }
    }

    // Draw crisp print-shop trim/crop marks if bleed is enabled
    if (options.withBleed) {
      const markColor = side.isDark ? rgb(0.85, 0.85, 0.85) : rgb(0.25, 0.25, 0.25)
      const len = mm(1.6)
      const corners = [
        { x: mm(bleed), y: mm(bleed), dx: -1, dy: -1 },
        { x: mm(pageW - bleed), y: mm(bleed), dx: 1, dy: -1 },
        { x: mm(bleed), y: mm(pageH - bleed), dx: -1, dy: 1 },
        { x: mm(pageW - bleed), y: mm(pageH - bleed), dx: 1, dy: 1 },
      ]
      for (const c of corners) {
        page.drawLine({
          start: { x: c.x + c.dx * mm(0.3), y: c.y },
          end: { x: c.x + c.dx * len, y: c.y },
          thickness: 0.35,
          color: markColor,
        })
        page.drawLine({
          start: { x: c.x, y: c.y + c.dy * mm(0.3) },
          end: { x: c.x, y: c.y + c.dy * len },
          thickness: 0.35,
          color: markColor,
        })
      }
    }
  }

  const pdfBytes = await pdfDoc.save()
  const blob = new Blob([pdfBytes as unknown as BlobPart], { type: 'application/pdf' })
  const safeName = (data.nameKo.trim() || data.nameEn.trim() || 'SKKU').replace(/\s+/g, '_')
  const suffix = options.withBleed ? '_94x54_bleed' : '_90x50'
  triggerDownload(blob, options.fileName ?? `SKKU_명함_${safeName}${suffix}.pdf`)
}

function loadHtmlImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => resolve(img)
    img.onerror = reject
    img.src = src
  })
}

function resolveCanvasFontFamily(
  data: CardData,
  customFonts: CustomFontState,
  fontRole?: 'body' | 'serif'
): string {
  if (fontRole === 'serif') {
    return '"Gowun Batang", Georgia, serif'
  }
  if (data.fontStyle === 'custom' && customFonts.regular) {
    return `"${customFonts.regular.family}", "Pretendard", sans-serif`
  }
  if (data.fontStyle === 'serif') {
    return '"Gowun Batang", Georgia, serif'
  }
  return '"Pretendard", -apple-system, BlinkMacSystemFont, sans-serif'
}

/**
 * 600 DPI 고해상도 PNG 내보내기 (앞면 또는 뒷면)
 */
export async function exportSidePng(
  data: CardData,
  customFonts: CustomFontState,
  side: 'front' | 'back',
  photoDataUrl?: string | null
): Promise<void> {
  const layout: CardSideLayout | null =
    side === 'front' ? buildFrontLayout(data, false) : buildBackLayout(data, false)
  if (!layout) return

  await document.fonts.ready

  // 600 DPI -> 2126 x 1181 px
  const dpi = 600
  const mmToPx = dpi / 25.4
  const ptToPx = dpi / 72

  const canvas = document.createElement('canvas')
  canvas.width = Math.round(CARD_WIDTH_MM * mmToPx)
  canvas.height = Math.round(CARD_HEIGHT_MM * mmToPx)
  const ctx = canvas.getContext('2d')
  if (!ctx) return

  ctx.fillStyle = layout.background
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  const qrPayload = data.qrMode !== 'none' ? buildQrPayload(data) : ''
  const qrDataUrl = qrPayload ? await generateQrDataUrl(qrPayload, '#072A60', '#FFFFFF') : ''
  const qrImg = qrDataUrl ? await loadHtmlImage(qrDataUrl) : null
  const photoImg = photoDataUrl ? await loadHtmlImage(photoDataUrl) : null

  for (const op of layout.ops) {
    if (op.type === 'rect') {
      ctx.fillStyle = op.fill
      ctx.fillRect(op.x * mmToPx, op.y * mmToPx, op.w * mmToPx, op.h * mmToPx)
    } else if (op.type === 'line') {
      ctx.strokeStyle = op.stroke
      ctx.lineWidth = op.strokeWidth * mmToPx
      ctx.beginPath()
      ctx.moveTo(op.x1 * mmToPx, op.y1 * mmToPx)
      ctx.lineTo(op.x2 * mmToPx, op.y2 * mmToPx)
      ctx.stroke()
    } else if (op.type === 'image') {
      const img = await loadHtmlImage(ASSET_META[op.asset].path)
      ctx.drawImage(img, op.x * mmToPx, op.y * mmToPx, op.w * mmToPx, op.h * mmToPx)
    } else if (op.type === 'photo' && photoImg) {
      ctx.drawImage(photoImg, op.x * mmToPx, op.y * mmToPx, op.w * mmToPx, op.h * mmToPx)
    } else if (op.type === 'qr' && qrImg) {
      if (op.withFrame) {
        const pad = 0.8 * mmToPx
        ctx.fillStyle = '#FFFFFF'
        ctx.fillRect(
          op.x * mmToPx - pad,
          op.y * mmToPx - pad,
          op.size * mmToPx + pad * 2,
          op.size * mmToPx + pad * 2
        )
      }
      ctx.drawImage(qrImg, op.x * mmToPx, op.y * mmToPx, op.size * mmToPx, op.size * mmToPx)
    } else if (op.type === 'text') {
      const weightNum = op.weight === 'bold' ? 700 : op.weight === 'medium' ? 500 : 400
      const family = resolveCanvasFontFamily(data, customFonts, op.fontRole)
      let pxSize = op.sizePt * ptToPx
      ctx.font = `${weightNum} ${pxSize}px ${family}`
      if (op.maxWidthMm) {
        const measured = ctx.measureText(op.text).width
        const maxPx = op.maxWidthMm * mmToPx
        if (measured > maxPx) {
          pxSize = pxSize * (maxPx / measured)
          ctx.font = `${weightNum} ${pxSize}px ${family}`
        }
      }
      ctx.fillStyle = op.color
      ctx.textAlign = op.align ?? 'left'
      ctx.textBaseline = 'alphabetic'
      ctx.fillText(op.text, op.x * mmToPx, op.y * mmToPx)
    }
  }

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/png'))
  if (!blob) throw new Error('Failed to render PNG blob')
  const safeName = (data.nameKo.trim() || data.nameEn.trim() || 'SKKU').replace(/\s+/g, '_')
  triggerDownload(blob, `SKKU_명함_${safeName}_${side === 'front' ? '앞면' : '뒷면'}_600dpi.png`)
}

function triggerDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 60000)
}
