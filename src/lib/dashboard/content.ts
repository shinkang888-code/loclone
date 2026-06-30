import { LCLONE_BRAND } from "@/lib/brand/tokens";

export const BRAND = {
  name: LCLONE_BRAND.name,
  tagline: LCLONE_BRAND.taglineKo,
  description: LCLONE_BRAND.description,
} as const;

export const WORKFLOW_STEPS = [
  {
    step: 1,
    title: "프로젝트 생성",
    summary: "클라이언트 이름과 대상 URL을 등록합니다.",
    image: "/images/dashboard/step-1-project.svg",
    href: "/dashboard/projects",
    details: [
      "대시보드 → 프로젝트 → 새 프로젝트",
      "프로젝트 이름(예: ACME 랜딩) 입력",
      "Target URL을 한 줄에 하나씩 붙여넣기",
      "생성 후 프로젝트 카드를 클릭해 개요로 이동",
    ],
  },
  {
    step: 2,
    title: "클론 실행",
    summary: "6가지 모드 중 목적에 맞는 방식으로 사이트를 추출합니다.",
    image: "/images/dashboard/step-2-clone.svg",
    href: "/dashboard/guide#clone-modes",
    details: [
      "프로젝트 → 클론 탭 이동",
      "static: 정적 HTML (즉시, Worker 불필요)",
      "render/mirror: JS 렌더·다중 페이지 (Clone Worker 필요)",
      "agent-pixel: AI 픽셀 클론 (Browser MCP + /clone-website)",
      "클론 실행 → 실행 기록에서 진행률 확인",
    ],
  },
  {
    step: 3,
    title: "프리뷰 비교",
    summary: "원본과 클론 결과를 나란히 확인합니다.",
    image: "/images/dashboard/step-3-preview.svg",
    href: "/dashboard/guide#preview",
    details: [
      "프로젝트 → 프리뷰 탭",
      "왼쪽: 원본 iframe (X-Frame-Options로 차단될 수 있음)",
      "오른쪽: public/clones/{runId} 로컬 프리뷰",
      "차이가 크면 render/mirror 모드 재시도 또는 agent-pixel",
    ],
  },
  {
    step: 4,
    title: "QA 검수",
    summary: "SEO·성능·접근성·디자인 토큰을 자동 점검합니다.",
    image: "/images/dashboard/step-4-qa.svg",
    href: "/dashboard/guide#qa",
    details: [
      "프로젝트 → QA 탭 → QA 실행",
      "SEO / 성능 / 접근성 / 디자인 점수 확인",
      "Tech stack·Design token 자동 감지",
      "이슈 카드의 fix 가이드대로 수정",
    ],
  },
  {
    step: 5,
    title: "ZIP 납품",
    summary: "README·HANDOFF·QA·클론 아티팩트를 한 번에 패키징합니다.",
    image: "/images/dashboard/step-5-export.svg",
    href: "/dashboard/guide#export",
    details: [
      "프로젝트 개요 → ZIP보내기 클릭",
      "포함: clones/, research/, HANDOFF.md, qa/report.json",
      "고객에게 ZIP + 배포 URL 전달",
      "사이트 모니터로 납품 후 uptime 점검",
    ],
  },
] as const;

export const CLONE_MODE_GUIDE = [
  {
    id: "static",
    label: "빠른 추출",
    badge: "추천 · 즉시",
    image: "/images/dashboard/mode-static.svg",
    when: "블로그, 랜딩, 정적 HTML",
    how: "Worker 없이 fetch + HTML 파싱. 가장 빠르게 시작.",
  },
  {
    id: "render",
    label: "JS 렌더",
    badge: "SPA 1페이지",
    image: "/images/dashboard/mode-render.svg",
    when: "React/Vite 랜딩, JS 렌더 필수",
    how: "Clone Worker + Playwright. CSS/JS/font 가로채기.",
  },
  {
    id: "mirror",
    label: "미러",
    badge: "다중 페이지",
    image: "/images/dashboard/mode-mirror.svg",
    when: "마케팅 사이트 50페이지 이하",
    how: "BFS + sitemap 시드. same-origin 필터.",
  },
  {
    id: "agent-pixel",
    label: "AI 픽셀",
    badge: "최고 품질",
    image: "/images/dashboard/mode-agent.svg",
    when: "픽셀 퍼펙트 납품",
    how: "Cursor Browser MCP + /clone-website 스킬.",
  },
] as const;

export const FAQ_ITEMS = [
  {
    q: "mirror 모드에서 Worker 오류가 납니다",
    a: "docker compose up clone-worker 실행 후 .env.local에 CLONE_WORKER_URL=http://localhost:3100 설정. Next.js dev 서버 재시작.",
  },
  {
    q: "Vercel 배포 후 클론이 저장되지 않습니다",
    a: "Vercel은 디스크가 임시입니다. DB(Neon)는 연결되어 있어도 public/clones 파일은 Blob 스토리지가 필요합니다.",
  },
  {
    q: "대기 목록 항목은 어떻게 처리하나요?",
    a: "설정 완료 후 대기 목록에서 완료 처리. 환경 스캔으로 미설정 항목 자동 갱신.",
  },
  {
    q: "고객 납품 ZIP에 무엇이 들어가나요?",
    a: "README, HANDOFF.md, qa/report.json, clones/{runId}, research/{runId} 폴더.",
  },
] as const;

export const NAV_SECTIONS = [
  {
    label: "시작하기",
    items: [
      { href: "/dashboard", label: "홈", icon: "home" as const },
      { href: "/dashboard/guide", label: "사용 가이드", icon: "book" as const },
    ],
  },
  {
    label: "작업",
    items: [
      { href: "/dashboard/projects", label: "프로젝트", icon: "folder" as const },
      { href: "/dashboard/runs", label: "실행 기록", icon: "activity" as const },
      { href: "/dashboard/sites", label: "사이트 모니터", icon: "globe" as const },
    ],
  },
  {
    label: "관리",
    items: [
      { href: "/dashboard/waiting", label: "대기 목록", icon: "clipboard" as const },
      { href: "/dashboard/settings", label: "설정", icon: "settings" as const },
      { href: "/dashboard/admin", label: "Admin", icon: "shield" as const },
    ],
  },
] as const;
