import Link from "next/link";
import { PageHero } from "@/components/dashboard/page-hero";
import { SectionHeading } from "@/components/dashboard/section-heading";
import { Badge } from "@/components/ui/badge";

const ENV_VARS = [
  {
    key: "LOCLONE_AUTH_MODE",
    desc: "dev — 개발 모드 자동 로그인. 프로덕션은 Supabase Auth 사용.",
    required: false,
  },
  {
    key: "DATABASE_URL",
    desc: "Neon PostgreSQL 연결 문자열. 미설정 시 로컬 JSON 파일 사용.",
    required: true,
  },
  {
    key: "FIRECRAWL_API_KEY",
    desc: "Firecrawl API 키. SPA(Next.js) JS 렌더·미러 시 Worker 대신 사용.",
    required: false,
  },
  {
    key: "CLONE_WORKER_URL",
    desc: "render/mirror/spa 모드용 Worker URL (예: http://localhost:3100)",
    required: false,
  },
  {
    key: "VERCEL_TOKEN",
    desc: "원클릭 배포용 Vercel API 토큰",
    required: false,
  },
  {
    key: "NEXT_PUBLIC_SUPABASE_URL",
    desc: "프로덕션 Google OAuth 등 Supabase Auth",
    required: false,
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <PageHero
        title="환경 설정"
        description="아래 변수를 .env.local 또는 Vercel 환경 변수에 설정하세요. 미설정 항목은 대기 목록에 자동 등록됩니다."
        actions={[{ label: "대기 목록", href: "/dashboard/waiting", variant: "outline" }]}
      />

      <section className="space-y-4">
        <SectionHeading title="환경 변수" />
        <div className="space-y-3">
          {ENV_VARS.map((v) => (
            <div key={v.key} className="rounded-xl border bg-card p-5">
              <div className="flex flex-wrap items-center gap-2">
                <code className="rounded bg-indigo-50 px-2 py-1 text-sm font-semibold text-indigo-800">
                  {v.key}
                </code>
                {v.required && <Badge variant="warning">프로덕션 권장</Badge>}
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{v.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="rounded-xl border border-indigo-200 bg-indigo-50 p-5 text-sm">
        <p className="font-semibold text-indigo-900">로컬 Worker 빠른 설정</p>
        <pre className="mt-3 overflow-x-auto rounded-lg bg-white p-4 text-xs">
{`docker compose up clone-worker
# .env.local
CLONE_WORKER_URL=http://localhost:3100`}
        </pre>
        <p className="mt-3 text-indigo-800">
          자세한 내용은{" "}
          <Link href="/dashboard/guide" className="font-medium underline">
            사용 가이드
          </Link>
          를 참고하세요.
        </p>
      </section>
    </div>
  );
}
