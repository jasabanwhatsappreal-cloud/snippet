import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { incrementViews } = await import("@/lib/github/snippets");
    await incrementViews(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to update views" },
      { status: 500 }
    );
  }
}
