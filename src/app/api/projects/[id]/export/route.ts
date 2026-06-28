import { NextResponse } from "next/server";
import { createReadStream } from "node:fs";
import { requireUser } from "@/lib/auth/session";
import { exportProjectZip } from "@/lib/export/zip-project";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Params) {
  try {
    await requireUser();
    const { id } = await params;
    const zipPath = await exportProjectZip(id);
    const stream = createReadStream(zipPath);
    return new NextResponse(stream as unknown as BodyInit, {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="loclone-${id}.zip"`,
      },
    });
  } catch (error) {
    const msg = error instanceof Error ? error.message : "error";
    if (msg === "UNAUTHORIZED") return NextResponse.json({ ok: false, error: msg }, { status: 401 });
    return NextResponse.json({ ok: false, error: msg }, { status: 500 });
  }
}
