"use client";

import Link from "next/link";
import { Eye, Heart, Copy } from "lucide-react";
import type { SnippetMeta } from "@/types/snippet";
import { getLanguageColor, formatDate, copyToClipboard } from "@/lib/utils/utils";
import { useToast } from "@/components/ui/toast";

interface SnippetCardProps {
  snippet: SnippetMeta;
}

export function SnippetCard({ snippet }: SnippetCardProps) {
  const { toast } = useToast();

  const handleCopy = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await copyToClipboard(`${typeof window !== "undefined" ? window.location.origin : ""}/s/${snippet.id}`);
    toast("Link copied to clipboard!");
  };

  return (
    <Link href={`/s/${snippet.id}`} className="group block">
      <div className="bg-surface border-2 border-border p-5 transition-all duration-150 shadow-[4px_4px_0_#1a1a1a] group-hover:shadow-[2px_2px_0_#1a1a1a] group-hover:translate-x-[2px] group-hover:translate-y-[2px]">
        <div className="flex items-center gap-2 mb-3">
          <div
            className="w-3 h-3 rounded-full shrink-0"
            style={{ backgroundColor: getLanguageColor(snippet.language) }}
          />
          <span className="text-xs font-bold text-muted uppercase tracking-wider">
            {snippet.language}
          </span>
        </div>

        <h3 className="text-base font-extrabold text-text mb-2 line-clamp-1 group-hover:text-accent transition-colors">
          {snippet.title}
        </h3>

        {snippet.description && (
          <p className="text-sm text-muted mb-3 line-clamp-2">
            {snippet.description}
          </p>
        )}

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-4">
            {snippet.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="px-2 py-0.5 text-xs font-bold border-2 border-border bg-yellow"
              >
                {tag}
              </span>
            ))}
            {snippet.tags.length > 4 && (
              <span className="px-2 py-0.5 text-xs font-bold border-2 border-border bg-surface-hover">
                +{snippet.tags.length - 4}
              </span>
            )}
          </div>
        )}

        <div className="flex items-center justify-between text-xs text-muted pt-3 border-t-2 border-border">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1 font-medium">
              <Eye className="w-3.5 h-3.5" />
              {snippet.views}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Heart className="w-3.5 h-3.5" />
              {snippet.likes}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span>{formatDate(snippet.createdAt)}</span>
            <button
              onClick={handleCopy}
              className="p-1 border-2 border-transparent hover:border-border hover:bg-yellow transition-all font-bold"
              title="Copy link"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </Link>
  );
}
