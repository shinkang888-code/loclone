import { getRunLogs } from "@/lib/clone/logs";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ runId: string }> };

export async function GET(request: Request, { params }: Params) {
  const { runId } = await params;
  const accept = request.headers.get("accept") ?? "";

  try {
    const logs = await getRunLogs(runId);

    if (accept.includes("text/event-stream")) {
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
          for (const entry of logs) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(entry)}\n\n`));
          }
          controller.enqueue(
            encoder.encode(
              `data: ${JSON.stringify({ ts: new Date().toISOString(), level: "info", message: "STREAM_END" })}\n\n`,
            ),
          );
          controller.close();
        },
      });
      return new Response(stream, {
        headers: {
          "content-type": "text/event-stream",
          "cache-control": "no-cache",
        },
      });
    }

    return Response.json({ ok: true, logs });
  } catch {
    return Response.json({ ok: true, logs: [] });
  }
}
