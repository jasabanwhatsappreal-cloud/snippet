import { getFile } from "./client";
import type {
  Snippet,
  SnippetMeta,
  SnippetCreateInput,
  SnippetUpdateInput,
  SnippetListResponse,
  SortOption,
} from "@/types/snippet";
import { saveSnippetFile, getSnippetFile, getAllSnippetFiles } from "./repository";

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

function toMeta(snippet: Snippet): SnippetMeta {
  const { code: _, ...meta } = snippet;
  return meta;
}

export async function createSnippet(
  input: SnippetCreateInput
): Promise<Snippet | null> {
  const id = generateId();
  const now = new Date().toISOString();

  const snippet: Snippet = {
    id,
    title: input.title,
    description: input.description,
    language: input.language,
    code: input.code,
    author: input.author || "Anonymous",
    tags: input.tags || [],
    visibility: input.visibility || "public",
    createdAt: now,
    updatedAt: now,
    views: 0,
    likes: 0,
  };

  const success = await saveSnippetFile(id, snippet);
  return success ? snippet : null;
}

export async function getSnippet(id: string): Promise<Snippet | null> {
  return getSnippetFile<Snippet>(id);
}

export async function getAllSnippets(): Promise<Snippet[]> {
  const files = await getAllSnippetFiles();
  const snippets: Snippet[] = [];

  for (const file of files) {
    const snippet = await getSnippetFile<Snippet>(file.name);
    if (snippet) snippets.push(snippet);
  }

  return snippets;
}

export async function getSnippets(params: {
  page?: number;
  perPage?: number;
  language?: string;
  tag?: string;
  sort?: SortOption;
  search?: string;
}): Promise<SnippetListResponse> {
  const {
    page = 1,
    perPage = 12,
    language,
    tag,
    sort = "newest",
    search,
  } = params;

  let snippets = await getAllSnippets();
  snippets = snippets.filter((s) => s.visibility === "public");

  if (search) {
    const q = search.toLowerCase();
    snippets = snippets.filter(
      (s) =>
        s.title.toLowerCase().includes(q) ||
        s.description.toLowerCase().includes(q) ||
        s.language.toLowerCase().includes(q) ||
        s.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  if (language) {
    snippets = snippets.filter(
      (s) => s.language.toLowerCase() === language.toLowerCase()
    );
  }

  if (tag) {
    snippets = snippets.filter((s) =>
      s.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  }

  switch (sort) {
    case "oldest":
      snippets.sort(
        (a, b) =>
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      );
      break;
    case "popular":
      snippets.sort((a, b) => b.likes - a.likes);
      break;
    case "views":
      snippets.sort((a, b) => b.views - a.views);
      break;
    case "newest":
    default:
      snippets.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
  }

  const total = snippets.length;
  const totalPages = Math.ceil(total / perPage);
  const start = (page - 1) * perPage;
  const paginated = snippets.slice(start, start + perPage);

  return {
    snippets: paginated.map(toMeta),
    total,
    page,
    perPage,
    totalPages,
  };
}

export async function updateSnippet(
  id: string,
  input: SnippetUpdateInput
): Promise<Snippet | null> {
  const existing = await getSnippet(id);
  if (!existing) return null;

  const updated: Snippet = {
    ...existing,
    ...input,
    updatedAt: new Date().toISOString(),
  };

  const success = await saveSnippetFile(id, updated);
  return success ? updated : null;
}

export async function deleteSnippet(id: string): Promise<boolean> {
  const file = await getFile(`snippets/${id}.json`);
  if (!file) return false;

  const { deleteSnippetFile } = await import("./repository");
  return deleteSnippetFile(id, file.sha);
}

export async function incrementViews(id: string): Promise<void> {
  const snippet = await getSnippet(id);
  if (snippet) {
    snippet.views += 1;
    await saveSnippetFile(id, snippet);
  }
}

export async function incrementLikes(id: string): Promise<void> {
  const snippet = await getSnippet(id);
  if (snippet) {
    snippet.likes += 1;
    await saveSnippetFile(id, snippet);
  }
}

export async function getPopularLanguages(
  limit = 10
): Promise<{ language: string; count: number }[]> {
  const snippets = await getAllSnippets();
  const publicSnippets = snippets.filter((s) => s.visibility === "public");

  const countMap = publicSnippets.reduce(
    (acc, s) => {
      acc[s.language] = (acc[s.language] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );

  return Object.entries(countMap)
    .sort(([, a], [, b]) => b - a)
    .slice(0, limit)
    .map(([language, count]) => ({ language, count }));
}

export async function getStats(): Promise<{
  totalSnippets: number;
  totalViews: number;
  totalLikes: number;
  languages: number;
}> {
  const snippets = await getAllSnippets();
  const publicSnippets = snippets.filter((s) => s.visibility === "public");
  const languages = new Set(publicSnippets.map((s) => s.language));

  return {
    totalSnippets: publicSnippets.length,
    totalViews: publicSnippets.reduce((sum, s) => sum + s.views, 0),
    totalLikes: publicSnippets.reduce((sum, s) => sum + s.likes, 0),
    languages: languages.size,
  };
}
