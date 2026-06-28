# Loclone

웹사이트 URL → 추출 → Next.js 클론 → QA → ZIP 납품까지 한 플랫폼.

## 빠른 시작

```bash
cp .env.example .env.local
npm install
npm run dev
```

브라우저: http://localhost:3000/dashboard/projects

- Supabase 미설정 시 **개발 모드**로 대시보드 즉시 사용
- DB 미설정 시 `storage/loclone-db.json` 로컬 스토어 사용

## 주요 경로

| 경로 | 설명 |
|------|------|
| `/dashboard/projects` | 프로젝트 CRUD |
| `/dashboard/projects/[id]/clone` | URL 클론 실행 |
| `/dashboard/projects/[id]/preview` | 원본 vs 클론 비교 |
| `/dashboard/projects/[id]/qa` | 납품 QA 리포트 |
| `/dashboard/runs` | 실행 기록 |
| `/dashboard/sites` | 납품 후 헬스체크 |
| `/dashboard/waiting` | **인간 선택 대기 목록** |
| `/dashboard/admin` | Admin (staff/admin) |

## 에이전트 클론 (픽셀 단위)

Cursor/Claude에서:

```
/clone-website https://example.com
```

`.claude/skills/clone-website/SKILL.md` 참고. 브라우저 MCP 필요 → 대기 목록 참고.

## 환경 변수

`.env.example` 참고. 미설정 항목은 `/dashboard/waiting`에 자동 등록.

## 스크립트

- `npm run dev` — 개발 서버
- `npm run check` — lint + typecheck + build
- `npm run clone:run` — CLI 클론 (레거시)

## 아키텍처

- **Next.js 16** + shadcn/ui + Tailwind v4
- **스토어**: `storage/loclone-db.json` (Neon 연동은 대기 목록 가이드)
- **클론 코어**: webclone (`src/lib/clone/*`)
- **대시보드**: wallpilotpro 패턴 Sidebar

## 납품

`docs/HANDOFF.md` + `/api/projects/[id]/export` ZIP
