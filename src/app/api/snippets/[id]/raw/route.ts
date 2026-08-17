import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { getSnippet } = await import("@/lib/github/snippets");
    const snippet = await getSnippet(id);

    if (!snippet) {
      return new NextResponse("Snippet not found", { status: 404 });
    }

    return new NextResponse(snippet.code, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return new NextResponse("Internal server error", { status: 500 });
  }
}
