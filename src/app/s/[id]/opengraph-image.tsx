import { ImageResponse } from "next/og";
import { codeToTokens } from "shiki";
import type { BundledLanguage } from "shiki";
import { getSnippet } from "@/lib/github/snippets";
import { getLanguageColor } from "@/lib/utils/utils";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";
export const alt = "Code snippet preview";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const revalidate = 3600;

// ---- code window metrics ----
const CODE_FONT_SIZE = 13;
const CODE_LINE_HEIGHT = 21;
const CODE_V_PAD = 12;
const TAB_HEIGHT = 34;
const MAX_LINE_LENGTH = 120;

// ---- chrome metrics ----
const PAD_X = 40;
const PAD_Y = 32;
const HEADER_HEIGHT = 16;
const TITLE_LINE_HEIGHT = 34;
const META_HEIGHT = 16;
const GAP_HEADER = 12;
const GAP_TITLE = 6;
const GAP_META = 18;

const LINE_NUM_WIDTH = 44;
const LINE_NUM_PAD_RIGHT = 12;
const CODE_PAD_RIGHT = 16;

interface Token {
  content: string;
  color?: string;
  fontStyle?: number;
}

interface FontFace {
  name: string;
  data: ArrayBuffer;
  weight: 400 | 700;
  style: "normal";
}

let fontCache: FontFace[] | null = null;

async function loadFonts(): Promise<FontFace[]> {
  if (fontCache) return fontCache;

  const css = await fetch(
    "https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;700&display=swap",
    { headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64)" } }
  ).then((r) => r.text());

  const faces = css.match(/@font-face\s*{[^}]*}/g) || [];
  const fonts: FontFace[] = [];
  for (const face of faces) {
    const weight = Number(face.match(/font-weight:\s*(\d+)/)?.[1] || 400) as
      | 400
      | 700;
    const url = face.match(/url\((https:[^)]+)\)/)?.[1];
    if (!url) continue;
    const data = await fetch(url).then((r) => r.arrayBuffer());
    fonts.push({ name: "Mono", data, weight, style: "normal" });
  }

  fontCache = fonts;
  return fonts;
}

function truncateText(text: string, max: number): string {
  return text.length > max ? text.slice(0, max) + "…" : text;
}

function truncateLine(line: Token[], max = MAX_LINE_LENGTH): Token[] {
  const total = line.reduce((s, t) => s + t.content.length, 0);
  if (total <= max) return line;

  let used = 0;
  const out: Token[] = [];
  for (const t of line) {
    const rem = max - used;
    if (rem <= 0) break;
    if (t.content.length < rem) {
      out.push(t);
      used += t.content.length;
    } else {
      out.push({ ...t, content: t.content.slice(0, rem) + "…" });
      break;
    }
  }
  return out;
}

async function getTokens(
  code: string,
  language: string,
  maxLines: number
): Promise<Token[][]> {
  try {
    const res = await codeToTokens(code, {
      lang: language as BundledLanguage,
      theme: "dark-plus",
    });
    return res.tokens.slice(0, maxLines).map(truncateLine);
  } catch {
    return code
      .split("\n")
      .slice(0, maxLines)
      .map((content) => [{ content, color: "#d4d4d4" }]);
  }
}

function capitalize(language: string): string {
  return language.charAt(0).toUpperCase() + language.slice(1);
}

export default async function Image({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [fonts, snippet] = await Promise.all([loadFonts(), getSnippet(id)]);

  const title = snippet?.title || "Code Snippet";
  const language = snippet?.language || "text";
  const author = snippet?.author || "Anonymous";
  const code = snippet?.code || "";
  const lineCount = code.split("\n").length;
  const langColor = getLanguageColor(language);
  const host = siteConfig.url.replace(/^https?:\/\//, "");

  // Exact pixel budget so the code window is sized to fit every rendered line
  // and never clips the last one.
  const contentHeight = size.height - PAD_Y * 2;
  const chromeHeight =
    HEADER_HEIGHT +
    GAP_HEADER +
    TITLE_LINE_HEIGHT +
    GAP_TITLE +
    META_HEIGHT +
    GAP_META;
  const codeBoxHeight = contentHeight - chromeHeight;
  const codeAreaHeight = codeBoxHeight - TAB_HEIGHT - 2; // 2px = box border
  const maxLines = Math.max(
    1,
    Math.floor((codeAreaHeight - CODE_V_PAD * 2) / CODE_LINE_HEIGHT)
  );
  const tokens = await getTokens(code, language, maxLines);
  const codeAreaUsed = tokens.length * CODE_LINE_HEIGHT + CODE_V_PAD * 2;

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          flexDirection: "column",
          backgroundColor: "#09090b",
          padding: `${PAD_Y}px ${PAD_X}px`,
          color: "#fafafa",
          fontFamily: "Mono",
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            height: HEADER_HEIGHT,
            marginBottom: GAP_HEADER,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{ width: 10, height: 10, borderRadius: 999, backgroundColor: langColor }}
            />
            <span style={{ fontSize: 14, color: "#a1a1aa" }}>{siteConfig.name}</span>
          </div>
          <span style={{ fontSize: 12, color: "#52525b" }}>{host}</span>
        </div>

        <div
          style={{
            fontSize: 28,
            fontWeight: 700,
            height: TITLE_LINE_HEIGHT,
            lineHeight: `${TITLE_LINE_HEIGHT}px`,
            marginBottom: GAP_TITLE,
            color: "#fafafa",
          }}
        >
          {truncateText(title, 64)}
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            height: META_HEIGHT,
            fontSize: 14,
            color: "#a1a1aa",
            marginBottom: GAP_META,
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              style={{ width: 8, height: 8, borderRadius: 999, backgroundColor: langColor }}
            />
            <span style={{ color: "#e4e4e7" }}>{capitalize(language)}</span>
          </span>
          <span style={{ color: "#3f3f46" }}>•</span>
          <span>by {truncateText(author, 24)}</span>
          <span style={{ color: "#3f3f46" }}>•</span>
          <span>{lineCount} lines</span>
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            height: codeBoxHeight,
            backgroundColor: "#1e1e1e",
            border: "1px solid #2b2b2b",
            borderRadius: 12,
            overflow: "hidden",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              height: TAB_HEIGHT,
              backgroundColor: "#252526",
              borderBottom: "1px solid #1e1e1e",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                height: TAB_HEIGHT,
                padding: "0 14px",
                backgroundColor: "#1e1e1e",
                borderRight: "1px solid #252526",
              }}
            >
              <span style={{ width: 10, height: 10, borderRadius: 3, backgroundColor: langColor }} />
              <span style={{ fontSize: 13, color: "#cccccc" }}>{capitalize(language)}</span>
              <span style={{ fontSize: 11, color: "#6e6e6e" }}>{tokens.length}L</span>
            </div>
            <span style={{ fontSize: 11, color: "#6e6e6e", paddingRight: 14, letterSpacing: 1 }}>
              CODE
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              height: codeAreaUsed,
              padding: `${CODE_V_PAD}px 0`,
              fontFamily: "Mono",
              fontSize: CODE_FONT_SIZE,
              lineHeight: `${CODE_LINE_HEIGHT}px`,
            }}
          >
            {tokens.map((line, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  whiteSpace: "pre",
                  height: CODE_LINE_HEIGHT,
                }}
              >
                <span
                  style={{
                    width: LINE_NUM_WIDTH,
                    flexShrink: 0,
                    textAlign: "right",
                    paddingRight: LINE_NUM_PAD_RIGHT,
                    color: "#6e6e6e",
                    fontSize: 12,
                    lineHeight: `${CODE_LINE_HEIGHT}px`,
                  }}
                >
                  {i + 1}
                </span>
                <span
                  style={{
                    color: "#d4d4d4",
                    paddingRight: CODE_PAD_RIGHT,
                    whiteSpace: "pre",
                  }}
                >
                  {line.length > 0
                    ? line.map((t, j) => (
                        <span
                          key={j}
                          style={{
                            color: t.color || "#d4d4d4",
                            fontWeight:
                              t.fontStyle === 2 || t.fontStyle === 3 ? 700 : 400,
                          }}
                        >
                          {t.content}
                        </span>
                      ))
                    : " "}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    {
      width: size.width,
      height: size.height,
      fonts,
    }
  );
}