# Clone Worker + Blob 배포 가이드

> **상태 (2026-06-30):** 아래 인프라가 CLI로 프로비저닝 완료됨.

| 리소스 | URL / ID |
|--------|----------|
| Vercel 앱 | https://loclone.vercel.app |
| Blob Store | `loclone-clone` (`store_JVxoBmxU3ufF4j2Z`, iad1, public) |
| Render Worker | https://loclone-clone-worker.onrender.com (`srv-d91mvfdaeets73fqjek0`) |

Production 환경 변수: `DATABASE_URL`, `LOCLONE_AUTH_MODE`, `BLOB_READ_WRITE_TOKEN`, `CLONE_WORKER_URL`

## 1. Vercel Blob (에셋 영구 저장)

1. [Vercel Dashboard → Storage → Blob](https://vercel.com/dashboard/stores) 에서 **Create Store** → 프로젝트 `loclone` 연결
2. 생성되면 `BLOB_READ_WRITE_TOKEN` 이 Production 환경 변수로 자동 주입됩니다.
3. Render Worker에도 **동일 토큰**을 설정해야 mirror/render 결과가 Vercel에서 미리보기 가능합니다.

```powershell
# 로컬 확인
vercel env pull .env.local --yes
```

## 2. Render Clone Worker (JS 렌더 / 미러)

### Blueprint (권장)

1. GitHub `shinkang888-code/loclone` 에 `render.yaml` 푸시
2. [Render Blueprints](https://dashboard.render.com/blueprints) → **New Blueprint Instance**
3. 저장소 연결 후 배포
4. Environment → `BLOB_READ_WRITE_TOKEN` 수동 추가 (Vercel Blob과 동일 값)

### 서비스 URL

배포 후 Worker URL 예: `https://loclone-clone-worker.onrender.com`

```powershell
# Vercel Production
vercel env add CLONE_WORKER_URL production
# 값: https://loclone-clone-worker.onrender.com
```

### 로컬 Worker

```powershell
cd services/clone-worker
npm run dev
# .env.local: CLONE_WORKER_URL=http://localhost:3100
```

## 3. 검증

```powershell
curl.exe https://loclone.vercel.app/api/health
curl.exe https://YOUR-WORKER.onrender.com/health
```

| 모드 | 필요 조건 |
|------|-----------|
| 빠른 추출 | Vercel만 (Neon + `/tmp`) |
| JS 렌더 / 미러 | `CLONE_WORKER_URL` + Render Worker **또는** `FIRECRAWL_API_KEY` (Firecrawl) |
| 영구 에셋 | `BLOB_READ_WRITE_TOKEN` (Vercel + Worker) |
