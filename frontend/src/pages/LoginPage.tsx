import { LoginForm } from '../components/organisms/LoginForm';
import { useTheme } from '../context/ThemeContext';

export function LoginPage() {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen flex flex-col justify-center items-center p-6 relative overflow-hidden transition-colors ${
      theme === 'dark' ? 'bg-[#0a0f1a]' : 'bg-gray-100'
    }`}>
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[550px] rounded-full pointer-events-none z-0"
        style={{
          background: theme === 'dark'
            ? 'radial-gradient(circle, rgba(231, 76, 60, 0.1) 0%, rgba(10, 15, 26, 0) 70%)'
            : 'radial-gradient(circle, rgba(231, 76, 60, 0.08) 0%, rgba(241, 245, 249, 0) 70%)',
        }}
      />

      <div className={`w-full max-w-md rounded-2xl p-11 shadow-2xl z-10 box-border transition-colors ${
        theme === 'dark'
          ? 'bg-[#111827] border border-gray-700/80'
          : 'bg-white border border-gray-200'
      }`}>
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className={`text-3xl font-extrabold tracking-wide ${
              theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>
              PacketCYBER ThreatIP
            </span>
          </div>
        </div>

        <LoginForm />
      </div>
    </div>
  );
}
