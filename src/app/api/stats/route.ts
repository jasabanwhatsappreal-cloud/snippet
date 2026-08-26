import { NextResponse } from "next/server";
import { getStats } from "@/lib/github/snippets";

export async function GET() {
  try {
    const stats = await getStats();
    return NextResponse.json({ success: true, data: stats });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
