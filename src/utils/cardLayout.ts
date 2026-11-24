import type { CardData, CoverLogoStyle } from '../types/card'
import { SKKU_COLORS, SLOGAN_TEXTS } from '../data/skkuData'
import {
  formatFrontName,
  getCampusLabel,
  splitEnglishAddress,
  toInternationalPhone,
} from './formatters'

export const CARD_WIDTH_MM = 90
export const CARD_HEIGHT_MM = 50
export const BLEED_MM = 2

export type AssetKey =
  | 'emblem-color'
  | 'emblem-white'
  | 'logotype-ko'
  | 'logotype-en'
  | 'signature-ko-en-color'
  | 'signature-ko-en-white'
  | 'signature-ko-en-v-white'
  | 'signature-hanja-v-white'
  | 'signature-en-v-white'
  | 'slogan-ko-dark'
  | 'slogan-ko-white'

export const ASSET_META: Record<AssetKey, { path: string; aspect: number }> = {
  'emblem-color': { path: './assets/skku/emblem-color.png', aspect: 969 / 972 },
  'emblem-white': { path: './assets/skku/emblem-white.png', aspect: 859 / 862 },
  'logotype-ko': { path: './assets/skku/logotype-ko.png', aspect: 1490 / 232 },
  'logotype-en': { path: './assets/skku/logotype-en.png', aspect: 1479 / 84 },
  'signature-ko-en-color': { path: './assets/skku/signature-ko-en-color.png', aspect: 1371 / 333 },
  'signature-ko-en-white': { path: './assets/skku/signature-ko-en-white.png', aspect: 1366 / 333 },
  'signature-ko-en-v-white': { path: './assets/skku/signature-ko-en-v-white.png', aspect: 774 / 521 },
  'signature-hanja-v-white': { path: './assets/skku/signature-hanja-v-white.png', aspect: 1164 / 565 },
  'signature-en-v-white': { path: './assets/skku/signature-en-v-white.png', aspect: 1691 / 1048 },
  'slogan-ko-dark': { path: './assets/skku/slogan-ko-dark.png', aspect: 2348 / 388 },
  'slogan-ko-white': { path: './assets/skku/slogan-ko-white.png', aspect: 2348 / 388 },
}

export type TextWeight = 'regular' | 'medium' | 'bold'
export type TextAlign = 'left' | 'center' | 'right'
export type FontRole = 'body' | 'serif'

export type DrawOp =
  | {
      type: 'rect'
      x: number
      y: number
      w: number
      h: number
      fill: string
      rx?: number
    }
  | {
      type: 'line'
      x1: number
      y1: number
      x2: number
      y2: number
      stroke: string
      strokeWidth: number
    }
  | {
      type: 'image'
      asset: AssetKey
      x: number
      y: number
      w: number
      h: number
    }
  | {
      type: 'qr'
      x: number
      y: number
      size: number
      withFrame?: boolean
    }
  | {
      type: 'photo'
      x: number
      y: number
      w: number
      h: number
    }
  | {
      type: 'text'
      text: string
      x: number
      y: number // baseline in mm from top
      sizePt: number
      weight: TextWeight
      color: string
      align?: TextAlign
      fontRole?: FontRole
      maxWidthMm?: number
      letterSpacingEm?: number
    }

export interface CardSideLayout {
  background: string
  isDark: boolean
  ops: DrawOp[]
}

function getPaperBg(data: CardData, forPrint: boolean): string {
  if (forPrint) return '#FFFFFF'
  return data.paperTone === 'ivory' ? '#FBF9F4' : '#FFFFFF'
}

function getSloganLines(data: CardData): { isGraphic: boolean; lines: string[] } {
  if (data.sloganPreset === 'none') return { isGraphic: false, lines: [] }
  if (data.sloganPreset === 'brand-statement-ko') {
    return { isGraphic: true, lines: [] }
  }
  if (data.sloganPreset === 'custom') {
    const raw = data.customSlogan
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean)
      .slice(0, 2)
    return { isGraphic: false, lines: raw }
  }
  const preset = SLOGAN_TEXTS[data.sloganPreset]
  if (!preset) return { isGraphic: false, lines: [] }
  return { isGraphic: false, lines: [preset.line1, preset.line2] }
}

function collectContactLines(
  data: CardData,
  mode: 'full-ko' | 'full-en' | 'compact'
): string[] {
  const isEn = mode === 'full-en'
  const tel = toInternationalPhone(data.tel, isEn && data.autoIntlPhoneOnEn)
  const mobile = toInternationalPhone(data.mobile, isEn && data.autoIntlPhoneOnEn)
  const fax = toInternationalPhone(data.fax, isEn && data.autoIntlPhoneOnEn)

  const lines: string[] = []
  if (mode === 'compact') {
    if (data.showEmail && data.email.trim()) lines.push(`E. ${data.email.trim()}`)
    if (data.showMobile && data.mobile.trim()) lines.push(`M. ${data.mobile.trim()}`)
    if (data.showTel && data.tel.trim()) lines.push(`T. ${data.tel.trim()}`)
    if (data.showFax && data.fax.trim()) lines.push(`F. ${data.fax.trim()}`)
    if (data.showWeb && data.web.trim()) lines.push(`W. ${data.web.trim()}`)
    return lines
  }

  if (data.showTel && tel) lines.push(`Tel: ${tel}`)
  if (data.showMobile && mobile) lines.push(`Mobile: ${mobile}`)
  if (data.showEmail && data.email.trim()) lines.push(`E-mail: ${data.email.trim()}`)
  if (data.showFax && fax) lines.push(`Fax: ${fax}`)
  if (data.showWeb && data.web.trim()) lines.push(`Web: ${data.web.trim()}`)
  return lines
}

function fitAssetInBox(
  asset: AssetKey,
  maxW: number,
  maxH: number
): { w: number; h: number } {
  const aspect = ASSET_META[asset].aspect
  let w = maxW
  let h = w / aspect
  if (h > maxH) {
    h = maxH
    w = h * aspect
  }
  return { w, h }
}

function getCoverAsset(style: CoverLogoStyle): AssetKey {
  switch (style) {
    case 'emblem':
      return 'emblem-white'
    case 'sig-ko-en-h':
      return 'signature-ko-en-white'
    case 'sig-hanja-v':
      return 'signature-hanja-v-white'
    case 'sig-en-v':
      return 'signature-en-v-white'
    case 'sig-ko-en-v':
    default:
      return 'signature-ko-en-v-white'
  }
}

/**
 * 1. 공식 표준형 (업로드된 실제 성균관대 공식 명함 샘플 기반)
 */
function buildOfficialEmblemFront(data: CardData, forPrint: boolean): CardSideLayout {
  const ops: DrawOp[] = []
  const bg = getPaperBg(data, forPrint)
  const hasQr = data.qrMode !== 'none' && data.qrPlacement === 'front'

  // Left Official Circular Emblem (replaced by photo when photo is enabled)
  if (data.showPhoto) {
    const isCircle = data.photoShape === 'circle'
    const pw = isCircle ? 23.18 : 21.25
    const ph = isCircle ? 23.18 : 28.34
    ops.push({
      type: 'photo',
      x: 18.8 - pw / 2,
      y: (CARD_HEIGHT_MM - ph) / 2,
      w: pw,
      h: ph,
    })
  } else {
    const emblemSize = 20.4
    ops.push({
      type: 'image',
      asset: 'emblem-color',
      x: 8.6,
      y: 14.8,
      w: emblemSize,
      h: emblemSize / ASSET_META['emblem-color'].aspect,
    })
  }

  const colX = 35.8
  const rightMargin = hasQr ? 16.5 : 5.5
  const maxTextW = CARD_WIDTH_MM - colX - rightMargin

  // Name
  const nameText = formatFrontName(data)
  if (nameText) {
    ops.push({
      type: 'text',
      text: nameText,
      x: colX,
      y: 11.6,
      sizePt: 14.2,
      weight: 'bold',
      color: '#23262B',
      maxWidthMm: CARD_WIDTH_MM - colX - 4.5,
    })
  }

  // Affiliation / Role line (e.g. "문과대학 국어국문학과 / 조교수")
  const affilMainParts: string[] = []
  if (data.affiliationLangMode === 'en-only') {
    const enDept = data.deptEn.trim()
    const enRole = data.roleEn.trim()
    if (enRole) affilMainParts.push(enRole)
    if (enDept) affilMainParts.push(enDept)
  } else {
    const leftPart = [data.collegeKo.trim(), data.deptKo.trim()].filter(Boolean).join(' ')
    const rightPart = data.roleKo.trim()
    if (leftPart && rightPart) {
      affilMainParts.push(`${leftPart} / ${rightPart}`)
    } else if (leftPart || rightPart) {
      affilMainParts.push(leftPart || rightPart)
    }
  }

  let curY = 15.5
  if (affilMainParts.length > 0) {
    ops.push({
      type: 'text',
      text: affilMainParts.join(' · '),
      x: colX,
      y: curY,
      sizePt: 6.4,
      weight: 'medium',
      color: '#374151',
      maxWidthMm: CARD_WIDTH_MM - colX - 5.5,
    })
    curY += 3.2
  }

  if (data.showExtraLine) {
    const extra =
      data.affiliationLangMode === 'en-only'
        ? data.extraLineEn.trim() || data.extraLineKo.trim()
        : data.extraLineKo.trim()
    if (extra) {
      ops.push({
        type: 'text',
        text: extra,
        x: colX,
        y: curY,
        sizePt: 6.0,
        weight: 'regular',
        color: '#4B5563',
        maxWidthMm: CARD_WIDTH_MM - colX - 5.5,
      })
    }
  }

  // Official Korean Logotype "성균관대학교" (from ui_3.zip Logotype_01.ai)
  const logoH = 3.7
  const logoW = logoH * ASSET_META['logotype-ko'].aspect
  const blockStartY = 23.8
  if (data.showInstitutionLine) {
    ops.push({
      type: 'image',
      asset: 'logotype-ko',
      x: colX,
      y: blockStartY,
      w: logoW,
      h: logoH,
    })
  }

  // Campus + Detail Location
  const contacts = collectContactLines(data, data.useEnglishAddressOnFront ? 'full-en' : 'full-ko')
  const lineStep = contacts.length >= 4 ? 2.85 : 3.25
  let infoY = data.showInstitutionLine ? blockStartY + 7.2 : blockStartY + 2.8

  if (data.useEnglishAddressOnFront) {
    const campusEn = getCampusLabel(data, 'en')
    const detailEn = data.addressDetailEn.trim()
    const campusLine = [campusEn, detailEn].filter(Boolean).join(', ')
    if (campusLine) {
      ops.push({
        type: 'text',
        text: campusLine,
        x: colX,
        y: infoY,
        sizePt: 6.9,
        weight: 'medium',
        color: '#23262B',
        maxWidthMm: maxTextW,
      })
      infoY += lineStep
    }
    const addrLines = splitEnglishAddress(data.addressBaseEn, hasQr ? 30 : 38)
    addrLines.forEach((line) => {
      ops.push({
        type: 'text',
        text: line,
        x: colX,
        y: infoY,
        sizePt: 6.6,
        weight: 'regular',
        color: '#4B5563',
        maxWidthMm: maxTextW,
      })
      infoY += lineStep
    })
  } else {
    const campusKo = getCampusLabel(data, 'ko')
    const detailKo = data.addressDetailKo.trim()
    const campusDetail = [campusKo, detailKo].filter(Boolean).join(' ')
    if (campusDetail) {
      ops.push({
        type: 'text',
        text: campusDetail,
        x: colX,
        y: infoY,
        sizePt: 7.0,
        weight: 'medium',
        color: '#23262B',
        maxWidthMm: maxTextW,
      })
      infoY += lineStep
    }
    if (data.addressBaseKo.trim()) {
      ops.push({
        type: 'text',
        text: data.addressBaseKo.trim(),
        x: colX,
        y: infoY,
        sizePt: 6.7,
        weight: 'regular',
        color: '#4B5563',
        maxWidthMm: maxTextW,
      })
      infoY += lineStep
    }
  }

  // Contacts
  contacts.forEach((line) => {
    ops.push({
      type: 'text',
      text: line,
      x: colX,
      y: infoY,
      sizePt: 6.8,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: maxTextW,
    })
    infoY += lineStep
  })

  if (hasQr) {
    ops.push({
      type: 'qr',
      x: CARD_WIDTH_MM - 14.5,
      y: CARD_HEIGHT_MM - 14.5,
      size: 10.5,
    })
  }

  return { background: bg, isDark: false, ops }
}

/**
 * 공식 표준형 영문 뒷면 (업로드된 실제 영문 명함 샘플 100% 기반)
 */
function buildOfficialEmblemEnglishBack(data: CardData, forPrint: boolean): CardSideLayout {
  const ops: DrawOp[] = []
  const bg = getPaperBg(data, forPrint)
  const hasQr = data.qrMode !== 'none' && data.qrPlacement === 'back'

  // Left Official Circular Emblem (back side always shows emblem only)
  const emblemSize = 20.4
  ops.push({
    type: 'image',
    asset: 'emblem-color',
    x: 8.6,
    y: 14.8,
    w: emblemSize,
    h: emblemSize / ASSET_META['emblem-color'].aspect,
  })

  const colX = 35.8
  const rightMargin = hasQr ? 16.5 : 5.5
  const maxTextW = CARD_WIDTH_MM - colX - rightMargin

  // English Name
  const enName = data.nameEn.trim() || data.nameKo.trim()
  if (enName) {
    ops.push({
      type: 'text',
      text: enName,
      x: colX,
      y: 11.0,
      sizePt: 13.6,
      weight: 'medium',
      color: '#23262B',
      maxWidthMm: CARD_WIDTH_MM - colX - 4.5,
    })
  }

  // Role & Department (English)
  let roleY = 14.4
  if (data.roleEn.trim()) {
    ops.push({
      type: 'text',
      text: data.roleEn.trim(),
      x: colX,
      y: roleY,
      sizePt: 6.2,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: CARD_WIDTH_MM - colX - 5.5,
    })
    roleY += 3.0
  }
  if (data.deptEn.trim()) {
    ops.push({
      type: 'text',
      text: data.deptEn.trim(),
      x: colX,
      y: roleY,
      sizePt: 6.2,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: CARD_WIDTH_MM - colX - 5.5,
    })
    roleY += 3.0
  }
  if (data.showExtraLine && data.extraLineEn.trim()) {
    ops.push({
      type: 'text',
      text: data.extraLineEn.trim(),
      x: colX,
      y: roleY,
      sizePt: 5.7,
      weight: 'regular',
      color: '#4B5563',
      maxWidthMm: CARD_WIDTH_MM - colX - 5.5,
    })
  }

  // Official English Logotype "SUNG KYUN KWAN UNIVERSITY" (Logotype_02.ai)
  const enLogoH = 2.55
  const enLogoW = Math.min(enLogoH * ASSET_META['logotype-en'].aspect, CARD_WIDTH_MM - colX - 5.5)
  const actualEnLogoH = enLogoW / ASSET_META['logotype-en'].aspect
  const logoY = 23.8
  if (data.showInstitutionLine) {
    ops.push({
      type: 'image',
      asset: 'logotype-en',
      x: colX,
      y: logoY,
      w: enLogoW,
      h: actualEnLogoH,
    })
  }

  const contacts = collectContactLines(data, 'full-en')
  const lineStep = contacts.length >= 4 ? 2.75 : 3.05
  let infoY = data.showInstitutionLine ? logoY + actualEnLogoH + 3.6 : logoY + 2.2

  // Campus English
  const campusEn = getCampusLabel(data, 'en')
  if (campusEn) {
    ops.push({
      type: 'text',
      text: campusEn,
      x: colX,
      y: infoY,
      sizePt: 6.9,
      weight: 'medium',
      color: '#23262B',
      maxWidthMm: maxTextW,
    })
    infoY += lineStep
  }

  // Address English (detail + base)
  const fullAddrEn = [data.addressDetailEn.trim(), data.addressBaseEn.trim()]
    .filter(Boolean)
    .join(', ')
  const addrLines = splitEnglishAddress(fullAddrEn, hasQr ? 29 : 36)
  addrLines.forEach((line) => {
    ops.push({
      type: 'text',
      text: line,
      x: colX,
      y: infoY,
      sizePt: 6.5,
      weight: 'regular',
      color: '#4B5563',
      maxWidthMm: maxTextW,
    })
    infoY += lineStep
  })

  contacts.forEach((line) => {
    ops.push({
      type: 'text',
      text: line,
      x: colX,
      y: infoY,
      sizePt: 6.6,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: maxTextW,
    })
    infoY += lineStep
  })

  if (hasQr) {
    ops.push({
      type: 'qr',
      x: CARD_WIDTH_MM - 14.5,
      y: CARD_HEIGHT_MM - 14.5,
      size: 10.5,
    })
  }

  return { background: bg, isDark: false, ops }
}

/**
 * 2. 모던 포인트형 (사용자 시안 + 공식 국영문 좌우 시그니처 + 2색 세로바 + 슬로건)
 */
function buildModernAccentSide(
  data: CardData,
  lang: 'ko' | 'en',
  forPrint: boolean
): CardSideLayout {
  const ops: DrawOp[] = []
  const bg = getPaperBg(data, forPrint)
  const hasQr =
    data.qrMode !== 'none' &&
    ((lang === 'ko' && data.qrPlacement === 'front') ||
      (lang === 'en' && data.qrPlacement === 'back'))

  // Top-left: OFFICIAL SKKU Horizontal Korean-English Signature (NEVER distorted)
  const sigH = 8.4
  const sigW = sigH * ASSET_META['signature-ko-en-color'].aspect
  ops.push({
    type: 'image',
    asset: 'signature-ko-en-color',
    x: 6.0,
    y: 4.8,
    w: sigW,
    h: sigH,
  })

  // Top-right: Optional Slogan (e.g. Inspiring Future, Grand Challenge / Unique Origin, Unique Future / Official Brand Statement)
  const slogan = getSloganLines(data)
  if (slogan.isGraphic) {
    const dim = fitAssetInBox('slogan-ko-dark', 34.0, 6.2)
    ops.push({
      type: 'image',
      asset: 'slogan-ko-dark',
      x: CARD_WIDTH_MM - 5.8 - dim.w,
      y: 5.4,
      w: dim.w,
      h: dim.h,
    })
  } else if (slogan.lines.length > 0) {
    slogan.lines.forEach((line, idx) => {
      ops.push({
        type: 'text',
        text: line,
        x: CARD_WIDTH_MM - 5.8,
        y: 8.2 + idx * 3.3,
        sizePt: 7.0,
        weight: 'medium',
        color: SKKU_COLORS.blue.hex,
        align: 'right',
        fontRole: 'serif',
        maxWidthMm: 36,
      })
    })
  }

  // Name + Role + Extra block with Dual-Tone Vertical Accent Bar (SKKU Green + SKKU Blue)
  const colX = 22.8
  const barX = 18.6
  const barTop = 17.6

  const nameStr =
    lang === 'ko' ? formatFrontName(data) : data.nameEn.trim() || data.nameKo.trim()

  const roleLine =
    lang === 'ko'
      ? [data.collegeKo.trim(), data.deptKo.trim(), data.roleKo.trim()].filter(Boolean).join(' ')
      : [data.roleEn.trim(), data.deptEn.trim()].filter(Boolean).join(' · ')

  const extraLine =
    data.showExtraLine
      ? lang === 'ko'
        ? data.extraLineKo.trim()
        : data.extraLineEn.trim()
      : ''

  // Calculate bar height dynamically to match the identity block
  const lineCount = 1 + (roleLine ? 1 : 0) + (extraLine ? 1 : 0)
  const barHeight = lineCount >= 3 ? 11.6 : lineCount === 2 ? 8.6 : 5.4
  const greenH = barHeight * 0.44
  const blueH = barHeight - greenH

  ops.push({
    type: 'rect',
    x: barX,
    y: barTop,
    w: 1.3,
    h: greenH,
    fill: SKKU_COLORS.green.hex,
  })
  ops.push({
    type: 'rect',
    x: barX,
    y: barTop + greenH,
    w: 1.3,
    h: blueH,
    fill: SKKU_COLORS.blue.hex,
  })

  const showPhotoOnSide = data.showPhoto && lang === 'ko'
  if (showPhotoOnSide) {
    const isCircle = data.photoShape === 'circle'
    const pw = isCircle ? 20.61 : 18.55
    const ph = isCircle ? 20.61 : 24.73
    const px = hasQr ? CARD_WIDTH_MM - 16.5 - pw : CARD_WIDTH_MM - 5.8 - pw
    ops.push({
      type: 'photo',
      x: px,
      y: 14.8,
      w: pw,
      h: ph,
    })
  }

  const textRightLimit = showPhotoOnSide
    ? hasQr
      ? CARD_WIDTH_MM - colX - 38.0
      : CARD_WIDTH_MM - colX - 26.5
    : CARD_WIDTH_MM - colX - 5.8

  if (nameStr) {
    ops.push({
      type: 'text',
      text: nameStr,
      x: colX,
      y: 21.1,
      sizePt: 11.4,
      weight: 'bold',
      color: '#111827',
      maxWidthMm: textRightLimit,
    })
  }

  let subY = 25.3
  if (roleLine) {
    ops.push({
      type: 'text',
      text: roleLine,
      x: colX,
      y: subY,
      sizePt: 6.6,
      weight: 'medium',
      color: '#1F2937',
      maxWidthMm: textRightLimit,
    })
    subY += 3.3
  }
  if (extraLine) {
    ops.push({
      type: 'text',
      text: extraLine,
      x: colX,
      y: subY,
      sizePt: 6.4,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: textRightLimit,
    })
  }

  // Lower block: Institution + Address + Contacts
  const contacts = collectContactLines(data, lang === 'en' ? 'full-en' : 'full-ko')
  const rightMargin = hasQr ? 17.5 : 5.8
  const maxLowerW = CARD_WIDTH_MM - colX - rightMargin
  const step = contacts.length >= 4 ? 2.55 : 2.85

  let lowerY = 34.0
  if (data.showInstitutionLine) {
    const campusLabel = getCampusLabel(data, lang)
    const instLine =
      lang === 'ko'
        ? ['성균관대학교', campusLabel].filter(Boolean).join(' ')
        : ['Sungkyunkwan University', campusLabel].filter(Boolean).join(' · ')
    ops.push({
      type: 'text',
      text: instLine,
      x: colX,
      y: lowerY,
      sizePt: 6.3,
      weight: 'bold',
      color: '#111827',
      maxWidthMm: maxLowerW,
    })
    lowerY += step
  }

  const addrStr =
    lang === 'ko' && !data.useEnglishAddressOnFront
      ? [data.addressBaseKo.trim(), data.addressDetailKo.trim()].filter(Boolean).join(' ')
      : [data.addressDetailEn.trim(), data.addressBaseEn.trim()].filter(Boolean).join(', ')
  if (addrStr) {
    ops.push({
      type: 'text',
      text: addrStr,
      x: colX,
      y: lowerY,
      sizePt: 5.8,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: maxLowerW,
    })
    lowerY += step
  }

  contacts.forEach((line) => {
    ops.push({
      type: 'text',
      text: line,
      x: colX,
      y: lowerY,
      sizePt: 5.8,
      weight: 'regular',
      color: '#374151',
      maxWidthMm: maxLowerW,
    })
    lowerY += step
  })

  if (hasQr) {
    ops.push({
      type: 'qr',
      x: CARD_WIDTH_MM - 15.2,
      y: CARD_HEIGHT_MM - 14.8,
      size: 10.6,
    })
  }

  return { background: bg, isDark: false, ops }
}

/**
 * 3 & 4. SKKU Blue / Dark Green 표지형의 앞면 (KAIST GSA 깔끔한 병기 레이아웃 + 성대 공식 UI)
 */
function buildCoverTemplateFront(
  data: CardData,
  accentHex: string,
  forPrint: boolean
): CardSideLayout {
  const ops: DrawOp[] = []
  const bg = getPaperBg(data, forPrint)
  const hasQr = data.qrMode !== 'none' && data.qrPlacement === 'front'

  // Top-right Official Signature
  const sigH = 7.6
  const sigW = sigH * ASSET_META['signature-ko-en-color'].aspect
  ops.push({
    type: 'image',
    asset: 'signature-ko-en-color',
    x: CARD_WIDTH_MM - 5.2 - sigW,
    y: 4.8,
    w: sigW,
    h: sigH,
  })

  // Left Name (e.g. 홍 길 동 | Gildong Hong)
  const nameText = formatFrontName(data)
  if (nameText) {
    ops.push({
      type: 'text',
      text: nameText,
      x: 5.4,
      y: 16.5,
      sizePt: 11.4,
      weight: 'bold',
      color: '#111827',
      maxWidthMm: 52,
    })
  }

  // Bilingual Department & Role/Course stack (like KAIST GSA, customizable language mode)
  const affilLines: string[] = []
  const koLine = [data.collegeKo.trim(), data.deptKo.trim(), data.roleKo.trim()]
    .filter(Boolean)
    .join(' ')
  if (data.affiliationLangMode !== 'en-only' && koLine) {
    affilLines.push(koLine)
  }
  if (data.affiliationLangMode !== 'ko-only') {
    if (data.deptEn.trim()) affilLines.push(data.deptEn.trim())
    if (data.roleEn.trim()) affilLines.push(data.roleEn.trim())
  }
  if (data.showExtraLine) {
    const extra =
      data.affiliationLangMode === 'en-only'
        ? data.extraLineEn.trim() || data.extraLineKo.trim()
        : data.extraLineKo.trim() || data.extraLineEn.trim()
    if (extra) affilLines.push(extra)
  }

  if (data.showPhoto) {
    const isCircle = data.photoShape === 'circle'
    const pw = isCircle ? 20.09 : 18.03
    const ph = isCircle ? 20.09 : 24.08
    const px = hasQr ? CARD_WIDTH_MM - 17.0 - pw : CARD_WIDTH_MM - 5.4 - pw
    ops.push({
      type: 'photo',
      x: px,
      y: 12.0,
      w: pw,
      h: ph,
    })
  }

  const maxAffilW =
    data.showPhoto && hasQr
      ? 49
      : data.showPhoto
      ? 62
      : hasQr
      ? 65
      : 79
  const affilStep = affilLines.length >= 4 ? 2.85 : 3.25
  affilLines.slice(0, 4).forEach((line, idx) => {
    ops.push({
      type: 'text',
      text: line,
      x: 5.4,
      y: 22.8 + idx * affilStep,
      sizePt: idx === 0 ? 6.3 : 5.9,
      weight: idx === 0 ? 'medium' : 'regular',
      color: idx === 0 ? '#1F2937' : '#374151',
      maxWidthMm: maxAffilW,
    })
  })

  if (hasQr) {
    ops.push({
      type: 'qr',
      x: CARD_WIDTH_MM - 15.6,
      y: 24.4,
      size: 10.4,
    })
  }

  // Horizontal SKKU Divider Line (Green accent head + Main SKKU Blue or Dark Green rule)
  ops.push({
    type: 'line',
    x1: 5.4,
    y1: 36.8,
    x2: 18.0,
    y2: 36.8,
    stroke: SKKU_COLORS.green.hex,
    strokeWidth: 0.55,
  })
  ops.push({
    type: 'line',
    x1: 18.0,
    y1: 36.8,
    x2: CARD_WIDTH_MM - 5.4,
    y2: 36.8,
    stroke: accentHex,
    strokeWidth: 0.42,
  })

  // Address line
  const addrLine = data.useEnglishAddressOnFront
    ? [data.addressDetailEn.trim(), data.addressBaseEn.trim()].filter(Boolean).join(', ')
    : [data.addressBaseKo.trim(), data.addressDetailKo.trim()].filter(Boolean).join(' ')
  if (addrLine) {
    ops.push({
      type: 'text',
      text: addrLine,
      x: 5.4,
      y: 41.0,
      sizePt: 5.7,
      weight: 'regular',
      color: '#5B616E',
      maxWidthMm: 79.2,
    })
  }

  // Compact horizontal contact row (E. ...   M. ...   T. ...)
  const contacts = collectContactLines(data, 'compact')
  if (contacts.length > 0) {
    const row1 = contacts.slice(0, 3)
    const totalW = CARD_WIDTH_MM - 10.8
    if (row1.length === 1) {
      ops.push({
        type: 'text',
        text: row1[0],
        x: 5.4,
        y: 44.8,
        sizePt: 5.7,
        weight: 'medium',
        color: '#4B5563',
        maxWidthMm: totalW,
      })
    } else if (row1.length === 2) {
      ops.push({
        type: 'text',
        text: row1[0],
        x: 5.4,
        y: 44.8,
        sizePt: 5.7,
        weight: 'medium',
        color: '#4B5563',
        maxWidthMm: 46,
      })
      ops.push({
        type: 'text',
        text: row1[1],
        x: CARD_WIDTH_MM - 5.4,
        y: 44.8,
        sizePt: 5.7,
        weight: 'medium',
        color: '#4B5563',
        align: 'right',
        maxWidthMm: 34,
      })
    } else {
      ops.push({
        type: 'text',
        text: row1[0],
        x: 5.4,
        y: 44.8,
        sizePt: 5.6,
        weight: 'medium',
        color: '#4B5563',
        maxWidthMm: 35,
      })
      ops.push({
        type: 'text',
        text: row1[1],
        x: 47.0,
        y: 44.8,
        sizePt: 5.6,
        weight: 'medium',
        color: '#4B5563',
        align: 'center',
        maxWidthMm: 24,
      })
      ops.push({
        type: 'text',
        text: row1[2],
        x: CARD_WIDTH_MM - 5.4,
        y: 44.8,
        sizePt: 5.6,
        weight: 'medium',
        color: '#4B5563',
        align: 'right',
        maxWidthMm: 24,
      })
    }
    if (contacts.length > 3) {
      ops.push({
        type: 'text',
        text: contacts.slice(3).join('   ·   '),
        x: 5.4,
        y: 47.6,
        sizePt: 5.3,
        weight: 'regular',
        color: '#6B7280',
        maxWidthMm: totalW,
      })
    }
  }

  return { background: bg, isDark: false, ops }
}

/**
 * 유색 표지 뒷면 (SKKU Blue #072A60 또는 SKKU Dark Green #124532 + 공식 Solid White 로고)
 */
function buildColoredCoverBack(
  data: CardData,
  bgHex: string
): CardSideLayout {
  const ops: DrawOp[] = []
  const hasQr = data.qrMode !== 'none' && data.qrPlacement === 'back'
  const logoAsset = getCoverAsset(data.coverLogoStyle)

  // Subtle top SKKU Green thin hairline stripe (1.0mm) for refined SKKU identity
  ops.push({
    type: 'rect',
    x: 0,
    y: 0,
    w: CARD_WIDTH_MM,
    h: 1.0,
    fill: SKKU_COLORS.green.hex,
  })

  const labLines = data.labName
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 2)

  const slogan = data.showSloganOnCover ? getSloganLines(data) : { isGraphic: false, lines: [] }
  const hasSlogan = slogan.isGraphic || slogan.lines.length > 0

  // Determine vertical box for official white logo
  const maxLogoW = data.coverLogoStyle === 'sig-ko-en-h' ? 54 : data.coverLogoStyle === 'emblem' ? 22 : 44
  const maxLogoH = data.coverLogoStyle === 'emblem' ? 22 : data.coverLogoStyle === 'sig-ko-en-h' ? 14 : 21
  const logoDim = fitAssetInBox(logoAsset, maxLogoW, maxLogoH)

  const extraTextOffset = (labLines.length > 0 ? 4.5 : 0) + (hasSlogan ? 4.0 : 0)
  const logoY = Math.max(8.0, (CARD_HEIGHT_MM - logoDim.h - extraTextOffset) / 2)

  ops.push({
    type: 'image',
    asset: logoAsset,
    x: (CARD_WIDTH_MM - logoDim.w) / 2,
    y: logoY,
    w: logoDim.w,
    h: logoDim.h,
  })

  // Lab / Organization name underneath
  let nextY = logoY + logoDim.h + 5.2
  labLines.forEach((line) => {
    ops.push({
      type: 'text',
      text: line,
      x: CARD_WIDTH_MM / 2,
      y: nextY,
      sizePt: 6.4,
      weight: 'bold',
      color: '#FFFFFF',
      align: 'center',
      maxWidthMm: 74,
    })
    nextY += 3.3
  })

  // Optional Slogan near bottom
  if (slogan.isGraphic) {
    const dim = fitAssetInBox('slogan-ko-white', 40.0, 6.0)
    ops.push({
      type: 'image',
      asset: 'slogan-ko-white',
      x: (CARD_WIDTH_MM - dim.w) / 2,
      y: CARD_HEIGHT_MM - dim.h - 4.2,
      w: dim.w,
      h: dim.h,
    })
  } else if (slogan.lines.length > 0) {
    const text = slogan.lines.join(' ')
    ops.push({
      type: 'text',
      text,
      x: CARD_WIDTH_MM / 2,
      y: CARD_HEIGHT_MM - 5.0,
      sizePt: 5.8,
      weight: 'regular',
      color: 'rgba(255,255,255,0.82)',
      align: 'center',
      fontRole: 'serif',
      maxWidthMm: hasQr ? 60 : 76,
    })
  }

  if (hasQr) {
    ops.push({
      type: 'qr',
      x: CARD_WIDTH_MM - 14.2,
      y: CARD_HEIGHT_MM - 14.2,
      size: 10.2,
      withFrame: true,
    })
  }

  return { background: bgHex, isDark: true, ops }
}

/**
 * 앞면 레이아웃 생성
 */
export function buildFrontLayout(data: CardData, forPrint = false): CardSideLayout {
  switch (data.template) {
    case 'official-emblem':
      return buildOfficialEmblemFront(data, forPrint)
    case 'modern-accent':
      return buildModernAccentSide(data, 'ko', forPrint)
    case 'skku-blue-cover':
      return buildCoverTemplateFront(data, SKKU_COLORS.blue.hex, forPrint)
    case 'skku-green-cover':
      return buildCoverTemplateFront(data, SKKU_COLORS.darkGreen.hex, forPrint)
  }
}

/**
 * 뒷면 레이아웃 생성 (단면 모드이면 null 반환)
 */
export function buildBackLayout(data: CardData, forPrint = false): CardSideLayout | null {
  if (data.backMode === 'none') return null
  if (data.backMode === 'cover-blue') {
    return buildColoredCoverBack(data, SKKU_COLORS.blue.hex)
  }
  if (data.backMode === 'cover-green') {
    return buildColoredCoverBack(data, SKKU_COLORS.darkGreen.hex)
  }
  // English back
  if (data.template === 'modern-accent') {
    return buildModernAccentSide(data, 'en', forPrint)
  }
  return buildOfficialEmblemEnglishBack(data, forPrint)
}
