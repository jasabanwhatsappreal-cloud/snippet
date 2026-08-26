"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Plus,
  Menu,
  X,
  Code2,
  FileCode,
  LayoutDashboard,
  MessageSquarePlus,
} from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetch("/api/admin/check")
      .then((r) => r.json())
      .then((d) => setIsAdmin(d.isAdmin))
      .catch(() => {});
  }, []);

  const navLinks = [
    { href: "/snippets", label: "Snippets", icon: FileCode },
    { href: "/request", label: "Request", icon: MessageSquarePlus },
    ...(isAdmin ? [{ href: "/create", label: "Create", icon: Plus }] : []),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-surface/95 backdrop-blur-sm border-b-2 border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Code2 className="w-7 h-7 text-accent group-hover:rotate-12 transition-transform" />
              <span className="text-lg font-extrabold tracking-tight text-text">
                Phrzy
              </span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center gap-2 px-3 py-2 border-2 text-sm font-bold transition-all ${
                      isActive
                        ? "bg-accent text-white border-border shadow-[2px_2px_0_#1a1a1a]"
                        : "bg-surface text-text border-transparent hover:border-border hover:shadow-[2px_2px_0_#1a1a1a]"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-3">
            <Link
              href="/admin"
              className="flex items-center gap-2 px-3 py-2 border-2 border-transparent text-sm font-bold text-text hover:border-border hover:bg-surface hover:shadow-[2px_2px_0_#1a1a1a] transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
            {isAdmin && (
              <Link
                href="/create"
                className="flex items-center gap-2 px-4 py-2 border-2 border-border bg-accent text-white text-sm font-bold shadow-[3px_3px_0_#1a1a1a] hover:shadow-[1px_1px_0_#1a1a1a] hover:translate-x-[2px] hover:translate-y-[2px] transition-all"
              >
                <Plus className="w-4 h-4" />
                New Snippet
              </Link>
            )}
          </div>

          <button
            type="button"
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-3 min-w-[44px] min-h-[44px] flex items-center justify-center border-2 border-border bg-surface shadow-[2px_2px_0_#1a1a1a] active:shadow-none active:translate-x-[2px] active:translate-y-[2px] transition-shadow"
          >
            {mobileOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden border-t-2 border-border bg-surface animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 border-2 text-sm font-bold transition-all ${
                    isActive
                      ? "bg-accent text-white border-border shadow-[2px_2px_0_#1a1a1a]"
                      : "text-text border-transparent hover:border-border hover:bg-surface-hover hover:shadow-[2px_2px_0_#1a1a1a]"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </Link>
              );
            })}
            <Link
              href="/admin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 border-2 border-transparent text-sm font-bold text-text hover:border-border hover:bg-surface-hover hover:shadow-[2px_2px_0_#1a1a1a] transition-all"
            >
              <LayoutDashboard className="w-4 h-4" />
              Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
