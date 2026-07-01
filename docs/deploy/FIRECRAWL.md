# Firecrawl 연동

SPA(Next.js) 사이트는 Render Worker Playwright 대신 **Firecrawl API**로 렌더할 수 있습니다.

## 1. API 키 발급

1. [firecrawl.dev](https://www.firecrawl.dev/) 가입
2. Dashboard → API Keys → 키 복사 (`fc-...`)

## 2. 환경 변수

| 변수 | 위치 | 설명 |
|------|------|------|
| `FIRECRAWL_API_KEY` | Vercel Production | 필수 |
| `FIRECRAWL_API_URL` | 선택 | 기본 `https://api.firecrawl.dev/v1` |

```powershell
# 로컬
# .env.local
FIRECRAWL_API_KEY=fc-your-key-here

# Vercel Production
vercel env add FIRECRAWL_API_KEY production
```

## 3. 사용 방법

1. 클론 탭 → **JS 렌더** 또는 **미러** 선택
2. **고급 옵션 보기** → `scraperBackend`
   - **자동**: `FIRECRAWL_API_KEY` 있으면 Firecrawl 사용
   - **firecrawl**: 명시적으로 Firecrawl 사용
   - **local**: Render Clone Worker (Playwright)
3. URL 입력 후 클론 실행

## 4. 모드별 동작

| 모드 | Firecrawl API |
|------|----------------|
| JS 렌더 | `POST /v1/scrape` (단일 페이지) |
| 소형 사이트 / 미러 / SPA | `POST /v1/crawl` + 폴링 |

## 5. 검증

```powershell
# 키 설정 후 loclone에서
# follawyer.co.kr + JS 렌더 + scraperBackend=firecrawl
```

Worker(`CLONE_WORKER_URL`) 없이도 Firecrawl 키만 있으면 JS 렌더·미러가 동작합니다.
