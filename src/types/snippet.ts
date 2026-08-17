export interface Snippet {
  id: string;
  title: string;
  description: string;
  language: string;
  code: string;
  author: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

export interface SnippetMeta {
  id: string;
  title: string;
  description: string;
  language: string;
  author: string;
  tags: string[];
  visibility: "public" | "private";
  createdAt: string;
  updatedAt: string;
  views: number;
  likes: number;
}

export interface SnippetCreateInput {
  title: string;
  description: string;
  language: string;
  code: string;
  author?: string;
  tags?: string[];
  visibility?: "public" | "private";
}

export interface SnippetUpdateInput extends Partial<SnippetCreateInput> {}

export interface SnippetListResponse {
  snippets: SnippetMeta[];
  total: number;
  page: number;
  perPage: number;
  totalPages: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

export type SortOption = "newest" | "oldest" | "popular" | "views";
