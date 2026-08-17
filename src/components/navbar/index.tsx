"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
  Search,
  Plus,
  Menu,
  X,
  Code2,
  FileCode,
  LayoutDashboard,
} from "lucide-react";

export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/snippets", label: "Snippets", icon: FileCode },
    { href: "/create", label: "Create", icon: Plus },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <Code2 className="w-7 h-7 text-accent group-hover:scale-110 transition-transform" />
              <span className="text-lg font-bold tracking-tight text-text">
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
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-accent/10 text-accent"
                        : "text-muted hover:text-text hover:bg-surface-hover"
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
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
            >
              <LayoutDashboard className="w-4 h-4" />
            </Link>
            <Link
              href="/create"
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-accent hover:bg-accent-hover text-white transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Snippet
            </Link>
          </div>

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-muted hover:text-text hover:bg-surface-hover transition-colors"
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
        <div className="md:hidden border-t border-border bg-surface/95 backdrop-blur-xl animate-slide-in">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-accent/10 text-accent"
                      : "text-muted hover:text-text hover:bg-surface-hover"
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
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted hover:text-text hover:bg-surface-hover transition-colors"
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
