# Phase H — 인간 개입 (대기 목록)

자동화로 처리할 수 없는 항목은 `/dashboard/waiting`에 등록됩니다.

| 항목 | 트리거 | 해결 방법 |
|------|--------|-----------|
| Clone Worker | render/mirror/spa + `CLONE_WORKER_URL` 미설정 | `docker compose up clone-worker` |
| Playwright Chromium | Worker 첫 실행 시 | `cd services/clone-worker && npx playwright install chromium` |
| Worker 런타임 검증 | render/mirror 실제 클론 테스트 | Worker 기동 후 샘플 URL 클론 |
| Browser MCP | agent-pixel 모드 | Cursor MCP + `/clone-website` |
| FireCrawl | scraperBackend=firecrawl | `FIRECRAWL_API_KEY` |
| Crawl4AI | scraperBackend=crawl4ai | `CRAWL4AI_BASE_URL` |
| Neon DB | `DATABASE_URL` 미설정 | Neon 콘솔 |
| Supabase Auth | OAuth 키 미설정 | Supabase 대시보드 |
| Vercel Token | 배포 | Vercel 토큰 |

완료 후 대기 목록에서 "완료" 처리하세요.
