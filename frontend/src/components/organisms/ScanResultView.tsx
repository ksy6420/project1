import type { IPMetadata, Report } from '../../types/threat';
import { MetadataTable } from '../molecules/MetadataTable';
import { GaugeBar } from '../molecules/GaugeBar';
import { ReportList } from './ReportList';
import { useTheme } from '../../context/ThemeContext';
import { useNavigate } from 'react-router-dom';

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
  const { theme } = useTheme();
  const navigate = useNavigate();

  const handleWhoisClick = () => {
    navigate(`/whois/${result.ip}`);
  };

  return (
    <div className="flex flex-col gap-5 animate-fadeIn">
      <div
        className={`rounded-2xl p-7 shadow-lg transition-colors ${
          theme === 'dark' ? 'bg-[#161D30]' : 'bg-#FAFAFA'
        }`}
      >
        <div className="flex items-start md:items-center justify-between gap-6 mb-5">
          <div className="flex items-start md:items-center gap-5">
            <div>
              <h3
                className={`font-extrabold text-xl md:text-2xl tracking-tight`}
                style={{
                  color: result.isExternalFetch ? '#158cba' : '#b55e07',
                }}
              >
                IP {result.ip}은 데이터베이스에
                {result.isExternalFetch ? ' 없습니다' : ' 있습니다'}.
              </h3>
              <p
                className={`text-xl mt-3 leading-relaxed font-medium ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-700'
                }`}
              >
                {result.isExternalFetch ? (
                  '해당 IP는 데이터베이스에 등록되어 있지 않습니다.'
                ) : (
                  <>
                    총{' '}
                    <span className="text-black dark:text-white font-bold">
                      {result.uniqueSources}
                    </span>{' '}
                    개의 독립된 곳에서 누적{' '}
                    <span className="text-black dark:text-white font-bold">
                      {result.totalReports}
                    </span>{' '}
                    회 신고되었습니다.
                  </>
                )}
              </p>
            </div>
          </div>
        </div>

        <div className="mb-5">
          <GaugeBar score={result.threatScore} />
        </div>

        <MetadataTable rawData={rawData} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-5 border-t border-gray-200/10">
          <a
            href={`/report?ip=${result.ip}`}
            className="px-5 py-3 rounded-lg text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98] no-underline text-center"
            style={{ backgroundColor: '#e27328' }}
          >
            Report {result.ip}
          </a>
          <button
            onClick={handleWhoisClick}
            className="px-5 py-3 rounded-lg text-base font-semibold text-white transition-all hover:opacity-90 active:scale-[0.98]"
            style={{ backgroundColor: '#e27328' }}
          >
            WHOIS {result.ip}
          </button>
        </div>
      </div>

      {reports && reports.length > 0 && <ReportList reports={reports} />}
    </div>
  );
}
