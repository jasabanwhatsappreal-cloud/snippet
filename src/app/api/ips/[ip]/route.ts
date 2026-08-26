import { NextResponse } from "next/server";
import { getIp, setBlacklist } from "@/lib/ip-db";

export const runtime = "nodejs";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ip: string }> }
) {
  try {
    const { ip } = await params;
    const record = getIp(ip);

    if (!record) {
      return NextResponse.json(
        { success: false, error: "IP not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, data: record });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
