"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { Copy, Check, WrapText, AlignLeft, X, FileCode2 } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { copyToClipboard, getLanguageColor } from "@/lib/utils/utils";

interface CodeViewerProps {
  code: string;
  language: string;
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const { toast } = useToast();
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  const rawLines = code.split("\n");
  const lineCount = codeLines.length || rawLines.length;
  const langColor = getLanguageColor(language);

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, { lang: language, theme: "dark-plus" });
        if (dead) return;
        const tmp = document.createElement("div");
        tmp.innerHTML = html;
        const codeEl = tmp.querySelector("code");
        if (!codeEl) {
          setCodeLines(rawLines.map(escapeHtml));
          return;
        }
        const spans = codeEl.querySelectorAll(":scope > span.line");
        if (spans.length > 0) {
          setCodeLines(Array.from(spans).map((s) => s.outerHTML));
        } else {
          const parts = codeEl.innerHTML.split("\n");
          if (parts[parts.length - 1].trim() === "") parts.pop();
          setCodeLines(parts);
        }
      } catch {
        if (!dead) setCodeLines(rawLines.map(escapeHtml));
      }
    })();
    return () => { dead = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language]);

  const handleCopy = useCallback(async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [code, toast]);

  const codeRows = useMemo(() => {
    const src = codeLines.length > 0 ? codeLines : rawLines.map(escapeHtml);
    return src.map((html, i) => ({ num: i + 1, html }));
  }, [codeLines, rawLines]);

  return (
    <div className="border-2 border-border shadow-[4px_4px_0_#1a1a1a] overflow-hidden bg-[#1e1e1e]">
      <div className="flex items-center justify-between bg-[#252526] border-b-2 border-border">
        <div className="flex items-stretch">
          <div className="flex items-center gap-2 px-4 h-10 bg-[#1e1e1e] text-[#cccccc] border-r-2 border-border select-none">
            <span
              className="w-2.5 h-2.5 shrink-0"
              style={{ backgroundColor: langColor }}
            />
            <FileCode2 className="w-3.5 h-3.5 text-[#858585]" />
            <span className="text-[13px] font-bold">{language}</span>
            <span className="text-[11px] text-[#6e6e6e] ml-1">{lineCount}L</span>
            <span className="ml-2 text-[#6e6e6e] hover:text-[#cccccc] transition-colors cursor-default">
              <X className="w-3.5 h-3.5" />
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1 pr-2">
          <button
            onClick={() => setWordWrap((v) => !v)}
            className={`p-1.5 border-2 text-[#cccccc] hover:bg-[#2a2d2e] transition-colors ${
              wordWrap ? "bg-[#37373d] text-white border-[#555]" : "border-transparent hover:border-[#555]"
            }`}
            title={wordWrap ? "No wrap" : "Word wrap"}
          >
            {wordWrap ? <WrapText className="w-4 h-4" /> : <AlignLeft className="w-4 h-4" />}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 border-2 border-transparent hover:border-[#555] text-xs text-[#cccccc] hover:bg-[#2a2d2e] transition-colors font-bold"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#89d185]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div className="code-scroll overflow-auto max-h-[70vh]">
        {codeRows.length > 0 ? (
          <table
            className="w-full border-collapse code-viewer"
            style={{
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontSize: "13px",
              lineHeight: "1.6",
            }}
          >
            <tbody>
              {codeRows.map((row) => (
                <tr key={row.num} className="group">
                  <td
                    className="sticky left-0 z-10 select-none text-right text-[#858585] group-hover:text-[#c6c6c6] bg-[#1e1e1e] group-hover:bg-[#282828] pl-4 pr-2 py-0 align-top whitespace-nowrap transition-colors tabular-nums"
                    style={{ width: "1%", minWidth: "3.5rem", fontSize: "12px" }}
                  >
                    {row.num}
                  </td>
                  <td
                    className="pl-2 pr-4 py-0 align-top group-hover:bg-[#282828]"
                    style={{ whiteSpace: wordWrap ? "pre-wrap" : "pre" }}
                    dangerouslySetInnerHTML={{ __html: row.html || "&nbsp;" }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-16 text-[#6e6e6e]">
            <span className="inline-block w-4 h-4 border-2 border-[#264f78] border-t-[#89d185] rounded-full animate-spin mr-3" />
            <span className="text-sm">Loading...</span>
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(s: string): string {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
