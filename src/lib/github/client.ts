const GITHUB_API = "https://api.github.com";

function getHeaders(): HeadersInit {
  const token = process.env.GITHUB_TOKEN;
  return {
    Accept: "application/vnd.github.v3+json",
    "Content-Type": "application/json",
    ...(token ? { Authorization: `token ${token}` } : {}),
  };
}

function getConfig() {
  return {
    owner: process.env.GITHUB_OWNER || "",
    repo: process.env.GITHUB_REPO || "",
    branch: process.env.GITHUB_BRANCH || "main",
  };
}

export interface GitHubFile {
  path: string;
  content: string;
  sha?: string;
  message: string;
}

export interface GitHubFileResponse {
  content: string;
  sha: string;
  name: string;
  path: string;
}

export async function getFile(
  filePath: string
): Promise<GitHubFileResponse | null> {
  const { owner, repo, branch } = getConfig();
  if (!owner || !repo) return null;

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}?ref=${branch}`,
      { headers: getHeaders(), cache: "no-store" }
    );

    if (res.status === 404) return null;
    if (!res.ok) throw new Error(`GitHub API error: ${res.status}`);

    const data = await res.json();
    const content = atob(data.content.replace(/\n/g, ""));
    return {
      content,
      sha: data.sha,
      name: data.name,
      path: data.path,
    };
  } catch {
    return null;
  }
}

export async function createFile(file: GitHubFile): Promise<boolean> {
  const { owner, repo, branch } = getConfig();
  if (!owner || !repo) return false;

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          message: file.message,
          content: btoa(unescape(encodeURIComponent(file.content))),
          branch,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function updateFile(
  file: GitHubFile,
  sha: string
): Promise<boolean> {
  const { owner, repo, branch } = getConfig();
  if (!owner || !repo) return false;

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${file.path}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          message: file.message,
          content: btoa(unescape(encodeURIComponent(file.content))),
          sha,
          branch,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function deleteFile(
  filePath: string,
  sha: string,
  message: string
): Promise<boolean> {
  const { owner, repo, branch } = getConfig();
  if (!owner || !repo) return false;

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${filePath}`,
      {
        method: "DELETE",
        headers: getHeaders(),
        body: JSON.stringify({ message, sha, branch }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export async function listDirectory(
  dirPath: string
): Promise<GitHubFileResponse[]> {
  const { owner, repo, branch } = getConfig();
  if (!owner || !repo) return [];

  try {
    const res = await fetch(
      `${GITHUB_API}/repos/${owner}/${repo}/contents/${dirPath}?ref=${branch}`,
      { headers: getHeaders(), cache: "no-store" }
    );

    if (!res.ok) return [];
    const data = await res.json();

    if (!Array.isArray(data)) return [];

    return data
      .filter((item: { type: string }) => item.type === "file")
      .map((item: GitHubFileResponse) => ({
        path: item.path,
        name: item.name,
        content: "",
        sha: item.sha,
      }));
  } catch {
    return [];
  }
}

export { getConfig };
