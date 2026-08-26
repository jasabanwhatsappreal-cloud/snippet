"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Search,
  Shield,
  ShieldOff,
  Trash2,
  Eye,
  Globe,
  Clock,
  Users,
  AlertTriangle,
  X,
  FileCode,
} from "lucide-react";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils/utils";
import type { IpRecord } from "@/types/ip";

interface IpStats {
  total: number;
  blacklisted: number;
  totalVisits: number;
  todayVisits: number;
}

export default function AdminIpsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [ips, setIps] = useState<IpRecord[]>([]);
  const [stats, setStats] = useState<IpStats>({
    total: 0,
    blacklisted: 0,
    totalVisits: 0,
    todayVisits: 0,
  });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "blacklisted" | "whitelisted">("all");
  const [detailModal, setDetailModal] = useState<IpRecord | null>(null);
  const [deleteModal, setDeleteModal] = useState<string | null>(null);

  const fetchIps = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      if (filter !== "all") params.set("filter", filter);

      const res = await fetch(`/api/ips?${params}`);
      const data = await res.json();
      if (data.success) {
        setIps(data.data.ips);
        setStats(data.data.stats);
      } else {
        router.push("/admin/login");
      }
    } catch {
      router.push("/admin/login");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchIps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filter]);

  useEffect(() => {
    const timer = setTimeout(() => fetchIps(), 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const handleToggleBlacklist = async (ip: string, current: boolean) => {
    try {
      const res = await fetch(`/api/ips/${encodeURIComponent(ip)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blacklisted: !current }),
      });
      const data = await res.json();
      if (data.success) {
        setIps((prev) =>
          prev.map((r) =>
            r.ip === ip ? { ...r, blacklisted: !current } : r
          )
        );
        setStats((prev) => ({
          ...prev,
          blacklisted: current
            ? prev.blacklisted - 1
            : prev.blacklisted + 1,
        }));
        toast(current ? "IP di-unblacklist" : "IP di-blacklist");
      } else {
        toast(data.error || "Gagal update", "error");
      }
    } catch {
      toast("Gagal update", "error");
    }
  };

  const handleDelete = async (ip: string) => {
    try {
      const res = await fetch(`/api/ips/${encodeURIComponent(ip)}`, {
        method: "DELETE",
      });
      const data = await res.json();
      if (data.success) {
        setIps((prev) => prev.filter((r) => r.ip !== ip));
        setStats((prev) => ({
          ...prev,
          total: prev.total - 1,
        }));
        toast("IP dihapus");
      } else {
        toast(data.error || "Gagal menghapus", "error");
      }
    } catch {
      toast("Gagal menghapus", "error");
    }
    setDeleteModal(null);
    setDetailModal(null);
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
          <h1 className="text-2xl font-extrabold text-text">IP Management</h1>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Total IPs", value: stats.total, icon: Users, bg: "bg-accent" },
          { label: "Blacklisted", value: stats.blacklisted, icon: AlertTriangle, bg: "bg-error" },
          { label: "Total Visits", value: stats.totalVisits, icon: Eye, bg: "bg-blue" },
          { label: "Active Today", value: stats.todayVisits, icon: Clock, bg: "bg-green" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-surface border-2 border-border p-4 shadow-[3px_3px_0_#1a1a1a]"
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

      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by IP, page, or note..."
            className="w-full pl-10 pr-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as typeof filter)}
          className="px-3 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a]"
        >
          <option value="all">All IPs</option>
          <option value="blacklisted">Blacklisted</option>
          <option value="whitelisted">Whitelisted</option>
        </select>
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
      ) : ips.length === 0 ? (
        <div className="bg-surface border-2 border-border p-12 text-center shadow-[4px_4px_0_#1a1a1a]">
          <Globe className="w-12 h-12 text-muted mx-auto mb-4" />
          <h3 className="text-lg font-extrabold text-text mb-2">No IPs found</h3>
          <p className="text-sm text-muted font-medium">
            {search ? "Try a different search term." : "No IP data yet."}
          </p>
        </div>
      ) : (
        <div className="bg-surface border-2 border-border overflow-hidden shadow-[4px_4px_0_#1a1a1a]">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-border bg-surface-hover">
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    IP Address
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Visits
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Pages
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Last Visit
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Status
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-extrabold text-text uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {ips.map((record) => (
                  <tr
                    key={record.ip}
                    className="border-b-2 border-border last:border-0 hover:bg-yellow transition-colors"
                  >
                    <td className="px-4 py-3">
                      <code className="text-sm font-bold font-mono text-text">
                        {record.ip}
                      </code>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-sm font-bold text-text">
                        {record.visits}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <FileCode className="w-3.5 h-3.5 text-muted" />
                        <span className="text-xs text-muted font-medium">
                          {record.pages.length} page{record.pages.length !== 1 ? "s" : ""}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-muted font-medium">
                        {formatDate(record.lastVisit)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      {record.blacklisted ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-border bg-error text-white text-xs font-bold">
                          <AlertTriangle className="w-3 h-3" />
                          Banned
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-border bg-green text-text text-xs font-bold">
                          <Shield className="w-3 h-3" />
                          Active
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setDetailModal(record)}
                          className="p-1.5 border-2 border-transparent hover:border-border text-muted hover:text-text hover:bg-surface-hover transition-all"
                          title="View details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() =>
                            handleToggleBlacklist(record.ip, record.blacklisted)
                          }
                          className={`p-1.5 border-2 border-transparent hover:border-border transition-all ${
                            record.blacklisted
                              ? "text-success hover:bg-green/10"
                              : "text-warning hover:bg-yellow/30"
                          }`}
                          title={record.blacklisted ? "Unban" : "Ban"}
                        >
                          {record.blacklisted ? (
                            <ShieldOff className="w-4 h-4" />
                          ) : (
                            <Shield className="w-4 h-4" />
                          )}
                        </button>
                        <button
                          onClick={() => setDeleteModal(record.ip)}
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
        isOpen={!!detailModal}
        onClose={() => setDetailModal(null)}
        title="IP Details"
      >
        {detailModal && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <code className="text-lg font-bold font-mono text-text">
                {detailModal.ip}
              </code>
              {detailModal.blacklisted ? (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-border bg-error text-white text-xs font-bold">
                  <AlertTriangle className="w-3 h-3" />
                  Banned
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 border-2 border-border bg-green text-text text-xs font-bold">
                  <Shield className="w-3 h-3" />
                  Active
                </span>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="border-2 border-border p-3 shadow-[2px_2px_0_#1a1a1a]">
                <div className="text-xs text-muted font-bold">Total Visits</div>
                <div className="text-lg font-extrabold text-text">{detailModal.visits}</div>
              </div>
              <div className="border-2 border-border p-3 shadow-[2px_2px_0_#1a1a1a]">
                <div className="text-xs text-muted font-bold">Pages Visited</div>
                <div className="text-lg font-extrabold text-text">{detailModal.pages.length}</div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted font-bold">First Visit</div>
              <div className="text-sm text-text font-medium">{formatDate(detailModal.firstVisit)}</div>
            </div>

            <div className="space-y-1">
              <div className="text-xs text-muted font-bold">Last Visit</div>
              <div className="text-sm text-text font-medium">{formatDate(detailModal.lastVisit)}</div>
            </div>

            {detailModal.blacklisted && detailModal.blacklistedAt && (
              <div className="space-y-1">
                <div className="text-xs text-muted font-bold">Blacklisted At</div>
                <div className="text-sm text-text font-medium">{formatDate(detailModal.blacklistedAt)}</div>
              </div>
            )}

            {detailModal.note && (
              <div className="space-y-1">
                <div className="text-xs text-muted font-bold">Note</div>
                <div className="text-sm text-text font-medium">{detailModal.note}</div>
              </div>
            )}

            <div className="space-y-2">
              <div className="text-xs text-muted font-bold">Pages Visited</div>
              <div className="max-h-40 overflow-y-auto border-2 border-border p-2 space-y-1">
                {detailModal.pages.map((page, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-xs font-mono text-text py-1 px-2 hover:bg-surface-hover"
                  >
                    <Globe className="w-3 h-3 text-muted shrink-0" />
                    {page}
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  handleToggleBlacklist(
                    detailModal.ip,
                    detailModal.blacklisted
                  );
                  setDetailModal(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-border text-sm font-bold shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all ${
                  detailModal.blacklisted
                    ? "bg-green text-text"
                    : "bg-yellow text-text"
                }`}
              >
                {detailModal.blacklisted ? (
                  <>
                    <ShieldOff className="w-4 h-4" />
                    Unban
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Ban IP
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setDeleteModal(detailModal.ip);
                  setDetailModal(null);
                }}
                className="flex items-center justify-center gap-2 px-4 py-2 bg-error border-2 border-border text-white text-sm font-bold shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Trash2 className="w-4 h-4" />
                Delete
              </button>
            </div>
          </div>
        )}
      </Modal>

      <Modal
        isOpen={!!deleteModal}
        onClose={() => setDeleteModal(null)}
        title="Delete IP"
      >
        <p className="text-sm text-muted mb-6 font-medium">
          Yakin ingin menghapus data IP <code className="font-bold">{deleteModal}</code>? Semua riwayat kunjungan akan hilang.
        </p>
        <div className="flex justify-end gap-2">
          <button
            onClick={() => setDeleteModal(null)}
            className="px-4 py-2 border-2 border-border bg-surface text-sm text-text font-bold hover:bg-yellow shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Batal
          </button>
          <button
            onClick={() => deleteModal && handleDelete(deleteModal)}
            className="px-4 py-2 bg-error border-2 border-border text-white text-sm font-bold shadow-[2px_2px_0_#1a1a1a] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
          >
            Hapus
          </button>
        </div>
      </Modal>
    </div>
  );
}
