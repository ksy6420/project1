import { IPSearchForm } from '../components/organisms/IPSearchForm';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { FileWarning, KeyRound, Search } from 'lucide-react';

const dummyReportedIPs = [
  {
    ip: '185.220.101.34',
    category: '스팸',
    comment: '지속적인 스팸 메일 발송',
  },
  { ip: '45.33.32.156', category: '스캔', comment: '포트 스캔 감지됨' },
  {
    ip: '198.51.100.42',
    category: '브루트포스',
    comment: 'SSH 브루트포스 시도',
  },
  { ip: '103.224.182.251', category: 'DDoS', comment: 'DDoS 공격 소스' },
  { ip: '77.247.181.163', category: '멀웨어', comment: '멀웨어 배포 의심' },
  { ip: '139.59.173.249', category: '피싱', comment: '피싱 사이트 호스팅' },
  { ip: '176.9.29.100', category: '스팸', comment: '댓글 스팸 자동화' },
  { ip: '91.134.203.99', category: '스캔', comment: '웹 애플리케이션 스캔' },
  { ip: '51.15.43.205', category: '브루트포스', comment: '로그인 반복 시도' },
  { ip: '142.93.123.56', category: '기타', comment: '이상한 트래픽 패턴' },
  { ip: '165.227.83.149', category: '스팸', comment: 'API 엔드포트 공격' },
  { ip: '217.182.137.45', category: 'DDoS', comment: 'HTTP 플러딩 공격' },
  { ip: '89.248.167.131', category: '멀웨어', comment: '랜섬웨어 배포 시도' },
  { ip: '141.98.10.63', category: '스캔', comment: '취약점 스캔 감지' },
  {
    ip: '5.188.206.14',
    category: '브루트포스',
    comment: 'FTP 무차별 대입 공격',
  },
  { ip: '111.90.139.52', category: '피싱', comment: '가짜 로그인 페이지' },
  { ip: '23.129.64.100', category: '스팸', comment: '이메일 스팸 발송' },
  { ip: '104.244.72.115', category: '기타', comment: '알 수 없는 악성 행위' },
  { ip: '185.56.83.83', category: 'DDoS', comment: 'UDP 플러딩' },
  { ip: '62.210.105.116', category: '스캔', comment: '네트워크 전체 스캔' },
];

export function Dashboard() {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [userIp, setUserIp] = useState('');

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

  const handleSearch = (ip: string) => {
    navigate(`/ip-check?ip=${ip}`);
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#e74c3c]/30 selection:text-white transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 my-0 mx-[30px] py-0 px-[15px] flex flex-col">
        <IPSearchForm
          onSearch={handleSearch}
          isLoading={false}
          initialIp={userIp}
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
              className="flex items-center gap-4 p-6 rounded-xl transition-all hover:scale-[1.02] bg-white border border-gray-200 hover:border-red-400"
            >
              <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
                <FileWarning className="w-6 h-6 text-red-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Report IP Now</h3>
                <p className="text-xs mt-1 text-gray-500">
                  악성 IP를 신고하여 커뮤니티에 기여하세요.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/ip-check')}
              className="flex items-center gap-4 p-6 rounded-xl transition-all hover:scale-[1.02] bg-white border border-gray-200 hover:border-green-400"
            >
              <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                <Search className="w-6 h-6 text-green-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">IP 검색</h3>
                <p className="text-xs mt-1 text-gray-500">
                  IP 주소를 검색하여 위험도를 확인하세요.
                </p>
              </div>
            </button>

            <button
              onClick={() => navigate('/register-api')}
              className="flex items-center gap-4 p-6 rounded-xl transition-all hover:scale-[1.02] bg-white border border-gray-200 hover:border-blue-400"
            >
              <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                <KeyRound className="w-6 h-6 text-blue-500" />
              </div>
              <div className="text-left">
                <h3 className="font-bold text-gray-900">Register API Key</h3>
                <p className="text-xs mt-1 text-gray-500">
                  API 키를 발급받아 프로그래밍 방식으로 데이터를 활용하세요.
                </p>
              </div>
            </button>
          </div>
        </div>

        <div
          className={`rounded-xl p-6 transition-colors mt-8 ${
            theme === 'dark'
              ? 'bg-[#111827] border border-gray-800/90'
              : 'bg-white border border-gray-200'
          }`}
        >
          <h2
            className={`text-lg font-bold mb-4 ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}
          >
            Recently Reported IP
          </h2>

          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {dummyReportedIPs.map((item, index) => (
              <button
                key={index}
                onClick={() => navigate(`/ip-check?ip=${item.ip}`)}
                className={`flex items-center gap-2 p-3 rounded-lg transition-all hover:scale-[1.02] text-left ${
                  theme === 'dark'
                    ? 'bg-gray-800/50 hover:bg-gray-800 border border-gray-700/50'
                    : 'bg-gray-50 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                <span
                  className={`font-mono text-xs truncate ${
                    theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                  }`}
                >
                  {item.ip}
                </span>
              </button>
            ))}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
