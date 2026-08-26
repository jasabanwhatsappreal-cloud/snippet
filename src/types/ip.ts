export interface IpRecord {
  ip: string;
  firstVisit: string;
  lastVisit: string;
  visits: number;
  pages: string[];
  blacklisted: boolean;
  blacklistedAt?: string;
  note?: string;
}

export interface IpDatabase {
  [ip: string]: IpRecord;
}
