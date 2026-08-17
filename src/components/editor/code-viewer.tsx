"use client";

import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import {
  Copy,
  Check,
  WrapText,
  AlignLeft,
  Play,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/toast";
import { copyToClipboard } from "@/lib/utils/utils";

interface CodeViewerProps {
  code: string;
  language: string;
}

interface LogEntry {
  id: number;
  type: "log" | "error" | "warn" | "info" | "result";
  content: string;
  time: string;
}

export function CodeViewer({ code, language }: CodeViewerProps) {
  const { toast } = useToast();
  const [codeLines, setCodeLines] = useState<string[]>([]);
  const [wordWrap, setWordWrap] = useState(false);
  const [copied, setCopied] = useState(false);
  const [running, setRunning] = useState(false);
  const [showConsole, setShowConsole] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const consoleEndRef = useRef<HTMLDivElement>(null);
  const idCounter = useRef(0);
  const runAbortRef = useRef<AbortController | null>(null);

  const canRun = ["javascript", "js", "typescript", "ts"].includes(language);
  const rawLines = code.split("\n");
  const lineCount = codeLines.length || rawLines.length;

  useEffect(() => {
    let dead = false;
    (async () => {
      try {
        const { codeToHtml } = await import("shiki");
        const html = await codeToHtml(code, {
          lang: language,
          theme: "github-dark",
        });
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
    return () => {
      dead = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code, language]);

  useEffect(() => {
    consoleEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  const pushLog = useCallback(
    (type: LogEntry["type"], content: string) => {
      idCounter.current += 1;
      const now = new Date();
      const time = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}:${String(now.getSeconds()).padStart(2, "0")}`;
      setLogs((prev) => [
        ...prev,
        { id: idCounter.current, type, content, time },
      ]);
    },
    []
  );

  const handleCopy = useCallback(async () => {
    await copyToClipboard(code);
    setCopied(true);
    toast("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  }, [code, toast]);

  const handleRun = useCallback(async () => {
    if (running) return;
    setRunning(true);
    setShowConsole(true);
    setLogs([]);
    pushLog("info", "Running...");
    const t0 = Date.now();

    const abortController = new AbortController();
    runAbortRef.current = abortController;

    const safe =
      (fn: (...a: unknown[]) => void) =>
      (...a: unknown[]) => {
        try {
          fn(...a);
        } catch {
          // swallow
        }
      };

    const fakeConsole = {
      log: safe((...a: unknown[]) =>
        pushLog("log", a.map(fmt).join(" "))
      ),
      error: safe((...a: unknown[]) =>
        pushLog("error", a.map(fmt).join(" "))
      ),
      warn: safe((...a: unknown[]) =>
        pushLog("warn", a.map(fmt).join(" "))
      ),
      info: safe((...a: unknown[]) =>
        pushLog("info", a.map(fmt).join(" "))
      ),
      clear: safe(() => setLogs([])),
      table: safe((d: unknown) => pushLog("log", fmt(d))),
      dir: safe((d: unknown) => pushLog("log", fmt(d))),
      time: safe(() => {}),
      timeEnd: safe(() => {}),
      timeLog: safe(() => {}),
      count: safe(() => {}),
      countReset: safe(() => {}),
      group: safe(() => {}),
      groupEnd: safe(() => {}),
      assert: safe((...a: unknown[]) => {
        if (a.length > 0 && !a[0])
          pushLog("error", a.slice(1).map(fmt).join(" "));
      }),
    };

    // Track all pending fetch promises from user code
    const pendingFetches = new Set<Promise<Response>>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const pendingTimers = new Set<any>();

    const trackedFetch = (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const p = proxyFetch(input, init);
      pendingFetches.add(p);
      const cleaned = p.finally(() => pendingFetches.delete(p));
      return cleaned;
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trackedSetTimeout = (
      handler: TimerHandler,
      ms?: number,
      ...args: unknown[]
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): any => {
      const id = setTimeout(
        () => {
          pendingTimers.delete(id);
          if (typeof handler === "function") handler(...args);
          else eval(handler);
        },
        ms,
        ...args
      );
      pendingTimers.add(id);
      return id;
    };

    const proxyFetch = async (
      input: RequestInfo | URL,
      init?: RequestInit
    ): Promise<Response> => {
      const url = String(input);
      const method = init?.method || "GET";
      const headers: Record<string, string> = {};
      if (init?.headers) {
        if (init.headers instanceof Headers) {
          init.headers.forEach((v, k) => {
            headers[k] = v;
          });
        } else if (Array.isArray(init.headers)) {
          for (const [k, v] of init.headers) headers[k] = v;
        } else {
          Object.assign(headers, init.headers);
        }
      }
      let body: string | undefined;
      if (init?.body != null) {
        body =
          typeof init.body === "string"
            ? init.body
            : JSON.stringify(init.body);
      }

      try {
        const res = await fetch("/api/proxy", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ url, method, headers, body }),
        });
        const json = await res.json();

        if (!json.success) {
          const errMsg = json.error || "Proxy request failed";
          const textBody = JSON.stringify({ success: false, error: errMsg });
          return {
            ok: false,
            status: json.status || 500,
            statusText: errMsg,
            headers: new Headers({ "content-type": "application/json" }),
            json: () =>
              Promise.resolve({ success: false, error: errMsg }),
            text: () => Promise.resolve(textBody),
            arrayBuffer: () =>
              Promise.resolve(new ArrayBuffer(0)),
            blob: () =>
              Promise.resolve(new Blob([textBody])),
            body: null,
            bodyUsed: false,
            clone() {
              return this;
            },
          } as Response;
        }

        const textBody =
          typeof json.data === "string"
            ? json.data
            : JSON.stringify(json.data);

        return {
          ok: json.status >= 200 && json.status < 300,
          status: json.status,
          statusText: json.statusText,
          headers: new Headers(
            json.headers as Record<string, string>
          ),
          json: () => Promise.resolve(json.data),
          text: () => Promise.resolve(textBody),
          arrayBuffer: () =>
            Promise.resolve(new ArrayBuffer(0)),
          blob: () =>
            Promise.resolve(new Blob([textBody])),
          body: null,
          bodyUsed: false,
          clone() {
            return this;
          },
        } as Response;
      } catch (err) {
        const errMsg =
          err instanceof Error ? err.message : String(err);
        const textBody = JSON.stringify({
          success: false,
          error: errMsg,
        });
        return {
          ok: false,
          status: 0,
          statusText: errMsg,
          headers: new Headers(),
          json: () =>
            Promise.resolve({ success: false, error: errMsg }),
          text: () => Promise.resolve(textBody),
          arrayBuffer: () =>
            Promise.resolve(new ArrayBuffer(0)),
          blob: () =>
            Promise.resolve(new Blob([textBody])),
          body: null,
          bodyUsed: false,
          clone() {
            return this;
          },
        } as Response;
      }
    };

    const onUnhandled = (e: PromiseRejectionEvent) => {
      e.preventDefault();
      const msg =
        e.reason instanceof Error
          ? e.reason.message
          : typeof e.reason === "string"
            ? e.reason
            : fmt(e.reason);
      pushLog("error", msg);
    };
    window.addEventListener("unhandledrejection", onUnhandled);

    try {
      const fn = new Function(
        "console",
        "fetch",
        "setTimeout",
        code
      );
      const result = fn(
        fakeConsole,
        trackedFetch,
        trackedSetTimeout
      );

      // If user code returned a promise, await it
      if (result instanceof Promise) {
        await Promise.race([
          result.catch((e: unknown) => {
            const msg =
              e instanceof Error ? e.message : String(e);
            pushLog("error", msg);
          }),
          new Promise<never>((_, rej) =>
            setTimeout(
              () => rej(new Error("Timed out (30s)")),
              30000
            )
          ),
        ]);
      }

      // Wait for all in-flight fetch promises to settle
      let safety = 0;
      while (
        (pendingFetches.size > 0 || pendingTimers.size > 0) &&
        safety < 300
      ) {
        if (pendingFetches.size > 0) {
          await Promise.allSettled([...pendingFetches]);
        }
        if (pendingTimers.size > 0) {
          await new Promise((r) => setTimeout(r, 100));
        }
        safety++;
      }

      pushLog(
        "info",
        `Done in ${Date.now() - t0}ms`
      );
    } catch (err) {
      pushLog(
        "error",
        err instanceof Error ? err.message : String(err)
      );
    } finally {
      window.removeEventListener(
        "unhandledrejection",
        onUnhandled
      );
      // Cleanup any lingering timers
      pendingTimers.forEach((id) => clearTimeout(id as ReturnType<typeof setTimeout>));
      pendingTimers.clear();
      pendingFetches.clear();
      runAbortRef.current = null;
    }

    setRunning(false);
  }, [code, running, pushLog]);

  const handleStop = useCallback(() => {
    runAbortRef.current?.abort();
  }, []);

  const handleClearConsole = useCallback(() => setLogs([]), []);

  const codeRows = useMemo(() => {
    const src =
      codeLines.length > 0
        ? codeLines
        : rawLines.map(escapeHtml);
    return src.map((html, i) => ({ num: i + 1, html }));
  }, [codeLines, rawLines]);

  return (
    <div className="rounded-xl border border-border overflow-hidden bg-[#0d1117]">
      {/* -------- HEADER -------- */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-surface/80">
        <div className="flex items-center gap-3">
          <div className="flex gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
            <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
            <span className="w-3 h-3 rounded-full bg-[#28c840]" />
          </div>
          <span className="text-xs text-muted uppercase font-medium tracking-wider">
            {language}
          </span>
          <span className="text-[10px] text-muted/50 font-mono">
            {lineCount}L
          </span>
        </div>

        <div className="flex items-center gap-0.5">
          {canRun && (
            <>
              <button
                onClick={() => setShowConsole((v) => !v)}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  showConsole
                    ? "text-accent bg-accent/10"
                    : "text-muted hover:text-text hover:bg-surface-hover"
                }`}
                title="Toggle console"
              >
                {"{ }"}
              </button>
              <button
                onClick={running ? handleStop : handleRun}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
                  running
                    ? "bg-red-500/15 text-red-400 hover:bg-red-500/25 border-red-500/20"
                    : "bg-emerald-500/15 text-emerald-400 hover:bg-emerald-500/25 border-emerald-500/20"
                }`}
              >
                {running ? (
                  <>
                    <Trash2 className="w-3 h-3" />
                    Stop
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    Run
                  </>
                )}
              </button>
            </>
          )}

          <button
            onClick={() => setWordWrap((v) => !v)}
            className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
            title={wordWrap ? "No wrap" : "Word wrap"}
          >
            {wordWrap ? (
              <WrapText className="w-4 h-4" />
            ) : (
              <AlignLeft className="w-4 h-4" />
            )}
          </button>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
            {copied ? "Copied!" : "Copy"}
          </button>
        </div>
      </div>

      {/* -------- CODE -------- */}
      <div
        ref={scrollContainerRef}
        className="overflow-auto max-h-[70vh]"
        style={
          wordWrap ? { whiteSpace: "pre-wrap" } : undefined
        }
      >
        {codeRows.length > 0 ? (
          <table
            className="w-full border-collapse"
            style={{
              fontFamily:
                "var(--font-geist-mono), monospace",
              fontSize: "13px",
              lineHeight: "1.65",
            }}
          >
            <tbody>
              {codeRows.map((row) => (
                <tr key={row.num} className="group">
                  <td
                    className="sticky left-0 z-10 select-none text-right text-muted/25 group-hover:text-muted/50 bg-[#0d1117] border-r border-border/30 px-4 py-0 align-top whitespace-nowrap transition-colors"
                    style={{
                      width: "1%",
                      minWidth: "3rem",
                    }}
                  >
                    {row.num}
                  </td>
                  <td
                    className="px-4 py-0 align-top whitespace-pre code-viewer"
                    dangerouslySetInnerHTML={{
                      __html: row.html || "&nbsp;",
                    }}
                  />
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="flex items-center justify-center py-16">
            <span className="inline-block w-4 h-4 border-2 border-accent/30 border-t-accent rounded-full animate-spin mr-3" />
            <span className="text-sm text-muted">
              Loading...
            </span>
          </div>
        )}
      </div>

      {/* -------- CONSOLE -------- */}
      {showConsole && canRun && (
        <div className="border-t border-border">
          <div className="flex items-center justify-between px-4 py-1.5 bg-surface/80">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono font-bold text-accent">
                {"{ }"}
              </span>
              <span className="text-xs text-muted">
                Console
                {logs.length > 0 && (
                  <span className="ml-1 px-1.5 py-px text-[9px] rounded-full bg-surface-hover text-muted/60">
                    {logs.length}
                  </span>
                )}
              </span>
            </div>
            <div className="flex items-center gap-1">
              {running && (
                <span className="inline-block w-3 h-3 border-[1.5px] border-emerald-400/30 border-t-emerald-400 rounded-full animate-spin" />
              )}
              <button
                onClick={handleClearConsole}
                className="p-1 rounded text-muted/40 hover:text-muted transition-colors"
                title="Clear"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div
            className="max-h-[30vh] overflow-y-auto px-3 pb-3"
            style={{
              fontFamily:
                "var(--font-geist-mono), monospace",
              fontSize: "12px",
            }}
          >
            {logs.length === 0 && (
              <p className="text-muted/30 py-2">
                Click &quot;Run&quot; to execute...
              </p>
            )}
            {logs.map((entry) => (
              <LogLine key={entry.id} entry={entry} />
            ))}
            <div ref={consoleEndRef} />
          </div>
        </div>
      )}
    </div>
  );
}

function LogLine({ entry }: { entry: LogEntry }) {
  const bg =
    entry.type === "error"
      ? "bg-red-500/5 text-red-400"
      : entry.type === "warn"
        ? "bg-yellow-500/5 text-yellow-400"
        : entry.type === "result"
          ? "bg-violet-500/5 text-violet-400"
          : entry.type === "info"
            ? "bg-blue-500/5 text-blue-400"
            : "bg-white/[.02] text-[#e6edf3]";

  const icon =
    entry.type === "error"
      ? "\u2715 "
      : entry.type === "warn"
        ? "\u26A0 "
        : entry.type === "result"
          ? "\u2192 "
          : "";

  return (
    <div
      className={`px-2 py-0.5 rounded whitespace-pre-wrap break-all ${bg}`}
    >
      <span className="opacity-25 mr-2 select-none text-[9px]">
        {entry.time}
      </span>
      <span>
        {icon}
        {entry.content}
      </span>
    </div>
  );
}

function fmt(v: unknown): string {
  if (v === undefined) return "undefined";
  if (v === null) return "null";
  if (typeof v === "string") return v;
  if (
    typeof v === "number" ||
    typeof v === "boolean" ||
    typeof v === "bigint"
  )
    return String(v);
  if (typeof v === "function")
    return `[Function: ${v.name || "anon"}]`;
  if (v instanceof Error)
    return `${v.name}: ${v.message}`;
  if (v instanceof Promise) return "[Promise]";
  if (typeof v === "symbol") return v.toString();
  try {
    return JSON.stringify(v, null, 2);
  } catch {
    return String(v);
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
