const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

export async function sendTelegramNotification(text: string): Promise<boolean> {
  if (!BOT_TOKEN || !CHAT_ID) return false;

  try {
    const res = await fetch(
      `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: CHAT_ID,
          text,
          parse_mode: "HTML",
          disable_web_page_preview: true,
        }),
      }
    );
    return res.ok;
  } catch {
    return false;
  }
}

export function notifyNewRequest(input: {
  title: string;
  description: string;
  language?: string;
  requester?: string;
  contact?: string;
}): Promise<boolean> {
  const lines = [
    "<b>\u{1F4E9} Request Snippet Baru</b>",
    "",
    `<b>\u{1F4CC} Judul:</b> ${escapeHtml(input.title)}`,
    `<b>\u{1F4A1} Deskripsi:</b> ${escapeHtml(
      input.description.length > 200
        ? input.description.slice(0, 200) + "\u2026"
        : input.description
    )}`,
    `<b>\u{1F4BB} Bahasa:</b> ${escapeHtml(input.language || "\u2014")}`,
    `<b>\u{1F464} Nama:</b> ${escapeHtml(input.requester || "Anonymous")}`,
    `<b>\u{1F4DE} Kontak:</b> ${escapeHtml(input.contact || "\u2014")}`,
  ];

  return sendTelegramNotification(lines.join("\n"));
}