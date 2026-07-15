import { Link } from 'react-router-dom';
import { Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

// =========================================================================
// UI Style Mapper (비즈니스 로직과 스타일 설정 클래스의 명확한 분리)
// =========================================================================
const getThemeStyles = (theme: 'light' | 'dark') => {
  const isDark = theme === 'dark';
  return {
    nav: isDark
      ? 'bg-[#222c36] border-[#2d3945]'
      : 'bg-[#f8f8f8] border-[#e7e7e7]',
    textMuted: 'text-[#999999]',
    textHover: isDark ? 'hover:text-white' : 'hover:text-[#333333]',
    themeBtn: isDark
      ? 'text-gray-400 hover:text-white hover:bg-gray-800'
      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100',
  };
};

export function Nav() {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navItems = [
    { label: 'Blacklist', path: '/blacklist' },
    { label: 'Report IP', path: '/report' },
    { label: 'API Key', path: '/register-api' },
  ];

  const styles = getThemeStyles(theme);

  return (
    <nav
      className={`sticky top-0 z-50 border-b transition-colors duration-200 ${styles.nav}`}
    >
      {/* 
        max-w-7xl, mx-auto, px-4 를 활용해 전체 가로폭을 잡고,
        flex items-center justify-between으로 좌우 구역을 1열 배정합니다.
      */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* [좌측 영역]: 로고 및 상시 노출 네비게이션 */}
        <div className="flex items-center gap-6">
          <Link
            to="/"
            className="flex items-center text-lg font-bold tracking-wider text-[#4e7e14] no-underline transition-colors"
          >
            PacketCYBER ThreatIP
          </Link>

          <nav className="flex items-center gap-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`text-[14px] font-normal px-3 py-2 rounded-md transition-colors ${styles.textMuted} ${styles.textHover}`}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* [우측 영역]: 인증 버튼 그룹 및 테마 토글 */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            {user ? (
              <>
                <span
                  className={`text-[14px] font-normal mr-2 ${styles.textMuted}`}
                >
                  {user.userName}
                </span>
                <Link
                  to="/login"
                  onClick={logout}
                  className={`text-[14px] font-normal px-3 py-2 transition-colors ${styles.textMuted} ${styles.textHover}`}
                >
                  Logout
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className={`text-[14px] font-normal px-3 py-2 transition-colors ${styles.textMuted} ${styles.textHover}`}
                >
                  Login
                </Link>
                <Link
                  to="/signup"
                  className="text-[14px] font-medium rounded-md text-white transition-colors bg-[#007bff] hover:bg-[#0069d9] px-[14px] py-[6px]"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* 테마 토글 버튼 */}
          <button
            onClick={toggleTheme}
            className={`p-2 rounded-lg transition-colors ${styles.themeBtn}`}
            title={
              theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'
            }
          >
            {theme === 'dark' ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </nav>
  );
}
