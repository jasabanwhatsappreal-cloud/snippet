import { NextResponse } from "next/server";
import { logVisit } from "@/lib/ip-db";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const ip = body.ip;
    const page = body.page || "/";

    if (!ip || typeof ip !== "string") {
      return NextResponse.json(
        { success: false, error: "Invalid IP" },
        { status: 400 }
      );
    }

    logVisit(ip, page);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
