import React from 'react'
import type { UiLang } from '../types/card'

interface FooterProps {
  uiLang: UiLang
}

export const Footer: React.FC<FooterProps> = ({ uiLang }) => {
  const ko = uiLang === 'ko'
  return (
    <footer className="skku-footer">
      <div className="skku-footer-inner">
        <div>
          <strong style={{ color: '#FFFFFF' }}>
            {ko ? '성균관대학교 명함 제작 시스템' : 'SKKU Business Card Studio'}
          </strong>
          <div style={{ marginTop: '0.25rem' }}>
            {ko
              ? '본 시스템은 외부 서버 및 AI 토큰을 사용하지 않으며 모든 정보는 사용자 브라우저에서만 처리됩니다.'
              : 'Runs 100% client-side with zero API tokens. No personal data leaves your browser.'}
          </div>
          <div style={{ marginTop: '0.25rem' }}>
            {ko ? (
              <>
                이 사이트는 성균관대의 공식 시스템이 아니며, 국어국문학과{' '}
                <a href="https://daewonnoh.github.io" target="_blank" rel="noreferrer">
                  노대원 교수
                </a>
                가 제작한 것입니다. · 문의:{' '}
              </>
            ) : (
              <>
                This is not an official university service; it was independently created and provided by{' '}
                <a href="https://daewonnoh.github.io" target="_blank" rel="noreferrer">
                  Prof. Daewon Noh
                </a>{' '}
                (Dept. of Korean Language & Literature). · Contact:{' '}
              </>
            )}
            <a href="mailto:novum@skku.edu">novum@skku.edu</a>
          </div>
        </div>
        <div style={{ textAlign: 'left' }}>
          <div>
            {ko ? '공식 UI 가이드라인 출처: ' : 'Official UI Reference: '}
            <a
              href="https://www.skku.edu/skku/about/symbol/symbol_01.do"
              target="_blank"
              rel="noreferrer"
            >
              skku.edu 성대 UI
            </a>
            {' · '}
            {ko ? '참고 시스템: ' : 'Inspired by: '}
            <a
              href="https://gsa.kaist.ac.kr/business-card-renderer"
              target="_blank"
              rel="noreferrer"
            >
              {ko ? 'KAIST 대학원 총학생회 명함 제작 시스템' : 'KAIST GSA Business Card Renderer'}
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
