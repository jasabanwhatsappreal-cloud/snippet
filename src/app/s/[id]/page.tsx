"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Copy,
  Download,
  ExternalLink,
  Heart,
  Eye,
  Calendar,
  ArrowLeft,
  Tag,
  User,
  Globe,
  Lock,
} from "lucide-react";
import { CodeViewer } from "@/components/editor/code-viewer";
import { useToast } from "@/components/ui/toast";
import { Skeleton } from "@/components/ui/skeleton";
import type { Snippet } from "@/types/snippet";
import { formatDate, copyToClipboard } from "@/lib/utils/utils";

export default function SnippetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [snippet, setSnippet] = useState<Snippet | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [liked, setLiked] = useState(false);

  const id = params.id as string;

  useEffect(() => {
    async function fetchSnippet() {
      try {
        const res = await fetch(`/api/snippets/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          setSnippet(data.data);
          fetch(`/api/snippets/${id}/views`, { method: "POST" });
        } else {
          setError(true);
        }
      } catch {
        setError(true);
      }
      setLoading(false);
    }

    fetchSnippet();
  }, [id]);

  const handleCopyLink = async () => {
    await copyToClipboard(`${window.location.origin}/s/${id}`);
    toast("Link copied to clipboard!");
  };

  const handleCopyCode = async () => {
    if (!snippet) return;
    await copyToClipboard(snippet.code);
    toast("Copied to clipboard!");
  };

  const handleDownload = () => {
    if (!snippet) return;
    const ext = getExtension(snippet.language);
    const blob = new Blob([snippet.code], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${snippet.id}.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLike = async () => {
    if (liked) return;
    try {
      await fetch(`/api/snippets/${id}/like`, { method: "POST" });
      setLiked(true);
      setSnippet((prev) =>
        prev ? { ...prev, likes: prev.likes + 1 } : prev
      );
      toast("Liked!");
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96" />
        <Skeleton className="h-[400px] w-full rounded-xl" />
      </div>
    );
  }

  if (error || !snippet) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Snippet Not Found</h1>
        <p className="text-muted mb-6">
          The snippet you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/snippets"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Browse Snippets
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-text mb-2">
              {snippet.title}
            </h1>
            {snippet.description && (
              <p className="text-sm text-muted mb-3">{snippet.description}</p>
            )}
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <span className="flex items-center gap-1">
                <User className="w-3.5 h-3.5" />
                {snippet.author}
              </span>
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {formatDate(snippet.createdAt)}
              </span>
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5" />
                {snippet.views} views
              </span>
              {snippet.visibility === "public" ? (
                <span className="flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5" />
                  Public
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Lock className="w-3.5 h-3.5" />
                  Private
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleCopyCode}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Copy className="w-4 h-4" />
              Copy
            </button>
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <Download className="w-4 h-4" />
              Download
            </button>
            <a
              href={`/s/${id}/raw`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Raw
            </a>
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <ExternalLink className="w-4 h-4" />
              Share
            </button>
            <button
              onClick={handleLike}
              disabled={liked}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition-colors ${
                liked
                  ? "bg-accent/10 border-accent/30 text-accent"
                  : "border-border text-muted hover:text-accent hover:border-accent/30 hover:bg-accent/10"
              }`}
            >
              <Heart className={`w-4 h-4 ${liked ? "fill-accent" : ""}`} />
              {snippet.likes}
            </button>
          </div>
        </div>

        {snippet.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 mt-4">
            <Tag className="w-3.5 h-3.5 text-muted" />
            {snippet.tags.map((tag) => (
              <Link
                key={tag}
                href={`/snippets?search=${encodeURIComponent(tag)}`}
                className="px-2.5 py-1 text-xs rounded-full bg-accent/10 text-accent border border-accent/20 hover:bg-accent/20 transition-colors"
              >
                {tag}
              </Link>
            ))}
          </div>
        )}
      </div>

      <CodeViewer code={snippet.code} language={snippet.language} />

      <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-muted mb-1">Language</div>
          <div className="text-sm font-medium text-text capitalize">
            {snippet.language}
          </div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-muted mb-1">Views</div>
          <div className="text-sm font-medium text-text">{snippet.views}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-muted mb-1">Likes</div>
          <div className="text-sm font-medium text-text">{snippet.likes}</div>
        </div>
        <div className="bg-surface border border-border rounded-xl p-3 text-center">
          <div className="text-xs text-muted mb-1">Created</div>
          <div className="text-sm font-medium text-text">
            {formatDate(snippet.createdAt)}
          </div>
        </div>
      </div>
    </div>
  );
}

function getExtension(language: string): string {
  const map: Record<string, string> = {
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
  };
  return map[language] || "txt";
}
