"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save, X, Lock } from "lucide-react";
import { siteConfig } from "@/config/site";
import type { Snippet } from "@/types/snippet";

export default function EditSnippetPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notFound, setNotFound] = useState(false);
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

  useEffect(() => {
    async function fetchSnippet() {
      try {
        const res = await fetch(`/api/snippets/${id}`);
        const data = await res.json();
        if (data.success && data.data) {
          const s: Snippet = data.data;
          setTitle(s.title);
          setDescription(s.description || "");
          setLanguage(s.language);
          setCode(s.code);
          setAuthor(s.author || "");
          setTags(s.tags || []);
          setVisibility(s.visibility);
        } else {
          setNotFound(true);
        }
      } catch {
        setNotFound(true);
      }
      setLoading(false);
    }
    fetchSnippet();
  }, [id]);

  if (isAdmin === null || loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="w-6 h-6 border-2 border-accent/30 border-t-accent rounded-full animate-spin mx-auto" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <Lock className="w-12 h-12 text-muted mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-text mb-2">Access Restricted</h1>
        <p className="text-sm text-muted mb-6">Only admin can edit snippets.</p>
        <button
          onClick={() => router.push("/admin/login")}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Admin Login
        </button>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold text-text mb-4">Snippet Not Found</h1>
        <p className="text-sm text-muted mb-6">
          The snippet you&apos;re trying to edit doesn&apos;t exist.
        </p>
        <button
          onClick={() => router.push("/admin/snippets")}
          className="px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          Back to Manage Snippets
        </button>
      </div>
    );
  }

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      const tag = tagInput.trim().toLowerCase();
      if (tag && !tags.includes(tag) && tags.length < 10) {
        setTags([...tags, tag]);
        setTagInput("");
      }
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

    setSaving(true);
    try {
      const res = await fetch(`/api/snippets/${id}`, {
        method: "PUT",
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
      if (data.success) {
        router.push(`/s/${id}`);
      } else {
        setError(data.error || "Failed to update snippet");
      }
    } catch {
      setError("Something went wrong");
    }
    setSaving(false);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-text mb-2">Edit Snippet</h1>
        <p className="text-sm text-muted">
          Update the snippet details and save your changes.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. React Button Component"
            maxLength={100}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A short description of your snippet"
            rows={2}
            maxLength={500}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors resize-none"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Language *</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text outline-none focus:border-accent transition-colors"
            >
              {siteConfig.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text">Visibility</label>
            <select
              value={visibility}
              onChange={(e) =>
                setVisibility(e.target.value as "public" | "private")
              }
              className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text outline-none focus:border-accent transition-colors"
            >
              <option value="public">Public</option>
              <option value="private">Private</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Author</label>
          <input
            type="text"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            placeholder="Anonymous"
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">
            Tags <span className="text-muted font-normal">(press Enter to add)</span>
          </label>
          <div className="flex flex-wrap gap-2 mb-2">
            {tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-accent/10 text-accent text-xs border border-accent/20"
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
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={handleAddTag}
            placeholder="e.g. react, component"
            disabled={tags.length >= 10}
            className="w-full px-4 py-2.5 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors disabled:opacity-50"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text">Code *</label>
          <textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder={`function hello() {\n  console.log("Hello Phrzy!");\n}`}
            rows={16}
            className="w-full px-4 py-3 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors resize-y font-mono"
            style={{ fontFamily: "var(--font-geist-mono), monospace" }}
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {saving ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="w-5 h-5" />
              Save Changes
            </>
          )}
        </button>
      </form>
    </div>
  );
}