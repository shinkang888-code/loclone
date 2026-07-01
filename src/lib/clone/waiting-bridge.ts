import { newId, writeDb } from "@/lib/store/file-store";
import type { WaitingCategory } from "@/lib/store/types";
import type { CloneMode } from "@/types/clone";
import { modeNeedsHuman, modeNeedsWorker } from "@/types/clone";

const WAITING_DEFS: Array<{
  id: string;
  category: WaitingCategory;
  title: string;
  description: string;
  actionUrl?: string;
  envKeys?: string[];
  when?: () => boolean;
}> = [
  {
    id: "clone-worker-url",
    category: "clone_worker",
    title: "Clone Worker 서비스 실행",
    description:
      "render/mirror/spa 모드는 Clone Worker가 필요합니다. docker compose up clone-worker 또는 npm run worker:dev 후 CLONE_WORKER_URL=http://localhost:3100 설정.",
    actionUrl: "https://github.com/shinkang888-code/loclone#clone-worker",
    envKeys: ["CLONE_WORKER_URL"],
    when: () => !process.env.CLONE_WORKER_URL?.trim(),
  },
  {
    id: "firecrawl-api",
    category: "credentials",
    title: "FireCrawl API 키 (선택)",
    description: "scraperBackend=firecrawl 사용 시 FIRECRAWL_API_KEY가 필요합니다. SPA(Next.js) 사이트에 권장.",
    envKeys: ["FIRECRAWL_API_KEY"],
    when: () => !process.env.FIRECRAWL_API_KEY?.trim(),
  },
  {
    id: "crawl4ai-url",
    category: "credentials",
    title: "Crawl4AI 서버 URL (선택)",
    description: "scraperBackend=crawl4ai 사용 시 CRAWL4AI_BASE_URL 설정.",
    envKeys: ["CRAWL4AI_BASE_URL"],
    when: () => !process.env.CRAWL4AI_BASE_URL?.trim(),
  },
];

export async function ensureWaitingForMode(
  mode: CloneMode,
  options?: { scraperBackend?: string },
): Promise<string | null> {
  const items: string[] = [];

  if (modeNeedsHuman(mode)) {
    await pushWaiting({
      category: "browser_mcp",
      title: "AI 픽셀 클론 — Browser MCP 연결",
      description:
        "agent-pixel 모드는 Cursor/Claude에서 Browser MCP와 /clone-website 스킬 실행이 필요합니다. foundation 단계는 에이전트가 수동으로 진행합니다.",
      actionUrl: "https://github.com/shinkang888-code/loclone",
    });
    items.push("browser_mcp");
  }

  if (modeNeedsWorker(mode)) {
    const backend =
      options?.scraperBackend ?? (process.env.FIRECRAWL_API_KEY?.trim() ? "firecrawl" : "local");
    if (backend === "firecrawl") {
      if (!process.env.FIRECRAWL_API_KEY?.trim()) {
        await pushWaiting(WAITING_DEFS.find((d) => d.id === "firecrawl-api")!);
        items.push("firecrawl");
      }
    } else if (!process.env.CLONE_WORKER_URL?.trim()) {
      await pushWaiting(WAITING_DEFS.find((d) => d.id === "clone-worker-url")!);
      items.push("clone_worker");
    }
    if (options?.scraperBackend === "crawl4ai") {
      await pushWaiting(WAITING_DEFS.find((d) => d.id === "crawl4ai-url")!);
      items.push("crawl4ai");
    }
  }

  if (items.length === 0) return null;
  return `/dashboard/waiting (${items.join(", ")})`;
}

async function pushWaiting(
  def: Omit<(typeof WAITING_DEFS)[0], "id" | "when">,
): Promise<void> {
  await writeDb((db) => {
    const exists = db.waitingItems.some(
      (w) => w.status === "pending" && w.title === def.title,
    );
    if (!exists) {
      db.waitingItems.push({
        id: newId(),
        category: def.category,
        title: def.title,
        description: def.description,
        actionUrl: def.actionUrl,
        envKeys: def.envKeys,
        status: "pending",
        createdAt: new Date().toISOString(),
      });
    }
  });
}

export async function scanCloneWorkerWaiting(): Promise<void> {
  for (const def of WAITING_DEFS) {
    if (def.when?.() === false) continue;
    if (def.when && !def.when()) continue;
    await pushWaiting(def);
  }
}
