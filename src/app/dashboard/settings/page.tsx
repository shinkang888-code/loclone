export default function SettingsPage() {
  return (
    <div className="space-y-4 max-w-2xl">
      <h1 className="text-2xl font-bold">설정</h1>
      <div className="rounded-lg border p-4 text-sm space-y-2">
        <p><strong>LOCLONE_AUTH_MODE</strong> — dev 시 자동 로그인</p>
        <p><strong>DATABASE_URL</strong> — Neon (미설정 시 storage/loclone-db.json)</p>
        <p><strong>VERCEL_TOKEN</strong> — 원클릭 배포</p>
        <p><strong>NEXT_PUBLIC_SUPABASE_URL</strong> — 프로덕션 Auth</p>
      </div>
      <p className="text-sm text-muted-foreground">
        미설정 항목은 <a href="/dashboard/waiting" className="underline">대기 목록</a>에 자동 등록됩니다.
      </p>
    </div>
  );
}
