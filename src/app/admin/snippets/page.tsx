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
            className="flex items-center gap-1.5 text-sm text-muted font-bold hover:text-text hover:underline transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-extrabold text-text">Manage Snippets</h1>
        </div>
        <Link
          href="/create"
          className="flex items-center gap-2 px-4 py-2 bg-accent border-2 border-border text-white text-sm font-bold shadow-[3px_3px_0_#1a1a1a] hover:shadow-[1px_1px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
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
              className="bg-surface border-2 border-border p-4 h-16 animate-pulse shadow-[3px_3px_0_#1a1a1a]"
            />
          ))}
        </div>
      ) : snippets.length === 0 ? (
        <div className="bg-surface border-2 border-border p-12 text-center shadow-[4px_4px_0_#1a1a1a]">
          <h3 className="text-lg font-extrabold text-text mb-2">No snippets</h3>
          <Link
            href="/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-accent border-2 border-border text-white text-sm font-bold shadow-[3px_3px_0_#1a1a1a] hover:shadow-[1px_1px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Snippet
          </Link>
        </div>
      ) : (
        <div className="bg-surface border-2 border-border overflow-hidden shadow-[4px_4px_0_#1a1a1a]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-surface-hover">
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    ID
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Title
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Language
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Views
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Likes
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Created
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {snippets.map((snippet) => (
                  <tr
                    key={snippet.id}
                    className="border-b-2 border-border last:border-0 hover:bg-yellow transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-xs text-muted font-mono font-bold">
                        {snippet.id}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-text truncate max-w-[200px] block">
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
                        <span className="text-xs text-muted font-bold capitalize">
                          {snippet.language}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted font-medium">{snippet.views}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted font-medium">{snippet.likes}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted font-medium">
                        {formatDate(snippet.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/s/${snippet.id}`}
                          className="p-1.5 border-2 border-transparent hover:border-border text-muted hover:text-text hover:bg-surface-hover transition-all"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleCopyUrl(snippet.id)}
                          className="p-1.5 border-2 border-transparent hover:border-border text-muted hover:text-text hover:bg-surface-hover transition-all"
                          title="Copy URL"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/admin/edit/${snippet.id}`}
                          className="p-1.5 border-2 border-transparent hover:border-border text-muted hover:text-accent hover:bg-accent/10 transition-all"
                          title="Edit"
                        >
                          <Pencil className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteModal(snippet.id)}
                          className="p-1.5 border-2 border-transparent hover:border-border text-muted hover:text-error hover:bg-error/10 transition-all"
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
        <p className="text-sm text-muted mb-6 font-medium">
          Are you sure you want to delete this snippet? This action cannot be
          undone.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-4 py-2 border-2 border-border bg-surface text-sm text-text font-bold hover:bg-yellow shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Cancel
          </button>
          <button
            onClick={() => deleteModal && handleDelete(deleteModal)}
            className="px-4 py-2 bg-error border-2 border-border text-white text-sm font-bold shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}
