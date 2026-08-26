"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Code2,
  Search,
  Eye,
  Globe,
  FileCode,
  ArrowRight,
  Plus,
  Sparkles,
  MessageCircle,
} from "lucide-react";
import { SnippetCard } from "@/components/snippet/card";
import { SnippetCardSkeleton } from "@/components/ui/skeleton";
import { SearchModal } from "@/components/ui/search-modal";
import { siteConfig } from "@/config/site";
import type { SnippetMeta } from "@/types/snippet";
import { getLanguageColor } from "@/lib/utils/utils";

interface Stats {
  totalSnippets: number;
  totalViews: number;
  languages: number;
  publicSnippets: number;
}

export default function HomePage() {
  const [recentSnippets, setRecentSnippets] = useState<SnippetMeta[]>([]);
  const [popularLanguages, setPopularLanguages] = useState<
    { language: string; count: number }[]
  >([]);
  const [stats, setStats] = useState<Stats>({
    totalSnippets: 0,
    totalViews: 0,
    languages: 0,
    publicSnippets: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const [snippetsRes, statsRes, languagesRes] = await Promise.all([
          fetch("/api/snippets?per_page=6&sort=newest"),
          fetch("/api/stats"),
          fetch("/api/languages?limit=10"),
        ]);

        const snippetsData = await snippetsRes.json();
        const statsData = await statsRes.json();
        const languagesData = await languagesRes.json();

        if (snippetsData.success) {
          setRecentSnippets(snippetsData.data.snippets);
          setStats((prev) => ({
            ...prev,
            totalSnippets: snippetsData.data.total,
            publicSnippets: snippetsData.data.total,
          }));
        }

        if (statsData.success) {
          setStats((prev) => ({
            ...prev,
            totalSnippets: statsData.data.totalSnippets,
            totalViews: statsData.data.totalViews,
            languages: statsData.data.languages,
            publicSnippets: statsData.data.totalSnippets,
          }));
        }

        if (languagesData.success) {
          setPopularLanguages(languagesData.data);
        }
      } catch {
        // silent
      }
      setLoading(false);
    }

    fetchData();

    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => {});
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />

      <section className="relative overflow-hidden">
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 pt-20 pb-16">
          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 border-2 border-border bg-yellow text-text text-xs font-bold mb-6 shadow-[2px_2px_0_#1a1a1a]">
              <Sparkles className="w-3.5 h-3.5" />
              Simple snippet sharing for developers
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-4">
              {siteConfig.tagline}
            </h1>

            <p className="text-lg text-muted mb-8 max-w-xl mx-auto font-medium">
              {siteConfig.subTagline}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
              {isAdmin && (
                <Link
                  href="/create"
                  className="flex items-center gap-2 px-6 py-3 bg-accent border-2 border-border text-white font-bold shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Create Snippet
                </Link>
              )}
              <Link
                href="/snippets"
                className="flex items-center gap-2 px-6 py-3 border-2 border-border bg-surface text-text font-bold shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] hover:bg-yellow transition-all"
              >
                <Globe className="w-5 h-5" />
                Explore Snippets
              </Link>
            </div>

            <button
              onClick={() => setSearchOpen(true)}
              className="w-full max-w-lg mx-auto flex items-center gap-3 px-5 py-3.5 border-2 border-border bg-surface hover:bg-yellow transition-colors group shadow-[4px_4px_0_#1a1a1a]"
            >
              <Search className="w-5 h-5 text-muted group-hover:text-accent transition-colors" />
              <span className="text-muted text-sm font-medium">Search snippets...</span>
              <kbd className="hidden sm:inline-flex ml-auto px-2 py-0.5 text-[10px] font-mono font-bold text-muted bg-surface-hover border-2 border-border">
                Ctrl + K
              </kbd>
            </button>
          </div>
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-8">
        <a
          href={siteConfig.whatsappChannel}
          target="_blank"
          rel="noopener noreferrer"
          className="group flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 px-5 py-4 border-2 border-border bg-surface shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          <span className="flex items-center gap-3">
            <span className="flex items-center justify-center w-10 h-10 border-2 border-border bg-accent shrink-0">
              <MessageCircle className="w-5 h-5 text-white" />
            </span>
            <span className="flex flex-col">
              <span className="text-sm font-bold text-text">
                Ikuti Channel WhatsApp Kami
              </span>
              <span className="text-xs text-muted">
                Dapatkan update snippet &amp; tips coding terbaru
              </span>
            </span>
          </span>
          <span className="sm:ml-auto inline-flex items-center gap-1.5 px-4 py-2 bg-green border-2 border-border text-text text-sm font-bold shadow-[2px_2px_0_#1a1a1a]">
            Gabung Sekarang
            <ArrowRight className="w-4 h-4" />
          </span>
        </a>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: "Total Snippets", value: stats.totalSnippets, icon: FileCode },
            { label: "Total Views", value: stats.totalViews, icon: Eye },
            { label: "Languages", value: stats.languages || siteConfig.languages.length, icon: Code2 },
            { label: "Public", value: stats.publicSnippets, icon: Globe },
          ].map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="bg-surface border-2 border-border p-4 text-center shadow-[3px_3px_0_#1a1a1a]"
              >
                <Icon className="w-5 h-5 text-accent mx-auto mb-2" />
                <div className="text-2xl font-extrabold text-text">
                  {stat.value.toLocaleString()}
                </div>
                <div className="text-xs text-muted mt-1 font-medium">{stat.label}</div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-extrabold text-text">Recently Added</h2>
          <Link
            href="/snippets"
            className="flex items-center gap-1 text-sm text-accent font-bold hover:underline transition-colors"
          >
            View all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        ) : recentSnippets.length === 0 ? (
          <div className="bg-surface border-2 border-border p-12 text-center shadow-[4px_4px_0_#1a1a1a]">
            <FileCode className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-extrabold text-text mb-2">
              No snippets yet
            </h3>
            <p className="text-sm text-muted mb-4 font-medium">
              {isAdmin
                ? "Be the first to create a snippet."
                : "No snippets have been created yet."}
            </p>
            {isAdmin && (
              <Link
                href="/create"
                className="inline-flex items-center gap-2 px-4 py-2 bg-accent border-2 border-border text-white text-sm font-bold shadow-[3px_3px_0_#1a1a1a] hover:shadow-[1px_1px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Plus className="w-4 h-4" />
                Create Snippet
              </Link>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSnippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-20">
        <h2 className="text-xl font-extrabold text-text mb-6">Popular Languages</h2>
        {popularLanguages.length === 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {siteConfig.languages.map((lang) => (
              <Link
                key={lang}
                href={`/snippets?language=${lang}`}
                className="flex items-center gap-3 p-3 border-2 border-border bg-surface hover:bg-yellow hover:shadow-[3px_3px_0_#1a1a1a] transition-all group"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: getLanguageColor(lang) }}
                />
                <span className="text-sm font-bold text-text capitalize">
                  {lang}
                </span>
              </Link>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
            {popularLanguages.map(({ language, count }) => (
              <Link
                key={language}
                href={`/snippets?language=${language}`}
                className="flex items-center gap-3 p-3 border-2 border-border bg-surface hover:bg-yellow hover:shadow-[3px_3px_0_#1a1a1a] transition-all group"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ backgroundColor: getLanguageColor(language) }}
                />
                <span className="text-sm font-bold text-text capitalize">
                  {language}
                </span>
                <span className="ml-auto text-xs text-muted font-medium">
                  {count}
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
