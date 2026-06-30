# Loclone 대시보드 — Figma 디자인 스펙

> Figma MCP 미연결 환경용 스펙. Figma에서 `use_figma` 또는 수동으로 아래 토큰·프레임을 구현하세요.

## 1. 브랜드

| 토큰 | 값 |
|------|-----|
| Primary | `#4F46E5` (indigo-600) |
| Primary hover | `#4338CA` |
| Accent | `#7C3AED` (violet) |
| Background | `#FAFAFE` |
| Surface | `#FFFFFF` |
| Text | `#1E1B4B` |
| Muted | `#64748B` |
| Success | `#10B981` |
| Warning | `#F59E0B` |
| Radius | 12px (card), 16px (hero) |

## 2. 페이지 구조 (1440×1024)

### Frame: Dashboard / Home
- Hero gradient `#4F46E5 → #7C3AED`, title 36px Bold, CTA 2개
- Stat grid 4열: 프로젝트 / 클론 / 대기 / 모니터
- Workflow 5 steps (이미지 + 텍스트 교차 레이아웃)

### Frame: Dashboard / Guide
- TOC: 5단계 · 클론 모드 · 프리뷰 · QA · ZIP · FAQ
- Mode cards 4열 grid with thumbnail 120×80

### Frame: Dashboard / Projects
- Hero + project cards 3열
- Empty state dashed border

### Frame: Project / Clone
- Mode selector 3×2 grid
- Advanced options collapsible panel
- Worker warning amber banner

## 3. 컴포넌트

| 컴포넌트 | Variants |
|----------|----------|
| Sidebar Nav Item | default, active (indigo fill) |
| Stat Card | default, warning trend |
| Step Card | image-left, image-right |
| Badge | default, success, warning, outline |
| Button | primary, outline, destructive |

## 4. 일러스트 에셋

로컬 SVG (`public/images/dashboard/`):

- `hero-dashboard.svg` — 홈 히어로
- `step-1-project.svg` ~ `step-5-export.svg` — 5단계
- `mode-static.svg` ~ `mode-agent.svg` — 클론 모드

Figma import: File → Place image → 위 SVG 드래그

## 5. 타이포

- Display: Geist Sans 36/32 Bold
- Heading: 24/20 Semibold
- Body: 14/16 Regular
- Caption: 11/12 Medium uppercase (sidebar section)

## 6. 구현 상태

코드베이스에 위 스펙이 반영됨 (`src/app/dashboard/*`, `src/components/dashboard/*`).

Figma 파일 생성 시 이 문서 + `src/lib/dashboard/content.ts` 텍스트를 소스로 사용.
