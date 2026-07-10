import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { RefreshCw } from 'lucide-react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: 'primary' | 'secondary' | 'orange';
  isLoading?: boolean;
}

export function Button({
  children,
  type = 'button',
  variant = 'primary',
  className = '',
  disabled,
  isLoading = false,
  ...props
}: ButtonProps) {
  const baseClass =
    'flex items-center justify-center gap-2 w-full px-4 py-3 rounded-lg font-semibold text-sm transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none cursor-pointer outline-none';

  const variantClass =
    variant === 'primary'
      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 hover:bg-blue-500'
      : variant === 'secondary'
        ? 'bg-gray-800 text-gray-200 border border-gray-700 hover:bg-gray-700'
        : 'bg-[#F97316] hover:bg-[#EA580C] text-white shadow-lg shadow-orange-500/10 border-none';

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variantClass} ${className}`}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <RefreshCw className="w-4 h-4 animate-spin text-current" />
          처리 중...
        </span>
      ) : (
        children
      )}
    </button>
  );
}
