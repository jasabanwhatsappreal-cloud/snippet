"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Eye, Heart, FileCode, TrendingUp } from "lucide-react";
import { getLanguageColor } from "@/lib/utils/utils";
import type { Snippet } from "@/types/snippet";

interface Stats {
  totalSnippets: number;
  totalViews: number;
  totalLikes: number;
  languages: number;
}

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [stats, setStats] = useState<Stats>({
    totalSnippets: 0,
    totalViews: 0,
    totalLikes: 0,
    languages: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/snippets");
        const data = await res.json();
        if (data.success) {
          setSnippets(data.data.snippets);
          setStats(data.data.stats);
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

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="h-8 w-48 bg-surface-hover rounded animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-6 h-32 animate-pulse"
            />
          ))}
        </div>
      </div>
    );
  }

  const popularSnippets = [...snippets]
    .sort((a, b) => b.views - a.views)
    .slice(0, 5);

  const languageCount = snippets.reduce(
    (acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  const popularLanguages = Object.entries(languageCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10);

  const today = new Date().toISOString().split("T")[0];
  const viewsToday = snippets.reduce((sum, s) => {
    if (s.createdAt.startsWith(today)) return sum + s.views;
    return sum;
  }, 0);

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Link
          href="/admin"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-text">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Views", value: stats.totalViews, icon: Eye, color: "text-blue-400" },
          { label: "Views Today", value: viewsToday, icon: TrendingUp, color: "text-green-400" },
          { label: "Total Likes", value: stats.totalLikes, icon: Heart, color: "text-pink-400" },
          { label: "Snippets", value: stats.totalSnippets, icon: FileCode, color: "text-accent" },
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Popular Snippets
          </h3>
          {popularSnippets.length === 0 ? (
            <p className="text-sm text-muted">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popularSnippets.map((snippet, i) => (
                <div
                  key={snippet.id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-surface-hover transition-colors"
                >
                  <span className="text-xs text-muted w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-text truncate">
                      {snippet.title}
                    </div>
                    <div className="text-xs text-muted">
                      {snippet.views} views &middot; {snippet.likes} likes
                    </div>
                  </div>
                  <div
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{
                      backgroundColor: getLanguageColor(snippet.language),
                    }}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-surface border border-border rounded-xl p-6">
          <h3 className="text-sm font-semibold text-text mb-4">
            Popular Languages
          </h3>
          {popularLanguages.length === 0 ? (
            <p className="text-sm text-muted">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popularLanguages.map(([lang, count]) => {
                const maxCount = popularLanguages[0][1];
                const percentage = (count / maxCount) * 100;
                return (
                  <div key={lang} className="space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2.5 h-2.5 rounded-full"
                          style={{
                            backgroundColor: getLanguageColor(lang),
                          }}
                        />
                        <span className="text-sm text-text capitalize">
                          {lang}
                        </span>
                      </div>
                      <span className="text-xs text-muted">{count} snippets</span>
                    </div>
                    <div className="w-full h-1.5 bg-surface-hover rounded-full overflow-hidden">
                      <div
                        className="h-full bg-accent rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
