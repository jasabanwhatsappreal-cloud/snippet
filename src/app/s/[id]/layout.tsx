import type { Metadata } from "next";
import { siteConfig } from "@/config/site";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/snippets/${id}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();

    if (data.success && data.data) {
      const snippet = data.data;
      return {
        title: `${snippet.title}`,
        description: snippet.description || `Code snippet in ${snippet.language}`,
        openGraph: {
          title: `${snippet.title} — ${siteConfig.name}`,
          description:
            snippet.description || `Code snippet in ${snippet.language}`,
          url: `${siteConfig.url}/s/${id}`,
          type: "article",
          authors: [snippet.author],
          tags: snippet.tags,
        },
        twitter: {
          card: "summary_large_image",
          title: `${snippet.title} — ${siteConfig.name}`,
          description:
            snippet.description || `Code snippet in ${snippet.language}`,
        },
        alternates: {
          canonical: `${siteConfig.url}/s/${id}`,
        },
      };
    }
  } catch {
    // fallback
  }

  return {
    title: `Snippet — ${siteConfig.name}`,
    description: siteConfig.description,
  };
}

export default function SnippetLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
