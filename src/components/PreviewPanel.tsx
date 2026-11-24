import React, { useMemo, useState } from 'react'
import { Download, Eye, FileDown, ImageDown, Info, Palette, Scissors } from 'lucide-react'
import type { CardData, CustomFontState, UiLang } from '../types/card'
import { SKKU_COLORS } from '../data/skkuData'
import { buildBackLayout, buildFrontLayout } from '../utils/cardLayout'
import { exportCardPdf, exportSidePng } from '../utils/exportCard'
import { CardSvg } from './CardSvg'

interface PreviewPanelProps {
  data: CardData
  uiLang: UiLang
  customFonts: CustomFontState
  photoDataUrl: string | null
  onNotify: (msg: string) => void
}

type ViewMode = 'both' | 'front' | 'back'

export const PreviewPanel: React.FC<PreviewPanelProps> = ({
  data,
  uiLang,
  customFonts,
  photoDataUrl,
  onNotify,
}) => {
  const ko = uiLang === 'ko'
  const [viewMode, setViewMode] = useState<ViewMode>('both')
  const [showGuides, setShowGuides] = useState<boolean>(false)
  const [exporting, setExporting] = useState<string | null>(null)

  const frontLayout = useMemo(() => buildFrontLayout(data, false), [data])
  const backLayout = useMemo(() => buildBackLayout(data, false), [data])

  const effectiveView: ViewMode = !backLayout && viewMode === 'back' ? 'front' : viewMode

  const handleExportPdf = async (withBleed: boolean) => {
    const key = withBleed ? 'pdf-bleed' : 'pdf-std'
    setExporting(key)
    try {
      await exportCardPdf(data, customFonts, { withBleed, photoDataUrl })
      onNotify(
        ko
          ? withBleed
            ? '인쇄소용 도련 포함 PDF(94×54mm)가 다운로드되었습니다.'
            : '표준 명함 PDF(90×50mm)가 다운로드되었습니다.'
          : 'PDF downloaded successfully.'
      )
    } catch (err) {
      console.error(err)
      onNotify(ko ? 'PDF 생성 중 오류가 발생했습니다.' : 'Failed to generate PDF.')
    } finally {
      setExporting(null)
    }
  }

  const handleExportPng = async (side: 'front' | 'back') => {
    const key = `png-${side}`
    setExporting(key)
    try {
      await exportSidePng(data, customFonts, side, photoDataUrl)
      onNotify(
        ko
          ? `${side === 'front' ? '앞면' : '뒷면'} 고해상도 PNG(600 DPI)가 다운로드되었습니다.`
          : '600 DPI PNG downloaded.'
      )
    } catch (err) {
      console.error(err)
      onNotify(ko ? 'PNG 생성 중 오류가 발생했습니다.' : 'Failed to generate PNG.')
    } finally {
      setExporting(null)
    }
  }

  return (
    <aside className="preview-sticky">
      <div className="preview-card-shell">
        <div className="preview-toolbar">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
            <Eye size={17} color="#072A60" />
            <strong style={{ fontSize: '0.95rem', color: 'var(--skku-blue)' }}>
              {ko ? '실시간 명함 미리보기' : 'Live Card Preview'}
            </strong>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
            <div className="seg-group">
              <button
                type="button"
                className={`seg-btn btn-small ${effectiveView === 'both' ? 'active' : ''}`}
                onClick={() => setViewMode('both')}
              >
                {ko ? '앞·뒷면 함께' : 'Both'}
              </button>
              <button
                type="button"
                className={`seg-btn btn-small ${effectiveView === 'front' ? 'active' : ''}`}
                onClick={() => setViewMode('front')}
              >
                {ko ? '앞면' : 'Front'}
              </button>
              {backLayout && (
                <button
                  type="button"
                  className={`seg-btn btn-small ${effectiveView === 'back' ? 'active' : ''}`}
                  onClick={() => setViewMode('back')}
                >
                  {ko ? '뒷면' : 'Back'}
                </button>
              )}
            </div>

            <label className="check-row" style={{ fontSize: '0.75rem' }}>
              <input
                type="checkbox"
                checked={showGuides}
                onChange={(e) => setShowGuides(e.target.checked)}
              />
              {ko ? '안전여백' : 'Guides'}
            </label>
          </div>
        </div>

        <div className="preview-stage">
          {(effectiveView === 'both' || effectiveView === 'front') && (
            <div className="preview-side-wrap">
              <div className="preview-side-label">
                <span>{ko ? '앞면 (Front)' : 'Front Side'}</span>
                <span>90 × 50 mm</span>
              </div>
              <div className="card-frame">
                <CardSvg
                  data={data}
                  layout={frontLayout}
                  customFonts={customFonts}
                  photoDataUrl={photoDataUrl}
                  showGuides={showGuides}
                />
              </div>
            </div>
          )}

          {backLayout && (effectiveView === 'both' || effectiveView === 'back') && (
            <div className="preview-side-wrap">
              <div className="preview-side-label">
                <span>
                  {ko ? '뒷면 (Back)' : 'Back Side'} ·{' '}
                  {data.backMode === 'english'
                    ? ko
                      ? '영문면'
                      : 'English'
                    : data.backMode === 'cover-blue'
                    ? 'SKKU Blue (#072A60)'
                    : 'SKKU Dark Green (#124532)'}
                </span>
                <span>90 × 50 mm</span>
              </div>
              <div className="card-frame">
                <CardSvg
                  data={data}
                  layout={backLayout}
                  customFonts={customFonts}
                  photoDataUrl={photoDataUrl}
                  showGuides={showGuides}
                />
              </div>
            </div>
          )}
        </div>

        {/* Download Actions */}
        <div className="download-grid">
          <button
            type="button"
            className="btn-primary"
            disabled={exporting !== null}
            onClick={() => handleExportPdf(false)}
          >
            <FileDown size={16} />
            {exporting === 'pdf-std'
              ? ko
                ? 'PDF 생성 중...'
                : 'Generating...'
              : ko
              ? '표준 PDF 다운로드 (90×50mm)'
              : 'Download PDF (90×50mm)'}
          </button>

          <button
            type="button"
            className="btn-secondary"
            disabled={exporting !== null}
            onClick={() => handleExportPdf(true)}
          >
            <Scissors size={16} />
            {exporting === 'pdf-bleed'
              ? ko
                ? '인쇄용 PDF 생성 중...'
                : 'Generating...'
              : ko
              ? '인쇄소용 도련 PDF (94×54mm)'
              : 'Print PDF + 2mm Bleed'}
          </button>

          <button
            type="button"
            className="btn-outline"
            disabled={exporting !== null}
            onClick={() => handleExportPng('front')}
          >
            <ImageDown size={15} />
            {exporting === 'png-front'
              ? ko
                ? 'PNG 생성 중...'
                : 'Rendering...'
              : ko
              ? '앞면 이미지 PNG (600 DPI)'
              : 'Front PNG (600 DPI)'}
          </button>

          <button
            type="button"
            className="btn-outline"
            disabled={exporting !== null || !backLayout}
            onClick={() => handleExportPng('back')}
          >
            <Download size={15} />
            {exporting === 'png-back'
              ? ko
                ? 'PNG 생성 중...'
                : 'Rendering...'
              : ko
              ? '뒷면 이미지 PNG (600 DPI)'
              : 'Back PNG (600 DPI)'}
          </button>
        </div>
      </div>

      {/* Official SKKU Color System & Print Guide */}
      <div className="guide-card">
        <h4>
          <Palette size={15} />
          {ko ? '성균관대학교 공식 UI 지정 색채 (SKKU Color System)' : 'Official SKKU Color System'}
        </h4>
        <div className="swatch-grid">
          {Object.values(SKKU_COLORS).map((c) => (
            <div key={c.hex} className="swatch-item">
              <span className="swatch-dot" style={{ backgroundColor: c.hex }} />
              <div className="swatch-meta">
                <span className="swatch-name">{ko ? c.nameKo.split(' (')[0] : c.nameEn}</span>
                <span className="swatch-code">
                  {c.hex} · {c.pantone}
                </span>
              </div>
            </div>
          ))}
        </div>

        <h4 style={{ marginTop: '0.85rem' }}>
          <Info size={15} />
          {ko ? '인쇄 및 UI 규정 안내' : 'Print & UI Guidelines'}
        </h4>
        <ul className="guide-list">
          <li>
            {ko
              ? '인쇄 사양은 업체마다 다를 수 있으므로, 각 업체에 직접 문의하시면 명함에 적합한 종이 종류와 인쇄 방식을 추천받으실 수 있습니다.'
              : 'Since printing specifications may vary by printing shop, we recommend contacting each vendor directly for suggestions on suitable paper types and printing methods.'}
          </li>
          <li>
            {ko
              ? '표준 PDF(90×50mm)는 디지털 출력에, 도련 PDF(94×54mm·재단선 포함)는 전문 인쇄소 접수에 적합합니다.'
              : 'Use 90×50mm PDF for digital printing, and 94×54mm PDF (with 2mm bleed & crop marks) for commercial printers.'}
          </li>
          <li>
            {ko
              ? '권장 용지: 반누보 250g~300g, 랑데뷰 240g, 엑스트라매트 등 고급지 (인쇄 전문 업체 문의 권장).'
              : 'Recommended paper: Van Nouveaux 250–300g or Rendezvous 240g uncoated fine paper.'}
          </li>
        </ul>
      </div>
    </aside>
  )
}
