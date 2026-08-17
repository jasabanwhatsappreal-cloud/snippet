"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
  Trash2,
  MessageSquare,
  Clock,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate, getLanguageColor } from "@/lib/utils/utils";
import type { SnippetRequest } from "@/types/request";

export default function AdminRequestsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [requests, setRequests] = useState<SnippetRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch("/api/requests");
        const data = await res.json();
        if (data.success) {
          setRequests(data.data);
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

  const handleStatus = async (id: string, status: "pending" | "resolved") => {
    try {
      const res = await fetch(`/api/requests/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) =>
          prev.map((r) => (r.id === id ? { ...r, status } : r))
        );
        toast(status === "resolved" ? "Request ditandai selesai" : "Request dibuka kembali");
      } else {
        toast(data.error || "Gagal memperbarui", "error");
      }
    } catch {
      toast("Gagal memperbarui", "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/requests/${id}`, { method: "DELETE" });
      const data = await res.json();
      if (data.success) {
        setRequests((prev) => prev.filter((r) => r.id !== id));
        toast("Request dihapus");
      } else {
        toast(data.error || "Gagal menghapus", "error");
      }
    } catch {
      toast("Gagal menghapus", "error");
    }
    setDeleteModal(null);
  };

  const pending = requests.filter((r) => r.status === "pending").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-1.5 text-sm text-muted hover:text-text transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Dashboard
          </Link>
          <h1 className="text-2xl font-bold text-text">Snippet Requests</h1>
        </div>
        {!loading && (
          <span
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${
              pending > 0
                ? "bg-warning/10 text-warning border-warning/20"
                : "bg-success/10 text-success border-success/20"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            {pending} pending
          </span>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-surface border border-border rounded-xl p-4 h-24 animate-pulse"
            />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-surface border border-border rounded-xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-text mb-2">Belum ada request</h3>
          <p className="text-sm text-muted">
            Request snippet dari pengunjung akan muncul di sini.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map((request) => (
            <div
              key={request.id}
              className="bg-surface border border-border rounded-xl p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-text">
                      {request.title}
                    </h3>
                    {request.language && (
                      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs border border-border text-muted">
                        <span
                          className="w-2 h-2 rounded-full"
                          style={{
                            backgroundColor: getLanguageColor(request.language),
                          }}
                        />
                        {request.language}
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                        request.status === "resolved"
                          ? "bg-success/10 text-success border border-success/20"
                          : "bg-warning/10 text-warning border border-warning/20"
                      }`}
                    >
                      {request.status === "resolved" ? "Selesai" : "Pending"}
                    </span>
                  </div>
                  <p className="text-sm text-muted mb-3 whitespace-pre-wrap">
                    {request.description}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted/70">
                    <span>{request.requester || "Anonymous"}</span>
                    {request.contact && (
                      <span className="break-all">{request.contact}</span>
                    )}
                    <span>{formatDate(request.createdAt)}</span>
                    <span className="font-mono text-muted/40">{request.id}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  {request.status === "pending" ? (
                    <button
                      onClick={() => handleStatus(request.id, "resolved")}
                      className="p-2 rounded-lg text-success hover:bg-success/10 transition-colors"
                      title="Tandai selesai"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStatus(request.id, "pending")}
                      className="p-2 rounded-lg text-warning hover:bg-warning/10 transition-colors"
                      title="Buka kembali"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setDeleteModal(request.id)}
                    className="p-2 rounded-lg text-muted hover:text-error hover:bg-error/10 transition-colors"
                    title="Hapus"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Hapus Request"
      >
        <p className="text-sm text-muted mb-6">
          Yakin ingin menghapus request ini? Aksi ini tidak bisa dibatalkan.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-4 py-2 rounded-lg border border-border text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
          >
            Batal
          </button>
          <button
            onClick={() => deleteModal && handleDelete(deleteModal)}
            className="px-4 py-2 rounded-lg bg-error hover:bg-error/80 text-white text-sm font-medium transition-colors"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}