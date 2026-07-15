import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { API_BASE_URL } from '../config';
import { Footer } from '../components/layout/Footer';

interface IpDetails {
  isp: string;
  usageType: string;
  hostname: string;
  domainName: string;
  country: string;
  city: string;
}

function DetailRow({
  label,
  value,
  theme,
}: {
  label: string;
  value: string;
  theme: 'dark' | 'light';
}) {
  return (
    <div
      className={`py-3 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'}`}
    >
      <span
        className={`text-sm font-medium ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
      >
        {label}
      </span>
      <p
        className={`text-sm font-semibold mt-1 ${theme === 'dark' ? 'text-gray-200' : 'text-gray-700'} word-break-break-all`}
      >
        {value}
      </p>
    </div>
  );
}

export function WhoisPage() {
  const { ip } = useParams<{ ip: string }>();
  const { theme } = useTheme();
  const [ipDetails, setIpDetails] = useState<IpDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ip) return;

    const fetchData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ipRes = await fetch(`${API_BASE_URL}/ip/check?ip=${ip}`);

        const ipJson = await ipRes.json();

        if (ipJson.data) {
          setIpDetails({
            isp: ipJson.data.isp || '-',
            usageType: ipJson.data.usageType || '-',
            hostname: ipJson.data.hostnames?.[0] || ip,
            domainName: ipJson.data.domain || '-',
            country: ipJson.data.countryName || '-',
            city: ipJson.data.city || '-',
          });
        }
      } catch {
        setError('데이터를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [ip]);

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#e74c3c]/30 selection:text-white transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 px-4 md:px-8 py-8 w-2/3 mx-auto mt-[15px] flex flex-col">
        <div
          className={`rounded-2xl p-6 transition-colors ${
            theme === 'dark' ? 'bg-[#161D30]' : 'bg-white'
          }`}
        >
          {isLoading ? (
            <div className="flex items-center justify-center py-12"></div>
          ) : error ? (
            <div className="flex items-center justify-center py-12 text-center">
              <p
                className={`text-lg ${theme === 'dark' ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {error}
              </p>
            </div>
          ) : ipDetails ? (
            <div className="space-y-4">
              <h2
                className={`text-lg font-bold border-b pb-3 ${
                  theme === 'dark'
                    ? 'border-gray-700 text-white'
                    : 'border-gray-200 text-gray-900'
                }`}
              >
                IP Details
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <DetailRow label="ISP" value={ipDetails.isp} theme={theme} />
                <DetailRow
                  label="Usage Type"
                  value={ipDetails.usageType}
                  theme={theme}
                />
                <DetailRow
                  label="Hostname"
                  value={ipDetails.hostname}
                  theme={theme}
                />
                <DetailRow
                  label="Domain Name"
                  value={ipDetails.domainName}
                  theme={theme}
                />
                <DetailRow
                  label="Country"
                  value={ipDetails.country}
                  theme={theme}
                />
                <DetailRow label="City" value={ipDetails.city} theme={theme} />
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center py-12 text-center">
              <p
                className={`text-lg ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`}
              >
                WHOIS 정보를 불러올 수 없습니다.
              </p>
            </div>
          )}
        </div>

        <Footer />
      </main>
    </div>
  );
}
