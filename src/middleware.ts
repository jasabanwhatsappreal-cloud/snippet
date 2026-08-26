import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.svg|api/log-visit).*)"],
};

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "127.0.0.1";

  const page = request.nextUrl.pathname;

  fetch(`${request.nextUrl.origin}/api/log-visit`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ip, page }),
  }).catch(() => {});

  return response;
}
