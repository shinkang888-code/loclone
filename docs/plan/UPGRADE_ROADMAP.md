# Loclone 업그레이드 로드맵 (통합 실행안)

> **메인 베이스:** [shinkang888-code/loclone](https://github.com/shinkang888-code/loclone)  
> **로컬:** `e:\cursor\loclone`  
> **작성:** 2026-06-29  
> **범위:** GitHub 오픈소스 + Hugging Face Spaces/Datasets + Kaggle Notebooks/Datasets

---

## 0. 전략 한 줄

**Loclone 대시보드·납품 파이프라인은 그대로 유지**하고, **클론 엔진만 Worker 분리 + 3플랫폼 기술 이식**으로 SPA·미러·픽셀 클론까지 커버한다.

```
┌─────────────────────────────────────────────────────────────────┐
│  Loclone (Next.js Dashboard)          ← 유지·확장              │
│  프로젝트 → 클론 → Preview → QA → ZIP export                    │
└───────────────────────────┬─────────────────────────────────────┘
                            │ REST / SSE
┌───────────────────────────▼─────────────────────────────────────┐
│  services/clone-worker (신규)                                    │
│  static │ render │ mirror │ spa-states │ agent-pixel             │
└───────────────────────────┬─────────────────────────────────────┘
                            │
     GitHub: AnyDownload · websnap · site-mirror · Crawl4AI
     HF:     re-mind/Crawl4AI · logiover/sitemap · llm-web-scrapper
     Kaggle: sitemap dataset · Selenium/BFS 노트북 레퍼런스
```

---

## 1. 현재 상태 vs 목표

| 영역 | 현재 (Loclone) | Phase 4 완료 후 |
|------|----------------|-----------------|
| 클론 엔진 | `fetch()` + regex (`run-clone.ts`) | Playwright Worker 6모드 |
| SPA | 거의 불가 | render + spa-states |
| 다중 페이지 | 1페이지 | mirror (sitemap 시드 + BFS) |
| 에셋 | img/icon | CSS/JS/font/video + 가로채기 |
| Run 가시성 | status만 | SSE 로그 + step 타임라인 |
| QA | SEO/perf/a11y 점수 | + Design token · Tech stack |
| 외부 연동 | `/clone-website` 스킬 | 스킬 + Worker 자동 foundation |

---

## 2. 소스 맵 — 3플랫폼 통합

### 2.1 GitHub (엔진·아키텍처)

| 우선순위 | 리포 | Loclone 역할 |
|----------|------|-------------|
| **P0** | [AnyDownload](https://github.com/HenryLok0/AnyDownload) | render/mirror preset, offline preview, wizard UX |
| **P0** | [websnap](https://github.com/uirip/websnap) | SPA 상태 트리, asset intercept, daemon 패턴 |
| **P1** | [site-mirror](https://github.com/MaheshDoiphode/site-mirror) | sitemap seed, sameOrigin, SPA offline nav |
| **P1** | [Crawl4AI](https://github.com/unclecode/crawl4ai) | browser pool, monitoring dashboard, deep crawl |
| **P1** | [WebCloner](https://github.com/nikomarinovic/WebCloner) | BFS + 링크 재작성 |
| **P2** | [firecrawl-simple](https://github.com/devflowinc/firecrawl-simple) | Redis+Bull 장기 job |
| **P2** | [webrecon](https://github.com/ozenalp22/webrecon) | QA 병렬 분석 (Design/Tech/SEO) |
| **P2** | [ultimate-web-cloner](https://github.com/kutyfuty/ultimate-web-cloner) | Visual QA·품질 5-pillar 리포트 |

### 2.2 Hugging Face (Worker·UI·데이터)

| 우선순위 | 리소스 | URL | Loclone 역할 |
|----------|--------|-----|-------------|
| **P0** | Crawl4AI Space | https://huggingface.co/spaces/re-mind/Crawl4AI | Worker API·Playwright 크롤 베이스 |
| **P0** | sitemap-to-url-crawler | https://huggingface.co/datasets/logiover/sitemap-to-url-crawler-sample-data | mirror URL 시드 스키마 |
| **P1** | LLM Web Scraper | https://huggingface.co/spaces/frkhan/llm-web-scrapper | FireCrawl/Crawl4AI 듀얼 엔진 선택 UI |
| **P1** | ScrapeFlow Dashboard | https://huggingface.co/spaces/ShoppingSW/scrapeflow-web-scraping-dashboard-delight | Run 로그·진행률 UI |
| **P1** | Website Cloner Backend | https://huggingface.co/spaces/0ZeroXD/website-cloner-backend | Docker FE/BE 분리 레퍼런스 |
| **P2** | CRAWL-GPT-CHAT | https://huggingface.co/spaces/jatinmehra/CRAWL-GPT-CHAT | 크롤→RAG→챗 (QA 확장) |
| **P2** | Qwen3 Coder WebDev | https://huggingface.co/spaces/Qwen/Qwen3-Coder-WebDev | agent-pixel 보조 코드 생성 |
| **참고** | Crawling Top 20 가이드 | https://huggingface.co/blog/samihalawa/crawling-mster-best-scrap-guide | static fallback (wget) 문서화 |
| **참고** | Crawl4AI deep crawl | https://huggingface.co/blog/lynn-mikami/crawl-ai | BFS depth/maxPages 설정 |

### 2.3 Kaggle (구현 레퍼런스·시드 데이터)

| 우선순위 | 리소스 | URL | Loclone 역할 |
|----------|--------|-----|-------------|
| **P0** | Sitemap to URL Crawler | https://www.kaggle.com/datasets/logiover/sitemap-to-url-crawler-data | mirror 시드 (HF와 동일 출처) |
| **P1** | Dynamic + Selenium | https://www.kaggle.com/code/yingfu46/scrape-dynamic-website-with-selenium | render 모드 Python→TS 포팅 참고 |
| **P1** | web crawler (BFS) | https://www.kaggle.com/code/mackuber/web-crawler | mirror BFS 알고리즘 |
| **P1** | Wikipedia webcrawler | https://www.kaggle.com/code/adepvenugopal/webscraping-webcrawler-wikipedia | sameOrigin BFS 패턴 |
| **P2** | BeautifulSoup + Requests | https://www.kaggle.com/code/imoore/web-scraping-using-beautifulsoup-and-requests-libs | static 모드 `extract.ts` 개선 |
| **P2** | requests_html | https://www.kaggle.com/code/adahmed/web-scraping-with-requests-html | 경량 JS 렌더 middle tier |

> Kaggle CLI 재검색: `kaggle auth login` 후 `kaggle datasets list -s "sitemap crawler"`

---

## 3. 클론 모드 6종 (통합 스펙)

| 모드 | 엔진 | 주요 소스 | Loclone UI 라벨 |
|------|------|-----------|-----------------|
| `static` | fetch + regex/cheerio | Loclone `extract.ts`, Kaggle BeautifulSoup | 빠른 추출 |
| `render` | Playwright 단일 페이지 | AnyDownload `--mode render`, Kaggle Selenium | JS 렌더 |
| `full` | BFS depth=2 | WebCloner, Kaggle web-crawler | 소형 사이트 |
| `mirror` | BFS depth=5 + sitemap | site-mirror, **logiover sitemap** (HF/Kaggle) | 미러 |
| `spa-states` | 상태 트리 BFS | websnap | SPA 상태 탐색 |
| `agent-pixel` | Browser MCP + Skill | Loclone `.claude/skills/clone-website`, HF Qwen3 WebDev | AI 픽셀 클론 |

### CloneRequest 확장 (목표 스키마)

```typescript
// src/lib/schemas/project.ts
{
  url: string;
  mode: "static" | "render" | "full" | "mirror" | "spa-states" | "agent-pixel";
  options?: {
    maxDepth?: number;       // AnyDownload preset
    maxPages?: number;       // site-mirror / Crawl4AI
    sameOriginOnly?: boolean;
    seedSitemaps?: boolean;  // logiover sitemap (HF/Kaggle)
    browser?: "playwright" | "puppeteer";
    scraperBackend?: "local" | "crawl4ai" | "firecrawl"; // HF llm-web-scrapper 패턴
    headless?: boolean;
  };
}
```

---

## 4. Phase별 실행 계획

### Phase 0 — 기반·모드 UI (1주)

**목표:** 기존 static 클론 유지 + 모드 선택·스키마·Run step 확장

| # | 작업 | 수정/신규 파일 | 참고 소스 |
|---|------|----------------|-----------|
| 0.1 | `CloneMode` 타입 추가 | `src/types/clone.ts` | AnyDownload CLI flags |
| 0.2 | Zod 스키마 확장 | `src/lib/schemas/project.ts` | — |
| 0.3 | `CloneRun`에 `mode`, `options` 필드 | `src/lib/store/types.ts`, `file-store.ts` | — |
| 0.4 | clone-workspace 모드 선택 UI | `src/components/clone/clone-workspace.tsx` | AnyDownload GUI preset |
| 0.5 | 프로젝트 clone 페이지 연동 | `src/app/dashboard/projects/[id]/clone/page.tsx` | — |
| 0.6 | `run-clone.ts` mode 분기 (static=기존) | `src/lib/clone/run-clone.ts` | Kaggle BeautifulSoup 패턴 |

**완료 기준**
- [x] 6모드 UI에서 static 클론 정상 동작
- [x] Run 기록에 mode 저장
- [x] render/mirror 선택 시 "Worker 준비 중" 또는 waiting 등록

---

### Phase 1 — Playwright Worker (2~3주) ★ 핵심

**목표:** Vercel timeout 회피용 Worker 분리, `render` 모드 가동

| # | 작업 | 수정/신규 파일 | 참고 소스 |
|---|------|----------------|-----------|
| 1.1 | Worker 패키지 scaffold | `services/clone-worker/` | HF `0ZeroXD/website-cloner-backend` |
| 1.2 | docker-compose Worker 추가 | `docker-compose.yml` | Crawl4AI self-host |
| 1.3 | Playwright render (network idle) | `services/clone-worker/engines/render.ts` | AnyDownload, Kaggle Selenium |
| 1.4 | Asset interceptor | `services/clone-worker/lib/asset-interceptor.ts` | websnap, Crawl4AI |
| 1.5 | Link rewriter | `services/clone-worker/lib/link-rewriter.ts` | WebCloner |
| 1.6 | Worker HTTP API | `services/clone-worker/server.ts` | Crawl4AI REST |
| 1.7 | Loclone orchestrator | `src/lib/clone/worker-client.ts`, `run-clone.ts` | — |
| 1.8 | offline preview | `src/app/dashboard/projects/[id]/preview` | AnyDownload offline preview |

**Worker API (초안)**

```
POST /jobs          { url, mode, options }
GET  /jobs/:id      { status, progress, steps[], artifacts[] }
GET  /jobs/:id/logs SSE
POST /jobs/:id/cancel
GET  /health        { browserPool, queueDepth }
```

**완료 기준**
- [ ] React/Vite SPA 랜딩 1개 render 성공률 70%+ *(Phase H: Worker + Playwright 실행 필요)*
- [x] CSS/JS/font 에셋 로컬 저장
- [x] Preview iframe에서 오프라인 열람

---

### Phase 2 — Mirror / SPA / Sitemap (2주)

**목표:** 다중 페이지 미러 + sitemap 시드 + SPA 상태 (선택)

| # | 작업 | 수정/신규 파일 | 참고 소스 |
|---|------|----------------|-----------|
| 2.1 | sitemap URL 시드 | `services/clone-worker/lib/sitemap-seed.ts` | **HF/Kaggle logiover**, site-mirror |
| 2.2 | BFS site crawler | `services/clone-worker/engines/site-crawler.ts` | WebCloner, Kaggle mackuber BFS |
| 2.3 | sameOrigin + maxDepth | Worker options | site-mirror `--sameOriginOnly` |
| 2.4 | mirror preset (depth 5) | `run-clone.ts` preset map | AnyDownload `--preset mirror` |
| 2.5 | SPA state explorer (flag) | `services/clone-worker/engines/spa-explorer.ts` | websnap BFS + state hash |
| 2.6 | `_external` CDN 분리 | asset 저장 구조 | site-mirror |

**sitemap 시드 파이프라인**

```
URL 입력
  → logiover sitemap actor 스키마 참고 (HF dataset 필드: url, lastmod, priority)
  → /sitemap.xml 재귀 파싱
  → URL 큐 시드
  → BFS 크롤 (sameOrigin 필터)
```

**완료 기준**
- [ ] 50페이지 이하 마케팅 사이트 mirror 성공 *(Phase H: Worker 런타임 검증)*
- [x] sitemap 시드 ON/OFF 옵션 동작
- [x] spa-states는 experimental flag로 제공

---

### Phase 3 — 실시간 로그·Admin·듀얼 스크래퍼 (1~2주)

**목표:** Crawl4AI/ScrapeFlow급 Run 가시성 + Admin 메트릭

| # | 작업 | 수정/신규 파일 | 참고 소스 |
|---|------|----------------|-----------|
| 3.1 | Run SSE 로그 | `src/app/api/runs/[runId]/logs/route.ts` | Crawl4AI `/dashboard` |
| 3.2 | Run 상세 step 타임라인 | `src/app/dashboard/runs/[runId]/page.tsx` | ScrapeFlow Dashboard (HF) |
| 3.3 | Admin browser pool 카드 | `src/app/dashboard/admin/page.tsx` | Crawl4AI browser pool |
| 3.4 | Worker health 연동 | `src/app/api/admin/worker/route.ts` | Crawl4AI health |
| 3.5 | scraperBackend 선택 UI | clone-workspace 고급 옵션 | HF llm-web-scrapper (Crawl4AI/FireCrawl) |
| 3.6 | 3-step clone wizard | clone-workspace | AnyDownload `--wizard` |

**완료 기준**
- [x] Run 페이지에서 실시간 로그 스트림
- [x] Admin에서 Worker 상태·pool 가시화
- [ ] mirror job 5분+ 실행 시 SSE로 진행률 확인 *(Phase H: Worker 장시간 job)*

---

### Phase 4 — QA·Design Token·에이전트 통합 (2주)

**목표:** webrecon급 QA 확장 + agent-pixel handoff

| # | 작업 | 수정/신규 파일 | 참고 소스 |
|---|------|----------------|-----------|
| 4.1 | Design token 추출 리포트 | `src/lib/qa/design-tokens.ts` | webrecon Design agent |
| 4.2 | Tech stack 감지 | `src/lib/qa/tech-stack.ts` | INSPECTION_GUIDE Phase 4 |
| 4.3 | 원본 vs 클론 diff | `src/components/clone/preview-compare.tsx` | ultimate-web-cloner Visual QA |
| 4.4 | QA 패널 확장 | `src/components/qa/qa-panel.tsx` | webrecon 6-agent |
| 4.5 | agent-pixel → foundation 자동 | `src/app/api/projects/[id]/clone/agent/route.ts` | Loclone skill + HF Qwen3 WebDev |
| 4.6 | ZIP export에 QA·research 포함 | `src/lib/export/zip-project.ts` | HANDOFF.md |

**완료 기준**
- [x] QA 리포트에 design/tech 섹션 추가
- [x] agent-pixel Run 후 foundation step 자동 pending→running
- [x] export ZIP에 `docs/research/` + QA JSON 포함

---

### Phase 5 — 스케일 (선택, 2주+)

| # | 작업 | 참고 |
|---|------|------|
| 5.1 | Redis + Bull job queue | firecrawl-simple |
| 5.2 | Neon PostgreSQL 전환 | waiting 목록 가이드 |
| 5.3 | Worker Render/VPS 분리 배포 | HF Docker Space 패턴 |
| 5.4 | CRAWL-GPT RAG 연동 | HF jatinmehra/CRAWL-GPT-CHAT |

---

## 5. 디렉터리 목표 구조

```
loclone/
├── src/
│   ├── app/api/runs/[runId]/logs/     # Phase 3 SSE
│   ├── app/api/admin/worker/          # Phase 3
│   ├── components/clone/
│   │   ├── clone-workspace.tsx        # Phase 0~3 wizard
│   │   ├── mode-selector.tsx          # Phase 0 (신규)
│   │   └── run-log-viewer.tsx         # Phase 3 (신규)
│   └── lib/clone/
│       ├── run-clone.ts               # orchestrator
│       ├── worker-client.ts           # Phase 1
│       └── modes/                     # Phase 0~2
├── services/clone-worker/             # Phase 1~2 (신규)
│   ├── Dockerfile
│   ├── server.ts
│   ├── engines/
│   │   ├── static-fetch.ts
│   │   ├── render.ts
│   │   ├── site-crawler.ts
│   │   └── spa-explorer.ts
│   └── lib/
│       ├── asset-interceptor.ts
│       ├── link-rewriter.ts
│       └── sitemap-seed.ts            # HF/Kaggle logiover
└── docs/plan/
    ├── UPGRADE_ROADMAP.md             # 본 문서
    └── CLONE_UPGRADE_PLAN.md          # 상세 부록·레퍼런스
```

---

## 6. 일정·마일스톤

| Phase | 기간 | 마일스톤 | KPI |
|-------|------|----------|-----|
| **0** | 1주 | 모드 UI + static 유지 | 6모드 선택 가능 |
| **1** | 2~3주 | Worker + render | SPA 성공률 70%+ |
| **2** | 2주 | mirror + sitemap | 50p 미러 1회 성공 |
| **3** | 1~2주 | SSE + Admin | 장기 job 가시성 |
| **4** | 2주 | QA + agent handoff | export ZIP 완전 납품 |
| **5** | 선택 | Queue + Neon | mirror 500p+ |

**총 예상:** 8~10주 (Phase 5 제외)

---

## 7. Phase × 소스 교차 매트릭스

| Phase | GitHub | Hugging Face | Kaggle |
|-------|--------|--------------|--------|
| 0 | AnyDownload preset UX | — | BeautifulSoup notebook |
| 1 | AnyDownload render, websnap intercept | re-mind/Crawl4AI, 0ZeroXD backend | Selenium dynamic |
| 2 | site-mirror, WebCloner, websnap | logiover sitemap dataset | sitemap dataset, BFS notebooks |
| 3 | Crawl4AI monitoring | ScrapeFlow, llm-web-scrapper | — |
| 4 | webrecon, ultimate-web-cloner | Qwen3 WebDev, CRAWL-GPT | — |
| 5 | firecrawl-simple | Crawl4AI self-host docs | — |

---

## 8. 리스크 & 대응

| 리스크 | 대응 | 관련 소스 |
|--------|------|-----------|
| Vercel 60s timeout | Worker Docker 분리 | HF 0ZeroXD backend |
| SPA/인증 실패 | waiting + 수동 로그인 프로필 | AnyDownload auth |
| sitemap 없는 사이트 | BFS-only fallback | Kaggle web-crawler |
| websnap 복잡도 | spa-states experimental flag | websnap |
| FireCrawl API 비용 | scraperBackend=local 기본 | HF llm-web-scrapper |
| 저작권·ToS | robots.txt 존중 옵션 + 고지 | — |

---

## 9. 즉시 착수 체크리스트 (Phase 0 Sprint 1)

- [ ] `src/types/clone.ts` — `CloneMode`, `CloneOptions` 타입
- [ ] `src/components/clone/mode-selector.tsx` — 6모드 라디오 + 고급 옵션
- [ ] `clone-workspace.tsx` — mode-selector 통합
- [ ] `run-clone.ts` — `mode` 파라미터 수신 (static만 구현)
- [ ] `docker-compose.yml` — `clone-worker` 서비스 stub
- [ ] `docs/research/SITEMAP_SEED.md` — logiover 스키마 정리 (HF/Kaggle)
- [ ] GitHub Issue 5개: Phase 0~4 라벨 생성

---

## 10. 관련 문서

| 문서 | 용도 |
|------|------|
| [UPGRADE_ROADMAP.md](./UPGRADE_ROADMAP.md) | **본 실행 로드맵** |
| [CLONE_UPGRADE_PLAN.md](./CLONE_UPGRADE_PLAN.md) | 상세 아키텍처·부록 A~E |
| [HANDOFF.md](../HANDOFF.md) | 고객 납품 체크리스트 |
| [INSPECTION_GUIDE.md](../research/INSPECTION_GUIDE.md) | agent-pixel recon 가이드 |

---

*Loclone은 대시보드·납품의 주인이고, GitHub/HF/Kaggle은 클론 엔진·데이터·UI 패턴의 부품 창고다.*
