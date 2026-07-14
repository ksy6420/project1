import { useState } from 'react';
import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { FileWarning, Send } from 'lucide-react';
import { API_BASE_URL } from '../config';

const CATEGORIES = [
  '스팸',
  '브루트포스',
  '스캔',
  'DDoS',
  '멀웨어',
  '피싱',
  '기타',
];

export function ReportPage() {
  const { theme } = useTheme();
  const [ip, setIp] = useState('');
  const [category, setCategory] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!ip || !category) {
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
        body: JSON.stringify({ ip, category, comment }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage('신고가 접수되었습니다. 감사합니다.');
        setIsSuccess(true);
        setIp('');
        setCategory('');
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
                IP 주소
              </label>
              <input
                type="text"
                value={ip}
                onChange={(e) => setIp(e.target.value)}
                placeholder="신고할 IP 주소를 입력하세요 (예: 1.2.3.4)"
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
                카테고리
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full px-4 py-3 rounded-lg border transition-colors ${
                  theme === 'dark'
                    ? 'bg-gray-800 border-gray-700 text-gray-900 focus:border-red-500'
                    : 'bg-white border-gray-300 text-black focus:border-red-500'
                } focus:outline-none focus:ring-2 focus:ring-red-500/20`}
              >
                <option value="">카테고리를 선택하세요</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`block text-sm font-medium mb-2 ${
                  theme === 'dark' ? 'text-gray-300' : 'text-gray-700'
                }`}
              >
                코멘트 (선택사항)
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
