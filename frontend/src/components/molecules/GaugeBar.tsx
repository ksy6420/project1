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
      <div className={`w-full rounded-full h-3 overflow-hidden mb-1.5 ${
        theme === 'dark' ? 'bg-gray-900' : 'bg-gray-200'
      }`}>
        <div
          className={`h-full transition-all duration-1000 rounded-full ${barColor}`}
          style={{ width: `${score}%` }}
        />
      </div>
      <div className={`flex justify-between w-full text-xs font-medium ${
        theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
      }`}>
        <span>0% (Safe)</span>
        <span>50%</span>
        <span>100% (High Danger)</span>
      </div>
    </div>
  );
}
