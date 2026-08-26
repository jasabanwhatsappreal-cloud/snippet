"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Code2, Plus, X, Lock } from "lucide-react";
import { siteConfig } from "@/config/site";

export default function CreateSnippetPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [code, setCode] = useState("");
  const [author, setAuthor] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [visibility, setVisibility] = useState<"public" | "private">("public");

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => setIsAdmin(false));
  }, []);

  if (isAdmin === null) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-6 h-6 border-2 border-border border-t-accent animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Lock className="w-12 h-12 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-extrabold text-text mb-2">Access Restricted</h1>
        <p className="text-sm text-muted mb-6 font-medium">
          Only admin can create snippets.
        </p>
        <button
          onClick={() => router.push("/admin/login")}
          className="px-4 py-2 border-2 border-border bg-accent text-white text-sm font-bold shadow-[3px_3px_0_#1a1a1a] hover:shadow-[1px_1px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          Admin Login
        </button>
      </div>
    );
  }

  const handleAddTagFromValue = (value: string) => {
    const tag = value.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 10) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const handleTagInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (val.includes(",")) {
      const parts = val.split(",");
      for (const part of parts.slice(0, -1)) {
        const tag = part.trim().toLowerCase();
        if (tag && !tags.includes(tag) && tags.length < 10) {
          setTags((prev) => [...prev, tag]);
        }
      }
      setTagInput(parts[parts.length - 1]);
    } else {
      setTagInput(val);
    }
  };

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === "Go" || e.key === "Next" || e.key === "Done") {
      e.preventDefault();
      handleAddTagFromValue(tagInput);
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!code.trim()) {
      setError("Code is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/snippets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          language,
          code,
          author: author.trim() || "Anonymous",
          tags,
          visibility,
        }),
      });

      const data = await res.json();
      if (data.success && data.data) {
        router.push(`/s/${data.data.id}`);
      } else {
        setError(data.error || "Failed to create snippet");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted font-bold hover:text-text hover:underline transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text mb-2">Create Snippet</h1>
        <p className="text-sm text-muted font-medium">
          Share a code snippet with the community.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 border-2 border-border bg-error/10 text-error text-sm font-bold shadow-[3px_3px_0_#1a1a1a]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Button Component"
            maxLength={100}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of your snippet"
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors resize-none shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-text">Language *</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a]"
            >
              {siteConfig.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold text-text">Visibility</label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "public" | "private")
              }
              className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a]"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">
            Tags <span className="text-muted font-normal">(type comma or Enter to add)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 border-2 border-border bg-yellow text-accent text-xs font-bold"
              >
                {tag}
                <button
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className="hover:text-accent-hover"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          <input
            type="text"
            value={tagInput}
            onChange={handleTagInputChange}
            onKeyDown={handleAddTag}
            placeholder="e.g. react, component"
            disabled={tags.length >= 10}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors disabled:opacity-50 shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Code *</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`function hello() {\n  console.log("Hello Phrzy!");\n}`}
            rows={16}
            className="w-full px-4 py-3 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors resize-y font-mono shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-accent border-2 border-border text-white font-bold shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_#1a1a1a] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all"
        >
          {loading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="w-5 h-5" />
              Create Snippet
            </>
          )}
        </button>
      </form>
    </div>
  );
}
