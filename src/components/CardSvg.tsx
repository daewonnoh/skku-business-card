import React, { useEffect, useState } from 'react'
import type { CardData, CustomFontState } from '../types/card'
import {
  ASSET_META,
  CARD_HEIGHT_MM,
  CARD_WIDTH_MM,
  type CardSideLayout,
} from '../utils/cardLayout'
import { buildQrPayload } from '../utils/formatters'
import { generateQrDataUrl } from '../utils/qr'

const SCALE = 10 // 1mm = 10 SVG units -> viewBox 0 0 900 500
const PT_TO_SVG = (25.4 / 72) * SCALE // 1pt = 3.52778 SVG units

interface CardSvgProps {
  data: CardData
  layout: CardSideLayout
  customFonts: CustomFontState
  photoDataUrl?: string | null
  showGuides?: boolean
}

function resolveSvgFontFamily(
  data: CardData,
  customFonts: CustomFontState,
  fontRole?: 'body' | 'serif'
): string {
  if (fontRole === 'serif') {
    return "'Gowun Batang', Georgia, serif"
  }
  if (data.fontStyle === 'custom' && customFonts.regular) {
    return `'${customFonts.regular.family}', 'Pretendard', sans-serif`
  }
  if (data.fontStyle === 'serif') {
    return "'Gowun Batang', Georgia, serif"
  }
  return "'Pretendard', -apple-system, BlinkMacSystemFont, sans-serif"
}

export const CardSvg: React.FC<CardSvgProps> = ({
  data,
  layout,
  customFonts,
  photoDataUrl = null,
  showGuides = false,
}) => {
  const [qrUrl, setQrUrl] = useState<string>('')

  const needsQr = layout.ops.some((op) => op.type === 'qr')
  const qrPayload = needsQr ? buildQrPayload(data) : ''

  useEffect(() => {
    let active = true
    if (!needsQr || !qrPayload) {
      setQrUrl('')
      return
    }
    generateQrDataUrl(qrPayload, '#072A60', '#FFFFFF').then((url) => {
      if (active) setQrUrl(url)
    })
    return () => {
      active = false
    }
  }, [needsQr, qrPayload])

  return (
    <svg
      viewBox={`0 0 ${CARD_WIDTH_MM * SCALE} ${CARD_HEIGHT_MM * SCALE}`}
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="SKKU Business Card Preview"
    >
      <rect
        x={0}
        y={0}
        width={CARD_WIDTH_MM * SCALE}
        height={CARD_HEIGHT_MM * SCALE}
        fill={layout.background}
      />

      {layout.ops.map((op, idx) => {
        if (op.type === 'rect') {
          return (
            <rect
              key={idx}
              x={op.x * SCALE}
              y={op.y * SCALE}
              width={op.w * SCALE}
              height={op.h * SCALE}
              rx={op.rx ? op.rx * SCALE : undefined}
              fill={op.fill}
            />
          )
        }
        if (op.type === 'line') {
          return (
            <line
              key={idx}
              x1={op.x1 * SCALE}
              y1={op.y1 * SCALE}
              x2={op.x2 * SCALE}
              y2={op.y2 * SCALE}
              stroke={op.stroke}
              strokeWidth={op.strokeWidth * SCALE}
            />
          )
        }
        if (op.type === 'image') {
          return (
            <image
              key={idx}
              href={ASSET_META[op.asset].path}
              x={op.x * SCALE}
              y={op.y * SCALE}
              width={op.w * SCALE}
              height={op.h * SCALE}
              preserveAspectRatio="xMidYMid meet"
            />
          )
        }
        if (op.type === 'photo') {
          if (photoDataUrl) {
            return (
              <image
                key={idx}
                href={photoDataUrl}
                x={op.x * SCALE}
                y={op.y * SCALE}
                width={op.w * SCALE}
                height={op.h * SCALE}
                preserveAspectRatio="xMidYMid meet"
              />
            )
          }
          return (
            <g key={idx}>
              <rect
                x={op.x * SCALE}
                y={op.y * SCALE}
                width={op.w * SCALE}
                height={op.h * SCALE}
                rx={data.photoShape === 'circle' ? (op.w * SCALE) / 2 : 12}
                fill="#F3F5F8"
                stroke="#CBD4E1"
                strokeWidth={1.4}
                strokeDasharray="6 4"
              />
              <text
                x={(op.x + op.w / 2) * SCALE}
                y={(op.y + op.h / 2 + 1.2) * SCALE}
                fontSize={18}
                fill="#6E7A8A"
                textAnchor="middle"
                fontFamily="Pretendard, sans-serif"
              >
                사진
              </text>
            </g>
          )
        }
        if (op.type === 'qr') {
          if (!qrUrl) return null
          const pad = op.withFrame ? 0.8 * SCALE : 0
          return (
            <g key={idx}>
              {op.withFrame && (
                <rect
                  x={op.x * SCALE - pad}
                  y={op.y * SCALE - pad}
                  width={op.size * SCALE + pad * 2}
                  height={op.size * SCALE + pad * 2}
                  rx={4}
                  fill="#FFFFFF"
                />
              )}
              <image
                href={qrUrl}
                x={op.x * SCALE}
                y={op.y * SCALE}
                width={op.size * SCALE}
                height={op.size * SCALE}
              />
            </g>
          )
        }
        if (op.type === 'text') {
          const anchor =
            op.align === 'center' ? 'middle' : op.align === 'right' ? 'end' : 'start'
          const weight =
            op.weight === 'bold' ? 700 : op.weight === 'medium' ? 500 : 400
          const fontSizeSvg = op.sizePt * PT_TO_SVG
          // Gentle proportional shrink estimate if string is unusually long
          const estCharWidth = fontSizeSvg * 0.50
          const maxSvgW = op.maxWidthMm ? op.maxWidthMm * SCALE : undefined
          const estLen = op.text.length * estCharWidth
          const adjFontSize =
            maxSvgW && estLen > maxSvgW
              ? Math.max(fontSizeSvg * 0.78, fontSizeSvg * (maxSvgW / estLen))
              : fontSizeSvg

          return (
            <text
              key={idx}
              x={op.x * SCALE}
              y={op.y * SCALE}
              fill={op.color}
              fontSize={adjFontSize}
              fontWeight={weight}
              fontFamily={resolveSvgFontFamily(data, customFonts, op.fontRole)}
              textAnchor={anchor}
              letterSpacing={op.letterSpacingEm ? `${op.letterSpacingEm}em` : undefined}
            >
              {op.text}
            </text>
          )
        }
        return null
      })}

      {showGuides && (
        <g pointerEvents="none">
          {/* 3mm Safe Margin Guide */}
          <rect
            x={30}
            y={30}
            width={(CARD_WIDTH_MM - 6) * SCALE}
            height={(CARD_HEIGHT_MM - 6) * SCALE}
            fill="none"
            stroke={layout.isDark ? 'rgba(141,198,63,0.75)' : 'rgba(255,108,15,0.65)'}
            strokeWidth={1.2}
            strokeDasharray="6 4"
          />
          <text
            x={36}
            y={46}
            fontSize={12}
            fill={layout.isDark ? 'rgba(141,198,63,0.9)' : 'rgba(255,108,15,0.85)'}
            fontFamily="Pretendard, sans-serif"
          >
            안전여백 3mm (Safe Area · 90×50mm)
          </text>
        </g>
      )}
    </svg>
  )
}
