import type { CardData, CampusId, MemberCategory, TemplateId } from '../types/card'

/**
 * 성균관대학교 공식 UI 지정 색채 (https://www.skku.edu/skku/about/symbol/symbol_01.do)
 */
export const SKKU_COLORS = {
  blue: {
    nameKo: 'SKKU 파란색 (리더십·신뢰·지성·책임)',
    nameEn: 'SKKU Blue',
    hex: '#072A60',
    rgb: [7, 42, 96] as const,
    cmyk: 'C100 M96 Y51 K11',
    pantone: 'Pantone 541C',
  },
  green: {
    nameKo: 'SKKU 연두색 (다시 시작되는 역사)',
    nameEn: 'SKKU Green',
    hex: '#8DC63F',
    rgb: [141, 198, 63] as const,
    cmyk: 'C52 M5 Y89 K0',
    pantone: 'Pantone 367C',
  },
  orange: {
    nameKo: 'SKKU 주황색 (창조·역동·혁신)',
    nameEn: 'SKKU Orange',
    hex: '#FF6C0F',
    rgb: [255, 108, 15] as const,
    cmyk: 'C0 M71 Y89 K0',
    pantone: 'Pantone 1585C',
  },
  darkGreen: {
    nameKo: 'SKKU 진녹색 (소통·공유·협력)',
    nameEn: 'SKKU Dark Green',
    hex: '#124532',
    rgb: [18, 69, 50] as const,
    cmyk: 'C89 M61 Y86 K38',
    pantone: 'Pantone 3435C',
  },
} as const

export interface CampusInfo {
  id: CampusId
  nameKo: string
  nameEn: string
  addressKo: string
  addressEn: string
}

export const SKKU_CAMPUSES: Record<Exclude<CampusId, 'custom'>, CampusInfo> = {
  hssc: {
    id: 'hssc',
    nameKo: '인문사회과학캠퍼스',
    nameEn: 'Humanities & Social Sciences Campus',
    addressKo: '03073 서울시 종로구 성균관로 5길 67',
    addressEn: '67, Sungkyunkwan-ro 5-gil, Jongno-gu, Seoul 03073, Korea',
  },
  nsc: {
    id: 'nsc',
    nameKo: '자연과학캠퍼스',
    nameEn: 'Natural Sciences Campus',
    addressKo: '16419 경기도 수원시 장안구 서부로 2066',
    addressEn: '2066, Seobu-ro, Jangan-gu, Suwon-si, Gyeonggi-do 16419, Korea',
  },
}

export interface DeptItem {
  key: string
  kor: string
  eng: string
  campus: 'hssc' | 'nsc'
}

export interface CollegeGroup {
  collegeKo: string
  collegeEn: string
  campus: 'hssc' | 'nsc'
  depts: DeptItem[]
}

export const SKKU_COLLEGES: CollegeGroup[] = [
  {
    collegeKo: '유학대학',
    collegeEn: 'College of Confucian Studies & Eastern Philosophy',
    campus: 'hssc',
    depts: [
      { key: 'confucian', kor: '유학·동양학과', eng: 'Dept. of Confucian & Oriental Studies', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '문과대학',
    collegeEn: 'College of Liberal Arts',
    campus: 'hssc',
    depts: [
      { key: 'korean', kor: '국어국문학과', eng: 'Dept. of Korean Language & Literature', campus: 'hssc' },
      { key: 'english', kor: '영어영문학과', eng: 'Dept. of English Language & Literature', campus: 'hssc' },
      { key: 'french', kor: '프랑스어문학과', eng: 'Dept. of French Language & Literature', campus: 'hssc' },
      { key: 'chinese', kor: '중어중문학과', eng: 'Dept. of Chinese Language & Literature', campus: 'hssc' },
      { key: 'german', kor: '독어독문학과', eng: 'Dept. of German Language & Literature', campus: 'hssc' },
      { key: 'russian', kor: '러시아어문학과', eng: 'Dept. of Russian Language & Literature', campus: 'hssc' },
      { key: 'hanmun', kor: '한문학과', eng: 'Dept. of Korean Literature in Classical Chinese', campus: 'hssc' },
      { key: 'history', kor: '사학과', eng: 'Dept. of History', campus: 'hssc' },
      { key: 'philosophy', kor: '철학과', eng: 'Dept. of Philosophy', campus: 'hssc' },
      { key: 'lis', kor: '문헌정보학과', eng: 'Dept. of Library & Information Science', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '사회과학대학',
    collegeEn: 'College of Social Sciences',
    campus: 'hssc',
    depts: [
      { key: 'pa', kor: '행정학과', eng: 'Dept. of Public Administration', campus: 'hssc' },
      { key: 'polsci', kor: '정치외교학과', eng: 'Dept. of Political Science & Diplomacy', campus: 'hssc' },
      { key: 'media', kor: '미디어커뮤니케이션학과', eng: 'Dept. of Media & Communication', campus: 'hssc' },
      { key: 'sociology', kor: '사회학과', eng: 'Dept. of Sociology', campus: 'hssc' },
      { key: 'swelfare', kor: '사회복지학과', eng: 'Dept. of Social Welfare', campus: 'hssc' },
      { key: 'psych', kor: '심리학과', eng: 'Dept. of Psychology', campus: 'hssc' },
      { key: 'consumer', kor: '소비자학과', eng: 'Dept. of Consumer Science', campus: 'hssc' },
      { key: 'child', kor: '아동·청소년학과', eng: 'Dept. of Child Psychology & Education', campus: 'hssc' },
      { key: 'global-leader', kor: '글로벌리더학부', eng: 'School of Global Leader', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '경제대학',
    collegeEn: 'College of Economics',
    campus: 'hssc',
    depts: [
      { key: 'econ', kor: '경제학과', eng: 'Dept. of Economics', campus: 'hssc' },
      { key: 'stat', kor: '통계학과', eng: 'Dept. of Statistics', campus: 'hssc' },
      { key: 'global-econ', kor: '글로벌경제학과', eng: 'Dept. of Global Economics', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '경영대학',
    collegeEn: 'School of Business',
    campus: 'hssc',
    depts: [
      { key: 'biz', kor: '경영학과', eng: 'Dept. of Business Administration', campus: 'hssc' },
      { key: 'global-biz', kor: '글로벌경영학과', eng: 'Dept. of Global Business Administration', campus: 'hssc' },
      { key: 'skk-gsb', kor: 'SKK GSB', eng: 'SKK Graduate School of Business', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '사범대학',
    collegeEn: 'College of Education',
    campus: 'hssc',
    depts: [
      { key: 'edu', kor: '교육학과', eng: 'Dept. of Education', campus: 'hssc' },
      { key: 'hanmun-edu', kor: '한문교육과', eng: 'Dept. of Classical Chinese Education', campus: 'hssc' },
      { key: 'math-edu', kor: '수학교육과', eng: 'Dept. of Mathematics Education', campus: 'hssc' },
      { key: 'cs-edu', kor: '컴퓨터교육과', eng: 'Dept. of Computer Education', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '예술대학',
    collegeEn: 'College of Art',
    campus: 'hssc',
    depts: [
      { key: 'fine-art', kor: '미술학과', eng: 'Dept. of Fine Art', campus: 'hssc' },
      { key: 'design', kor: '디자인학과', eng: 'Dept. of Design', campus: 'hssc' },
      { key: 'dance', kor: '무용학과', eng: 'Dept. of Dance', campus: 'hssc' },
      { key: 'film', kor: '영상학과', eng: 'Dept. of Film, Television & Multimedia', campus: 'hssc' },
      { key: 'acting', kor: '연기예술학과', eng: 'Dept. of Acting for Theatre, Film & TV', campus: 'hssc' },
      { key: 'fashion', kor: '의상학과', eng: 'Dept. of Fashion Design', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '자연과학대학',
    collegeEn: 'College of Science',
    campus: 'nsc',
    depts: [
      { key: 'bio', kor: '생명과학과', eng: 'Dept. of Biological Sciences', campus: 'nsc' },
      { key: 'math', kor: '수학과', eng: 'Dept. of Mathematics', campus: 'nsc' },
      { key: 'physics', kor: '물리학과', eng: 'Dept. of Physics', campus: 'nsc' },
      { key: 'chem', kor: '화학과', eng: 'Dept. of Chemistry', campus: 'nsc' },
    ],
  },
  {
    collegeKo: '정보통신대학',
    collegeEn: 'College of Information & Communication Engineering',
    campus: 'nsc',
    depts: [
      { key: 'eee', kor: '전자전기공학부', eng: 'Dept. of Electrical & Computer Engineering', campus: 'nsc' },
      { key: 'semi', kor: '반도체시스템공학과', eng: 'Dept. of Semiconductor Systems Engineering', campus: 'nsc' },
      { key: 'semi-conv', kor: '반도체융합공학과', eng: 'Dept. of Semiconductor Convergence Engineering', campus: 'nsc' },
      { key: 'materials-dev', kor: '소재부품융합공학과', eng: 'Dept. of Materials, Parts & Equipment Convergence', campus: 'nsc' },
    ],
  },
  {
    collegeKo: '소프트웨어융합대학',
    collegeEn: 'College of Computing & Informatics',
    campus: 'nsc',
    depts: [
      { key: 'sw', kor: '소프트웨어학과', eng: 'Dept. of Software', campus: 'nsc' },
      { key: 'cs', kor: '컴퓨터공학과', eng: 'Dept. of Computer Science & Engineering', campus: 'nsc' },
      { key: 'ai', kor: '인공지능학과', eng: 'Dept. of Artificial Intelligence', campus: 'nsc' },
      { key: 'ds', kor: '데이터사이언스융합전공', eng: 'Dept. of Applied Data Science', campus: 'nsc' },
      { key: 'g-conv', kor: '글로벌융합학부', eng: 'School of Convergence', campus: 'hssc' },
    ],
  },
  {
    collegeKo: '공과대학',
    collegeEn: 'College of Engineering',
    campus: 'nsc',
    depts: [
      { key: 'cheme', kor: '화학공학/고분자공학부', eng: 'School of Chemical Engineering', campus: 'nsc' },
      { key: 'mse', kor: '신소재공학부', eng: 'School of Advanced Materials Science & Engineering', campus: 'nsc' },
      { key: 'me', kor: '기계공학부', eng: 'School of Mechanical Engineering', campus: 'nsc' },
      { key: 'civil', kor: '건설환경공학부', eng: 'School of Civil, Architectural Engineering & Landscape Architecture', campus: 'nsc' },
      { key: 'ie', kor: '시스템경영공학과', eng: 'Dept. of Systems Management Engineering', campus: 'nsc' },
      { key: 'arch', kor: '건축학과', eng: 'Dept. of Architecture', campus: 'nsc' },
      { key: 'nano', kor: '나노공학과', eng: 'Dept. of Nano Engineering', campus: 'nsc' },
    ],
  },
  {
    collegeKo: '약학대학 · 생명공학대학 · 스포츠과학대학',
    collegeEn: 'Pharmacy / Biotechnology / Sport Science',
    campus: 'nsc',
    depts: [
      { key: 'pharm', kor: '약학과', eng: 'School of Pharmacy', campus: 'nsc' },
      { key: 'food-bio', kor: '식품생명공학과', eng: 'Dept. of Food Science & Biotechnology', campus: 'nsc' },
      { key: 'biomech', kor: '바이오메카트로닉스학과', eng: 'Dept. of Biomechatronic Engineering', campus: 'nsc' },
      { key: 'fusion-bio', kor: '융합생명공학과', eng: 'Dept. of Integrative Biotechnology', campus: 'nsc' },
      { key: 'sport', kor: '스포츠과학과', eng: 'Dept. of Sport Science', campus: 'nsc' },
    ],
  },
  {
    collegeKo: '의과대학 · 성균융합원 · 전문대학원',
    collegeEn: 'Medicine / SKKU Institute for Convergence / Professional Schools',
    campus: 'nsc',
    depts: [
      { key: 'med', kor: '의학과', eng: 'School of Medicine', campus: 'nsc' },
      { key: 'bme', kor: '글로벌바이오메디컬공학과', eng: 'Dept. of Biomedical Engineering', campus: 'nsc' },
      { key: 'energy', kor: '에너지과학과', eng: 'Dept. of Energy Science', campus: 'nsc' },
      { key: 'law', kor: '법학전문대학원', eng: 'Law School', campus: 'hssc' },
      { key: 'ai-gs', kor: '인공지능융합학과', eng: 'Dept. of Applied Artificial Intelligence', campus: 'hssc' },
      { key: 'admin', kor: '대외협력처 / 행정부서', eng: 'Office of University Administration', campus: 'hssc' },
    ],
  },
]

export interface RoleOption {
  key: string
  category: MemberCategory
  kor: string
  eng: string
}

export const SKKU_ROLES: RoleOption[] = [
  // 교원 (Faculty)
  { key: 'prof', category: 'faculty', kor: '교수', eng: 'Professor' },
  { key: 'assoc-prof', category: 'faculty', kor: '부교수', eng: 'Associate Professor' },
  { key: 'asst-prof', category: 'faculty', kor: '조교수', eng: 'Assistant Professor' },
  { key: 'dist-prof', category: 'faculty', kor: '석좌교수', eng: 'Distinguished Professor' },
  { key: 'emeritus-prof', category: 'faculty', kor: '명예교수', eng: 'Professor Emeritus' },
  { key: 'research-prof', category: 'faculty', kor: '연구교수', eng: 'Research Professor' },
  { key: 'lecturer', category: 'faculty', kor: '강사', eng: 'Lecturer' },
  // 대학원생 (Graduate)
  { key: 'ms', category: 'graduate', kor: '석사과정', eng: "Master's Student" },
  { key: 'phd', category: 'graduate', kor: '박사과정', eng: 'Ph.D. Candidate' },
  { key: 'ms-phd', category: 'graduate', kor: '석박사통합과정', eng: 'Combined M.S./Ph.D. Student' },
  // 학부생 (Undergraduate)
  { key: 'undergrad', category: 'undergraduate', kor: '학사과정', eng: 'Undergraduate Student' },
  { key: 'student-council', category: 'undergraduate', kor: '학생회장', eng: 'Student Council President' },
  // 연구원 (Researcher)
  { key: 'postdoc', category: 'researcher', kor: '박사후연구원', eng: 'Postdoctoral Researcher' },
  { key: 'senior-res', category: 'researcher', kor: '선임연구원', eng: 'Senior Researcher' },
  { key: 'researcher', category: 'researcher', kor: '연구원', eng: 'Researcher' },
  // 교직원 (Staff)
  { key: 'team-leader', category: 'staff', kor: '팀장', eng: 'Team Leader' },
  { key: 'senior-staff', category: 'staff', kor: '선임', eng: 'Senior Administrator' },
  { key: 'staff', category: 'staff', kor: '직원', eng: 'Administrative Staff' },
  // 기타
  { key: 'none', category: 'custom', kor: '', eng: '' },
]

export const MEMBER_CATEGORIES: { id: MemberCategory; labelKo: string; labelEn: string }[] = [
  { id: 'faculty', labelKo: '교원 (교수)', labelEn: 'Faculty' },
  { id: 'graduate', labelKo: '대학원생', labelEn: 'Graduate' },
  { id: 'undergraduate', labelKo: '학부생', labelEn: 'Undergraduate' },
  { id: 'researcher', labelKo: '연구원', labelEn: 'Researcher' },
  { id: 'staff', labelKo: '교직원', labelEn: 'Staff' },
  { id: 'custom', labelKo: '직접입력', labelEn: 'Custom' },
]

export interface TemplateMeta {
  id: TemplateId
  nameKo: string
  nameEn: string
  descKo: string
  descEn: string
  badgeKo: string
  defaultBackMode: CardData['backMode']
  accentColor: string
}

export const TEMPLATES: TemplateMeta[] = [
  {
    id: 'official-emblem',
    nameKo: '공식 표준형 (엠블렘)',
    nameEn: 'Official Emblem',
    descKo: '실제 성대 공식 명함 규격 — 좌측 원형 엠블렘 + 공식 로고타입',
    descEn: 'Official SKKU circular emblem & logotype layout',
    badgeKo: '공식 표준',
    defaultBackMode: 'english',
    accentColor: SKKU_COLORS.blue.hex,
  },
  {
    id: 'modern-accent',
    nameKo: '모던 포인트형 (시그니처)',
    nameEn: 'Modern Signature Accent',
    descKo: '공식 좌우 시그니처 + 슬로건 + 2색 세로바 포인트',
    descEn: 'Official signature + slogan + dual-tone vertical bar',
    badgeKo: '모던 추천',
    defaultBackMode: 'english',
    accentColor: SKKU_COLORS.green.hex,
  },
  {
    id: 'skku-blue-cover',
    nameKo: 'SKKU 블루 표지형',
    nameEn: 'SKKU Blue Cover',
    descKo: 'SKKU Blue(#072A60) 단색 표지 + 깔끔한 국영문 병기 정보면',
    descEn: 'Deep SKKU Blue solid cover with bilingual info side',
    badgeKo: '표지형',
    defaultBackMode: 'cover-blue',
    accentColor: SKKU_COLORS.blue.hex,
  },
  {
    id: 'skku-green-cover',
    nameKo: 'SKKU 진녹색 전통형',
    nameEn: 'SKKU Dark Green Cover',
    descKo: 'SKKU Dark Green(#124532) 전통 표지 + 화이트 공식 시그니처',
    descEn: 'Traditional SKKU Dark Green cover with white signature',
    badgeKo: '전통형',
    defaultBackMode: 'cover-green',
    accentColor: SKKU_COLORS.darkGreen.hex,
  },
]

export const SLOGAN_TEXTS: Record<string, { line1: string; line2: string; labelKo: string }> = {
  'inspiring-future': {
    line1: 'Inspiring Future,',
    line2: 'Grand Challenge',
    labelKo: 'Inspiring Future, Grand Challenge (비전 슬로건)',
  },
  'unique-origin': {
    line1: 'Unique Origin,',
    line2: 'Unique Future',
    labelKo: 'Unique Origin, Unique Future (공식 영문 슬로건)',
  },
  'brand-statement-ko': {
    line1: '“예로부터 나라의 인재는 성균에 모여 왔으니,',
    line2: '그대 머묾이 우연이겠는가”',
    labelKo: '공식 국문 Brand Statement (캘리그래피 이미지)',
  },
}

export const SAMPLE_PRESETS: Record<string, { labelKo: string; labelEn: string; data: CardData }> = {
  professorOfficial: {
    labelKo: '교원 (공식 표준형)',
    labelEn: 'Faculty (Official)',
    data: {
      template: 'official-emblem',
      backMode: 'english',
      coverLogoStyle: 'sig-ko-en-v',
      fontStyle: 'gothic',
      paperTone: 'white',
      labName: '',
      sloganPreset: 'none',
      customSlogan: '',
      showSloganOnCover: true,
      qrMode: 'none',
      qrPlacement: 'front',
      qrUrl: 'https://www.skku.edu',
      showPhoto: false,
      photoShape: 'rounded',
      nameDisplayMode: 'ko-hanja',
      koreanNameSpaced: true,
      nameKo: '홍길동',
      nameHanja: '洪吉童',
      nameEn: 'Hong, Gil Dong',
      memberCategory: 'faculty',
      affiliationLangMode: 'ko-en',
      collegeKo: '문과대학',
      collegeEn: 'College of Liberal Arts',
      deptPresetKey: 'korean',
      deptKo: '국어국문학과',
      deptEn: 'Dept. of Korean Language & Literature',
      rolePresetKey: 'asst-prof',
      roleKo: '조교수',
      roleEn: 'Assistant Professor',
      showExtraLine: false,
      extraLineKo: '',
      extraLineEn: '',
      campus: 'hssc',
      addressDetailKo: 'I-하우스 000호',
      addressDetailEn: 'I-House #000',
      addressBaseKo: SKKU_CAMPUSES.hssc.addressKo,
      addressBaseEn: SKKU_CAMPUSES.hssc.addressEn,
      useEnglishAddressOnFront: false,
      showInstitutionLine: true,
      showTel: true,
      tel: '02-760-0100',
      showMobile: true,
      mobile: '010-1234-5678',
      showEmail: true,
      email: 'gdhong@skku.edu',
      showFax: false,
      fax: '02-760-0101',
      showWeb: false,
      web: 'https://www.skku.edu',
      autoIntlPhoneOnEn: true,
    },
  },
  professorModern: {
    labelKo: '교원 (모던 포인트형)',
    labelEn: 'Faculty (Modern Accent)',
    data: {
      template: 'modern-accent',
      backMode: 'english',
      coverLogoStyle: 'sig-ko-en-v',
      fontStyle: 'gothic',
      paperTone: 'ivory',
      labName: '한국문학연구실',
      sloganPreset: 'inspiring-future',
      customSlogan: '',
      showSloganOnCover: true,
      qrMode: 'none',
      qrPlacement: 'front',
      qrUrl: 'https://www.skku.edu',
      showPhoto: false,
      photoShape: 'rounded',
      nameDisplayMode: 'ko-only',
      koreanNameSpaced: true,
      nameKo: '성균관',
      nameHanja: '成均館',
      nameEn: 'Sung, Kyun Kwan',
      memberCategory: 'faculty',
      affiliationLangMode: 'ko-only',
      collegeKo: '',
      collegeEn: 'College of Liberal Arts',
      deptPresetKey: 'korean',
      deptKo: '국어국문학과',
      deptEn: 'Dept. of Korean Language & Literature',
      rolePresetKey: 'prof',
      roleKo: '교수',
      roleEn: 'Professor',
      showExtraLine: true,
      extraLineKo: '문학평론가 / 문학박사',
      extraLineEn: 'Literary Critic / Ph.D. in Literature',
      campus: 'hssc',
      addressDetailKo: '교수회관 213호',
      addressDetailEn: 'Faculty Hall #213',
      addressBaseKo: SKKU_CAMPUSES.hssc.addressKo,
      addressBaseEn: SKKU_CAMPUSES.hssc.addressEn,
      useEnglishAddressOnFront: false,
      showInstitutionLine: true,
      showTel: true,
      tel: '02-760-0200',
      showMobile: true,
      mobile: '010-2345-6789',
      showEmail: true,
      email: 'skku.prof@skku.edu',
      showFax: false,
      fax: '',
      showWeb: false,
      web: 'https://www.skku.edu',
      autoIntlPhoneOnEn: true,
    },
  },
  gradStudent: {
    labelKo: '대학원생 (SKKU 블루 표지형)',
    labelEn: 'Graduate (Blue Cover)',
    data: {
      template: 'skku-blue-cover',
      backMode: 'cover-blue',
      coverLogoStyle: 'sig-ko-en-v',
      fontStyle: 'gothic',
      paperTone: 'white',
      labName: 'SKKU AI & DATA LAB',
      sloganPreset: 'unique-origin',
      customSlogan: '',
      showSloganOnCover: true,
      qrMode: 'url',
      qrPlacement: 'back',
      qrUrl: 'https://www.skku.edu',
      showPhoto: false,
      photoShape: 'rounded',
      nameDisplayMode: 'ko-en',
      koreanNameSpaced: true,
      nameKo: '김성균',
      nameHanja: '金成均',
      nameEn: 'Sungkyun Kim',
      memberCategory: 'graduate',
      affiliationLangMode: 'ko-en',
      collegeKo: '소프트웨어융합대학',
      collegeEn: 'College of Computing & Informatics',
      deptPresetKey: 'ai',
      deptKo: '인공지능학과',
      deptEn: 'Dept. of Artificial Intelligence',
      rolePresetKey: 'ms-phd',
      roleKo: '석박사통합과정',
      roleEn: 'Combined M.S./Ph.D. Student',
      showExtraLine: false,
      extraLineKo: '',
      extraLineEn: '',
      campus: 'nsc',
      addressDetailKo: '산학협력센터 85402호',
      addressDetailEn: 'Corporate Collaboration Center #85402',
      addressBaseKo: SKKU_CAMPUSES.nsc.addressKo,
      addressBaseEn: SKKU_CAMPUSES.nsc.addressEn,
      useEnglishAddressOnFront: false,
      showInstitutionLine: true,
      showTel: true,
      tel: '031-290-7100',
      showMobile: true,
      mobile: '010-9876-5432',
      showEmail: true,
      email: 'skkim@g.skku.edu',
      showFax: false,
      fax: '',
      showWeb: false,
      web: 'https://github.com/skku',
      autoIntlPhoneOnEn: true,
    },
  },
  undergradGreen: {
    labelKo: '학부생/연구원 (진녹색 전통형)',
    labelEn: 'Student / Researcher (Green)',
    data: {
      template: 'skku-green-cover',
      backMode: 'cover-green',
      coverLogoStyle: 'emblem',
      fontStyle: 'serif',
      paperTone: 'white',
      labName: '성균관대학교 인문사회과학캠퍼스',
      sloganPreset: 'brand-statement-ko',
      customSlogan: '',
      showSloganOnCover: true,
      qrMode: 'vcard',
      qrPlacement: 'front',
      qrUrl: 'https://www.skku.edu',
      showPhoto: false,
      photoShape: 'rounded',
      nameDisplayMode: 'ko-en',
      koreanNameSpaced: true,
      nameKo: '이율전',
      nameHanja: '李栗田',
      nameEn: 'Yuljeon Lee',
      memberCategory: 'undergraduate',
      affiliationLangMode: 'ko-en',
      collegeKo: '자연과학대학',
      collegeEn: 'College of Science',
      deptPresetKey: 'physics',
      deptKo: '물리학과',
      deptEn: 'Dept. of Physics',
      rolePresetKey: 'undergrad',
      roleKo: '학사과정',
      roleEn: 'Undergraduate Student',
      showExtraLine: true,
      extraLineKo: '학부연구생 · 양자광학연구실',
      extraLineEn: 'Undergraduate Researcher · Quantum Optics Lab',
      campus: 'nsc',
      addressDetailKo: '제1과학관 31205호',
      addressDetailEn: 'Science Building 1 #31205',
      addressBaseKo: SKKU_CAMPUSES.nsc.addressKo,
      addressBaseEn: SKKU_CAMPUSES.nsc.addressEn,
      useEnglishAddressOnFront: false,
      showInstitutionLine: true,
      showTel: false,
      tel: '',
      showMobile: true,
      mobile: '010-5555-1398',
      showEmail: true,
      email: 'yjlee@g.skku.edu',
      showFax: false,
      fax: '',
      showWeb: true,
      web: 'https://skku.edu',
      autoIntlPhoneOnEn: true,
    },
  },
}

export const DEFAULT_CARD_DATA: CardData = SAMPLE_PRESETS.professorOfficial.data
