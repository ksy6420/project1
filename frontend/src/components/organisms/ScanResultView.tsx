import type { IPMetadata, Report } from '../../types/threat';
import { MetadataTable } from '../molecules/MetadataTable';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';
import { useState } from 'react';

interface RawData {
  reports?: Report[];
  [key: string]: unknown;
}

interface ScanResultViewProps {
  result: IPMetadata;
  rawData?: RawData;
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

export function ScanResultView({ result, rawData }: ScanResultViewProps) {
  const [reportPage, setReportPage] = useState(1);
  const [expandedComments, setExpandedComments] = useState<Set<number>>(
    new Set(),
  );

  const toggleComment = (idx: number) => {
    setExpandedComments((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };
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
    <div className="flex flex-col gap-10 animate-fadeIn">
      <div className={`bg-[#161D30] rounded-2xl border ${barBorder} p-7 shadow-lg`}>
        <div className="flex items-start md:items-center justify-between gap-6 mb-5">
          <div className="flex items-start md:items-center gap-5">
            <div
              className={`p-4 rounded-xl ${
                result.threatScore >= 75
                  ? 'bg-red-500/20 text-red-400'
                  : result.threatScore >= 25
                    ? 'bg-amber-500/20 text-amber-400'
                    : 'bg-emerald-500/20 text-emerald-400'
              }`}
            >
              {result.threatScore >= 75 ? (
                <ShieldAlert className="w-8 h-8" />
              ) : result.threatScore >= 25 ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>
            <div>
              <h3 className="font-extrabold text-xl md:text-2xl tracking-tight text-gray-100">
                IP {result.ip}은 데이터베이스에
                {result.isExternalFetch ? ' 없습니다' : ' 있습니다'}.
              </h3>
              <p className="text-sm mt-1.5 text-gray-400 leading-relaxed font-medium">
                {result.isExternalFetch
                  ? '해당 IP는 데이터베이스에 등록되어 있지 않습니다.'
                  : `총 ${result.uniqueSources}개의 독립된 곳에서 누적 ${result.totalReports}회 신고되었습니다.`}
              </p>
            </div>
          </div>
          <span
            className={`text-4xl font-extrabold ${barColor.replace('bg-', 'text-')} shrink-0`}
          >
            {result.threatScore}%
          </span>
        </div>

        <div className="flex items-center gap-4 mb-1.5">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider shrink-0">
            실시간 위협 점수
          </span>
          <div className="flex-1 bg-gray-900 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 rounded-full ${barColor}`}
              style={{ width: `${result.threatScore}%` }}
            />
          </div>
        </div>
        <div className="flex justify-between w-full text-xs font-medium text-gray-500 mb-5">
          <span>0% (Safe)</span>
          <span>50%</span>
          <span>100% (High Danger)</span>
        </div>

        <MetadataTable rawData={rawData} />
      </div>

      {reports && reports.length > 0 && (
        <div className="bg-[#161D30] rounded-2xl border border-gray-800/80 p-7">
          <div className="text-lg font-bold text-gray-200 uppercase tracking-wider mb-5 flex items-center gap-2.5">
            <span>신고 내역</span>
            <span className="text-sm bg-gray-800 text-gray-400 px-2.5 py-0.5 rounded-full font-normal">
              {reports.length}건
            </span>
          </div>
          <div className="overflow-x-auto">
            <div className="min-w-[900px] flex flex-col gap-2.5">
              <div className="flex items-center gap-5 px-5 py-2.5 text-sm font-bold text-gray-400 uppercase tracking-wider">
                <div className="w-36 shrink-0">국가</div>
                <div className="w-52 shrink-0">Timestamp</div>
                <div className="flex-1 min-w-0">Comment</div>
                <div className="w-72 shrink-0">Categories</div>
              </div>
              {paginatedReports.map((r, i) => (
                <div
                  key={(reportPage - 1) * REPORTS_PER_PAGE + i}
                  className="bg-[#1E2738] border border-gray-700/50 rounded-xl px-5 py-4 hover:border-gray-600/60 transition-colors"
                >
                  <div className="flex items-start gap-5">
                    <div className="flex items-center gap-2 w-36 shrink-0">
                      <span className="text-gray-100 text-base font-semibold truncate">
                        {countryName(r.reporterCountryCode)}
                      </span>
                    </div>
                    <div className="text-gray-300 text-base w-52 shrink-0 pt-0.5">
                      {r.reportedAt
                        ? `${r.reportedAt.slice(0, 10)} ${r.reportedAt.slice(11, 19)}`
                        : ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-gray-200 text-base leading-relaxed ${!expandedComments.has(i) ? 'line-clamp-2' : ''}`}
                      >
                        {r.comment}
                      </div>
                      {r.comment && r.comment.length > 100 && (
                        <button
                          onClick={() => toggleComment(i)}
                          className="text-blue-400 hover:text-blue-300 text-sm mt-0.5 font-medium transition-colors"
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
                                ? 'bg-red-500/20 text-red-200 border border-red-500/40'
                                : c <= 4
                                  ? 'bg-orange-500/20 text-orange-200 border border-orange-500/40'
                                  : c === 7
                                    ? 'bg-purple-500/20 text-purple-200 border border-purple-500/40'
                                    : c === 14
                                      ? 'bg-yellow-500/20 text-yellow-200 border border-yellow-500/40'
                                      : c === 18 || c === 5 || c === 22
                                        ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40'
                                        : c === 13
                                          ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-500/40'
                                          : c === 15 || c === 16 || c === 21
                                            ? 'bg-rose-500/20 text-rose-200 border border-rose-500/40'
                                            : c === 11 || c === 12
                                              ? 'bg-gray-500/20 text-gray-200 border border-gray-500/40'
                                              : 'bg-blue-500/20 text-blue-200 border border-blue-500/40'
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
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
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
                        <span className="px-1.5 text-sm text-gray-600">...</span>
                      )}
                      <button
                        onClick={() => goReportPage(p)}
                        className={`px-4 py-2 text-sm font-medium rounded-lg border transition-colors ${
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
                  className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-700/60 bg-gray-800/40 text-gray-400 hover:bg-gray-700/60 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                >
                  다음
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
