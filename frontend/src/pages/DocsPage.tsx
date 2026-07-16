import { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { Footer } from '../components/layout/Footer';

type Lang = 'curl' | 'python';

interface ParamRow {
  field: string;
  required: boolean;
  default?: string;
  description: string;
}

interface EndpointSection {
  id: string;
  title: string;
  method: 'GET' | 'POST' | 'DELETE';
  path: string;
  description: string;
  params: ParamRow[];
  codeExamples: Record<Lang, string>;
  responseExample: string;
  responseNote?: string;
}

const sidebarSections = [
  { id: 'introduction', label: 'Introduction' },
  {
    id: 'ip-check',
    label: 'IP Check',
    children: [
      { id: 'check', label: 'Check' },
      { id: 'country', label: 'Country' },
      { id: 'whois', label: 'WHOIS' },
    ],
  },
  {
    id: 'ip-history',
    label: 'IP History & Blacklist',
    children: [
      { id: 'history', label: 'History' },
      { id: 'blacklist', label: 'Blacklist' },
      { id: 'blacklist-search', label: 'Blacklist Search' },
      { id: 'blacklist-random', label: 'Blacklist Random' },
    ],
  },
  {
    id: 'ip-reports',
    label: 'IP Reports',
    children: [
      { id: 'reported-recent', label: 'Reported Recent' },
      { id: 'recent', label: 'Recent' },
      { id: 'report', label: 'Report' },
      { id: 'reports', label: 'Reports' },
    ],
  },
  { id: 'error-handling', label: 'Error Handling' },
  { id: 'security', label: 'Security' },
];

const endpoints: EndpointSection[] = [
  {
    id: 'check',
    title: 'Check',
    method: 'GET',
    path: '/api/v2/ip/check',
    description:
      'IP 주소의 위협 정보를 조회합니다. 로컬 DB에서 블랙리스트 등록 여부 및 위협 점수를 확인합니다.',
    params: [{ field: 'ip', required: true, description: '조회할 IP 주소' }],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/check \\
  --data-urlencode "ip=8.8.8.8"`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/check"

params = {"ip": "8.8.8.8"}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": {
    "ipAddress": "8.8.8.8",
    "domain": "google.com",
    "hostnames": ["dns.google"],
    "isWhitelisted": false,
    "abuseConfidenceScore": 0,
    "totalReports": 0,
    "numDistinctUsers": 0,
    "countryCode": "US",
    "isp": "Google LLC",
    "lastReportedAt": null,
    "requestTime": "2026-07-15T10:30:00Z"
  }
}`,
  },
  {
    id: 'country',
    title: 'Country',
    method: 'GET',
    path: '/api/v2/ip/country',
    description: 'IP 주소의 국가 코드를 조회합니다.',
    params: [{ field: 'ip', required: true, description: '조회할 IP 주소' }],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/country \\
  --data-urlencode "ip=8.8.8.8"`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/country"

params = {"ip": "8.8.8.8"}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "countryCode": "US"
}`,
  },
  {
    id: 'whois',
    title: 'WHOIS',
    method: 'GET',
    path: '/api/v2/ip/whois',
    description: 'IP 주소의 WHOIS 정보를 조회합니다.',
    params: [{ field: 'ip', required: true, description: '조회할 IP 주소' }],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/whois \\
  --data-urlencode "ip=8.8.8.8"`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/whois"

params = {"ip": "8.8.8.8"}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": {
    "networkRange": "8.8.8.0/24",
    "country": "US",
    "netname": "GOOGLE",
    "orgName": "Google LLC",
    "registrar": "ARIN",
    "registeredDate": "1992-12-01",
    "updatedDate": "2024-01-01",
    "status": "active",
    "abuseContact": "abuse@google.com",
    "raw": "..."
  }
}`,
  },
  {
    id: 'history',
    title: 'History',
    method: 'GET',
    path: '/api/v2/ip/history',
    description: '특정 날짜의 IP 검색 이력을 조회합니다.',
    params: [
      {
        field: 'date',
        required: true,
        default: '',
        description: '조회할 날짜 (YYYY-MM-DD)',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/history \\
  --data-urlencode "date=2026-07-15"`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/history"

params = {"date": "2026-07-15"}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    { "ip": "8.8.8.8", "checkedAt": "2026-07-15T10:30:00Z" },
    { "ip": "1.1.1.1", "checkedAt": "2026-07-15T11:15:00Z" }
  ]
}`,
  },
  {
    id: 'blacklist',
    title: 'Blacklist',
    method: 'GET',
    path: '/api/v2/ip/blacklist',
    description: '특정 날짜의 블랙리스트 IP 목록을 페이지 단위로 조회합니다.',
    params: [
      {
        field: 'date',
        required: true,
        description: '조회할 날짜 (YYYY-MM-DD)',
      },
      {
        field: 'page',
        required: false,
        default: '1',
        description: '페이지 번호',
      },
      {
        field: 'limit',
        required: false,
        default: '200',
        description: '페이지당 항목 수',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/blacklist \\
  --data-urlencode "date=2026-07-15" \\
  -d page=1 \\
  -d limit=200`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/blacklist"

params = {
    "date": "2026-07-15",
    "page": 1,
    "limit": 200
}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    {
      "ip": "1.2.3.4",
      "abuseConfidenceScore": 100,
      "countryCode": "CN",
      "countryName": "China",
      "isp": "Example ISP",
      "domain": "example.com",
      "totalReports": 150,
      "lastReportedAt": "2026-07-15T09:00:00Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 200,
    "total": 5000,
    "totalPages": 25
  }
}`,
  },
  {
    id: 'blacklist-search',
    title: 'Blacklist Search',
    method: 'GET',
    path: '/api/v2/ip/blacklist/search',
    description:
      '블랙리스트에서 특정 IP 주소를 검색하고 등록된 날짜 목록을 반환합니다.',
    params: [
      { field: 'ip', required: true, description: '검색할 IP 주소' },
      {
        field: 'date',
        required: false,
        description: '특정 날짜 필터 (YYYY-MM-DD)',
      },
      {
        field: 'limit',
        required: false,
        default: '200',
        description: '검색 결과 제한',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/blacklist/search \\
  --data-urlencode "ip=1.2.3.4" \\
  --data-urlencode "date=2026-07-15"`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/blacklist/search"

params = {
    "ip": "1.2.3.4",
    "date": "2026-07-15"
}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "found": true,
  "dates": ["2026-07-10", "2026-07-11", "2026-07-15"],
  "page": 1,
  "totalPages": 1
}`,
  },
  {
    id: 'blacklist-random',
    title: 'Blacklist Random',
    method: 'GET',
    path: '/api/v2/ip/blacklist/random',
    description: '랜덤 블랙리스트 IP를 조회합니다.',
    params: [
      {
        field: 'limit',
        required: false,
        default: '20',
        description: '조회할 IP 수',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/blacklist/random \\
  -d limit=20`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/blacklist/random"

params = {"limit": 20}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    { "ip": "5.188.10.179", "country": "RU" },
    { "ip": "185.222.209.14", "country": "NL" }
  ]
}`,
  },
  {
    id: 'reported-recent',
    title: 'Reported Recent',
    method: 'GET',
    path: '/api/v2/ip/reported/recent',
    description: '최근 신고된 IP 목록을 랜덤으로 조회합니다.',
    params: [
      {
        field: 'limit',
        required: false,
        default: '20',
        description: '조회할 IP 수',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/reported/recent \\
  -d limit=20`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/reported/recent"

params = {"limit": 20}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    { "ip": "123.45.67.89", "countryCode": "KR" },
    { "ip": "98.76.54.32", "countryCode": "US" }
  ]
}`,
  },
  {
    id: 'recent',
    title: 'Recent',
    method: 'GET',
    path: '/api/v2/ip/recent',
    description: '최근 검색된 IP 목록을 조회합니다.',
    params: [
      {
        field: 'limit',
        required: false,
        default: '20',
        description: '조회할 IP 수',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/recent \\
  -d limit=20`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/recent"

params = {"limit": 20}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    { "ip": "8.8.8.8", "country": "US", "checkedAt": "2026-07-15T10:30:00Z" }
  ]
}`,
  },
  {
    id: 'report',
    title: 'Report',
    method: 'POST',
    path: '/api/v2/ip/report',
    description:
      'IP 주소를 신고합니다. 카테고리와 코멘트를 포함하여 신고할 수 있습니다.',
    params: [
      { field: 'ip', required: true, description: '신고할 IP 주소' },
      {
        field: 'categories',
        required: true,
        description: '신고 카테고리 ID 목록',
      },
      { field: 'comment', required: false, description: '신고 코멘트' },
    ],
    codeExamples: {
      curl: `curl -X POST https://your-domain.com/api/v2/ip/report \\
  -H "Content-Type: application/json" \\
  -d '{
    "ip": "1.2.3.4",
    "categories": [18, 22],
    "comment": "SSH login attempts"
  }'`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/report"

payload = {
    "ip": "1.2.3.4",
    "categories": [18, 22],
    "comment": "SSH login attempts"
}

response = requests.post(url, json=payload)
print(response.json())`,
    },
    responseExample: `{
  "message": "신고가 접수되었습니다.",
  "id": 12345
}`,
  },
  {
    id: 'reports',
    title: 'Reports',
    method: 'GET',
    path: '/api/v2/ip/reports',
    description: '최근 신고된 IP 목록을 조회합니다.',
    params: [
      {
        field: 'limit',
        required: false,
        default: '20',
        description: '조회할 항목 수',
      },
    ],
    codeExamples: {
      curl: `curl -G https://your-domain.com/api/v2/ip/reports \\
  -d limit=20`,
      python: `import requests

url = "https://your-domain.com/api/v2/ip/reports"

params = {"limit": 20}

response = requests.get(url, params=params)
print(response.json())`,
    },
    responseExample: `{
  "data": [
    {
      "ip": "1.2.3.4",
      "categoryIds": [18, 22],
      "comment": "SSH login attempts",
      "reportedAt": "2026-07-15T10:30:00Z",
      "countryCode": "KR"
    }
  ]
}`,
  },
];

function CodeBlock({ code, language }: { code: string; language: string }) {
  return (
    <div className="relative">
      <span className="absolute top-2 right-3 text-[10px] text-gray-500 uppercase tracking-wider font-medium">
        {language}
      </span>
      <pre className="bg-[#1e1e1e] text-[#d4d4d4] rounded-lg p-4 overflow-x-auto text-[13px] leading-relaxed font-mono">
        <code>{code}</code>
      </pre>
    </div>
  );
}

function CodeTabs({ examples }: { examples: Record<Lang, string> }) {
  const [activeTab, setActiveTab] = useState<Lang>('curl');
  return (
    <div>
      <div className="flex gap-0 mb-0">
        {(['curl', 'python'] as Lang[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setActiveTab(lang)}
            className={`px-4 py-2 text-xs font-medium rounded-t-lg transition-colors ${
              activeTab === lang
                ? 'bg-[#1e1e1e] text-gray-200'
                : 'bg-gray-200 text-gray-600 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-400 dark:hover:bg-gray-600'
            }`}
          >
            {lang === 'curl' ? 'cURL' : 'Python'}
          </button>
        ))}
      </div>
      <CodeBlock code={examples[activeTab]} language={activeTab} />
    </div>
  );
}

function ParamTable({ params, theme }: { params: ParamRow[]; theme: string }) {
  const isDark = theme === 'dark';
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr
            className={
              isDark ? 'border-b border-gray-700' : 'border-b border-gray-200'
            }
          >
            <th
              className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Field
            </th>
            <th
              className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Required
            </th>
            <th
              className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Default
            </th>
            <th
              className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
            >
              Description
            </th>
          </tr>
        </thead>
        <tbody>
          {params.map((p) => (
            <tr
              key={p.field}
              className={
                isDark ? 'border-b border-gray-800' : 'border-b border-gray-100'
              }
            >
              <td className="py-2 px-3 font-mono text-xs text-[#e74c3c]">
                {p.field}
              </td>
              <td className="py-2 px-3">
                {p.required ? (
                  <span className="text-[#e74c3c] text-xs font-semibold">
                    Yes
                  </span>
                ) : (
                  <span
                    className={`${isDark ? 'text-gray-500' : 'text-gray-400'} text-xs`}
                  >
                    No
                  </span>
                )}
              </td>
              <td
                className={`py-2 px-3 font-mono text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}
              >
                {p.default || '-'}
              </td>
              <td
                className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
              >
                {p.description}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function EndpointBlock({
  endpoint,
  theme,
}: {
  endpoint: EndpointSection;
  theme: string;
}) {
  const isDark = theme === 'dark';
  const methodColors: Record<string, string> = {
    GET: 'bg-[#27ae60]',
    POST: 'bg-[#2980b9]',
    DELETE: 'bg-[#e74c3c]',
  };

  return (
    <section id={endpoint.id} className="scroll-mt-20">
      <div className="flex items-center gap-3 mb-3">
        <span
          className={`${methodColors[endpoint.method]} text-white text-xs font-bold px-2.5 py-1 rounded`}
        >
          {endpoint.method}
        </span>
        <code
          className={`text-sm font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
        >
          {endpoint.path}
        </code>
      </div>
      <h3
        className={`text-lg font-semibold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}
      >
        {endpoint.title}
      </h3>
      <p
        className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
      >
        {endpoint.description}
      </p>

      <h4
        className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
      >
        Parameters
      </h4>
      <div
        className={`rounded-lg border mb-6 overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
      >
        <ParamTable params={endpoint.params} theme={theme} />
      </div>

      <h4
        className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
      >
        Example Request
      </h4>
      <div className="mb-6">
        <CodeTabs examples={endpoint.codeExamples} />
      </div>

      <h4
        className={`text-sm font-semibold mb-2 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
      >
        Response
      </h4>
      <CodeBlock code={endpoint.responseExample} language="json" />
      {endpoint.responseNote && (
        <p
          className={`text-xs mt-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
        >
          {endpoint.responseNote}
        </p>
      )}
    </section>
  );
}

export function DocsPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeSection, setActiveSection] = useState('introduction');
  const mainRef = useRef<HTMLDivElement>(null);

  const handleScroll = useCallback(() => {
    if (!mainRef.current) return;
    const sections = mainRef.current.querySelectorAll('section[id]');
    let current = 'introduction';
    for (const section of sections) {
      const rect = section.getBoundingClientRect();
      if (rect.top <= 120) {
        current = section.id;
      }
    }
    setActiveSection(current);
  }, []);

  useEffect(() => {
    const el = mainRef.current;
    if (!el) return;
    el.addEventListener('scroll', handleScroll, { passive: true });
    return () => el.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${isDark ? 'bg-[#0a0f1a] text-gray-100' : 'bg-gray-100 text-gray-900'}`}
    >
      <div className="flex flex-1">
        {/* Sidebar */}
        <aside
          className={`w-60 shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto border-r py-6 px-4 ${isDark ? 'border-gray-800 bg-[#0d1321]' : 'border-gray-200 bg-white'}`}
        >
          <h2
            className={`text-xs font-bold uppercase tracking-wider mb-4 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}
          >
            API Reference
          </h2>
          <nav className="flex flex-col gap-0.5">
            {sidebarSections.map((section) => (
              <div key={section.id}>
                <button
                  onClick={() => scrollTo(section.id)}
                  className={`w-full text-left text-sm px-3 py-1.5 rounded transition-colors ${
                    activeSection === section.id
                      ? 'bg-[#e74c3c]/10 text-[#e74c3c] font-medium'
                      : isDark
                        ? 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                  }`}
                >
                  {section.label}
                </button>
                {section.children && (
                  <div className="ml-3 flex flex-col gap-0.5">
                    {section.children.map((child) => (
                      <button
                        key={child.id}
                        onClick={() => scrollTo(child.id)}
                        className={`w-full text-left text-xs px-3 py-1 rounded flex items-center gap-1 transition-colors ${
                          activeSection === child.id
                            ? 'text-[#e74c3c] font-medium'
                            : isDark
                              ? 'text-gray-500 hover:text-gray-300'
                              : 'text-gray-500 hover:text-gray-700'
                        }`}
                      >
                        <ChevronRight className="w-3 h-3" />
                        {child.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main
          ref={mainRef}
          className="flex-1 overflow-y-auto h-[calc(100vh-4rem)]"
        >
          <div className="max-w-3xl mx-auto px-8 py-10">
            {/* Introduction */}
            <section id="introduction" className="scroll-mt-20 mb-12">
              <h1 className="text-3xl font-bold mb-4">Introduction</h1>
              <p
                className={`text-sm leading-relaxed mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                PacketCYBER ThreatIP API를 통해 IP 위협 정보를 프로그래밍
                방식으로 이용할 수 있습니다. 이 API는 IP 주소의 위협 점수,
                블랙리스트 상태, WHOIS 정보, 신고 내역 등을 조회하고 신고할 수
                있습니다.
              </p>
            </section>

            {/* IP Check */}
            <section id="ip-check" className="scroll-mt-20 mb-8">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-700">
                IP Check
              </h2>
            </section>
            {endpoints
              .filter((e) => ['check', 'country', 'whois'].includes(e.id))
              .map((ep) => (
                <div key={ep.id} className="mb-10">
                  <EndpointBlock endpoint={ep} theme={theme} />
                </div>
              ))}

            {/* IP History & Blacklist */}
            <section id="ip-history" className="scroll-mt-20 mb-8">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-700">
                IP History & Blacklist
              </h2>
            </section>
            {endpoints
              .filter((e) =>
                [
                  'history',
                  'blacklist',
                  'blacklist-search',
                  'blacklist-random',
                ].includes(e.id),
              )
              .map((ep) => (
                <div key={ep.id} className="mb-10">
                  <EndpointBlock endpoint={ep} theme={theme} />
                </div>
              ))}

            {/* IP Reports */}
            <section id="ip-reports" className="scroll-mt-20 mb-8">
              <h2 className="text-2xl font-bold mb-6 pb-2 border-b border-gray-700">
                IP Reports
              </h2>
            </section>
            {endpoints
              .filter((e) =>
                ['reported-recent', 'recent', 'report', 'reports'].includes(
                  e.id,
                ),
              )
              .map((ep) => (
                <div key={ep.id} className="mb-10">
                  <EndpointBlock endpoint={ep} theme={theme} />
                </div>
              ))}

            {/* Error Handling */}
            <section id="error-handling" className="scroll-mt-20 mb-12">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-700">
                Error Handling
              </h2>
              <p
                className={`text-sm mb-4 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
              >
                API는 HTTP 상태 코드를 사용하여 요청 결과를 나타냅니다.
              </p>
              <div
                className={`rounded-lg border overflow-hidden ${isDark ? 'border-gray-700' : 'border-gray-200'}`}
              >
                <table className="w-full text-sm">
                  <thead>
                    <tr
                      className={
                        isDark
                          ? 'bg-gray-800/50 border-b border-gray-700'
                          : 'bg-gray-50 border-b border-gray-200'
                      }
                    >
                      <th
                        className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Status
                      </th>
                      <th
                        className={`text-left py-2 px-3 font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}
                      >
                        Description
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      ['200', '요청 성공'],
                      ['400', '잘못된 요청 (파라미터 누락 또는 잘못됨)'],
                      ['401', '인증 실패 (로그인 정보 불일치)'],
                      ['403', '접근 거부 (유효하지 않은 토큰)'],
                      ['429', '요청 한도 초과'],
                      ['500', '서버 내부 오류'],
                    ].map(([status, desc]) => (
                      <tr
                        key={status}
                        className={
                          isDark
                            ? 'border-b border-gray-800'
                            : 'border-b border-gray-100'
                        }
                      >
                        <td className="py-2 px-3 font-mono text-xs text-[#e74c3c]">
                          {status}
                        </td>
                        <td
                          className={`py-2 px-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}
                        >
                          {desc}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="mt-4">
                <CodeBlock
                  code={`{
  "errors": [
    {
      "detail": "요청 처리 중 오류가 발생했습니다.",
      "status": 422
    }
  ]
}`}
                  language="json"
                />
              </div>
            </section>

            {/* Security */}
            <section id="security" className="scroll-mt-20 mb-12">
              <h2 className="text-2xl font-bold mb-4 pb-2 border-b border-gray-700">
                Security
              </h2>
              <div
                className={`rounded-lg border p-5 ${isDark ? 'border-gray-700 bg-[#111827]' : 'border-gray-200 bg-white'}`}
              >
                <ul
                  className={`text-sm space-y-3 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}
                >
                  <li className="flex items-start gap-2">
                    <span className="text-[#e74c3c] mt-0.5">1.</span>
                    <span>모든 API 요청은 HTTPS를 통해 이루어져야 합니다.</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#e74c3c] mt-0.5">2.</span>
                    <span>
                      API 토큰은 HTTP 헤더에 포함하여 전송하는 것이 권장됩니다.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#e74c3c] mt-0.5">3.</span>
                    <span>
                      API 토큰은 클라이언트 측 JavaScript에서 사용하지 마세요.
                    </span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-[#e74c3c] mt-0.5">4.</span>
                    <span>
                      API 토큰은 비밀번호와 마찬가지로 안전하게 관리해야 합니다.
                    </span>
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </main>
      </div>
      <Footer />
    </div>
  );
}
