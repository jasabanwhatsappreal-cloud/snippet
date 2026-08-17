import { getFile, createFile, updateFile, deleteFile, listDirectory } from "./client";

const SNIPPETS_DIR = "snippets";

export async function ensureSnippetsDir(): Promise<void> {
  const existing = await getFile(`${SNIPPETS_DIR}/.gitkeep`);
  if (!existing) {
    await createFile({
      path: `${SNIPPETS_DIR}/.gitkeep`,
      content: "",
      message: "Initialize snippets directory",
    });
  }
}

export async function saveSnippetFile(
  id: string,
  data: unknown
): Promise<boolean> {
  const filePath = `${SNIPPETS_DIR}/${id}.json`;
  const existing = await getFile(filePath);
  const content = JSON.stringify(data, null, 2);

  if (existing) {
    return updateFile(
      { path: filePath, content, message: `Update snippet ${id}` },
      existing.sha
    );
  }

  return createFile({
    path: filePath,
    content,
    message: `Create snippet ${id}`,
  });
}

export async function getSnippetFile<T>(id: string): Promise<T | null> {
  const filePath = `${SNIPPETS_DIR}/${id}.json`;
  const file = await getFile(filePath);
  if (!file) return null;

  try {
    return JSON.parse(file.content) as T;
  } catch {
    return null;
  }
}

export async function deleteSnippetFile(
  id: string,
  sha: string
): Promise<boolean> {
  const filePath = `${SNIPPETS_DIR}/${id}.json`;
  return deleteFile(filePath, sha, `Delete snippet ${id}`);
}

export async function getAllSnippetFiles(): Promise<
  { name: string; sha: string }[]
> {
  const files = await listDirectory(SNIPPETS_DIR);
  return files
    .filter((f) => f.name.endsWith(".json") && f.name !== ".gitkeep")
    .map((f) => ({
      name: f.name.replace(".json", ""),
      sha: f.sha || "",
    }));
}
