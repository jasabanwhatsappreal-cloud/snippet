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
        <div className="h-8 w-48 bg-surface-hover border-2 border-border animate-pulse mb-8" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border-2 border-border p-6 h-32 animate-pulse shadow-[3px_3px_0_#1a1a1a]"
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
          className="flex items-center gap-1.5 text-sm text-muted font-bold hover:text-text hover:underline transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Dashboard
        </Link>
        <h1 className="text-2xl font-extrabold text-text">Analytics</h1>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total Views", value: stats.totalViews, icon: Eye, bg: "bg-blue" },
          { label: "Views Today", value: viewsToday, icon: TrendingUp, bg: "bg-green" },
          { label: "Total Likes", value: stats.totalLikes, icon: Heart, bg: "bg-pink" },
          { label: "Snippets", value: stats.totalSnippets, icon: FileCode, bg: "bg-accent" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border-2 border-border p-5 shadow-[3px_3px_0_#1a1a1a]"
            >
              <div className={`w-8 h-8 ${stat.bg} border-2 border-border flex items-center justify-center mb-2`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div className="text-2xl font-extrabold text-text">
                {stat.value.toLocaleString()}
              </div>
              <div className="text-xs text-muted mt-1 font-bold">{stat.label}</div>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-surface border-2 border-border p-6 shadow-[4px_4px_0_#1a1a1a]">
          <h3 className="text-sm font-extrabold text-text mb-4">
            Popular Snippets
          </h3>
          {popularSnippets.length === 0 ? (
            <p className="text-sm text-muted font-medium">No data yet</p>
          ) : (
            <div className="space-y-3">
              {popularSnippets.map((snippet, i) => (
                <div
                  key={snippet.id}
                  className="flex items-center gap-3 p-2 hover:bg-yellow transition-colors"
                >
                  <span className="text-xs text-muted font-bold w-5">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-bold text-text truncate">
                      {snippet.title}
                    </div>
                    <div className="text-xs text-muted font-medium">
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

        <div className="bg-surface border-2 border-border p-6 shadow-[4px_4px_0_#1a1a1a]">
          <h3 className="text-sm font-extrabold text-text mb-4">
            Popular Languages
          </h3>
          {popularLanguages.length === 0 ? (
            <p className="text-sm text-muted font-medium">No data yet</p>
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
                        <span className="text-sm font-bold text-text capitalize">
                          {lang}
                        </span>
                      </div>
                      <span className="text-xs text-muted font-medium">{count} snippets</span>
                    </div>
                    <div className="w-full h-3 bg-surface-hover border-2 border-border overflow-hidden">
                      <div
                        className="h-full bg-accent"
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
