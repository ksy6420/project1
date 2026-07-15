import type { IPMetadata, Report } from '../types/threat';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { IPSearchForm } from '../components/organisms/IPSearchForm';
import { ScanResultView } from '../components/organisms/ScanResultView';
import { Footer } from '../components/layout/Footer';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

interface IpCheckResponse {
  ipAddress?: string;
  abuseConfidenceScore?: number;
  isp?: string;
  usageType?: string;
  hostnames?: string[];
  domain?: string;
  countryName?: string;
  totalReports?: number;
  numDistinctUsers?: number;
  lastReportedAt?: string;
  isExternalFetch?: boolean;
  reports?: Report[];
  [key: string]: unknown;
}

function mapApiResult(data: IpCheckResponse, ip: string): IPMetadata {
  const score = data.abuseConfidenceScore ?? 0;
  return {
    ip: data.ipAddress || ip,
    threatScore: score,
    isp: data.isp || '-',
    usageType: data.usageType || '-',
    hostname: data.hostnames?.[0] || ip,
    domainName: data.domain || '-',
    country: data.countryName || '-',
    totalReports: data.totalReports ?? 0,
    uniqueSources: data.numDistinctUsers ?? 0,
    latestReportDate: data.lastReportedAt || 'N/A',
    status: score >= 75 ? 'Danger' : score >= 25 ? 'Warning' : 'Safe',
    isExternalFetch: data.isExternalFetch ?? false,
  };
}

export function IPCheckPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [currentResult, setCurrentResult] = useState<IPMetadata | null>(null);
  const [rawData, setRawData] = useState<IpCheckResponse | null>(null);
  const [searchError, setSearchError] = useState('');
  const { theme } = useTheme();

  const fetchIp = async (ipToSearch: string) => {
    setIsLoading(true);
    setSearchError('');
    setCurrentResult(null);

    try {
      const res = await axios.get(`${API_BASE_URL}/ip/check`, {
        params: { ip: ipToSearch },
      });

      setCurrentResult(mapApiResult(res.data.data, ipToSearch));
      setRawData(res.data.data);
      setSearchParams({ ip: ipToSearch }, { replace: true });
    } catch (error) {
      setSearchParams({}, { replace: true });
      setSearchError(
        error instanceof Error
          ? error.message
          : '알 수 없는 오류가 발생했습니다.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const ipFromUrl = searchParams.get('ip');
    if (ipFromUrl) {
      fetchIp(ipFromUrl);
    }
  }, [searchParams.get('ip')]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#e74c3c]/30 selection:text-white transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 px-4 md:px-8 py-8 w-2/3 mx-auto mt-[15px] flex flex-col">
        <IPSearchForm
          onSearch={fetchIp}
          isLoading={isLoading}
          defaultIp={searchParams.get('ip') || ''}
        />

        <div
          className={`flex flex-col gap-6 p-6 transition-colors ${
            theme === 'dark' ? 'bg-[#161D30]' : 'bg-white'
          }`}
        >
          {searchError && (
            <div
              className={`p-4 rounded-xl text-sm ${
                theme === 'dark'
                  ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                  : 'bg-red-50 border border-red-200 text-red-700'
              }`}
            >
              {searchError}
            </div>
          )}

          {currentResult ? (
            <ScanResultView
              result={currentResult}
              rawData={rawData ?? undefined}
            />
          ) : (
            <div
              className={`flex flex-col items-center justify-center py-20 rounded-xl transition-colors ${
                theme === 'dark'
                  ? 'border border-gray-800/40 bg-[#111827]/40'
                  : 'border border-gray-200 bg-white'
              }`}
            >
              <div
                className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800/40 text-gray-500 border border-gray-800/80'
                    : 'bg-gray-100 text-gray-400 border border-gray-200'
                }`}
              ></div>
              <h3
                className={`text-base font-bold ${
                  theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
                }`}
              >
                데이터가 없습니다
              </h3>
              <p
                className={`text-xs mt-1 max-w-sm text-center leading-relaxed ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                조사하려는 의심스러운 IP 주소를 상단 검색창에 입력하고 검색
                버튼을 클릭하시면 실시간 위협 보고서 정보가 이곳에 활성화됩니다.
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
