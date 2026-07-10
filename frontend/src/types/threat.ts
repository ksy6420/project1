export interface IPMetadata {
  ip: string;
  threatScore: number;
  isp: string;
  usageType: string;
  hostname: string;
  domainName: string;
  country: string;
  totalReports: number;
  uniqueSources: number;
  latestReportDate: string;
  status: 'Danger' | 'Warning' | 'Safe';
  isExternalFetch?: boolean;
}

export interface Report {
  reporterCountryCode?: string;
  reporterId?: number;
  reportedAt?: string;
  comment?: string;
  categories?: number[];
}

export interface ScanHistory {
  id: string;
  ip: string;
  threatScore: number;
  country: string;
  date: string;
  status: 'Danger' | 'Warning' | 'Safe';
}
