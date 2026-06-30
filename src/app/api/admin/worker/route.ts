import { getWorkerHealth } from "@/lib/clone/worker-client";

export const dynamic = "force-dynamic";

export async function GET() {
  const health = await getWorkerHealth();
  return Response.json({
    ok: true,
    configured: health !== null,
    health,
  });
}
