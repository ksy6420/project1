import { useTheme } from '../../context/ThemeContext';

export function Footer() {
  const { theme } = useTheme();

  return (
    <footer className={`border-t py-6 px-6 text-center text-xs mt-auto transition-colors ${
      theme === 'dark'
        ? 'border-gray-800 bg-[#0f1729] text-gray-500'
        : 'border-gray-200 bg-gray-50 text-gray-500'
    }`}>
      <p>
        © 2026 PacketCYBER ThreatIP & Real-time Integration Screen. All
        rights reserved.
      </p>
    </footer>
  );
}
