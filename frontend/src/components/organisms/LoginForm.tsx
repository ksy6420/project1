import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { InputField } from '../atoms/InputField';
import { Button } from '../atoms/Button';
import { Mail, Lock, AlertCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

export function LoginForm() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const { theme } = useTheme();
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const success = await login(email, password);
    if (success) navigate('/dashboard', { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && (
        <div className={`flex items-start gap-2.5 p-3 px-4 rounded-lg text-xs text-left ${
          theme === 'dark'
            ? 'text-red-200 bg-red-500/15 border border-red-500/30'
            : 'text-red-700 bg-red-50 border border-red-200'
        }`}>
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
          <span>{error}</span>
        </div>
      )}

      <InputField
        label="이메일 주소"
        icon={Mail}
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일을 입력하세요"
        required
      />

      <InputField
        label="비밀번호"
        icon={Lock}
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />

      <div className={`flex items-center justify-between w-full text-sm mt-1 ${
        theme === 'dark' ? 'text-gray-400' : 'text-gray-500'
      }`}>
        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input type="checkbox" className="accent-[#e74c3c] w-3.5 h-3.5 cursor-pointer" />
          <span>로그인 유지</span>
        </label>
        <span className="text-[#e74c3c] font-medium">
          비밀번호를 잊으셨나요?
        </span>
      </div>

      <Button type="submit" variant="primary" disabled={loading}>
        {loading ? '인증 처리 중...' : '로그인'}
      </Button>
    </form>
  );
}
