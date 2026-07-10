import type { IPMetadata, Report } from '../../types/threat';
import { MetadataTable } from '../molecules/MetadataTable';
import {
  ShieldAlert,
  AlertTriangle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useState } from 'react';

interface RawData {
  reports?: Report[];
  [key: string]: unknown;
}

interface ScanResultViewProps {
  result: IPMetadata;
  rawData?: RawData;
}

const REPORTS_PER_PAGE = 15;

const CATEGORY_MAP: Record<number, string> = {
  1: 'DNS Compromise',
  2: 'DNS Poisoning',
  3: 'Fraud Orders',
  4: 'DDoS Attack',
  5: 'FTP Brute-Force',
  6: 'Ping of Death',
  7: 'Phishing',
  8: 'Fraud VoIP',
  9: 'Open Proxy',
  10: 'Web Spam',
  11: 'Email Spam',
  12: 'Blog Spam',
  13: 'VPN IP',
  14: 'Port Scan',
  15: 'Hacking',
  16: 'SQL Injection',
  17: 'Spoofing',
  18: 'Brute-Force',
  19: 'Bad Web Bot',
  20: 'Exploited Host',
  21: 'Web App Attack',
  22: 'SSH',
  23: 'IoT Targeted',
};

export function ScanResultView({ result, rawData }: ScanResultViewProps) {
  const [showReports, setShowReports] = useState(false);
  const [reportPage, setReportPage] = useState(1);
  const reports = rawData?.reports;
  const totalReportPages = reports
    ? Math.ceil(reports.length / REPORTS_PER_PAGE)
    : 1;
  const paginatedReports = reports
    ? reports.slice(
        (reportPage - 1) * REPORTS_PER_PAGE,
        reportPage * REPORTS_PER_PAGE,
      )
    : [];
  const goReportPage = (p: number) =>
    setReportPage(Math.max(1, Math.min(p, totalReportPages)));

  const barColor =
    result.threatScore >= 75
      ? 'bg-red-500'
      : result.threatScore >= 25
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  const barBorder =
    result.threatScore >= 75
      ? 'border-red-500/30'
      : result.threatScore >= 25
        ? 'border-amber-500/30'
        : 'border-emerald-500/30';

  return (
    <div className="flex flex-col gap-8 animate-fadeIn">
      <div
        className={`p-5 rounded-xl border flex flex-col md:flex-row items-start md:items-center justify-between gap-4 transition-all duration-300 shadow-lg ${
          result.threatScore >= 75
            ? 'bg-red-500/10 border-red-500/30 text-red-100'
            : result.threatScore >= 25
              ? 'bg-amber-500/10 border-amber-500/30 text-amber-100'
              : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-100'
        }`}
      >
        <div className="flex items-start md:items-center gap-4">
          <div
            className={`p-3 rounded-lg ${
              result.threatScore >= 75
                ? 'bg-red-500/20 text-red-400'
                : result.threatScore >= 25
                  ? 'bg-amber-500/20 text-amber-400'
                  : 'bg-emerald-500/20 text-emerald-400'
            }`}
          >
            {result.threatScore >= 75 ? (
              <ShieldAlert className="w-6 h-6" />
            ) : result.threatScore >= 25 ? (
              <AlertTriangle className="w-6 h-6" />
            ) : (
              <ShieldCheck className="w-6 h-6" />
            )}
          </div>
          <div>
            <h3 className="font-extrabold text-base md:text-lg tracking-tight">
              IP {result.ip}은 데이터베이스에
              {result.isExternalFetch ? ' 없습니다' : ' 있습니다'}.
            </h3>
            <p className="text-xs mt-1 text-gray-400 leading-relaxed font-medium">
              {result.isExternalFetch
                ? '해당 IP는 데이터베이스에 등록되어 있지 않습니다.'
                : `총 ${result.uniqueSources}개의 독립된 곳에서 누적 ${result.totalReports}회 신고되었습니다.`}
            </p>
          </div>
        </div>
      </div>

      <div className={`bg-[#161D30] rounded-xl border ${barBorder} p-6`}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
            실시간 위협 점수
          </h3>
          <span
            className={`text-lg font-extrabold ${barColor.replace('bg-', 'text-')}`}
          >
            {result.threatScore}%
          </span>
        </div>
        <div className="w-full bg-gray-900 rounded-full h-3 overflow-hidden">
          <div
            className={`h-full transition-all duration-1000 rounded-full ${barColor}`}
            style={{ width: `${result.threatScore}%` }}
          />
        </div>
        <div className="flex justify-between w-full mt-1.5 text-[11px] font-medium text-gray-500">
          <span>0% (Safe)</span>
          <span>50%</span>
          <span>100% (High Danger)</span>
        </div>

        <div className="mt-6">
          <MetadataTable rawData={rawData} />
        </div>
      </div>

      {reports && reports.length > 0 && (
        <div className="bg-[#161D30] rounded-xl border border-gray-800/80 p-6">
          <button
            onClick={() => {
              setShowReports(!showReports);
              setReportPage(1);
            }}
            className="w-full flex items-center justify-between text-xs font-semibold text-gray-400 uppercase tracking-wider hover:text-gray-300 transition-colors"
          >
            <span>신고 내역 ({reports.length}건)</span>
            {showReports ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
          {showReports && (
            <div className="mt-4 overflow-x-auto">
              <table className="w-full text-xs border-collapse">
                <thead>
                  <tr className="border-b border-gray-700/60 text-gray-500 font-semibold uppercase tracking-wider">
                    <th className="text-left py-2.5 pr-3 whitespace-nowrap">
                      국가
                    </th>
                    <th className="text-left py-2.5 pr-3 whitespace-nowrap">
                      ID
                    </th>
                    <th className="text-left py-2.5 pr-3 whitespace-nowrap">
                      IoA Timestamp
                    </th>
                    <th className="text-left py-2.5 pr-3 w-full">Comment</th>
                    <th className="text-left py-2.5 whitespace-nowrap">
                      Categories
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/40">
                  {paginatedReports.map((r, i) => (
                    <tr
                      key={(reportPage - 1) * REPORTS_PER_PAGE + i}
                      className="hover:bg-gray-800/20 transition-colors"
                    >
                      <td className="py-2.5 pr-3 text-gray-300 whitespace-nowrap font-semibold">
                        {r.reporterCountryCode}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-400 whitespace-nowrap">
                        {r.reporterId ?? '-'}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-400 whitespace-nowrap">
                        {r.reportedAt}
                      </td>
                      <td className="py-2.5 pr-3 text-gray-400 break-words max-w-xs leading-relaxed">
                        {r.comment}
                      </td>
                      <td className="py-2.5 text-gray-300 whitespace-nowrap">
                        {r.categories
                          ?.map((c: number) => CATEGORY_MAP[c] || c)
                          .join(', ')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {totalReportPages > 1 && (
                <div className="flex items-center justify-center gap-1.5 pt-4">
                  <button
                    onClick={() => goReportPage(reportPage - 1)}
                    disabled={reportPage === 1}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    이전
                  </button>
                  {Array.from({ length: totalReportPages }, (_, i) => i + 1)
                    .filter(
                      (p) =>
                        p === 1 ||
                        p === totalReportPages ||
                        Math.abs(p - reportPage) <= 1,
                    )
                    .map((p, idx, arr) => (
                      <span key={p} className="flex items-center">
                        {idx > 0 && arr[idx - 1] !== p - 1 && (
                          <span className="px-1 text-xs text-gray-600">
                            ...
                          </span>
                        )}
                        <button
                          onClick={() => goReportPage(p)}
                          className={`px-2.5 py-1 text-xs font-medium rounded border transition-colors ${
                            p === reportPage
                              ? 'bg-blue-600 border-blue-600 text-white'
                              : 'border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60'
                          }`}
                        >
                          {p}
                        </button>
                      </span>
                    ))}
                  <button
                    onClick={() => goReportPage(reportPage + 1)}
                    disabled={reportPage === totalReportPages}
                    className="px-2.5 py-1 text-xs font-medium rounded border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    다음
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
