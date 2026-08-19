import { NextResponse } from "next/server";
import { getSnippet } from "@/lib/github/snippets";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const revalidate = 3600;

const PIKWY_API = "https://api.pikwy.com";

interface PikwyResponse {
  code?: number;
  mesg?: string;
  iurl?: string;
  durl?: string;
  curl?: string;
  ourl?: string;
  url_pdf?: string;
}

async function captureImageUrl(apiUrl: string): Promise<string | null> {
  // The free web endpoint occasionally returns a transient "error of worker"
  // when its queue is busy, so retry a few times before giving up.
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const res = await fetch(apiUrl, { cache: "no-store" });
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }
      const payload = (await res.json()) as PikwyResponse;
      if (!payload.code && payload.iurl) {
        return payload.iurl;
      }
    } catch {
      // fall through to retry
    }
    if (attempt < 2) {
      await new Promise((r) => setTimeout(r, 2000));
    }
  }
  return null;
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // Resolve the snippet first so unknown IDs 404 without capturing a 404 page.
  const snippet = await getSnippet(id);
  if (!snippet) {
    return new NextResponse("Not Found", { status: 404 });
  }

  // The public web screenshot endpoint (tkn=125, rt=jweb) is the same call the
  // free https://pikwy.com tool makes. It returns a JSON payload with an image
  // URL that is publicly accessible — no API token required.
  const api = new URL(PIKWY_API);
  api.searchParams.set("tkn", "125");
  api.searchParams.set("rt", "jweb");
  api.searchParams.set("u", `${siteConfig.url}/og/${id}`);
  api.searchParams.set("w", "1200");
  api.searchParams.set("h", "630");
  api.searchParams.set("f", "png");
  api.searchParams.set("fs", "0");
  api.searchParams.set("s", "100");
  api.searchParams.set("z", "100");
  api.searchParams.set("d", "3000");

  const iurl = await captureImageUrl(api.toString());
  if (!iurl) {
    return new NextResponse("Screenshot service error", { status: 502 });
  }

  const img = await fetch(iurl, { cache: "no-store" });
  if (!img.ok) {
    return new NextResponse("Screenshot service error", { status: 502 });
  }

  const buffer = Buffer.from(await img.arrayBuffer());
  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": buffer.byteLength.toString(),
      "Cache-Control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
    },
  });
}