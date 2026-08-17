import { type ClassValue, clsx } from "clsx";

export function cn(...inputs: ClassValue[]): string {
  return clsx(inputs);
}

export function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str;
  return str.slice(0, length) + "...";
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export function getLanguageColor(language: string): string {
  const colors: Record<string, string> = {
    javascript: "#f7df1e",
    typescript: "#3178c6",
    python: "#3572a5",
    html: "#e34c26",
    css: "#563d7c",
    json: "#292929",
    php: "#4f5d95",
    java: "#b07219",
    cpp: "#f34b7d",
    bash: "#89e051",
    go: "#00add8",
    rust: "#dea584",
    ruby: "#cc342d",
    sql: "#e38c00",
    yaml: "#cb171e",
    markdown: "#083fa1",
  };
  return colors[language.toLowerCase()] || "#6b7280";
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text);
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
  return Promise.resolve();
}
