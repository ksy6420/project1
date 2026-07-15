import { useTheme } from '../../context/ThemeContext';

interface GaugeBarProps {
  score: number;
}

export function GaugeBar({ score }: GaugeBarProps) {
  const { theme } = useTheme();

  const barColor =
    score >= 75
      ? 'bg-red-500'
      : score >= 25
        ? 'bg-amber-500'
        : 'bg-emerald-500';

  return (
    <div>
      <div className={`w-full h-8 overflow-hidden ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'} relative`}>
        <div
          className={`h-full transition-all duration-1000 ${barColor} flex items-center justify-center`}
          style={{ width: `${score}%` }}
        >
          <span className="text-white font-bold text-base drop-shadow-lg">
            {score}%
          </span>
        </div>
      </div>
    </div>
  );
}
