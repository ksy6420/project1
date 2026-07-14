import { useTheme } from '../../context/ThemeContext';

type RawData = Record<string, unknown>;

interface MetadataTableProps {
  rawData?: RawData;
}

const LABEL_MAP: Record<string, string> = {
  ipAddress: 'IP 주소',
  domain: '도메인',
  hostnames: '호스트명',
  isWhitelisted: '화이트리스트',
  abuseConfidenceScore: '악용 신뢰도',
  totalReports: '총 신고 횟수',
  numDistinctUsers: '신고자 수',
  countryName: '국가',
  countryCode: '국가 코드',
  usageType: '사용 유형',
  isp: 'ISP',
  lastReportedAt: '최종 보고일',
  requestTime: 'API 요청 시간',
  isPublic: '공개 IP',
  isTor: 'Tor 노드',
  ipVersion: 'IP 버전',
};

const UNIT_MAP: Record<string, string> = {
  abuseConfidenceScore: '%',
  totalReports: '회',
  numDistinctUsers: '명',
};

function formatValue(key: string, value: unknown): string {
  if (key === 'isWhitelisted' || key === 'isPublic' || key === 'isTor') {
    return value ? 'YES' : 'NO';
  }
  if (Array.isArray(value)) return value.join(', ') || '-';
  if (value === null || value === undefined) return '-';
  const unit = UNIT_MAP[key];
  return unit ? `${String(value)}${unit}` : String(value);
}

export function MetadataTable({ rawData }: MetadataTableProps) {
  const { theme } = useTheme();

  const rows = rawData
    ? (Object.entries(rawData) as [string, unknown][])
        .filter(([key]) => key !== 'reports' && LABEL_MAP[key])
        .map(([key, value]) => ({
          label: LABEL_MAP[key] || key,
          value: formatValue(key, value),
        }))
    : [];

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`py-2.5 flex items-center justify-between gap-3 border-b transition-colors ${
              theme === 'dark'
                ? 'border-gray-800/60'
                : 'border-gray-200'
            }`}
          >
            <span className={`text-sm font-medium shrink-0 ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}>
              {row.label}
            </span>
            <span className={`text-sm font-semibold text-right break-all ml-auto ${
              theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
            }`}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
