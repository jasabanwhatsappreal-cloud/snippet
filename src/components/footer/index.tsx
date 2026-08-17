import Link from "next/link";
import { Code2, MessageCircle } from "lucide-react";
import { siteConfig } from "@/config/site";

export function Footer() {
  return (
    <footer className="border-t border-border bg-surface/50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-col md:flex-row justify-between gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2">
              <Code2 className="w-6 h-6 text-accent" />
              <span className="text-lg font-bold tracking-tight">
                {siteConfig.shortName}
              </span>
            </Link>
            <p className="text-sm text-muted max-w-xs">
              {siteConfig.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text">Product</h4>
              <div className="space-y-2">
                <Link
                  href="/snippets"
                  className="block text-sm text-muted hover:text-text transition-colors"
                >
                  Snippets
                </Link>
                <Link
                  href="/create"
                  className="block text-sm text-muted hover:text-text transition-colors"
                >
                  Create Snippet
                </Link>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text">Resources</h4>
              <div className="space-y-2">
                <a
                  href={siteConfig.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-sm text-muted hover:text-text transition-colors"
                >
                  GitHub
                </a>
                <a
                  href={siteConfig.whatsappChannel}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-sm text-muted hover:text-text transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-accent" />
                  WhatsApp Channel
                </a>
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-text">Admin</h4>
              <div className="space-y-2">
                <Link
                  href="/admin"
                  className="block text-sm text-muted hover:text-text transition-colors"
                >
                  Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-border">
          <p className="text-xs text-muted text-center">
            &copy; {new Date().getFullYear()} {siteConfig.name}. Built for
            developers.
          </p>
        </div>
      </div>
    </footer>
  );
}
