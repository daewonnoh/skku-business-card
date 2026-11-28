import React, { useEffect, useState } from 'react'
import { CheckCircle2 } from 'lucide-react'
import type { CardData, CustomFontState, UiLang } from './types/card'
import { DEFAULT_CARD_DATA } from './data/skkuData'
import { processProfilePhoto } from './utils/photo'
import { Header } from './components/Header'
import { EditorForm } from './components/EditorForm'
import { PreviewPanel } from './components/PreviewPanel'
import { Footer } from './components/Footer'

const STORAGE_KEY = 'skku-business-card-studio-v1'

function loadInitialData(): CardData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_CARD_DATA
    const parsed = JSON.parse(raw) as Partial<CardData>
    return { ...DEFAULT_CARD_DATA, ...parsed }
  } catch {
    return DEFAULT_CARD_DATA
  }
}

export const App: React.FC = () => {
  const [data, setData] = useState<CardData>(loadInitialData)
  const [uiLang, setUiLang] = useState<UiLang>('ko')
  const [customFonts, setCustomFonts] = useState<CustomFontState>({
    regular: null,
    bold: null,
  })
  const [photoFile, setPhotoFile] = useState<File | null>(null)
  const [photoDataUrl, setPhotoDataUrl] = useState<string | null>(null)
  const [toast, setToast] = useState<string | null>(null)
  const [mobileTab, setMobileTab] = useState<'edit' | 'preview'>('edit')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch {
      // ignore quota errors
    }
  }, [data])

  const notify = (msg: string) => {
    setToast(msg)
    window.clearTimeout((window as unknown as { __skkuToast?: number }).__skkuToast)
    ;(window as unknown as { __skkuToast?: number }).__skkuToast = window.setTimeout(() => {
      setToast(null)
    }, 3200)
  }

  const handlePatch = (patch: Partial<CardData>) => {
    setData((prev) => {
      const next = { ...prev, ...patch }
      if (patch.photoShape && patch.photoShape !== prev.photoShape && photoFile) {
        processProfilePhoto(photoFile, patch.photoShape)
          .then((res) => setPhotoDataUrl(res.dataUrl))
          .catch(() => {})
      }
      return next
    })
  }

  const handleUploadPhoto = async (file: File) => {
    try {
      const res = await processProfilePhoto(file, data.photoShape)
      setPhotoFile(file)
      setPhotoDataUrl(res.dataUrl)
      setData((prev) => ({ ...prev, showPhoto: true }))
      if (res.origWidth < 300 || res.origHeight < 300) {
        notify(
          uiLang === 'ko'
            ? '사진이 적용되었습니다. (참고: 해상도가 낮아 인쇄 시 흐릴 수 있습니다.)'
            : 'Photo applied (low resolution warning).'
        )
      } else {
        notify(uiLang === 'ko' ? '프로필 사진이 적용되었습니다.' : 'Profile photo applied.')
      }
    } catch {
      notify(uiLang === 'ko' ? '사진 파일을 읽지 못했습니다.' : 'Failed to load photo.')
    }
  }

  const handleClearPhoto = () => {
    setPhotoFile(null)
    setPhotoDataUrl(null)
  }

  const handleApplyPreset = (presetData: CardData) => {
    setData({ ...presetData })
    notify(uiLang === 'ko' ? '샘플 설정이 적용되었습니다.' : 'Sample preset applied.')
  }

  const handleReset = () => {
    setData(DEFAULT_CARD_DATA)
    localStorage.removeItem(STORAGE_KEY)
    notify(uiLang === 'ko' ? '기본 설정으로 초기화되었습니다.' : 'Reset to default.')
  }

  const handleExportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `skku-card-config-${data.nameKo || 'member'}.json`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 3000)
    notify(uiLang === 'ko' ? '설정 JSON 파일이 저장되었습니다.' : 'Configuration JSON saved.')
  }

  const handleImportJson = async (file: File) => {
    try {
      const text = await file.text()
      const parsed = JSON.parse(text) as Partial<CardData>
      setData({ ...DEFAULT_CARD_DATA, ...parsed })
      notify(uiLang === 'ko' ? '저장된 설정을 불러왔습니다.' : 'Configuration loaded.')
    } catch {
      notify(uiLang === 'ko' ? '올바른 JSON 설정 파일이 아닙니다.' : 'Invalid JSON file.')
    }
  }

  const handleUploadCustomFont = async (slot: 'regular' | 'bold', file: File) => {
    try {
      const bytes = await file.arrayBuffer()
      const family = 'SKKUCustomUserFont'
      const weight = slot === 'bold' ? '700' : '400'
      const face = new FontFace(family, bytes.slice(0), { weight })
      await face.load()
      document.fonts.add(face)

      setCustomFonts((prev) => ({
        ...prev,
        [slot]: { name: file.name, family, bytes },
      }))
      setData((prev) => ({ ...prev, fontStyle: 'custom' }))
      notify(
        uiLang === 'ko'
          ? `로컬 서체 "${file.name}"가 적용되었습니다.`
          : `Loaded local font "${file.name}".`
      )
    } catch (err) {
      console.error(err)
      notify(
        uiLang === 'ko'
          ? '폰트 파일을 읽지 못했습니다. 유효한 .ttf 또는 .otf 파일인지 확인하세요.'
          : 'Failed to load font. Please use a valid .ttf or .otf file.'
      )
    }
  }

  const handleClearCustomFont = (slot: 'regular' | 'bold') => {
    setCustomFonts((prev) => {
      const next = { ...prev, [slot]: null }
      if (!next.regular && !next.bold) {
        setData((d) => (d.fontStyle === 'custom' ? { ...d, fontStyle: 'gothic' } : d))
      }
      return next
    })
  }

  return (
    <div className="app-root">
      <Header
        uiLang={uiLang}
        onToggleUiLang={() => setUiLang((l) => (l === 'ko' ? 'en' : 'ko'))}
        onApplyPreset={handleApplyPreset}
        onReset={handleReset}
        onExportJson={handleExportJson}
        onImportJson={handleImportJson}
      />

      <div className="mobile-tab-bar" role="tablist" aria-label="Mobile view switcher">
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'edit'}
          className={`mobile-tab-btn ${mobileTab === 'edit' ? 'active' : ''}`}
          onClick={() => setMobileTab('edit')}
        >
          {uiLang === 'ko' ? '디자인 · 정보 입력' : 'Edit & Design'}
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mobileTab === 'preview'}
          className={`mobile-tab-btn ${mobileTab === 'preview' ? 'active' : ''}`}
          onClick={() => setMobileTab('preview')}
        >
          {uiLang === 'ko' ? '미리보기 · 다운로드' : 'Preview & Export'}
        </button>
      </div>

      <main className="workspace" data-mobile-tab={mobileTab}>
        <div className="editor-column">
          <EditorForm
            data={data}
            uiLang={uiLang}
            customFonts={customFonts}
            photoDataUrl={photoDataUrl}
            onChange={handlePatch}
            onUploadCustomFont={handleUploadCustomFont}
            onClearCustomFont={handleClearCustomFont}
            onUploadPhoto={handleUploadPhoto}
            onClearPhoto={handleClearPhoto}
          />
        </div>

        <PreviewPanel
          data={data}
          uiLang={uiLang}
          customFonts={customFonts}
          photoDataUrl={photoDataUrl}
          onNotify={notify}
        />
      </main>

      <Footer uiLang={uiLang} />

      {toast && (
        <div className="toast" role="status" aria-live="polite">
          <CheckCircle2 size={16} color="#8DC63F" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  )
}

export default App
