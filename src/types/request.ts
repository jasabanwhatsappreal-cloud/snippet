export interface SnippetRequest {
  id: string;
  title: string;
  description: string;
  language?: string;
  requester?: string;
  contact?: string;
  status: "pending" | "resolved";
  createdAt: string;
  updatedAt: string;
}