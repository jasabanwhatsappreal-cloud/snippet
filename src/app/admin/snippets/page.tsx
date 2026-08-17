"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Eye,
  Pencil,
  Trash2,
  Copy,
  Plus,
  ArrowLeft,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate, copyToClipboard, getLanguageColor } from "@/lib/utils/utils";
import type { Snippet } from "@/types/snippet";

export default function AdminSnippetsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [snippets, setSnippets] = useState<Snippet[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/admin/snippets");
        const data = await res.json();
        if (data.success) {
          setSnippets(data.data.snippets);
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

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/snippets/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setSnippets((prev) => prev.filter((s) => s.id !== id));
        toast("Snippet deleted");
      } else {
        toast(data.error || "Failed to delete", "error");
      }
    } catch {
      toast("Failed to delete", "error");
    }
    setDeleteModal(null);
  };

  const handleCopyUrl = async (id: string) => {
    await copyToClipboard(`${window.location.origin}/s/${id}`);
    toast("URL copied!");
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-text">Manage Snippets</h1>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
        >
          <Plus className="w-4 h-4" />
          New Snippet
        </Link>
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-4 h-16 animate-pulse"
            />
          ))}
        </div>
      ) : snippets.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <h3 className="text-lg font-semibold text-text mb-2">No snippets</h3>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent hover:bg-accent-hover text-white text-sm font-medium transition-colors"
          >
            <Plus className="w-4 h-4" />
            Create Snippet
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-border rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Language
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-medium text-muted uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {snippets.map((snippet) => (
                  <tr
                    key={snippet.id}
                    className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted font-mono">
                        {snippet.id}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-medium text-text truncate max-w-[200px] block">
                        {snippet.title}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getLanguageColor(snippet.language),
                          }}
                        />
                        <span className="text-xs text-muted capitalize">
                          {snippet.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{snippet.views}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">{snippet.likes}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted">
                        {formatDate(snippet.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/s/${snippet.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleCopyUrl(snippet.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/edit/${snippet.id}`}
                          className="p-1.5 rounded-lg text-muted hover:text-accent hover:bg-accent/10 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(snippet.id)}
                          className="p-1.5 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete Snippet"
      >
        <p className="text-sm text-muted mb-6">
          Are you sure you want to delete this snippet? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteModal && handleDelete(deleteModal)}
            className="px-4 py-2 rounded-lg bg-error hover:bg-error/80 text-white text-sm font-medium transition-colors"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
