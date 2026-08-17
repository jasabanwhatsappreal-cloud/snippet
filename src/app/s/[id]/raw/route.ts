import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/snippets/${id}`
    );
    const data = await res.json();

    if (!data.success || !data.data) {
      return new NextResponse("Not Found", { status: 404 });
    }

    return new NextResponse(data.data.code, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
