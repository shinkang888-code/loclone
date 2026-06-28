import { newId, readDb, writeDb } from "./file-store";
import type { WaitingCategory, WaitingItem } from "./types";

const ENV_CHECKS: Array<{
  keys: string[];
  category: WaitingCategory;
  title: string;
  description: string;
  actionUrl?: string;
}> = [
  {
    keys: ["DATABASE_URL"],
    category: "database",
    title: "Neon PostgreSQL 연결",
    description:
      "프로덕션 DB용 DATABASE_URL을 설정하세요. 미설정 시 로컬 JSON 스토어로 동작합니다.",
    actionUrl: "https://console.neon.tech/",
  },
  {
    keys: ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"],
    category: "credentials",
    title: "Supabase Auth 설정",
    description: "Google OAuth 등 실제 로그인을 위해 Supabase 프로젝트를 연결하세요.",
    actionUrl: "https://supabase.com/dashboard",
  },
  {
    keys: ["VERCEL_TOKEN"],
    category: "deployment",
    title: "Vercel 배포 토큰",
    description: "원클릭 배포를 위해 VERCEL_TOKEN을 설정하세요.",
    actionUrl: "https://vercel.com/account/settings/tokens",
  },
  {
    keys: ["GOOGLE_PAGESPEED_API_KEY"],
    category: "credentials",
    title: "PageSpeed API (선택)",
    description: "Lighthouse 대신 PageSpeed API로 성능 점수를 가져올 수 있습니다.",
  },
];

const HUMAN_ITEMS: Array<Omit<WaitingItem, "id" | "status" | "createdAt">> = [
  {
    category: "browser_mcp",
    title: "브라우저 MCP 연결 (픽셀 클론)",
    description:
      "정밀 클론·스크린샷·computed CSS 추출을 위해 Cursor에 Chrome 또는 Playwright MCP를 연결하세요. clone-website 스킬 필수 요구사항입니다.",
    actionUrl: "https://github.com/JCodesMore/ai-website-cloner-template",
  },
  {
    category: "billing",
    title: "Stripe Billing (선택)",
    description: "SaaS 요금제를 연동하려면 Stripe 키와 상품을 설정하세요.",
    actionUrl: "https://dashboard.stripe.com/",
  },
];

export async function scanWaitingItems(): Promise<WaitingItem[]> {
  const pendingEnv = ENV_CHECKS.filter((check) =>
    check.keys.some((key) => !process.env[key]?.trim()),
  );

  await writeDb((db) => {
    for (const check of pendingEnv) {
      const exists = db.waitingItems.some(
        (w) => w.status === "pending" && w.title === check.title,
      );
      if (!exists) {
        db.waitingItems.push({
          id: newId(),
          category: check.category,
          title: check.title,
          description: check.description,
          actionUrl: check.actionUrl,
          envKeys: check.keys,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }
    for (const item of HUMAN_ITEMS) {
      const exists = db.waitingItems.some(
        (w) => w.status === "pending" && w.title === item.title,
      );
      if (!exists) {
        db.waitingItems.push({
          id: newId(),
          ...item,
          status: "pending",
          createdAt: new Date().toISOString(),
        });
      }
    }
  });

  const db = await readDb();
  return db.waitingItems.filter((w) => w.status === "pending");
}

export async function listWaitingItems(): Promise<WaitingItem[]> {
  const db = await readDb();
  return db.waitingItems.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );
}

export async function markWaitingDone(id: string): Promise<WaitingItem | null> {
  let updated: WaitingItem | null = null;
  await writeDb((db) => {
    const item = db.waitingItems.find((w) => w.id === id);
    if (item) {
      item.status = "done";
      updated = item;
    }
  });
  return updated;
}
