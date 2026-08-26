import fs from "fs";
import path from "path";
import type { IpDatabase, IpRecord } from "@/types/ip";

const DB_PATH = path.join(process.cwd(), "data", "ips.json");
const MAX_PAGES = 20;
const MAX_IPS = 10000;

function readDb(): IpDatabase {
  try {
    if (!fs.existsSync(DB_PATH)) {
      fs.writeFileSync(DB_PATH, "{}", "utf-8");
      return {};
    }
    const raw = fs.readFileSync(DB_PATH, "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeDb(db: IpDatabase): void {
  try {
    const dir = path.dirname(DB_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2), "utf-8");
  } catch {
    // silent
  }
}

export function logVisit(ip: string, page: string): void {
  const db = readDb();
  const now = new Date().toISOString();

  if (db[ip]) {
    db[ip].lastVisit = now;
    db[ip].visits += 1;
    if (!db[ip].pages.includes(page)) {
      db[ip].pages.unshift(page);
      if (db[ip].pages.length > MAX_PAGES) {
        db[ip].pages = db[ip].pages.slice(0, MAX_PAGES);
      }
    }
  } else {
    if (Object.keys(db).length >= MAX_IPS) {
      const oldest = Object.entries(db).sort(
        ([, a], [, b]) =>
          new Date(a.lastVisit).getTime() - new Date(b.lastVisit).getTime()
      )[0];
      if (oldest) delete db[oldest[0]];
    }
    db[ip] = {
      ip,
      firstVisit: now,
      lastVisit: now,
      visits: 1,
      pages: [page],
      blacklisted: false,
    };
  }

  writeDb(db);
}

export function getAllIps(): IpRecord[] {
  const db = readDb();
  return Object.values(db).sort(
    (a, b) =>
      new Date(b.lastVisit).getTime() - new Date(a.lastVisit).getTime()
  );
}

export function getIp(ip: string): IpRecord | null {
  const db = readDb();
  return db[ip] || null;
}

export function setBlacklist(
  ip: string,
  blacklisted: boolean,
  note?: string
): boolean {
  const db = readDb();
  if (!db[ip]) return false;
  db[ip].blacklisted = blacklisted;
  db[ip].blacklistedAt = blacklisted ? new Date().toISOString() : undefined;
  if (note !== undefined) db[ip].note = note;
  writeDb(db);
  return true;
}

export function deleteIp(ip: string): boolean {
  const db = readDb();
  if (!db[ip]) return false;
  delete db[ip];
  writeDb(db);
  return true;
}

export function isBlacklisted(ip: string): boolean {
  const db = readDb();
  return db[ip]?.blacklisted === true;
}

export function getIpStats() {
  const db = readDb();
  const records = Object.values(db);
  return {
    total: records.length,
    blacklisted: records.filter((r) => r.blacklisted).length,
    totalVisits: records.reduce((sum, r) => sum + r.visits, 0),
    todayVisits: records.filter((r) => {
      const today = new Date().toISOString().split("T")[0];
      return r.lastVisit.startsWith(today);
    }).length,
  };
}
