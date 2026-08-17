import type { MetadataRoute } from "next";
import { siteConfig } from "@/config/site";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base: MetadataRoute.Sitemap = [
    {
      url: siteConfig.url,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteConfig.url}/snippets`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${siteConfig.url}/create`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  try {
    const { getAllSnippets } = await import("@/lib/github/snippets");
    const snippets = await getAllSnippets();
    const publicSnippets = snippets.filter((s) => s.visibility === "public");

    const snippetUrls: MetadataRoute.Sitemap = publicSnippets.map((s) => ({
      url: `${siteConfig.url}/s/${s.id}`,
      lastModified: new Date(s.updatedAt),
      changeFrequency: "weekly",
      priority: 0.8,
    }));

    return [...base, ...snippetUrls];
  } catch {
    return base;
  }
}