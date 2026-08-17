import type { SnippetRequest } from "@/types/request";
import {
  saveRequestFile,
  getRequestFile,
  deleteRequestFile,
  getAllRequestFiles,
} from "./request-repository";

function generateId(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let id = "";
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return id;
}

export async function createRequest(input: {
  title: string;
  description: string;
  language?: string;
  requester?: string;
  contact?: string;
}): Promise<SnippetRequest | null> {
  const id = generateId();
  const now = new Date().toISOString();

  const request: SnippetRequest = {
    id,
    title: input.title,
    description: input.description,
    language: input.language || undefined,
    requester: input.requester || undefined,
    contact: input.contact || undefined,
    status: "pending",
    createdAt: now,
    updatedAt: now,
  };

  const success = await saveRequestFile(id, request);
  return success ? request : null;
}

export async function getAllRequests(): Promise<SnippetRequest[]> {
  const files = await getAllRequestFiles();
  const requests: SnippetRequest[] = [];

  for (const file of files) {
    const request = await getRequestFile<SnippetRequest>(file.name);
    if (request) requests.push(request);
  }

  return requests.sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export async function updateRequestStatus(
  id: string,
  status: "pending" | "resolved"
): Promise<SnippetRequest | null> {
  const existing = await getRequestFile<SnippetRequest>(id);
  if (!existing) return null;

  const updated: SnippetRequest = {
    ...existing,
    status,
    updatedAt: new Date().toISOString(),
  };

  const success = await saveRequestFile(id, updated);
  return success ? updated : null;
}

export async function deleteRequest(id: string): Promise<boolean> {
  const files = await getAllRequestFiles();
  const target = files.find((f) => f.name === id);
  if (!target) return false;

  return deleteRequestFile(id, target.sha);
}