import { NextResponse } from "next/server";
import { getSnippet } from "@/lib/github/snippets";
import { buildPikwyUrl, fetchPikwyImage } from "@/lib/pikwy";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const revalidate = 3600;

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

  const buffer = await fetchPikwyImage(
    buildPikwyUrl(`${siteConfig.url}/og/${id}`).toString()
  );
  if (!buffer) {
    return new NextResponse("Screenshot service error", { status: 502 });
  }

  return new NextResponse(buffer, {
    headers: {
      "Content-Type": "image/png",
      "Content-Length": buffer.byteLength.toString(),
    },
  });
}