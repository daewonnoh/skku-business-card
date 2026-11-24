# 성균관대학교 명함 제작 시스템 (SKKU Business Card Studio)

성균관대학교(SKKU) 구성원(교원·대학원생·학부생·연구원·교직원)을 위한 **100% 브라우저 로컬 동작(토큰·서버 비용 0원)** 공식 명함 제작 웹 애플리케이션입니다.

## 주요 특징
- **공식 UI 100% 준수**: 성균관대학교 공식 UI(`skku.edu/skku/about/symbol/`) 원본 벡터(`.ai`)에서 정제한 엠블렘·시그니처·로고타입·슬로건 에셋과 공식 지정 색채 4종(`SKKU Blue #072A60`, `SKKU Dark Green #124532`, `SKKU Green #8DC63F`, `SKKU Orange #FF6C0F`) 적용
- **4종 공식 템플릿 + 자유로운 뒷면 조합**:
  1. **공식 표준형 (엠블렘 양면)**: 실제 성대 공식 명함 샘플 규격(좌측 원형 엠블렘 + 공식 로고타입)
  2. **모던 포인트형 (시그니처 + 세로바)**: 공식 국영문 좌우 시그니처 + 슬로건 + 2색 세로바 + 추가 직함 줄
  3. **SKKU 블루 표지형**: SKKU Blue(`#072A60`) 표지(단색 화이트 공식 시그니처) + 국영문 병기 정보면
  4. **SKKU 진녹색 전통형**: SKKU Dark Green(`#124532`) 표지 + 화이트 공식 시그니처/엠블렘
- **로컬 지정서체 지원**: 무료 오픈소스 서체(Pretendard · 고운바탕) 기본 내장 + 사용자가 보유한 공식 지정서체(`.ttf`/`.otf`) 로컬 직접 로드 및 PDF 임베딩
- **인쇄용 출력**: 표준 벡터 PDF(`90×50mm`), 인쇄소용 도련 2mm + 재단선 포함 PDF(`94×54mm`), 고해상도 600 DPI PNG 다운로드

## 실행 및 빌드 방법

```bash
# Node.js PATH가 필요한 경우 (~/.local/node 설치 시)
export PATH="$HOME/.local/node/bin:$PATH"

# 개발 서버 실행
npm run dev

# 배포용 정적 빌드 (dist/ 폴더 생성 — GitHub Pages / Netlify / 사내 웹서버 배포 가능)
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```
