import { NextResponse } from "next/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const { getSnippet } = await import("@/lib/github/snippets");
    const snippet = await getSnippet(id);

    if (!snippet) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const ext =
      {
        javascript: "js",
        typescript: "ts",
        python: "py",
        html: "html",
        css: "css",
        json: "json",
        php: "php",
        java: "java",
        cpp: "cpp",
        bash: "sh",
        go: "go",
        rust: "rs",
        ruby: "rb",
        sql: "sql",
        yaml: "yaml",
        markdown: "md",
      }[snippet.language] || "txt";

    return new NextResponse(snippet.code, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Disposition": `inline; filename="${id}.${ext}"`,
        "Cache-Control": "public, max-age=60",
      },
    });
  } catch {
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}