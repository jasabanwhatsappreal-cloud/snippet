import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { getLanguageColor } from "@/lib/utils/utils";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const font = fetch(`${siteConfig.url}/fonts/inter.woff2`).then((res) =>
  res.arrayBuffer()
);

export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const fontData = await font;

  let title = "Code Snippet";
  let language = "text";
  let author = "Anonymous";
  let lineCount = 0;

  try {
    const { getSnippet } = await import("@/lib/github/snippets");
    const snippet = await getSnippet(id);
    if (snippet) {
      title = snippet.title;
      language = snippet.language;
      author = snippet.author;
      lineCount = snippet.code.split("\n").length;
    }
  } catch {
    // fallback values
  }

  const color = getLanguageColor(language);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "0 80px",
          background: "#09090b",
          color: "#fafafa",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              borderRadius: 999,
              background: color,
            }}
          />
          <div
            style={{
              fontSize: 30,
              color: "#a1a1aa",
              textTransform: "uppercase",
              letterSpacing: 1,
            }}
          >
            {language}
          </div>
          <div style={{ fontSize: 30, color: "#3f3f46" }}>&bull;</div>
          <div style={{ fontSize: 30, color: "#a1a1aa" }}>{lineCount} lines</div>
        </div>

        <div
          style={{
            fontSize: 64,
            fontWeight: 700,
            lineHeight: 1.15,
            maxWidth: 950,
            marginBottom: 24,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginTop: "auto",
            marginBottom: 40,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 999,
                background: "#7c3aed",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                fontWeight: 700,
              }}
            >
              {author.charAt(0).toUpperCase()}
            </div>
            <div style={{ fontSize: 26, color: "#fafafa" }}>{author}</div>
          </div>
          <div style={{ fontSize: 26, color: "#a1a1aa" }}>
            {siteConfig.name}
          </div>
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        {
          name: "Inter",
          data: fontData,
          weight: 400 as const,
          style: "normal" as const,
        },
        {
          name: "Inter",
          data: fontData,
          weight: 700 as const,
          style: "normal" as const,
        },
      ],
    }
  );
}