import { IPSearchForm } from '../components/organisms/IPSearchForm';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_BASE_URL } from '../config';
import CountryFlag from '../components/CountryFlag';

export function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userIp, setUserIp] = useState('');
  const [reportedIps, setReportedIps] = useState<
    { ip: string; countryCode: string }[]
  >([]);

  useEffect(() => {
    const fetchUserIp = async () => {
      try {
        const res = await fetch('https://api.ipify.org?format=json');
        const data = await res.json();
        setUserIp(data.ip);
      } catch {
        console.error('IP를 가져오지 못했습니다.');
      }
    };
    fetchUserIp();
  }, []);

  useEffect(() => {
    const fetchReportedIps = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/ip/reported/recent?limit=20`);
        const data = await res.json();
        setReportedIps(data.data || []);
      } catch {
        console.error('신고된 IP를 가져오지 못했습니다.');
      }
    };
    fetchReportedIps();
  }, []);

  const handleSearch = (ip: string) => {
    navigate(`/check?ip=${ip}`);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-ffffff selection:text-white transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 my-0 mx-[30px] mt-[15px] py-0 px-[15px] flex flex-col">
        <IPSearchForm
          onSearch={handleSearch}
          isLoading={false}
          defaultIp={userIp}
        />

        <div
          style={{ background: '#fafafa' }}
          className="rounded-b-xl px-15 py-12 mb-[30px] flex flex-col gap-4"
        >
          <h1
            style={{ fontSize: '63px', color: '#555555' }}
            className="font-light leading-tight pb-[15.75px] m-[15.75px_0_47.25px]"
          >
            PacketCYBER <span style={{ fontWeight: 700 }}>ThreatIP</span>
            <br />
            <small style={{ color: '#999999', fontSize: '65%' }}>
              making the internet safer, one IP at a time
            </small>
          </h1>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button
              onClick={() => navigate('/report')}
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-[#158cba] text-white font-semibold text-base transition-colors hover:bg-[#1278a0] active:bg-[#106a90]"
            >
              <span>Report IP Now</span>
            </button>

            <IPSearchForm
              onSearch={handleSearch}
              isLoading={false}
              defaultIp={userIp}
              variant="inline"
            />

            <button
              onClick={() => navigate('/register-api')}
              className="flex items-center justify-center gap-3 px-6 py-3 rounded-lg bg-[#158cba] text-white font-semibold text-base transition-colors hover:bg-[#1278a0] active:bg-[#106a90]"
            >
              <span>Register API Key</span>
            </button>
          </div>
        </div>

        <div
          className={`rounded-xl p-6 transition-colors ${
            theme === 'dark'
              ? 'bg-[#111827] border border-gray-800/90'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-lg font-bold mb-4 color ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Recently Reported IPs:
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {reportedIps.map((item, index) => (
              <div
                key={index}
                className={`flex items-center gap-2 p-2 rounded transition-colors ${
                  theme === 'dark'
                    ? 'hover:bg-gray-800/50'
                    : 'hover:bg-gray-100'
                }`}
              >
                {item.countryCode && (
                  <CountryFlag
                    countryCode={item.countryCode}
                    className="shrink-0"
                  />
                )}
                <span
                  className={`font-mono truncate ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {item.ip}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
