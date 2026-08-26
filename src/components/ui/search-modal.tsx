"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Search, X, FileCode, ArrowRight } from "lucide-react";
import type { SnippetMeta } from "@/types/snippet";

export function SearchModal({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SnippetMeta[]>([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        if (isOpen) onClose();
        else onClose();
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/search?q=${encodeURIComponent(query)}`
        );
        const data = await res.json();
        if (data.success) {
          setResults(data.data || []);
        }
      } catch {
        setResults([]);
      }
      setLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[95] flex items-start justify-center pt-[15vh]"
      onClick={onClose}
    >
      <div className="absolute inset-0 bg-black/40" />
      <div
        className="relative w-full max-w-lg mx-4 bg-surface border-2 border-border shadow-[6px_6px_0_#1a1a1a] animate-fade-in overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b-2 border-border">
          <Search className="w-5 h-5 text-muted shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search snippets..."
            className="flex-1 bg-transparent text-text text-sm font-medium outline-none placeholder:text-muted"
          />
          <kbd className="hidden sm:inline-flex px-1.5 py-0.5 text-[10px] font-mono font-bold text-muted bg-surface-hover border-2 border-border">
            ESC
          </kbd>
          <button
            onClick={onClose}
            className="text-muted hover:text-text p-1 hover:bg-surface-hover border-2 border-transparent hover:border-border transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="max-h-80 overflow-y-auto">
          {loading && (
            <div className="p-4 text-center text-sm text-muted font-medium">
              Searching...
            </div>
          )}

          {!loading && query.length >= 2 && results.length === 0 && (
            <div className="p-4 text-center text-sm text-muted font-medium">
              No snippets found
            </div>
          )}

          {!loading && results.length > 0 && (
            <div className="py-2">
              {results.map((snippet) => (
                <button
                  key={snippet.id}
                  onClick={() => {
                    router.push(`/s/${snippet.id}`);
                    onClose();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-yellow transition-colors text-left border-b-2 border-border last:border-0"
                >
                  <FileCode className="w-5 h-5 text-accent shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text truncate">
                      {snippet.title}
                    </div>
                    <div className="text-xs text-muted truncate">
                      {snippet.language} &middot; {snippet.author}
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted shrink-0" />
                </button>
              ))}
            </div>
          )}

          {query.length < 2 && (
            <div className="p-4 text-center text-sm text-muted font-medium">
              Type at least 2 characters to search
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
