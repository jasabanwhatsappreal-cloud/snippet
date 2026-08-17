"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Search, ChevronLeft, ChevronRight } from "lucide-react";
import { SnippetCard } from "@/components/snippet/card";
import { SnippetCardSkeleton } from "@/components/ui/skeleton";
import { SearchModal } from "@/components/ui/search-modal";
import { siteConfig } from "@/config/site";
import type { SnippetMeta } from "@/types/snippet";
import type { SortOption } from "@/types/snippet";

function SnippetsContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [snippets, setSnippets] = useState<SnippetMeta[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);

  const page = parseInt(searchParams.get("page") || "1");
  const language = searchParams.get("language") || "";
  const sort = (searchParams.get("sort") || "newest") as SortOption;
  const search = searchParams.get("search") || "";

  const [localSearch, setLocalSearch] = useState(search);

  useEffect(() => {
    async function fetchSnippets() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: page.toString(),
          per_page: siteConfig.snippetsPerPage.toString(),
          sort,
        });
        if (language) params.set("language", language);
        if (search) params.set("search", search);

        const res = await fetch(`/api/snippets?${params}`);
        const data = await res.json();
        if (data.success) {
          setSnippets(data.data.snippets);
          setTotal(data.data.total);
          setTotalPages(data.data.totalPages);
        }
      } catch {
        // silent
      }
      setLoading(false);
    }

    fetchSnippets();
  }, [page, language, sort, search]);

  const updateParams = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    if (key !== "page") params.set("page", "1");
    router.push(`/snippets?${params}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateParams("search", localSearch);
  };

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

      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-text mb-2">Explore Snippets</h1>
          <p className="text-sm text-muted">Browse and discover code snippets</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <form onSubmit={handleSearch} className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search snippets..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
            />
          </form>

          <select
            value={language}
            onChange={(e) => updateParams("language", e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-surface border border-border text-sm text-text outline-none focus:border-accent transition-colors"
          >
            <option value="">All Languages</option>
            {siteConfig.languages.map((lang) => (
              <option key={lang} value={lang}>
                {lang.charAt(0).toUpperCase() + lang.slice(1)}
              </option>
            ))}
          </select>

          <select
            value={sort}
            onChange={(e) => updateParams("sort", e.target.value)}
            className="px-3 py-2.5 rounded-xl bg-surface border border-border text-sm text-text outline-none focus:border-accent transition-colors"
          >
            <option value="newest">Newest</option>
            <option value="oldest">Oldest</option>
            <option value="popular">Most Liked</option>
            <option value="views">Most Viewed</option>
          </select>
        </div>

        {!loading && total > 0 && (
          <p className="text-xs text-muted mb-4">
            {total} snippet{total !== 1 ? "s" : ""} found
          </p>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        ) : snippets.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center">
            <Search className="w-12 h-12 text-muted mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-text mb-2">
              No snippets found
            </h3>
            <p className="text-sm text-muted">
              Try adjusting your search or filters.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {snippets.map((snippet) => (
              <SnippetCard key={snippet.id} snippet={snippet} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            <button
              onClick={() => updateParams("page", (page - 1).toString())}
              disabled={page <= 1}
              className="p-2 rounded-lg border border-border text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 5) }).map((_, i) => {
              const pageNum = i + 1;
              return (
                <button
                  key={pageNum}
                  onClick={() => updateParams("page", pageNum.toString())}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${
                    page === pageNum
                      ? "bg-accent text-white"
                      : "border border-border text-muted hover:text-text hover:bg-surface-hover"
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}
            <button
              onClick={() => updateParams("page", (page + 1).toString())}
              disabled={page >= totalPages}
              className="p-2 rounded-lg border border-border text-muted hover:text-text hover:bg-surface-hover disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function SnippetsPage() {
  return (
    <Suspense
      fallback={
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="mb-8">
            <div className="h-8 w-48 bg-surface-hover rounded animate-pulse mb-2" />
            <div className="h-4 w-64 bg-surface-hover rounded animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <SnippetCardSkeleton key={i} />
            ))}
          </div>
        </div>
      }
    >
      <SnippetsContent />
    </Suspense>
  );
}
