import { NextResponse } from "next/server";

export async function GET() {
  try {
    const { validateSession } = await import("@/lib/auth/auth");
    const isAuth = await validateSession();
    return NextResponse.json({ success: true, isAdmin: isAuth });
  } catch {
    return NextResponse.json({ success: true, isAdmin: false });
  }
}
