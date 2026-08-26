import { NextResponse } from "next/server";
import { getAllIps, getIpStats } from "@/lib/ip-db";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const filter = searchParams.get("filter") || "all";

    let ips = getAllIps();

    if (filter === "blacklisted") {
      ips = ips.filter((r) => r.blacklisted);
    } else if (filter === "whitelisted") {
      ips = ips.filter((r) => !r.blacklisted);
    }

    if (search) {
      const q = search.toLowerCase();
      ips = ips.filter(
        (r) =>
          r.ip.includes(q) ||
          r.pages.some((p) => p.toLowerCase().includes(q)) ||
          (r.note && r.note.toLowerCase().includes(q))
      );
    }

    const stats = getIpStats();

    return NextResponse.json({ success: true, data: { ips, stats } });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
