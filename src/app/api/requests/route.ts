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

    const { getAllRequests } = await import("@/lib/github/requests");
    const requests = await getAllRequests();

    return NextResponse.json({ success: true, data: requests });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body.title || !body.description) {
      return NextResponse.json(
        { success: false, error: "Title and description are required" },
        { status: 400 }
      );
    }

    if (typeof body.title !== "string" || body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid title" },
        { status: 400 }
      );
    }

    if (typeof body.description !== "string" || body.description.length > 1000) {
      return NextResponse.json(
        { success: false, error: "Invalid description" },
        { status: 400 }
      );
    }

    const { createRequest } = await import("@/lib/github/requests");
    const created = await createRequest({
      title: body.title,
      description: body.description,
      language:
        typeof body.language === "string" ? body.language.slice(0, 30) : undefined,
      requester:
        typeof body.requester === "string" ? body.requester.slice(0, 50) : undefined,
      contact:
        typeof body.contact === "string" ? body.contact.slice(0, 100) : undefined,
    });

    if (!created) {
      return NextResponse.json(
        { success: false, error: "Failed to submit request" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: created }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}