import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { getSnippet, incrementViews } = await import(
      "@/lib/github/snippets"
    );
    const snippet = await getSnippet(id);

    if (!snippet) {
      return NextResponse.json(
        { success: false, error: "Snippet not found" },
        { status: 404 }
      );
    }

    incrementViews(id).catch(() => {});

    return NextResponse.json({ success: true, data: snippet });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { validateSession } = await import("@/lib/auth/auth");
    const isAuth = await validateSession();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { updateSnippet } = await import("@/lib/github/snippets");
    const updated = await updateSnippet(id, body);

    if (!updated) {
      return NextResponse.json(
        { success: false, error: "Failed to update snippet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { validateSession } = await import("@/lib/auth/auth");
    const isAuth = await validateSession();
    if (!isAuth) {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { deleteSnippet } = await import("@/lib/github/snippets");
    const deleted = await deleteSnippet(id);

    if (!deleted) {
      return NextResponse.json(
        { success: false, error: "Failed to delete snippet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
