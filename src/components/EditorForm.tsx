import React, { useRef } from 'react'
import { FileType2, ImagePlus, QrCode, Sparkles, Trash2, Upload } from 'lucide-react'
import type {
  BackMode,
  CardData,
  CoverLogoStyle,
  CustomFontState,
  FontStyleId,
  NameDisplayMode,
  PhotoShape,
  QrMode,
  QrPlacement,
  SloganPreset,
  TemplateId,
  UiLang,
} from '../types/card'
import {
  MEMBER_CATEGORIES,
  SKKU_CAMPUSES,
  SKKU_COLLEGES,
  SKKU_ROLES,
  SLOGAN_TEXTS,
  TEMPLATES,
} from '../data/skkuData'

interface EditorFormProps {
  data: CardData
  uiLang: UiLang
  customFonts: CustomFontState
  photoDataUrl: string | null
  onChange: (patch: Partial<CardData>) => void
  onUploadCustomFont: (slot: 'regular' | 'bold', file: File) => void
  onClearCustomFont: (slot: 'regular' | 'bold') => void
  onUploadPhoto: (file: File) => void
  onClearPhoto: () => void
}

export const EditorForm: React.FC<EditorFormProps> = ({
  data,
  uiLang,
  customFonts,
  photoDataUrl,
  onChange,
  onUploadCustomFont,
  onClearCustomFont,
  onUploadPhoto,
  onClearPhoto,
}) => {
  const ko = uiLang === 'ko'
  const regularFontRef = useRef<HTMLInputElement | null>(null)
  const boldFontRef = useRef<HTMLInputElement | null>(null)
  const photoInputRef = useRef<HTMLInputElement | null>(null)

  const handleSelectTemplate = (tplId: TemplateId) => {
    const meta = TEMPLATES.find((t) => t.id === tplId)
    const patch: Partial<CardData> = { template: tplId }
    if (meta) {
      patch.backMode = meta.defaultBackMode
    }
    if (tplId === 'modern-accent' && data.sloganPreset === 'none') {
      patch.sloganPreset = 'inspiring-future'
    }
    if (tplId === 'skku-blue-cover' || tplId === 'skku-green-cover') {
      if (data.nameDisplayMode === 'ko-hanja') {
        patch.nameDisplayMode = 'ko-en'
      }
    }
    onChange(patch)
  }

  const handleDeptPresetChange = (key: string) => {
    if (key === 'direct') {
      onChange({ deptPresetKey: 'direct' })
      return
    }
    for (const group of SKKU_COLLEGES) {
      const found = group.depts.find((d) => d.key === key)
      if (found) {
        const campusInfo = SKKU_CAMPUSES[found.campus]
        onChange({
          deptPresetKey: key,
          collegeKo: group.collegeKo.split(' · ')[0],
          collegeEn: group.collegeEn.split(' / ')[0],
          deptKo: found.kor,
          deptEn: found.eng,
          campus: found.campus,
          addressBaseKo: campusInfo.addressKo,
          addressBaseEn: campusInfo.addressEn,
        })
        return
      }
    }
  }

  const handleRolePresetChange = (key: string) => {
    if (key === 'direct') {
      onChange({ rolePresetKey: 'direct' })
      return
    }
    const found = SKKU_ROLES.find((r) => r.key === key)
    if (found) {
      onChange({
        rolePresetKey: key,
        roleKo: found.kor,
        roleEn: found.eng,
      })
    }
  }

  const handleCampusSelect = (campus: 'hssc' | 'nsc' | 'custom') => {
    if (campus === 'custom') {
      onChange({ campus: 'custom' })
      return
    }
    const info = SKKU_CAMPUSES[campus]
    onChange({
      campus,
      addressBaseKo: info.addressKo,
      addressBaseEn: info.addressEn,
    })
  }

  const isColoredCover = data.backMode === 'cover-blue' || data.backMode === 'cover-green'

  const filteredRoles =
    data.memberCategory === 'custom'
      ? SKKU_ROLES
      : SKKU_ROLES.filter((r) => r.category === data.memberCategory || r.key === 'none')

  return (
    <div>
      {/* Quick Section Anchor Bar (KAIST-inspired) */}
      <nav className="anchor-nav" aria-label="Section shortcuts">
        <a className="anchor-link" href="#sec-design">
          1. {ko ? '디자인' : 'Design'}
        </a>
        <a className="anchor-link" href="#sec-extras">
          2. {ko ? '뒷면·슬로건·QR' : 'Back/QR'}
        </a>
        <a className="anchor-link" href="#sec-name">
          3. {ko ? '이름' : 'Name'}
        </a>
        <a className="anchor-link" href="#sec-affil">
          4. {ko ? '소속·직위' : 'Affiliation'}
        </a>
        <a className="anchor-link" href="#sec-address">
          5. {ko ? '캠퍼스·주소' : 'Address'}
        </a>
        <a className="anchor-link" href="#sec-contact">
          6. {ko ? '연락처' : 'Contact'}
        </a>
        <a className="anchor-link" href="#sec-font">
          7. {ko ? '서체(지정체)' : 'Fonts'}
        </a>
      </nav>

      {/* 1. Design & Template */}
      <section className="form-section" id="sec-design">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">1</span>
            {ko ? '디자인 템플릿 및 뒷면 구성' : 'Design Template & Back Layout'}
          </h2>
          <span className="section-hint">90 × 50 mm</span>
        </div>

        <div className="template-grid">
          {TEMPLATES.map((tpl) => {
            const active = data.template === tpl.id
            return (
              <button
                key={tpl.id}
                type="button"
                className={`template-card ${active ? 'active' : ''}`}
                onClick={() => handleSelectTemplate(tpl.id)}
              >
                <div className="template-card-top">
                  <span className="template-name">{ko ? tpl.nameKo : tpl.nameEn}</span>
                  <span
                    className="template-badge"
                    style={{ backgroundColor: tpl.accentColor }}
                  >
                    {tpl.badgeKo}
                  </span>
                </div>
                <p className="template-desc">{ko ? tpl.descKo : tpl.descEn}</p>
              </button>
            )
          })}
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label">{ko ? '뒷면 구성 자유 선택' : 'Back Side Style'}</label>
            <div className="seg-group">
              {(
                [
                  { id: 'english', ko: '영문면', en: 'English' },
                  { id: 'cover-blue', ko: '블루 표지', en: 'SKKU Blue' },
                  { id: 'cover-green', ko: '진녹색 표지', en: 'Dark Green' },
                  { id: 'none', ko: '단면(없음)', en: 'Single-sided' },
                ] as { id: BackMode; ko: string; en: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`seg-btn ${
                    data.backMode === opt.id
                      ? opt.id === 'cover-green'
                        ? 'active-green'
                        : 'active'
                      : ''
                  }`}
                  onClick={() => onChange({ backMode: opt.id })}
                >
                  {ko ? opt.ko : opt.en}
                </button>
              ))}
            </div>
          </div>

          <div className="field">
            <label className="field-label">
              {ko ? '미리보기 용지 톤 (인쇄 PDF는 순백)' : 'Preview Paper Tone'}
            </label>
            <div className="seg-group">
              <button
                type="button"
                className={`seg-btn ${data.paperTone === 'white' ? 'active' : ''}`}
                onClick={() => onChange({ paperTone: 'white' })}
              >
                {ko ? '순백색 (White)' : 'Pure White'}
              </button>
              <button
                type="button"
                className={`seg-btn ${data.paperTone === 'ivory' ? 'active' : ''}`}
                onClick={() => onChange({ paperTone: 'ivory' })}
              >
                {ko ? '미색 고급지 (Ivory)' : 'Warm Ivory'}
              </button>
            </div>
          </div>
        </div>

        {isColoredCover && (
          <div className="field" style={{ marginTop: '0.4rem' }}>
            <label className="field-label">
              {ko
                ? '유색 표지 공식 로고 조합 (UI 단색 화이트 규정 자동 적용)'
                : 'Official Cover Logo Combination (Solid White UI Rule)'}
            </label>
            <div className="seg-group">
              {(
                [
                  { id: 'sig-ko-en-v', ko: '국영문 상하조합', en: 'KR/EN Stacked' },
                  { id: 'sig-ko-en-h', ko: '국영문 좌우조합', en: 'KR/EN Horizontal' },
                  { id: 'emblem', ko: '원형 엠블렘', en: 'Circular Emblem' },
                  { id: 'sig-hanja-v', ko: '한영문 상하조합', en: 'Hanja/EN Stacked' },
                  { id: 'sig-en-v', ko: '영문 상하조합', en: 'EN Stacked' },
                ] as { id: CoverLogoStyle; ko: string; en: string }[]
              ).map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  className={`seg-btn ${data.coverLogoStyle === opt.id ? 'active' : ''}`}
                  onClick={() => onChange({ coverLogoStyle: opt.id })}
                >
                  {ko ? opt.ko : opt.en}
                </button>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* 2. Back Lab Name, Slogan & QR */}
      <section className="form-section" id="sec-extras">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">2</span>
            {ko ? '뒷면 연구실명 · 슬로건 · QR코드' : 'Back Lab Name · Slogan · QR Code'}
          </h2>
          <span className="section-hint">
            <Sparkles size={13} style={{ verticalAlign: '-2px' }} /> {ko ? '선택 삽입' : 'Optional'}
          </span>
        </div>

        {isColoredCover && (
          <div className="field">
            <label className="field-label" htmlFor="labName">
              {ko ? '표지 하단 연구실 / 소속 기관명 (최대 2줄 · 공란 시 숨김)' : 'Lab / Organization Name on Cover (up to 2 lines)'}
            </label>
            <textarea
              id="labName"
              className="textarea"
              rows={2}
              placeholder={ko ? '예: SKKU AI & DATA LAB (출력을 원치 않으면 비워두세요)' : 'e.g. SKKU AI & DATA LAB (leave blank to hide)'}
              value={data.labName}
              onChange={(e) => onChange({ labName: e.target.value })}
            />
          </div>
        )}

        <div className="field">
          <label className="field-label" htmlFor="sloganPreset">
            {ko ? '성균관대학교 슬로건 선택' : 'SKKU Slogan'}
          </label>
          <select
            id="sloganPreset"
            className="select"
            value={data.sloganPreset}
            onChange={(e) => onChange({ sloganPreset: e.target.value as SloganPreset })}
          >
            <option value="none">{ko ? '표시 안함' : 'None'}</option>
            <option value="inspiring-future">{SLOGAN_TEXTS['inspiring-future'].labelKo}</option>
            <option value="unique-origin">{SLOGAN_TEXTS['unique-origin'].labelKo}</option>
            <option value="brand-statement-ko">{SLOGAN_TEXTS['brand-statement-ko'].labelKo}</option>
            <option value="custom">{ko ? '직접입력 (최대 2줄)' : 'Custom (up to 2 lines)'}</option>
          </select>
        </div>

        {data.sloganPreset === 'custom' && (
          <div className="field">
            <textarea
              className="textarea"
              rows={2}
              placeholder={ko ? '슬로건 문구를 입력하세요 (줄바꿈으로 최대 2줄)' : 'Enter custom slogan (up to 2 lines)'}
              value={data.customSlogan}
              onChange={(e) => onChange({ customSlogan: e.target.value })}
            />
          </div>
        )}

        {isColoredCover && data.sloganPreset !== 'none' && (
          <div className="field">
            <label className="check-row">
              <input
                type="checkbox"
                checked={data.showSloganOnCover}
                onChange={(e) => onChange({ showSloganOnCover: e.target.checked })}
              />
              {ko ? '유색 표지 뒷면 하단에 슬로건 함께 표시' : 'Show slogan on colored cover back'}
            </label>
          </div>
        )}

        <div
          style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed var(--border-subtle)',
          }}
        >
          <div className="field-grid">
            <div className="field">
              <label className="field-label">
                <span>
                  <QrCode size={13} style={{ verticalAlign: '-2px', marginRight: 4 }} />
                  {ko ? 'QR코드 삽입' : 'QR Code'}
                </span>
              </label>
              <div className="seg-group">
                {(
                  [
                    { id: 'none', ko: '표시 안함', en: 'Off' },
                    { id: 'url', ko: '웹주소(URL)', en: 'URL' },
                    { id: 'vcard', ko: '연락처 자동저장(vCard)', en: 'vCard' },
                  ] as { id: QrMode; ko: string; en: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`seg-btn ${data.qrMode === opt.id ? 'active' : ''}`}
                    onClick={() => onChange({ qrMode: opt.id })}
                  >
                    {ko ? opt.ko : opt.en}
                  </button>
                ))}
              </div>
            </div>

            {data.qrMode !== 'none' && (
              <div className="field">
                <label className="field-label">{ko ? 'QR코드 배치 면' : 'QR Placement'}</label>
                <div className="seg-group">
                  {(
                    [
                      { id: 'front', ko: '앞면 우측 하단', en: 'Front' },
                      { id: 'back', ko: '뒷면 우측 하단', en: 'Back' },
                    ] as { id: QrPlacement; ko: string; en: string }[]
                  ).map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      className={`seg-btn ${data.qrPlacement === opt.id ? 'active' : ''}`}
                      onClick={() => onChange({ qrPlacement: opt.id })}
                      disabled={opt.id === 'back' && data.backMode === 'none'}
                    >
                      {ko ? opt.ko : opt.en}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {data.qrMode === 'url' && (
            <div className="field">
              <label className="field-label" htmlFor="qrUrl">
                {ko ? 'QR코드 연결 URL (홈페이지·연구실·Google Scholar·ORCID 등)' : 'QR Target URL'}
              </label>
              <input
                id="qrUrl"
                type="url"
                className="input"
                placeholder="https://www.skku.edu"
                value={data.qrUrl}
                onChange={(e) => onChange({ qrUrl: e.target.value })}
              />
            </div>
          )}
        </div>

        {/* Profile Photo (Default Off) */}
        <div
          style={{
            marginTop: '0.85rem',
            paddingTop: '0.85rem',
            borderTop: '1px dashed var(--border-subtle)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem' }}>
            <label className="check-row">
              <input
                type="checkbox"
                checked={data.showPhoto}
                onChange={(e) => onChange({ showPhoto: e.target.checked })}
              />
              <ImagePlus size={14} style={{ color: 'var(--skku-blue)' }} />
              {ko ? '명함에 프로필 사진 넣기 (기본값: 꺼짐)' : 'Include Profile Photo (Default: Off)'}
            </label>

            {data.showPhoto && (
              <div className="seg-group">
                {(
                  [
                    { id: 'rounded', ko: '둥근 사각 (3:4)', en: 'Rounded (3:4)' },
                    { id: 'circle', ko: '원형 (1:1)', en: 'Circle (1:1)' },
                  ] as { id: PhotoShape; ko: string; en: string }[]
                ).map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    className={`seg-btn btn-small ${data.photoShape === opt.id ? 'active' : ''}`}
                    onClick={() => onChange({ photoShape: opt.id })}
                  >
                    {ko ? opt.ko : opt.en}
                  </button>
                ))}
              </div>
            )}
          </div>

          {data.showPhoto && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline btn-small"
                onClick={() => photoInputRef.current?.click()}
              >
                <Upload size={13} />
                {photoDataUrl
                  ? ko
                    ? '사진 변경하기'
                    : 'Change Photo'
                  : ko
                  ? '사진 파일 선택 (JPG/PNG)'
                  : 'Select Photo (JPG/PNG)'}
              </button>
              <input
                ref={photoInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUploadPhoto(f)
                  e.target.value = ''
                }}
              />
              {photoDataUrl && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <img
                    src={photoDataUrl}
                    alt="Profile preview"
                    style={{ height: 34, width: 'auto', borderRadius: 4, border: '1px solid var(--border-subtle)' }}
                  />
                  <button
                    type="button"
                    className="btn-outline btn-small"
                    onClick={onClearPhoto}
                    title={ko ? '사진 제거' : 'Remove photo'}
                  >
                    <Trash2 size={13} />
                    {ko ? '제거' : 'Remove'}
                  </button>
                </div>
              )}
              <span style={{ fontSize: '0.73rem', color: 'var(--text-muted)' }}>
                {ko
                  ? '중앙 자동 크롭 · 서버 전송 없이 브라우저에서만 처리됩니다.'
                  : 'Auto center-cropped locally in your browser.'}
              </span>
            </div>
          )}
        </div>
      </section>

      {/* 3. Name */}
      <section className="form-section" id="sec-name">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">3</span>
            {ko ? '이름 표기' : 'Name'}
          </h2>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.koreanNameSpaced}
              onChange={(e) => onChange({ koreanNameSpaced: e.target.checked })}
            />
            {ko ? '한글·한문 자간 띄우기 (홍 길 동)' : 'Wide spacing (홍 길 동)'}
          </label>
        </div>

        <div className="field">
          <label className="field-label">{ko ? '앞면 이름 표기 방식' : 'Front Name Format'}</label>
          <div className="seg-group">
            {(
              [
                { id: 'ko-hanja', ko: '국문 (한문) — 공식 샘플형', en: 'KR (Hanja)' },
                { id: 'ko-en', ko: '국문 | 영문 병기', en: 'KR | EN' },
                { id: 'ko-only', ko: '국문만 출력', en: 'Korean Only' },
                { id: 'en-only', ko: '영문만 출력', en: 'English Only' },
              ] as { id: NameDisplayMode; ko: string; en: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`seg-btn ${data.nameDisplayMode === opt.id ? 'active' : ''}`}
                onClick={() => onChange({ nameDisplayMode: opt.id })}
              >
                {ko ? opt.ko : opt.en}
              </button>
            ))}
          </div>
        </div>

        <div className="field-grid-3">
          <div className="field">
            <label className="field-label" htmlFor="nameKo">
              {ko ? '한글 이름' : 'Korean Name'}
            </label>
            <input
              id="nameKo"
              type="text"
              className="input"
              placeholder="홍길동"
              value={data.nameKo}
              onChange={(e) => onChange({ nameKo: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="nameHanja">
              {ko ? '한문 이름 (선택)' : 'Hanja Name (Optional)'}
            </label>
            <input
              id="nameHanja"
              type="text"
              className="input"
              placeholder="洪吉童"
              value={data.nameHanja}
              onChange={(e) => onChange({ nameHanja: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="nameEn">
              {ko ? '영문 이름' : 'English Name'}
            </label>
            <input
              id="nameEn"
              type="text"
              className="input"
              placeholder="Hong, Gil Dong"
              value={data.nameEn}
              onChange={(e) => onChange({ nameEn: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* 4. Member, Department & Role */}
      <section className="form-section" id="sec-affil">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">4</span>
            {ko ? '구성원 유형 · 소속 · 직위/학위과정' : 'Member Type · Department · Role'}
          </h2>
          <div className="seg-group">
            {(
              [
                { id: 'ko-en', ko: '국영 병기', en: 'KR+EN' },
                { id: 'ko-only', ko: '국문만', en: 'KR' },
                { id: 'en-only', ko: '영문만', en: 'EN' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`seg-btn btn-small ${
                  data.affiliationLangMode === opt.id ? 'active' : ''
                }`}
                onClick={() => onChange({ affiliationLangMode: opt.id })}
              >
                {ko ? opt.ko : opt.en}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <label className="field-label">{ko ? '구성원 구분' : 'Member Category'}</label>
          <div className="seg-group">
            {MEMBER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                className={`seg-btn ${data.memberCategory === cat.id ? 'active' : ''}`}
                onClick={() => onChange({ memberCategory: cat.id })}
              >
                {ko ? cat.labelKo : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="deptPreset">
              {ko ? '학과 / 부서 프리셋 선택' : 'Department Preset'}
            </label>
            <select
              id="deptPreset"
              className="select"
              value={data.deptPresetKey}
              onChange={(e) => handleDeptPresetChange(e.target.value)}
            >
              <option value="direct">{ko ? '직접입력' : 'Direct input'}</option>
              {SKKU_COLLEGES.map((group) => (
                <optgroup
                  key={group.collegeKo}
                  label={`${group.collegeKo} (${group.collegeEn})`}
                >
                  {group.depts.map((d) => (
                    <option key={d.key} value={d.key}>
                      {d.kor} ({d.eng})
                    </option>
                  ))}
                </optgroup>
              ))}
            </select>
          </div>

          <div className="field">
            <label className="field-label" htmlFor="rolePreset">
              {ko ? '직위 / 학위과정 선택' : 'Role / Degree Course'}
            </label>
            <select
              id="rolePreset"
              className="select"
              value={data.rolePresetKey}
              onChange={(e) => handleRolePresetChange(e.target.value)}
            >
              <option value="direct">{ko ? '직접입력' : 'Direct input'}</option>
              {filteredRoles.map((r) => (
                <option key={r.key} value={r.key}>
                  {r.key === 'none'
                    ? ko
                      ? '직위/과정 출력 안함'
                      : 'Do not print role'
                    : `${r.kor} (${r.eng})`}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="collegeKo">
              {ko ? '단과대학 / 대학원명 (국문 · 공란 가능)' : 'College / School (KR, optional)'}
            </label>
            <input
              id="collegeKo"
              type="text"
              className="input"
              placeholder="문과대학"
              value={data.collegeKo}
              onChange={(e) => onChange({ collegeKo: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="deptKo">
              {ko ? '학과 / 부서명 (국문)' : 'Department (KR)'}
            </label>
            <input
              id="deptKo"
              type="text"
              className="input"
              placeholder="국어국문학과"
              value={data.deptKo}
              onChange={(e) => onChange({ deptKo: e.target.value, deptPresetKey: 'direct' })}
            />
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="deptEn">
              {ko ? '학과 / 부서명 (영문)' : 'Department (EN)'}
            </label>
            <input
              id="deptEn"
              type="text"
              className="input"
              placeholder="Dept. of Korean Language & Literature"
              value={data.deptEn}
              onChange={(e) => onChange({ deptEn: e.target.value, deptPresetKey: 'direct' })}
            />
          </div>
          <div className="field-grid" style={{ gap: '0.5rem' }}>
            <div className="field">
              <label className="field-label" htmlFor="roleKo">
                {ko ? '직위/과정 (국문)' : 'Role (KR)'}
              </label>
              <input
                id="roleKo"
                type="text"
                className="input"
                placeholder="조교수"
                value={data.roleKo}
                onChange={(e) => onChange({ roleKo: e.target.value, rolePresetKey: 'direct' })}
              />
            </div>
            <div className="field">
              <label className="field-label" htmlFor="roleEn">
                {ko ? '직위/과정 (영문)' : 'Role (EN)'}
              </label>
              <input
                id="roleEn"
                type="text"
                className="input"
                placeholder="Assistant Professor"
                value={data.roleEn}
                onChange={(e) => onChange({ roleEn: e.target.value, rolePresetKey: 'direct' })}
              />
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: '0.6rem',
            paddingTop: '0.6rem',
            borderTop: '1px dashed var(--border-subtle)',
          }}
        >
          <label className="check-row" style={{ marginBottom: data.showExtraLine ? '0.6rem' : 0 }}>
            <input
              type="checkbox"
              checked={data.showExtraLine}
              onChange={(e) => onChange({ showExtraLine: e.target.checked })}
            />
            {ko
              ? '추가 직함 / 학위 / 연구실 소개 줄 표시 (예: 문학평론가 / 문학박사)'
              : 'Show extra title / degree / lab line'}
          </label>

          {data.showExtraLine && (
            <div className="field-grid">
              <div className="field">
                <label className="field-label" htmlFor="extraKo">
                  {ko ? '추가 소개 (국문)' : 'Extra Line (KR)'}
                </label>
                <input
                  id="extraKo"
                  type="text"
                  className="input"
                  placeholder="예: 문학평론가 / 문학박사"
                  value={data.extraLineKo}
                  onChange={(e) => onChange({ extraLineKo: e.target.value })}
                />
              </div>
              <div className="field">
                <label className="field-label" htmlFor="extraEn">
                  {ko ? '추가 소개 (영문)' : 'Extra Line (EN)'}
                </label>
                <input
                  id="extraEn"
                  type="text"
                  className="input"
                  placeholder="e.g. Ph.D. in Literature"
                  value={data.extraLineEn}
                  onChange={(e) => onChange({ extraLineEn: e.target.value })}
                />
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 5. Campus & Address */}
      <section className="form-section" id="sec-address">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">5</span>
            {ko ? '캠퍼스 및 주소' : 'Campus & Address'}
          </h2>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.useEnglishAddressOnFront}
              onChange={(e) => onChange({ useEnglishAddressOnFront: e.target.checked })}
            />
            {ko ? '앞면도 영문 주소 출력' : 'English address on front'}
          </label>
        </div>

        <div className="field">
          <label className="field-label">{ko ? '캠퍼스 빠른 선택' : 'Campus Preset'}</label>
          <div className="seg-group">
            <button
              type="button"
              className={`seg-btn ${data.campus === 'hssc' ? 'active' : ''}`}
              onClick={() => handleCampusSelect('hssc')}
            >
              {ko ? '인문사회과학캠퍼스 (서울·명륜)' : 'HSSC (Seoul)'}
            </button>
            <button
              type="button"
              className={`seg-btn ${data.campus === 'nsc' ? 'active-green' : ''}`}
              onClick={() => handleCampusSelect('nsc')}
            >
              {ko ? '자연과학캠퍼스 (수원·율전)' : 'NSC (Suwon)'}
            </button>
            <button
              type="button"
              className={`seg-btn ${data.campus === 'custom' ? 'active' : ''}`}
              onClick={() => handleCampusSelect('custom')}
            >
              {ko ? '캠퍼스명 숨김 / 직접입력' : 'Custom / Hide Campus'}
            </button>
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="addrDetailKo">
              {ko ? '상세 위치 / 연구실·호실 (국문)' : 'Building / Room (KR)'}
            </label>
            <input
              id="addrDetailKo"
              type="text"
              className="input"
              placeholder="교수회관 410호"
              value={data.addressDetailKo}
              onChange={(e) => onChange({ addressDetailKo: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="addrDetailEn">
              {ko ? '상세 위치 / 연구실·호실 (영문)' : 'Building / Room (EN)'}
            </label>
            <input
              id="addrDetailEn"
              type="text"
              className="input"
              placeholder="Faculty Hall #410"
              value={data.addressDetailEn}
              onChange={(e) => onChange({ addressDetailEn: e.target.value })}
            />
          </div>
        </div>

        <div className="field-grid">
          <div className="field">
            <label className="field-label" htmlFor="addrBaseKo">
              {ko ? '도로명 주소 (국문 · 자유 수정 가능)' : 'Street Address (KR)'}
            </label>
            <input
              id="addrBaseKo"
              type="text"
              className="input"
              value={data.addressBaseKo}
              onChange={(e) => onChange({ addressBaseKo: e.target.value })}
            />
          </div>
          <div className="field">
            <label className="field-label" htmlFor="addrBaseEn">
              {ko ? '도로명 주소 (영문 · 자유 수정 가능)' : 'Street Address (EN)'}
            </label>
            <input
              id="addrBaseEn"
              type="text"
              className="input"
              value={data.addressBaseEn}
              onChange={(e) => onChange({ addressBaseEn: e.target.value })}
            />
          </div>
        </div>

        <label className="check-row" style={{ marginTop: '0.25rem' }}>
          <input
            type="checkbox"
            checked={data.showInstitutionLine}
            onChange={(e) => onChange({ showInstitutionLine: e.target.checked })}
          />
          {ko ? '하단 공식 성균관대학교 로고타입 / 교명 줄 표시' : 'Show official SKKU logotype/institution line'}
        </label>
      </section>

      {/* 6. Contacts */}
      <section className="form-section" id="sec-contact">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">6</span>
            {ko ? '연락처 (원하는 항목만 선택 출력)' : 'Contact Details (Toggleable)'}
          </h2>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.autoIntlPhoneOnEn}
              onChange={(e) => onChange({ autoIntlPhoneOnEn: e.target.checked })}
            />
            {ko ? '영문면 +82 국제번호 자동 변환' : 'Auto +82 on English side'}
          </label>
        </div>

        <div className={`contact-row ${!data.showTel ? 'disabled' : ''}`}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.showTel}
              onChange={(e) => onChange({ showTel: e.target.checked })}
            />
            Tel ({ko ? '전화' : 'Office'})
          </label>
          <input
            type="tel"
            inputMode="tel"
            className="input"
            placeholder="02-760-0100"
            value={data.tel}
            disabled={!data.showTel}
            onChange={(e) => onChange({ tel: e.target.value })}
          />
        </div>

        <div className={`contact-row ${!data.showMobile ? 'disabled' : ''}`}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.showMobile}
              onChange={(e) => onChange({ showMobile: e.target.checked })}
            />
            Mobile ({ko ? '휴대폰' : 'Cell'})
          </label>
          <input
            type="tel"
            inputMode="tel"
            className="input"
            placeholder="010-1234-5678"
            value={data.mobile}
            disabled={!data.showMobile}
            onChange={(e) => onChange({ mobile: e.target.value })}
          />
        </div>

        <div className={`contact-row ${!data.showEmail ? 'disabled' : ''}`}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.showEmail}
              onChange={(e) => onChange({ showEmail: e.target.checked })}
            />
            E-mail
          </label>
          <input
            type="email"
            className="input"
            placeholder="hong@skku.edu"
            value={data.email}
            disabled={!data.showEmail}
            onChange={(e) => onChange({ email: e.target.value })}
          />
        </div>

        <div className={`contact-row ${!data.showFax ? 'disabled' : ''}`}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.showFax}
              onChange={(e) => onChange({ showFax: e.target.checked })}
            />
            Fax
          </label>
          <input
            type="tel"
            inputMode="tel"
            className="input"
            placeholder="02-760-0101"
            value={data.fax}
            disabled={!data.showFax}
            onChange={(e) => onChange({ fax: e.target.value })}
          />
        </div>

        <div className={`contact-row ${!data.showWeb ? 'disabled' : ''}`}>
          <label className="check-row">
            <input
              type="checkbox"
              checked={data.showWeb}
              onChange={(e) => onChange({ showWeb: e.target.checked })}
            />
            Web / Link
          </label>
          <input
            type="url"
            inputMode="url"
            className="input"
            placeholder="https://www.skku.edu"
            value={data.web}
            disabled={!data.showWeb}
            onChange={(e) => onChange({ web: e.target.value })}
          />
        </div>
      </section>

      {/* 7. Typography & Local Official Font Upload */}
      <section className="form-section" id="sec-font">
        <div className="section-header">
          <h2 className="section-title">
            <span className="section-num">7</span>
            {ko ? '서체 선택 및 로컬 지정서체 불러오기' : 'Typography & Local Official Font'}
          </h2>
          <span className="section-hint">
            <FileType2 size={13} style={{ verticalAlign: '-2px' }} /> TTF / OTF
          </span>
        </div>

        <div className="field">
          <label className="field-label">{ko ? '명함 본문 서체 선택' : 'Card Body Font'}</label>
          <div className="seg-group">
            {(
              [
                { id: 'gothic', ko: '고딕형 (Pretendard — 윤고딕/Frutiger 대체)', en: 'Gothic (Pretendard)' },
                { id: 'serif', ko: '명조형 (고운바탕 — 윤명조/Palatino 대체)', en: 'Serif (Gowun Batang)' },
                { id: 'custom', ko: '내 컴퓨터 공식 지정서체 직접 적용', en: 'My Local Font (.ttf/.otf)' },
              ] as { id: FontStyleId; ko: string; en: string }[]
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                className={`seg-btn ${data.fontStyle === opt.id ? 'active' : ''}`}
                onClick={() => onChange({ fontStyle: opt.id })}
              >
                {ko ? opt.ko : opt.en}
              </button>
            ))}
          </div>
        </div>

        <div className="font-upload-box">
          <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--skku-blue)' }}>
            {ko
              ? '개인 보유 공식 지정서체(윤고딕·윤명조·Frutiger·Palatino 등) 로컬 적용'
              : 'Load Local Official Fonts (.ttf / .otf)'}
          </div>
          <p style={{ margin: '0.25rem 0 0.6rem', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
            {ko
              ? '불러온 폰트 파일은 외부 서버에 업로드되지 않으며 브라우저 메모리에서만 미리보기 및 PDF 임베딩에 사용됩니다.'
              : 'Font files stay 100% in browser memory and are embedded directly into your exported PDF.'}
          </p>

          <div className="font-upload-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline btn-small"
                onClick={() => regularFontRef.current?.click()}
              >
                <Upload size={13} />
                {ko ? '기본 서체(Regular) 선택' : 'Select Regular Font'}
              </button>
              <input
                ref={regularFontRef}
                type="file"
                accept=".ttf,.otf,font/ttf,font/otf,application/octet-stream"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUploadCustomFont('regular', f)
                  e.target.value = ''
                }}
              />
              {customFonts.regular && (
                <span className="font-file-pill">
                  {customFonts.regular.name}
                  <button
                    type="button"
                    onClick={() => onClearCustomFont('regular')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      color: 'inherit',
                    }}
                    title={ko ? '제거' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              )}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="btn-outline btn-small"
                onClick={() => boldFontRef.current?.click()}
              >
                <Upload size={13} />
                {ko ? '굵은 서체(Bold · 선택)' : 'Select Bold Font (Optional)'}
              </button>
              <input
                ref={boldFontRef}
                type="file"
                accept=".ttf,.otf,font/ttf,font/otf,application/octet-stream"
                style={{ display: 'none' }}
                onChange={(e) => {
                  const f = e.target.files?.[0]
                  if (f) onUploadCustomFont('bold', f)
                  e.target.value = ''
                }}
              />
              {customFonts.bold && (
                <span className="font-file-pill">
                  {customFonts.bold.name}
                  <button
                    type="button"
                    onClick={() => onClearCustomFont('bold')}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      cursor: 'pointer',
                      padding: 0,
                      display: 'inline-flex',
                      color: 'inherit',
                    }}
                    title={ko ? '제거' : 'Remove'}
                  >
                    <Trash2 size={13} />
                  </button>
                </span>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
