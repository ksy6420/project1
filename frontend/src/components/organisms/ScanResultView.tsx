import type { IPMetadata, Report } from '../../types/threat';
import { MetadataTable } from '../molecules/MetadataTable';
import { GaugeBar } from '../molecules/GaugeBar';
import { ReportList } from './ReportList';
import { ShieldAlert, AlertTriangle, ShieldCheck } from 'lucide-react';

interface RawData {
  reports?: Report[];
  [key: string]: unknown;
}

interface ScanResultViewProps {
  result: IPMetadata;
  rawData?: RawData;
}

export function ScanResultView({ result, rawData }: ScanResultViewProps) {
  const reports = rawData?.reports;

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

        <div className="mb-5">
          <GaugeBar score={result.threatScore} />
        </div>

        <MetadataTable rawData={rawData} />
      </div>

      {reports && reports.length > 0 && <ReportList reports={reports} />}
    </div>
  );
}
