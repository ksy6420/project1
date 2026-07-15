import { useId, type InputHTMLAttributes, type ComponentType } from 'react';
import { useTheme } from '../../context/ThemeContext';

interface InputFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  icon?: ComponentType<{ className?: string }>;
  error?: string;
}

export function InputField({
  label,
  icon: Icon,
  type = 'text',
  value,
  onChange,
  placeholder,
  required,
  className = '',
  error,
  id,
  ...props
}: InputFieldProps) {
  const generatedId = useId();
  const inputId = id || generatedId;
  const { theme } = useTheme();

  return (
    <div className="flex flex-col gap-2 text-left w-full">
      {label && (
        <label
          htmlFor={inputId}
          className={`text-sm font-semibold tracking-wide ${
            theme === 'dark' ? 'text-gray-400' : 'text-gray-600'
          }`}
        >
          {label} {required && <span className="text-[#e74c3c]">*</span>}
        </label>
      )}
      <div className="relative w-full flex items-center">
        {Icon && (
          <div className={`absolute left-3.5 pointer-events-none flex items-center justify-center ${
            theme === 'dark' ? 'text-gray-500' : 'text-gray-400'
          }`}>
            <Icon className="h-5 w-5" />
          </div>
        )}
        <input
          id={inputId}
          type={type}
          value={value}
          onChange={onChange}
          required={required}
          placeholder={placeholder}
          className={`w-full py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 rounded-lg text-sm transition-all outline-none ${
            theme === 'dark'
              ? 'bg-[#161b26] border border-gray-700 text-gray-100 placeholder-gray-500'
              : 'bg-white border border-gray-300 text-gray-700 placeholder-gray-400'
          } ${
            error
              ? 'border-red-500'
              : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-[#e74c3c] mt-1">{error}</span>}
    </div>
  );
}
