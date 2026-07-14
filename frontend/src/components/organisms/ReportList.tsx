import type { Report } from '../../types/threat';
import { useRef, useState } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface ReportListProps {
  reports: Report[];
}

const REPORTS_PER_PAGE = 25;

function countryName(code: string | undefined): string {
  if (!code || code.length !== 2) return code || '';
  try {
    return (
      new Intl.DisplayNames('en', { type: 'region' }).of(code.toUpperCase()) ||
      code
    );
  } catch {
    return code;
  }
}

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

export function ReportList({ reports }: ReportListProps) {
  const [reportPage, setReportPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set(),
  );
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  const toggleComment = (idx: number) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const totalReportPages = Math.ceil(reports.length / REPORTS_PER_PAGE);
  const paginatedReports = reports.slice(
    (reportPage - 1) * REPORTS_PER_PAGE,
    reportPage * REPORTS_PER_PAGE,
  );
  const goReportPage = (p: number) => {
    setReportPage(Math.max(1, Math.min(p, totalReportPages)));
    containerRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  };

  return (
    <div
      ref={containerRef}
      className={`rounded-2xl border p-7 transition-colors ${
        theme === 'dark'
          ? 'bg-[#161D30] border-gray-800/80'
          : 'bg-white border-gray-200'
      }`}
    >
      <div
        className={`text-lg font-bold uppercase tracking-wider mb-5 flex items-center gap-2.5 ${
          theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
        }`}
      >
        <span>신고 내역</span>
        <span
          className={`text-sm px-2.5 py-0.5 rounded-full font-normal ${
            theme === 'dark'
              ? 'bg-gray-800 text-gray-400'
              : 'bg-gray-100 text-gray-500'
          }`}
        >
          {reports.length}건
        </span>
      </div>
      <div className="overflow-x-auto">
        <div className="min-w-[900px] flex flex-col gap-2.5">
          <div
            className={`flex items-center gap-5 px-5 py-2.5 text-sm font-bold uppercase tracking-wider ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            <div className="w-36 shrink-0">국가</div>
            <div className="w-52 shrink-0">Timestamp</div>
            <div className="flex-1 min-w-0">Comment</div>
            <div className="w-72 shrink-0">Categories</div>
          </div>
          {paginatedReports.map((r, i) => (
            <div
              key={(reportPage - 1) * REPORTS_PER_PAGE + i}
              className={`border rounded-xl px-5 py-4 transition-colors ${
                theme === 'dark'
                  ? 'bg-[#1E2738] border-gray-700/50 hover:border-gray-600/60'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}
            >
              <div className="flex items-start gap-5">
                <div className="flex items-center gap-2 w-36 shrink-0">
                  <span
                    className={`text-base font-semibold truncate ${
                      theme === 'dark' ? 'text-gray-100' : 'text-gray-700'
                    }`}
                  >
                    {countryName(r.reporterCountryCode)}
                  </span>
                </div>
                <div
                  className={`text-base w-52 shrink-0 pt-0.5 ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
                  }`}
                >
                  {r.reportedAt
                    ? `${r.reportedAt.slice(0, 10)} ${r.reportedAt.slice(11, 19)}`
                    : ''}
                </div>
                <div className="flex-1 min-w-0">
                  <div
                    className={`text-base leading-relaxed ${
                      theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                    } ${!expandedComments.has(i) ? 'line-clamp-2' : ''}`}
                  >
                    {r.comment}
                  </div>
                  {r.comment && r.comment.length > 100 && (
                    <button
                      onClick={() => toggleComment(i)}
                      className="text-[#e74c3c] hover:text-[#c0392b] text-sm mt-0.5 font-medium transition-colors"
                    >
                      {expandedComments.has(i) ? '접기' : '더 보기'}
                    </button>
                  )}
                </div>
                <div className="w-72 shrink-0 pt-0.5">
                  <div className="flex flex-wrap gap-2">
                    {r.categories?.map((c: number) => (
                      <span
                        key={c}
                        className={`inline-flex items-center px-3 py-1.5 rounded-lg font-semibold text-sm ${
                          c <= 2
                            ? 'bg-red-500/20 border border-red-500/40'
                            : c <= 4
                              ? 'bg-orange-500/20 border border-orange-500/40'
                              : c === 7
                                ? 'bg-purple-500/20 border border-purple-500/40'
                                : c === 14
                                  ? 'bg-yellow-500/20 border border-yellow-500/40'
                                  : c === 18 || c === 5 || c === 22
                                    ? 'bg-amber-500/20 border border-amber-500/40'
                                    : c === 13
                                      ? 'bg-cyan-500/20 border border-cyan-500/40'
                                      : c === 15 || c === 16 || c === 21
                                        ? 'bg-rose-500/20 border border-rose-500/40'
                                        : c === 11 || c === 12
                                          ? 'bg-gray-500/20 border border-gray-500/40'
                                          : 'bg-blue-500/20 border border-blue-500/40'
                        }`}
                      >
                        {CATEGORY_MAP[c] || c}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {totalReportPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-5">
            <button
              onClick={() => goReportPage(reportPage - 1)}
              disabled={reportPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60'
                  : 'border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
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
                    <span
                      className={`px-1.5 text-sm ${
                        theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                      }`}
                    >
                      ...
                    </span>
                  )}
                  <button
                    onClick={() => goReportPage(p)}
                    className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
                      p === reportPage
                        ? 'bg-[#e74c3c] border-[#e74c3c] text-white'
                        : theme === 'dark'
                          ? 'border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60'
                          : 'border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                  >
                    {p}
                  </button>
                </span>
              ))}
            <button
              onClick={() => goReportPage(reportPage + 1)}
              disabled={reportPage === totalReportPages}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                theme === 'dark'
                  ? 'border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60'
                  : 'border border-gray-300 bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              다음
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
