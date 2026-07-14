import { useEffect, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { Footer } from '../components/layout/Footer';
import axios from 'axios';
import { API_BASE_URL } from '../config';
import { useTheme } from '../context/ThemeContext';

interface BlacklistItem {
  ip: string;
  abuseConfidenceScore?: number;
  countryName?: string;
  countryCode?: string;
  lastReportedAt?: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function BlacklistPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const dateParam = searchParams.get('date') || '';
  const ipParam = searchParams.get('ip') || '';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const [items, setItems] = useState<BlacklistItem[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [dateValue, setDateValue] = useState(dateParam);
  const [ipSearchValue, setIpSearchValue] = useState(ipParam);
  const [ipSearchResult, setIpSearchResult] = useState<{
    found: boolean;
    dates: string[];
  } | null>(null);
  const [ipSearchLoading, setIpSearchLoading] = useState(false);
  const itemRefs = useRef<Record<string, HTMLDivElement | null>>({});

  useEffect(() => {
    if (!dateParam) return;
    let cancelled = false;
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await axios.get(`${API_BASE_URL}/ip/blacklist`, {
          params: { date: dateParam, page: pageParam, limit: 200 },
        });
        if (!cancelled) {
          setItems(res.data.data || []);
          setPagination(res.data.pagination || null);
        }
      } catch (err: unknown) {
        if (!cancelled)
          setError(err instanceof Error ? err.message : '오류가 발생했습니다.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchData();
    return () => {
      cancelled = true;
    };
  }, [dateParam, pageParam]);

  useEffect(() => {
    if (ipParam && items.length > 0) {
      const el = itemRefs.current[ipParam];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [ipParam, items]);

  const goToPage = (page: number) => {
    const params: Record<string, string> = {
      date: dateParam,
      page: String(page),
    };
    if (ipParam) params.ip = ipParam;
    setSearchParams(params);
  };

  const handleDateSearch = () => {
    if (!dateValue) return;
    setIpSearchResult(null);
    const params = `date=${dateValue}&page=1`;
    navigate(`/blacklist?${params}`);
  };

  const handleIpSearch = async () => {
    const ip = ipSearchValue.trim();
    if (!ip) return;

    if (dateValue) {
      setIpSearchLoading(true);
      setIpSearchResult(null);
      let navigateUrl = `/blacklist?date=${dateValue}&page=1`;
      try {
        const res = await axios.get(`${API_BASE_URL}/ip/blacklist/search`, {
          params: { ip, date: dateValue, limit: 200 },
        });
        if (res.data.found && res.data.page) {
          setIpSearchResult({ found: true, dates: res.data.dates });
          navigateUrl = `/blacklist?date=${dateValue}&ip=${ip}&page=${res.data.page}`;
        } else {
          setIpSearchResult({ found: false, dates: res.data.dates || [] });
        }
      } catch {
        setIpSearchResult({ found: false, dates: [] });
      } finally {
        setIpSearchLoading(false);
      }
      navigate(navigateUrl);
      return;
    }

    setIpSearchLoading(true);
    setIpSearchResult(null);
    try {
      const res = await axios.get(`${API_BASE_URL}/ip/blacklist/search`, {
        params: { ip },
      });
      setIpSearchResult(res.data);
    } catch {
      setIpSearchResult({ found: false, dates: [] });
    } finally {
      setIpSearchLoading(false);
    }
  };

  const formatDateRanges = (dates: string[]): string => {
    if (dates.length === 0) return '';
    const sorted = [...dates].sort();
    const ranges: string[] = [];
    let start = sorted[0];
    let prev = sorted[0];

    for (let i = 1; i < sorted.length; i++) {
      const prevDate = new Date(prev);
      const currDate = new Date(sorted[i]);
      const diff =
        (currDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24);
      if (diff === 1) {
        prev = sorted[i];
      } else {
        ranges.push(start === prev ? start : `${start}~${prev}`);
        start = sorted[i];
        prev = sorted[i];
      }
    }
    ranges.push(start === prev ? start : `${start}~${prev}`);
    return ranges.join(', ');
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 px-4 md:px-8 py-6 mx-auto flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <input
              type="date"
              value={dateValue}
              onChange={(e) => setDateValue(e.target.value)}
              className={`rounded-md px-3 py-2 text-sm outline-none transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border border-gray-700/60 text-gray-200 focus:border-[#e74c3c]/50 [color-scheme:dark]'
                  : 'bg-white border border-gray-300 text-gray-700 focus:border-[#e74c3c]/50'
              }`}
            />
            <button
              onClick={handleDateSearch}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#e74c3c] hover:bg-[#c0392b] rounded-md text-sm font-semibold text-white transition-colors"
            >
              <Search className="w-4 h-4" /> 날짜 조회
            </button>
          </div>
          <span
            className={`text-sm ${theme === 'dark' ? 'text-gray-600' : 'text-gray-400'}`}
          >
            |
          </span>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={ipSearchValue}
              onChange={(e) => setIpSearchValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleIpSearch()}
              placeholder="IP 주소 입력"
              className={`rounded-md px-3 py-2 text-sm outline-none w-52 transition-colors ${
                theme === 'dark'
                  ? 'bg-gray-800/60 border border-gray-700/60 text-gray-200 focus:border-[#e74c3c]/50'
                  : 'bg-white border border-gray-300 text-gray-700 focus:border-[#e74c3c]/50'
              }`}
            />
            <button
              onClick={handleIpSearch}
              disabled={ipSearchLoading}
              className="flex items-center gap-1.5 px-4 py-2 bg-[#e74c3c] hover:bg-[#c0392b] rounded-md text-sm font-semibold text-white transition-colors disabled:opacity-50"
            >
              <Search className="w-4 h-4" /> IP 조회
            </button>
          </div>
        </div>

        {ipSearchResult && (
          <div
            className={`p-4 rounded-xl border text-sm ${
              ipSearchResult.found
                ? theme === 'dark'
                  ? 'bg-red-500/10 border-red-500/30 text-red-200'
                  : 'bg-red-50 border-red-200 text-red-700'
                : theme === 'dark'
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-700'
            }`}
          >
            {ipSearchResult.found
              ? `IP가 블랙리스트에서 발견되었습니다 (${formatDateRanges(ipSearchResult.dates)})`
              : '해당 IP는 블랙리스트에 존재하지 않습니다.'}
          </div>
        )}

        {loading && (
          <div
            className={`text-center py-12 text-sm ${
              theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
            }`}
          >
            불러오는 중...
          </div>
        )}

        {error && (
          <div
            className={`p-4 rounded-xl text-sm ${
              theme === 'dark'
                ? 'bg-red-500/10 border border-red-500/30 text-red-200'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {error}
          </div>
        )}

        {!loading && !error && dateParam && items.length === 0 && (
          <div
            className={`flex flex-col items-center justify-center py-20 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'border border-gray-800/40 bg-[#111827]/40'
                : 'border border-gray-200 bg-white'
            }`}
          >
            <Calendar
              className={`w-10 h-10 mb-3 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`}
            />
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              해당 날짜에 블랙리스트가 없습니다.
            </p>
          </div>
        )}

        {!loading && !error && items.length > 0 && (
          <div className="flex flex-col gap-4">
            <div className="grid grid-cols-5 gap-1.5">
              {items.map((item) => (
                <div
                  key={item.ip}
                  ref={(el) => {
                    itemRefs.current[item.ip] = el;
                  }}
                  className={`px-2 py-2.5 rounded-md border font-mono text-center text-base transition-colors ${
                    ipParam === item.ip
                      ? theme === 'dark'
                        ? 'bg-[#e74c3c]/20 border-[#e74c3c]/60 text-[#e74c3c]'
                        : 'bg-[#e74c3c]/10 border-[#e74c3c]/40 text-[#c0392b]'
                      : theme === 'dark'
                        ? 'bg-[#111827]/60 border-gray-700/40 text-gray-200 hover:border-gray-600/60'
                        : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300'
                  }`}
                >
                  {item.ip}
                </div>
              ))}
            </div>
            {pagination && pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-2">
                <button
                  onClick={() => goToPage(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <ChevronLeft className="w-3.5 h-3.5" /> 이전
                </button>
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                  .filter(
                    (p) =>
                      Math.abs(p - pagination.page) <= 2 ||
                      p === 1 ||
                      p === pagination.totalPages,
                  )
                  .reduce((acc: (number | string)[], p, idx, arr) => {
                    if (idx > 0 && arr[idx - 1] !== p - 1) acc.push('...');
                    acc.push(p);
                    return acc;
                  }, [])
                  .map((p, i) =>
                    typeof p === 'string' ? (
                      <span
                        key={'e' + i}
                        className={`text-xs px-1 ${
                          theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
                        }`}
                      >
                        ...
                      </span>
                    ) : (
                      <button
                        key={p}
                        onClick={() => goToPage(p)}
                        className={`px-3 py-1.5 text-xs rounded-md transition-colors ${
                          p === pagination.page
                            ? 'bg-[#e74c3c] text-white font-semibold'
                            : theme === 'dark'
                              ? 'bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60'
                              : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {p}
                      </button>
                    ),
                  )}
                <button
                  onClick={() => goToPage(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`flex items-center gap-1 px-3 py-1.5 text-xs rounded-md transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
                    theme === 'dark'
                      ? 'bg-gray-800/60 border border-gray-700/60 text-gray-300 hover:bg-gray-700/60'
                      : 'bg-white border border-gray-300 text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  다음 <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {!dateParam && !loading && (
          <div
            className={`flex flex-col items-center justify-center py-20 rounded-xl transition-colors ${
              theme === 'dark'
                ? 'border border-gray-800/40 bg-[#111827]/40'
                : 'border border-gray-200 bg-white'
            }`}
          >
            <Calendar
              className={`w-10 h-10 mb-3 ${
                theme === 'dark' ? 'text-gray-600' : 'text-gray-400'
              }`}
            />
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
              }`}
            >
              조회할 날짜를 선택하고 검색 버튼을 눌러주세요.
            </p>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
