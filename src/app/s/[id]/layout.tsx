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
      const title = snippet.title?.trim() || "Untitled Snippet";
      const description =
        snippet.description?.trim() || "Developer code snippet shared on Phrzy.";
      const author = snippet.author?.trim() || "Phrzy";
      const tags = Array.isArray(snippet.tags) ? snippet.tags : [];
      const ogImage = `${siteConfig.url}/api/og/${id}`;
      return {
        title,
        description,
        keywords: [title, snippet.language, "code snippet", ...tags],
        category: "technology",
        authors: [{ name: author }],
        openGraph: {
          title: `${title} — ${siteConfig.name}`,
          description,
          url: `${siteConfig.url}/s/${id}`,
          siteName: siteConfig.name,
          locale: "id_ID",
          type: "article",
          authors: [author],
          tags,
          publishedTime: snippet.createdAt,
          modifiedTime: snippet.updatedAt,
          images: [
            {
              url: ogImage,
              width: 1200,
              height: 630,
              alt: `${title} — code snippet preview`,
            },
          ],
        },
        twitter: {
          card: "summary_large_image",
          title: `${title} — ${siteConfig.name}`,
          description,
          images: [ogImage],
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
    openGraph: {
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
      url: `${siteConfig.url}/s/${id}`,
      siteName: siteConfig.name,
      locale: "id_ID",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${siteConfig.name} — ${siteConfig.tagline}`,
      description: siteConfig.description,
    },
    alternates: {
      canonical: `${siteConfig.url}/s/${id}`,
    },
  };
}

export default async function SnippetLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let title = "";
  let description = "";
  let language = "";
  let author = "Anonymous";
  let createdAt = "";
  let updatedAt = "";
  let tags: string[] = [];

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/api/snippets/${id}`,
      { next: { revalidate: 60 } }
    );
    const data = await res.json();
    if (data.success && data.data) {
      title = data.data.title;
      description = data.data.description || "";
      language = data.data.language;
      author = data.data.author || "Anonymous";
      createdAt = data.data.createdAt;
      updatedAt = data.data.updatedAt;
      tags = data.data.tags || [];
    }
  } catch {
    // fallback
  }

  return (
    <>
      {children}
      {title && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "SoftwareSourceCode",
              name: title,
              description: description || undefined,
              programmingLanguage: language,
              codeRepository: siteConfig.github,
              author: { "@type": "Person", name: author },
              dateCreated: createdAt,
              dateModified: updatedAt,
              keywords: tags,
            }),
          }}
        />
      )}
    </>
  );
}