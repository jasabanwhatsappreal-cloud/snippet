import { getFile, createFile, updateFile, deleteFile, listDirectory } from "./client";

const REQUESTS_DIR = "requests";

export async function saveRequestFile(
  id: string,
  data: unknown
): Promise<boolean> {
  const filePath = `${REQUESTS_DIR}/${id}.json`;
  const existing = await getFile(filePath);
  const content = JSON.stringify(data, null, 2);

  if (existing) {
    return updateFile(
      { path: filePath, content, message: `Update request ${id}` },
      existing.sha
    );
  }

  return createFile({
    path: filePath,
    content,
    message: `Create request ${id}`,
  });
}

export async function getRequestFile<T>(id: string): Promise<T | null> {
  const filePath = `${REQUESTS_DIR}/${id}.json`;
  const file = await getFile(filePath);
  if (!file) return null;

  try {
    return JSON.parse(file.content) as T;
  } catch {
    return null;
  }
}

export async function deleteRequestFile(
  id: string,
  sha: string
): Promise<boolean> {
  const filePath = `${REQUESTS_DIR}/${id}.json`;
  return deleteFile(filePath, sha, `Delete request ${id}`);
}

export async function getAllRequestFiles(): Promise<
  { name: string; sha: string }[]
> {
  const files = await listDirectory(REQUESTS_DIR);
  return files
    .filter((f) => f.name.endsWith(".json") && f.name !== ".gitkeep")
    .map((f) => ({
      name: f.name.replace(".json", ""),
      sha: f.sha || "",
    }));
}