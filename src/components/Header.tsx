import React, { useRef } from 'react'
import { Download, Globe, RotateCcw, ShieldCheck, Upload } from 'lucide-react'
import type { CardData, UiLang } from '../types/card'
import { SAMPLE_PRESETS } from '../data/skkuData'

interface HeaderProps {
  uiLang: UiLang
  onToggleUiLang: () => void
  onApplyPreset: (data: CardData) => void
  onReset: () => void
  onExportJson: () => void
  onImportJson: (file: File) => void
}

export const Header: React.FC<HeaderProps> = ({
  uiLang,
  onToggleUiLang,
  onApplyPreset,
  onReset,
  onExportJson,
  onImportJson,
}) => {
  const fileRef = useRef<HTMLInputElement | null>(null)
  const ko = uiLang === 'ko'

  return (
    <>
      <div className="skku-ribbon" />
      <header className="skku-header">
        <div className="skku-header-inner">
          <div className="header-brand">
            <img
              src="./assets/skku/signature-ko-en-white.png"
              alt="성균관대학교 SUNG KYUN KWAN UNIVERSITY"
              className="header-logo-img"
            />
            <div className="header-divider" />
            <div className="header-title-group">
              <h1 className="header-title">
                {ko ? '성균관대학교 명함 제작 시스템' : 'SKKU Business Card Studio'}
              </h1>
              <div className="header-subtitle">
                <span>
                  {ko ? '공식 UI 엠블렘·시그니처·지정 색채 준수' : 'Official SKKU UI & Color Compliant'}
                </span>
                <span className="header-badge">1398 · Free</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button type="button" className="btn-header" onClick={onToggleUiLang}>
              <Globe size={15} />
              {ko ? 'EN' : '한국어'}
            </button>
            <button type="button" className="btn-header" onClick={onExportJson}>
              <Download size={15} />
              {ko ? '설정 저장' : 'Save JSON'}
            </button>
            <button
              type="button"
              className="btn-header"
              onClick={() => fileRef.current?.click()}
            >
              <Upload size={15} />
              {ko ? '불러오기' : 'Load JSON'}
            </button>
            <input
              ref={fileRef}
              type="file"
              accept="application/json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) onImportJson(file)
                e.target.value = ''
              }}
            />
            <button type="button" className="btn-header" onClick={onReset}>
              <RotateCcw size={15} />
              {ko ? '초기화' : 'Reset'}
            </button>
          </div>
        </div>
      </header>

      <div className="preset-bar">
        <div className="preset-bar-inner">
          <div className="preset-group">
            <span className="preset-label">{ko ? '구성원 샘플 불러오기:' : 'Quick Samples:'}</span>
            {Object.entries(SAMPLE_PRESETS).map(([key, preset]) => (
              <button
                key={key}
                type="button"
                className="preset-pill"
                onClick={() => onApplyPreset(preset.data)}
              >
                {ko ? preset.labelKo : preset.labelEn}
              </button>
            ))}
          </div>
          <div className="zero-token-chip">
            <ShieldCheck size={14} />
            {ko
              ? '토큰 소모 0원 · 100% 브라우저 로컬 생성 · 개인정보 외부 전송 없음'
              : 'Zero Tokens · 100% Local Browser Rendering · Privacy Safe'}
          </div>
        </div>
      </div>
    </>
  )
}
