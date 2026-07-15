import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { FileWarning, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';
import { CATEGORY_MAP } from '../constants/categories';

export function ReportPage() {
  const { theme } = useTheme();
  const [searchParams] = useSearchParams();
  const [ip, setIp] = useState('');
  const [categories, setCategories] = useState<number[]>([]);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  useEffect(() => {
    const ipFromUrl = searchParams.get('ip');
    if (ipFromUrl) {
      setIp(ipFromUrl);
    }
  }, [searchParams.get('ip')]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ip || categories.length === 0) {
      setMessage('IP 주소와 카테고리를 입력해주세요.');
      setIsSuccess(false);
      return;
    }

    setIsSubmitting(true);
    setMessage('');

    try {
      const res = await fetch(`${API_BASE_URL}/ip/report`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip, categories, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('신고가 접수되었습니다. 감사합니다.');
        setIsSuccess(true);
        setIp('');
        setCategories([]);
        setComment('');
      } else {
        setMessage(data.message || '신고 중 오류가 발생했습니다.');
        setIsSuccess(false);
      }
    } catch {
      setMessage('서버 연결에 실패했습니다.');
      setIsSuccess(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col font-sans selection:bg-[#e74c3c]/30 selection:text-white transition-colors ${
        theme === 'dark'
          ? 'bg-[#0a0f1a] text-gray-100'
          : 'bg-gray-100 text-gray-900'
      }`}
    >
      <main className="flex-1 px-4 md:px-8 py-8 w-2/3 mx-auto flex flex-col gap-8">
        <div
          className={`rounded-xl p-8 transition-colors ${
            theme === 'dark'
              ? 'bg-[#111827] border border-gray-800/90'
              : 'bg-white border border-gray-200'
          }`}
        >
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-lg bg-red-500/20 flex items-center justify-center">
              <FileWarning className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Report IP Now
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                악성 IP를 신고하여 커뮤니티에 기여하세요.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                IP Address(ex 8.8.8.8)
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="IP Address"
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
              />
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Categories(at least one is required)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                {Object.entries(CATEGORY_MAP).map(([id, name]) => {
                  const numId = Number(id);
                  const selected = categories.includes(numId);
                  return (
                    <label
                      key={numId}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                        selected
                          ? 'bg-[#e74c3c]/10 border-[#e74c3c]'
                          : theme === 'dark'
                            ? 'bg-gray-800 border-gray-700 hover:border-gray-500'
                            : 'bg-gray-50 border-gray-300 hover:border-gray-400'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          setCategories((prev) =>
                            selected
                              ? prev.filter((c) => c !== numId)
                              : [...prev, numId]
                          )
                        }
                        className="w-4 h-4 rounded accent-[#e74c3c]"
                      />
                      <span
                        className={`text-sm font-medium ${
                          selected
                            ? 'text-[#e74c3c]'
                            : theme === 'dark'
                              ? 'text-gray-300'
                              : 'text-gray-700'
                        }`}
                      >
                        {name}
                      </span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                Comment
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="추가 정보를 입력하세요"
                rows={4}
                className={`w-full px-4 py-3 rounded-lg border transition-colors resize-none ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-500 focus:border-red-500'
                    : 'bg-gray-50 border-gray-300 text-gray-900 placeholder-gray-400 focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
              />
            </div>

            {message && (
              <div
                className={`p-4 rounded-lg text-sm ${
                  isSuccess
                    ? theme === 'dark'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-green-50 text-green-700 border border-green-200'
                    : theme === 'dark'
                      ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                      : 'bg-red-50 text-red-700 border border-red-200'
                }`}
              >
                {message}
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold text-white transition-all ${
                isSubmitting
                  ? 'bg-gray-500 cursor-not-allowed'
                  : 'bg-[#e74c3c] hover:bg-[#c0392b] active:scale-[0.98]'
              }`}
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? '제출 중...' : '신고하기'}</span>
            </button>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
