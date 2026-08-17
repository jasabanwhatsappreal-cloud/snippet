import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { validateSession } = await import("@/lib/auth/auth");
    const isAuth = await validateSession();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { getAllSnippets, getStats } = await import("@/lib/github/snippets");
    const snippets = await getAllSnippets();
    const stats = await getStats();

    return NextResponse.json({ success: true, data: { snippets, stats } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
