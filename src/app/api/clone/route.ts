import { NextResponse } from "next/server";
import { extractSiteData } from "@/lib/clone/extract";
import { saveCloneArtifacts } from "@/lib/clone/artifacts";
import { normalizeUrl } from "@/lib/clone/normalize-url";
import type { CloneRequest, CloneResponse } from "@/types/clone";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const FETCH_TIMEOUT_MS = 20_000;

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CloneRequest;
    if (!body.url) {
      return NextResponse.json<CloneResponse>(
        { ok: false, error: "URL을 입력해 주세요." },
        { status: 400 },
      );
    }

    const targetUrl = normalizeUrl(body.url);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);

    const response = await fetch(targetUrl, {
      signal: controller.signal,
      redirect: "follow",
      headers: {
        "user-agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36",
      },
    }).finally(() => clearTimeout(timeout));

    if (!response.ok) {
      return NextResponse.json<CloneResponse>(
        { ok: false, error: `대상 페이지 요청 실패: ${response.status}` },
        { status: 502 },
      );
    }

    const html = await response.text();
    const extracted = extractSiteData(html, targetUrl, response.url);
    const result = await saveCloneArtifacts(targetUrl, extracted);

    return NextResponse.json<CloneResponse>({ ok: true, result });
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "클로닝 처리 중 알 수 없는 오류가 발생했습니다.";
    return NextResponse.json<CloneResponse>(
      { ok: false, error: message },
      { status: 500 },
    );
  }
}
