"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Code2, Lock } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      if (data.success) {
        router.push("/admin");
      } else {
        setError(data.error || "Invalid password");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Code2 className="w-10 h-10 text-accent mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-text">Admin Login</h1>
          <p className="text-sm text-muted mt-2">
            Enter your admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm">
              {error}
            </div>
          )}

          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted" />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Admin password"
              autoFocus
              className="w-full pl-10 pr-4 py-3 rounded-xl bg-surface border border-border text-sm text-text placeholder:text-muted outline-none focus:border-accent transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 rounded-xl bg-accent hover:bg-accent-hover text-white font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
