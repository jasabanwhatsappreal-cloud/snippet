import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");

    const { getPopularLanguages } = await import("@/lib/github/snippets");
    const languages = await getPopularLanguages(limit);

    return NextResponse.json({ success: true, data: languages });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}