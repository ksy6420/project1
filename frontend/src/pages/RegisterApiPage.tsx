import { Footer } from '../components/layout/Footer';
import { useTheme } from '../context/ThemeContext';
import { KeyRound } from 'lucide-react';

export function RegisterApiPage() {
  const { theme } = useTheme();

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
            <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <KeyRound className="w-6 h-6 text-blue-500" />
            </div>
            <div>
              <h1
                className={`text-2xl font-bold ${
                  theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}
              >
                Register for API Key
              </h1>
              <p
                className={`text-sm ${
                  theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
                }`}
              >
                API 키를 발급받아 프로그래밍 방식으로 데이터를 활용하세요.
              </p>
            </div>
          </div>

          <div
            className={`p-6 rounded-lg ${
              theme === 'dark' ? 'bg-gray-800/50' : 'bg-gray-50'
            }`}
          >
            <p
              className={`text-sm ${
                theme === 'dark' ? 'text-gray-300' : 'text-gray-600'
              }`}
            >
              이 기능은 곧 추가될 예정입니다.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
