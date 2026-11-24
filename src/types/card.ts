export type TemplateId =
  | 'official-emblem'
  | 'modern-accent'
  | 'skku-blue-cover'
  | 'skku-green-cover'

export type BackMode = 'english' | 'cover-blue' | 'cover-green' | 'none'

export type CoverLogoStyle =
  | 'sig-ko-en-v'
  | 'sig-ko-en-h'
  | 'emblem'
  | 'sig-hanja-v'
  | 'sig-en-v'

export type NameDisplayMode = 'ko-hanja' | 'ko-en' | 'ko-only' | 'en-only'

export type AffiliationLangMode = 'ko-en' | 'ko-only' | 'en-only'

export type FontStyleId = 'gothic' | 'serif' | 'custom'

export type SloganPreset =
  | 'none'
  | 'inspiring-future'
  | 'unique-origin'
  | 'brand-statement-ko'
  | 'custom'

export type QrMode = 'none' | 'url' | 'vcard'

export type QrPlacement = 'front' | 'back'

export type PhotoShape = 'rounded' | 'circle'

export type MemberCategory =
  | 'faculty'
  | 'graduate'
  | 'undergraduate'
  | 'researcher'
  | 'staff'
  | 'custom'

export type CampusId = 'hssc' | 'nsc' | 'custom'

export type UiLang = 'ko' | 'en'

export interface CustomFontAsset {
  name: string
  family: string
  bytes: ArrayBuffer
}

export interface CustomFontState {
  regular: CustomFontAsset | null
  bold: CustomFontAsset | null
}

export interface CardData {
  // Design & Template
  template: TemplateId
  backMode: BackMode
  coverLogoStyle: CoverLogoStyle
  fontStyle: FontStyleId
  paperTone: 'white' | 'ivory'

  // Back cover / Lab info
  labName: string

  // Slogan
  sloganPreset: SloganPreset
  customSlogan: string
  showSloganOnCover: boolean

  // QR Code
  qrMode: QrMode
  qrPlacement: QrPlacement
  qrUrl: string

  // Profile Photo (default off)
  showPhoto: boolean
  photoShape: PhotoShape

  // Name
  nameDisplayMode: NameDisplayMode
  koreanNameSpaced: boolean
  nameKo: string
  nameHanja: string
  nameEn: string

  // Member & Affiliation
  memberCategory: MemberCategory
  affiliationLangMode: AffiliationLangMode
  collegeKo: string
  collegeEn: string
  deptPresetKey: string
  deptKo: string
  deptEn: string
  rolePresetKey: string
  roleKo: string
  roleEn: string
  showExtraLine: boolean
  extraLineKo: string
  extraLineEn: string

  // Campus & Address
  campus: CampusId
  addressDetailKo: string
  addressDetailEn: string
  addressBaseKo: string
  addressBaseEn: string
  useEnglishAddressOnFront: boolean
  showInstitutionLine: boolean

  // Contacts (each toggleable)
  showTel: boolean
  tel: string
  showMobile: boolean
  mobile: string
  showEmail: boolean
  email: string
  showFax: boolean
  fax: string
  showWeb: boolean
  web: string
  autoIntlPhoneOnEn: boolean
}
