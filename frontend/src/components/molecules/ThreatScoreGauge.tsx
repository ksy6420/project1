interface ThreatGaugeProps {
  score: number;
}

export function ThreatScoreGauge({ score }: ThreatGaugeProps) {
  const getTheme = () => {
    if (score >= 75) return { stroke: '#EF4444', text: 'text-red-500' };
    if (score >= 25) return { stroke: '#F59E0B', text: 'text-yellow-500' };
    return { stroke: '#10B981', text: 'text-green-500' };
  };

  const theme = getTheme();
  const radius = 64;
  const strokeWidth = 14;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-[#161D30] rounded-xl border border-gray-800/80">
      <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">
        실시간 위협 점수
      </h3>

      <div className="relative flex items-center justify-center w-40 h-40">
        <svg className="w-full h-full transform -rotate-90">
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="text-gray-800"
            fill="transparent"
            stroke="currentColor"
            strokeWidth={strokeWidth}
          />
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="transition-all duration-1000 ease-out"
            fill="transparent"
            stroke={theme.stroke}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute text-center">
          <span
            className={`text-4xl font-extrabold tracking-tight ${theme.text}`}
          >
            {score}
          </span>
          <p className="text-[10px] text-gray-400 mt-1 uppercase tracking-widest">
            위협 점수
          </p>
        </div>
      </div>

      <div className="w-full mt-6 bg-gray-900 rounded-full h-2.5 overflow-hidden">
        <div
          className="h-full transition-all duration-1000"
          style={{ width: `${score}%`, backgroundColor: theme.stroke }}
        />
      </div>
      <div className="flex justify-between w-full mt-2 text-[11px] font-medium text-gray-400">
        <span>0% (safe)</span>
        <span>50%</span>
        <span>100% (High Danger)</span>
      </div>
    </div>
  );
}
