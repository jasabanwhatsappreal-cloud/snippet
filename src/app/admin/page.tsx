"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Code2,
  FileCode,
  Eye,
  Heart,
  Plus,
  LogOut,
  BarChart3,
} from "lucide-react";
import { SnippetCard } from "@/components/snippet/card";
import { SnippetCardSkeleton } from "@/components/ui/skeleton";
import type { Snippet } from "@/types/snippet";

interface Stats {
  totalSnippets: number;
  totalViews: number;
  totalLikes: number;
  languages: number;
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSnippets: 0,
    totalViews: 0,
    totalLikes: 0,
    languages: 0,
  });
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/snippets");
        const data = await res.json();
        if (data.success) {
          setSnippets(data.data.snippets);
          setStats(data.data.stats);
          setAuthorized(true);
        } else {
          router.push("/admin/login");
        }
      } catch {
        router.push("/admin/login");
      }
      setLoading(false);
    }

    fetchData();
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/admin/login", { method: "DELETE" });
      router.push("/admin/login");
    } catch {
      // silent
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-surface border border-border rounded-xl p-5">
              <div className="h-4 w-24 bg-surface-hover rounded animate-pulse mb-2" />
              <div className="h-8 w-16 bg-surface-hover rounded animate-pulse" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <SnippetCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  if (!authorized) return null;

  const recentSnippets = snippets
    .sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )
    .slice(0, 6);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-text">Admin Dashboard</h1>
          <p className="text-sm text-muted mt-1">Manage your snippets</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/admin/requests"
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            <BarChart3 className="w-4 h-4" />
            Requests
          </Link>
          <Link
            href="/create"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            New Snippet
          </Link>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Snippets", value: stats.totalSnippets, icon: FileCode, color: "text-accent" },
          { label: "Total Views", value: stats.totalViews, icon: Eye, color: "text-blue-400" },
          { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "text-pink-400" },
          { label: "Languages", value: stats.languages, icon: Code2, color: "text-green-400" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <Icon className={`w-5 h-5 ${stat.color} mb-2`} />
              <div className="text-2xl font-bold text-text">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-muted mt-1">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-text">Recent Snippets</h2>
        <Link
          href="/admin/snippets"
          className="text-sm text-accent hover:text-accent-hover transition-colors"
        >
          View all
        </Link>
      </div>

      {recentSnippets.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <FileCode className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">
            No snippets yet
          </h3>
          <p className="text-sm text-muted mb-4">
            Create your first snippet to get started.
          </p>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Snippet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {recentSnippets.map((snippet) => (
            <SnippetCard
              key={snippet.id}
              snippet={{
                id: snippet.id,
                title: snippet.title,
                description: snippet.description,
                language: snippet.language,
                author: snippet.author,
                tags: snippet.tags,
                visibility: snippet.visibility,
                createdAt: snippet.createdAt,
                updatedAt: snippet.updatedAt,
                views: snippet.views,
                likes: snippet.likes,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
