import type { CardData } from '../types/card'
import { SKKU_CAMPUSES } from '../data/skkuData'

/**
 * 2~4글자 한글 이름 자간 넓히기 ("홍길동" -> "홍 길 동")
 */
export function formatKoreanName(name: string, spaced: boolean): string {
  const trimmed = name.trim()
  if (!trimmed) return ''
  if (!spaced) return trimmed
  // If user already typed spaces, preserve them; otherwise space Hangul characters
  if (trimmed.includes(' ')) return trimmed
  if (trimmed.length >= 2 && trimmed.length <= 4) {
    return trimmed.split('').join(' ')
  }
  return trimmed
}

/**
 * 한문 이름 자간 넓히기 ("韓榮奎" -> "韓 榮 奎")
 */
export function formatHanjaName(hanja: string, spaced: boolean): string {
  const trimmed = hanja.trim()
  if (!trimmed) return ''
  if (!spaced || trimmed.includes(' ')) return trimmed
  if (trimmed.length >= 2 && trimmed.length <= 4) {
    return trimmed.split('').join(' ')
  }
  return trimmed
}

/**
 * 국내 전화번호를 국제번호 형식으로 변환 ("02-760-0234" -> "+82-2-760-0234", "010-1234-5678" -> "+82-10-1234-5678")
 */
export function toInternationalPhone(phone: string, enabled: boolean): string {
  const trimmed = phone.trim()
  if (!trimmed || !enabled) return trimmed
  if (trimmed.startsWith('+')) return trimmed
  if (trimmed.startsWith('0')) {
    return '+82-' + trimmed.slice(1)
  }
  return trimmed
}

/**
 * 앞면 이름 문자열 조합
 */
export function formatFrontName(data: CardData): string {
  const ko = formatKoreanName(data.nameKo, data.koreanNameSpaced)
  const hanja = formatHanjaName(data.nameHanja, data.koreanNameSpaced)
  const en = data.nameEn.trim()

  switch (data.nameDisplayMode) {
    case 'ko-hanja':
      if (ko && hanja) return `${ko} (${hanja})`
      return ko || en
    case 'ko-en':
      if (ko && en) return `${ko}  |  ${en}`
      return ko || en
    case 'ko-only':
      return ko || en
    case 'en-only':
      return en || ko
  }
}

/**
 * 캠퍼스 국/영문 명칭 반환
 */
export function getCampusLabel(data: CardData, lang: 'ko' | 'en'): string {
  if (data.campus === 'custom') return ''
  const info = SKKU_CAMPUSES[data.campus]
  return lang === 'ko' ? info.nameKo : info.nameEn
}

/**
 * vCard 3.0 payload 생성 (QR코드 스캔 시 스마트폰 연락처 바로 저장)
 */
export function buildQrPayload(data: CardData): string {
  if (data.qrMode === 'url') {
    return data.qrUrl.trim() || 'https://www.skku.edu'
  }
  if (data.qrMode === 'vcard') {
    const fn = data.nameKo.trim() || data.nameEn.trim() || 'SKKU Member'
    const orgParts = ['Sungkyunkwan University', data.deptKo || data.deptEn].filter(Boolean)
    const title = data.roleKo || data.roleEn
    const lines = [
      'BEGIN:VCARD',
      'VERSION:3.0',
      `FN:${fn}`,
      data.nameEn.trim() ? `NICKNAME:${data.nameEn.trim()}` : '',
      `ORG:${orgParts.join(';')}`,
      title ? `TITLE:${title}` : '',
      data.showTel && data.tel.trim() ? `TEL;TYPE=WORK,VOICE:${data.tel.trim()}` : '',
      data.showMobile && data.mobile.trim() ? `TEL;TYPE=CELL:${data.mobile.trim()}` : '',
      data.showEmail && data.email.trim() ? `EMAIL;TYPE=WORK:${data.email.trim()}` : '',
      data.showWeb && data.web.trim() ? `URL:${data.web.trim()}` : '',
      `ADR;TYPE=WORK:;;${[data.addressDetailKo, data.addressBaseKo].filter(Boolean).join(' ')};;;;Korea`,
      'END:VCARD',
    ].filter(Boolean)
    return lines.join('\n')
  }
  return ''
}

/**
 * 긴 영문 주소를 지정 문자 수 기준으로 깔끔하게 2줄 분할
 */
export function splitEnglishAddress(address: string, maxChars = 36): string[] {
  const trimmed = address.trim()
  if (!trimmed) return []
  if (trimmed.length <= maxChars) return [trimmed]
  // Prefer breaking after a comma near the middle
  const commaIndices: number[] = []
  for (let i = 0; i < trimmed.length; i++) {
    if (trimmed[i] === ',') commaIndices.push(i)
  }
  let bestSplit = -1
  for (const idx of commaIndices) {
    if (idx <= maxChars) bestSplit = idx
  }
  if (bestSplit > 8) {
    return [trimmed.slice(0, bestSplit + 1).trim(), trimmed.slice(bestSplit + 1).trim()]
  }
  const spaceIdx = trimmed.lastIndexOf(' ', maxChars)
  if (spaceIdx > 8) {
    return [trimmed.slice(0, spaceIdx).trim(), trimmed.slice(spaceIdx + 1).trim()]
  }
  return [trimmed]
}
