import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const q = searchParams.get("q") || "";

    if (q.length < 2) {
      return NextResponse.json({ success: true, data: [] });
    }

    const { getSnippets } = await import("@/lib/github/snippets");
    const result = await getSnippets({ search: q, perPage: 10 });

    return NextResponse.json({ success: true, data: result.snippets });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
