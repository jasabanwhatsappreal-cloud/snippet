import { NextResponse } from "next/server";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const perPage = parseInt(searchParams.get("per_page") || "12");
    const language = searchParams.get("language") || undefined;
    const tag = searchParams.get("tag") || undefined;
    const sort = (searchParams.get("sort") || "newest") as
      | "newest"
      | "oldest"
      | "popular"
      | "views";
    const search = searchParams.get("search") || undefined;

    const { getSnippets } = await import("@/lib/github/snippets");
    const result = await getSnippets({
      page,
      perPage,
      language,
      tag,
      sort,
      search,
    });

    return NextResponse.json({ success: true, data: result });
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

    if (!body.title || !body.code || !body.language) {
      return NextResponse.json(
        { success: false, error: "Title, code, and language are required" },
        { status: 400 }
      );
    }

    if (typeof body.title !== "string" || body.title.length > 100) {
      return NextResponse.json(
        { success: false, error: "Invalid title" },
        { status: 400 }
      );
    }

    if (typeof body.code !== "string" || body.code.length > 100000) {
      return NextResponse.json(
        { success: false, error: "Invalid code" },
        { status: 400 }
      );
    }

    const { createSnippet } = await import("@/lib/github/snippets");
    const snippet = await createSnippet({
      title: body.title,
      description: body.description || "",
      language: body.language,
      code: body.code,
      author: body.author || "Anonymous",
      tags: Array.isArray(body.tags) ? body.tags.slice(0, 10) : [],
      visibility: body.visibility || "public",
    });

    if (!snippet) {
      return NextResponse.json(
        { success: false, error: "Failed to create snippet" },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, data: snippet }, { status: 201 });
  } catch {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
