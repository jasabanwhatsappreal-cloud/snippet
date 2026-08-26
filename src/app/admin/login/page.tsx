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
          <h1 className="text-2xl font-extrabold text-text">Admin Login</h1>
          <p className="text-sm text-muted mt-2 font-medium">
            Enter your admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 border-2 border-border bg-error/10 text-error text-sm font-bold shadow-[3px_3px_0_#1a1a1a]">
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
              className="w-full pl-10 pr-4 py-3 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !password}
            className="w-full py-3 bg-accent border-2 border-border text-white font-bold text-sm shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-[4px_4px_0_#1a1a1a] disabled:hover:translate-x-0 disabled:hover:translate-y-0 transition-all"
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
