import { NextResponse } from "next/server";
import { getSnippet } from "@/lib/github/snippets";
import { getLanguageColor, formatNumber } from "@/lib/utils/utils";
import { siteConfig } from "@/config/site";

export const runtime = "nodejs";

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const snippet = await getSnippet(id);
  if (!snippet) {
    return new NextResponse("Not Found", { status: 404 });
  }

  const langColor = getLanguageColor(snippet.language);
  const host = siteConfig.url.replace(/^https?:\/\//, "");
  const rawLanguage = snippet.language || "text";
  const language = escapeHtml(
    rawLanguage.charAt(0).toUpperCase() + rawLanguage.slice(1)
  );
  const title = escapeHtml(snippet.title?.trim() || "Untitled Snippet");
  const description = escapeHtml(
    snippet.description?.trim() || "Developer code snippet shared on Phrzy."
  );
  const author = escapeHtml(snippet.author?.trim() || "Phrzy");
  const tags = (Array.isArray(snippet.tags) ? snippet.tags : []).slice(0, 4);
  const tagsHtml =
    tags.length > 0
      ? tags
          .map((t) => `<span class="tag">${escapeHtml(t)}</span>`)
          .join("")
      : `<span class="notag">NO TAGS</span>`;

  const css = `
*{margin:0;padding:0;box-sizing:border-box}
html,body{width:1200px;height:630px;overflow:hidden;background:#09090b;font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Arial,sans-serif}
.mono{font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,"Liberation Mono",monospace}
.root{width:1200px;height:630px;display:flex;flex-direction:column;padding:40px 44px}
.top{height:44px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0}
.brand{display:flex;align-items:center;gap:10px;color:#a1a1aa;font-size:15px;font-weight:600}
.host{color:#71717a;font-size:12px}
.card{flex:1;min-height:0;display:flex;flex-direction:column;border:1px solid #27272a;border-radius:16px;overflow:hidden;background:#111113;margin-top:20px}
.bar{height:44px;flex-shrink:0;display:flex;align-items:center;background:#18181b;border-bottom:1px solid #27272a}
.dots{display:flex;align-items:center;gap:8px;padding:0 16px}
.dot{width:12px;height:12px;border-radius:50%}
.tab{display:flex;align-items:center;gap:9px;height:100%;padding:0 18px;background:#111113;border-left:1px solid #27272a;border-right:1px solid #27272a;color:#e4e4e7;font-size:13px;font-weight:500}
.tab-dot{width:12px;height:12px;border-radius:3px}
.tab-label{color:#71717a;font-size:11px}
.bar-right{flex:1;text-align:right;padding-right:18px;color:#71717a;font-size:11px;letter-spacing:1px}
.body{flex:1;min-height:0;display:flex;flex-direction:column;padding:32px 36px}
.kicker{color:#7c3aed;font-size:11px;letter-spacing:2px;font-weight:600}
h1{color:#fafafa;font-size:30px;font-weight:700;line-height:38px;margin-top:10px;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.desc{color:#a1a1aa;font-size:15px;line-height:24px;margin-top:14px;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
.spacer{flex:1;min-height:16px}
.foot{border-top:1px solid #27272a}
.tags{display:flex;align-items:center;gap:8px;margin-top:22px;min-height:30px}
.tag{max-width:180px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:#c4b5fd;background:#7c3aed20;border:1px solid #7c3aed40;border-radius:999px;padding:5px 13px}
.notag{font-size:12px;color:#71717a}
.meta{display:flex;align-items:center;justify-content:space-between;margin-top:20px}
.meta-left{display:flex;align-items:center;gap:12px;font-size:13px;color:#71717a}
.meta-author{color:#d4d4d8}
.meta-cta{color:#a78bfa;font-size:13px;font-weight:600}
.bottom{height:20px;flex-shrink:0;display:flex;align-items:center;justify-content:center;gap:8px;color:#71717a;font-size:12px;margin-top:16px}
.sep{color:#3f3f46}
`;

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="robots" content="noindex, nofollow">
<title>${title} — ${siteConfig.name}</title>
<style>${css}</style>
</head>
<body>
<div class="root">
  <div class="top">
    <div class="brand"><span class="dot" style="background:${langColor}"></span>${siteConfig.name}</div>
    <span class="host mono">${host}</span>
  </div>
  <div class="card">
    <div class="bar">
      <div class="dots">
        <span class="dot" style="background:#ff5f56"></span>
        <span class="dot" style="background:#ffbd2e"></span>
        <span class="dot" style="background:#27c93f"></span>
      </div>
      <div class="tab">
        <span class="tab-dot" style="background:${langColor}"></span>
        <span>${language}</span>
        <span class="tab-label mono">SNIPPET</span>
      </div>
      <div class="bar-right mono">PREVIEW</div>
    </div>
    <div class="body">
      <span class="kicker mono">SNIPPET</span>
      <h1>${title}</h1>
      <p class="desc">${description}</p>
      <div class="spacer"></div>
      <div class="foot">
        <div class="tags">${tagsHtml}</div>
        <div class="meta">
          <div class="meta-left">
            <span class="meta-author">by ${author}</span>
            <span class="sep">•</span>
            <span>${formatNumber(snippet.views)} views</span>
            <span class="sep">•</span>
            <span>${formatNumber(snippet.likes)} likes</span>
          </div>
          <span class="meta-cta">View snippet →</span>
        </div>
      </div>
    </div>
  </div>
  <div class="bottom">
    <span class="mono">${host}</span>
    <span class="sep">•</span>
    <span>${siteConfig.tagline}</span>
  </div>
</div>
</body>
</html>`;

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html; charset=utf-8" },
  });
}
