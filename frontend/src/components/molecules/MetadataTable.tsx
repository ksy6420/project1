import { useTheme } from '../../context/ThemeContext';
import CountryFlag from '../CountryFlag';

type RawData = Record<string, unknown>;

interface MetadataTableProps {
  rawData?: RawData;
}

const LABEL_MAP: Record<string, string> = {
  ipAddress: 'IP Address',
  domain: 'Domain Name',
  hostnames: 'Hostname(s)',
  isWhitelisted: 'Whitelisted',
  abuseConfidenceScore: 'Abuse Confidence Score',
  totalReports: 'Total Reports',
  numDistinctUsers: 'Unique Reporters',
  countryName: 'Country',
  countryCode: 'Country Code',
  usageType: 'Usage Type',
  isp: 'ISP',
  lastReportedAt: 'Last Report Time',
  requestTime: 'API Request Time',
  isPublic: 'Public IP',
  isTor: 'Tor Node',
  ipVersion: 'IP Version',
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
          key,
          label: LABEL_MAP[key] || key,
          value: formatValue(key, value),
        }))
    : [];

  const countryCode = rawData?.countryCode as string | undefined;

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-10 gap-y-0">
        {rows.map((row, index) => (
          <div
            key={index}
            className={`py-2.5 flex items-center justify-between gap-3 border-b transition-colors ${
              theme === 'dark' ? 'border-gray-800/60' : 'border-gray-200'
            }`}
          >
            <span
              className={`font-semibold font-medium shrink-0 ${
                theme === 'dark' ? 'text-gray-400' : 'text-black'
              }`}
            >
              {row.label}
            </span>
            <span
              className={`text-right break-all ml-auto ${
                theme === 'dark' ? 'text-gray-200' : 'text-gray-700'
              }`}
            >
              {row.key === 'countryName' && countryCode ? (
                <span className="flex items-center gap-2">
                  <CountryFlag countryCode={countryCode} className="shrink-0" />
                  {row.value}
                </span>
              ) : (
                row.value
              )}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
