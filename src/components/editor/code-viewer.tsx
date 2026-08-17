"use client";

import { useEffect, useState } from "react";
import { Copy, Check, WrapText, AlignLeft } from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { copyToClipboard } from "@/lib/utils/utils";

interface CodeViewerProps {
  code: string;
  language: string;
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const { toast } = useToast();
  const [highlightedCode, setHighlightedCode] = useState("");
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function highlight() {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang: language,
          theme: "github-dark",
        });
        if (!cancelled) {
          setHighlightedCode(html);
        }
      } catch {
        if (!cancelled) {
          setHighlightedCode(
            `<pre><code>${escapeHtml(code)}</code></pre>`
          );
        }
      }
    }

    highlight();
    return () => {
      cancelled = true;
    };
  }, [code, language]);

  const handleCopy = async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group rounded-xl border border-border overflow-hidden bg-[#0d1117]">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/80">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <div className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-muted ml-2 uppercase font-medium">
            {language}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setWordWrap(!wordWrap)}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title={wordWrap ? "Disable word wrap" : "Enable word wrap"}
          >
            {wordWrap ? (
              <WrapText className="w-4 h-4" />
            ) : (
              <AlignLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-success" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      <div
        className="snippet-code overflow-auto max-h-[70vh]"
        style={wordWrap ? { whiteSpace: "pre-wrap", wordBreak: "break-all" } : {}}
      >
        {highlightedCode ? (
          <div dangerouslySetInnerHTML={{ __html: highlightedCode }} />
        ) : (
          <div className="p-4 text-sm text-muted animate-pulse-skeleton">
            Loading...
          </div>
        )}
      </div>
    </div>
  );
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
