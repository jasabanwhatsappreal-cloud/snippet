import { NextResponse } from "next/server";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { incrementLikes } = await import("@/lib/github/snippets");
    await incrementLikes(id);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Failed to like snippet" },
      { status: 500 }
    );
  }
}
