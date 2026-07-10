import { type ReactNode } from 'react';
import { Activity, Globe, User, ExternalLink, Clock } from 'lucide-react';

type RawData = Record<string, unknown>;

interface MetadataTableProps {
  rawData?: RawData;
}

const LABEL_MAP: Record<string, { label: string; icon: ReactNode }> = {
  ipAddress: { label: 'IP 주소', icon: <Activity className="w-4 h-4" /> },
  domain: { label: '도메인', icon: <Globe className="w-4 h-4" /> },
  hostnames: { label: '호스트명', icon: <ExternalLink className="w-4 h-4" /> },
  isWhitelisted: { label: '화이트리스트', icon: <Globe className="w-4 h-4" /> },
  abuseConfidenceScore: {
    label: '악용 신뢰도',
    icon: <Globe className="w-4 h-4" />,
  },
  totalReports: { label: '총 신고 횟수', icon: <Globe className="w-4 h-4" /> },
  numDistinctUsers: {
    label: '고유 신고자 수',
    icon: <User className="w-4 h-4" />,
  },
  countryName: { label: '국가', icon: <Globe className="w-4 h-4" /> },
  countryCode: { label: '국가 코드', icon: <Globe className="w-4 h-4" /> },
  usageType: { label: '사용 유형', icon: <User className="w-4 h-4" /> },
  isp: { label: 'ISP', icon: <Globe className="w-4 h-4" /> },
  lastReportedAt: { label: '최종 보고일', icon: <Clock className="w-4 h-4" /> },
  requestTime: { label: '요청 시간', icon: <Clock className="w-4 h-4" /> },
  isPublic: { label: '공개 IP', icon: <Globe className="w-4 h-4" /> },
  isTor: { label: 'Tor 노드', icon: <Globe className="w-4 h-4" /> },
  ipVersion: { label: 'IP 버전', icon: <Globe className="w-4 h-4" /> },
};

function formatValue(key: string, value: unknown): string {
  if (key === 'isWhitelisted' || key === 'isPublic' || key === 'isTor') {
    return value ? 'YES' : 'NO';
  }
  if (Array.isArray(value)) return value.join(', ') || '-';
  if (value === null || value === undefined) return '-';
  return String(value);
}

export function MetadataTable({ rawData }: MetadataTableProps) {
  const rows = rawData
    ? (Object.entries(rawData) as [string, unknown][])
        .filter(([key]) => key !== 'reports' && LABEL_MAP[key])
        .map(([key, value]) => ({
          label: LABEL_MAP[key]?.label || key,
          value: formatValue(key, value),
          icon: LABEL_MAP[key]?.icon || <Globe className="w-4 h-4" />,
        }))
    : [];

  return (
    <div>
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        세부 메타데이터 상세 분석
      </h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-0">
        {rows.map((row, index) => (
          <div
            key={index}
            className="py-3 flex items-center justify-between gap-2 border-b border-gray-800/60"
          >
            <div className="flex items-center gap-2.5 text-xs font-medium text-gray-400 shrink-0">
              {row.icon}
              <span>{row.label}</span>
            </div>
            <span className="text-sm font-semibold text-gray-200 text-right break-all ml-auto">
              {row.value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
