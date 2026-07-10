import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function Header() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="border-b border-gray-800 bg-[#0F1626] px-6 py-3 flex items-center justify-between sticky top-0 z-50 shadow-md">
      <div className="flex items-center gap-6">
        <span className="font-extrabold text-lg text-white tracking-wider">
          PCyber
        </span>

        <nav className="flex items-center gap-3">
          <button
            onClick={() => navigate('/dashboard')}
            className="px-3.5 py-1.5 rounded-md text-blue-400 bg-blue-500/8 border border-blue-500/20 flex items-center gap-1.5 select-none text-xs font-semibold cursor-pointer hover:bg-blue-500/15 transition-colors"
          >
            실시간 IP 검사
          </button>

          <button
            onClick={() => navigate('/blacklist')}
            className="px-3.5 py-1.5 rounded-md text-blue-400 bg-blue-500/8 border border-blue-500/20 flex items-center gap-1.5 select-none text-xs font-semibold cursor-pointer hover:bg-blue-500/15 transition-colors"
          >
            날짜별 검색
          </button>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 pr-3 border-r border-gray-700/60">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center font-bold text-xs text-white shadow-sm">
            {user?.userName?.slice(0, 2).toUpperCase() || (
              <User className="w-3.5 h-3.5" />
            )}
          </div>
          <div className="hidden sm:block text-left leading-tight">
            <span className="block text-[11px] text-gray-400">
              {user?.userName || '사용자'}
            </span>
            <span className="block text-xs font-semibold text-gray-200">
              {user?.userId || 'unknown'}
            </span>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-colors"
          title="로그아웃"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">로그아웃</span>
        </button>
      </div>
    </header>
  );
}
