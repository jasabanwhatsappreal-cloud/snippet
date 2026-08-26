"use client";

import { useState } from "react";
import { Send, CheckCircle2, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";

export default function RequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("");
  const [requester, setRequester] = useState("");
  const [contact, setContact] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!title.trim()) {
      setError("Title is required");
      return;
    }
    if (!description.trim()) {
      setError("Description is required");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: title.trim(),
          description: description.trim(),
          language: language.trim(),
          requester: requester.trim(),
          contact: contact.trim(),
        }),
      });

      const data = await res.json();
      if (data.success) {
        setSubmitted(true);
      } else {
        setError(data.error || "Failed to submit request");
      }
    } catch {
      setError("Something went wrong");
    }
    setLoading(false);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-20 text-center">
        <CheckCircle2 className="w-16 h-16 text-green mx-auto mb-6" />
        <h1 className="text-2xl font-extrabold text-text mb-3">Request Submitted!</h1>
        <p className="text-muted mb-8 max-w-md mx-auto font-medium">
          Terima kasih! Request snippet kamu sudah dikirim. Admin akan
          memprosesnya dan snippet bisa muncul di {siteConfig.name}.
        </p>
        <button
          onClick={() => router.push("/snippets")}
          className="px-6 py-3 bg-accent border-2 border-border text-white font-bold shadow-[4px_4px_0_#1a1a1a] hover:shadow-[2px_2px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
        >
          Explore Snippets
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm text-muted font-bold hover:text-text hover:underline transition-colors mb-6"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="mb-8">
        <h1 className="text-2xl font-extrabold text-text mb-2">Request a Snippet</h1>
        <p className="text-sm text-muted font-medium">
          Butuh kode tertentu? Ajukan request dan admin akan berusaha membuatkannya.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 border-2 border-border bg-error/10 text-error text-sm font-bold shadow-[3px_3px_0_#1a1a1a]">
            {error}
          </div>
        )}

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Apa yang kamu butuhkan? *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Script untuk download video YouTube"
            maxLength={100}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">Deskripsi detail *</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Jelaskan fitur/fungsi yang diinginkan, contoh input dan output, dll."
            rows={5}
            maxLength={1000}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors resize-none shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-extrabold text-text">Bahasa (opsional)</label>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a]"
            >
              <option value="">Pilih bahasa...</option>
              {siteConfig.languages.map((lang) => (
                <option key={lang} value={lang}>
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-extrabold text-text">Nama kamu (opsional)</label>
            <input
              type="text"
              value={requester}
              onChange={(e) => setRequester(e.target.value)}
              placeholder="Anonymous"
              maxLength={50}
              className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-extrabold text-text">
            Kontak (opsional){" "}
            <span className="text-muted font-normal">— WhatsApp/email supaya bisa dihubungi</span>
          </label>
          <input
            type="text"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="e.g. 08xxxx / email@example.com"
            maxLength={100}
            className="w-full px-4 py-2.5 border-2 border-border bg-surface text-sm text-text font-medium placeholder:text-muted outline-none focus:border-accent transition-colors shadow-[3px_3px_0_#1a1a1a] focus:shadow-[1px_1px_0_#1a1a1a] focus:translate-x-[2px] focus:translate-y-[2px]"
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
              Mengirim...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Kirim Request
            </>
          )}
        </button>
      </form>
    </div>
  );
}
