import { useId, type InputHTMLAttributes, type ComponentType } from 'react';

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

  return (
    <div className="flex flex-col gap-2 text-left w-full">
      {label && (
        <label
          htmlFor={inputId}
          className="text-sm font-semibold text-gray-400 tracking-wide"
        >
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative w-full flex items-center">
        {Icon && (
          <div className="absolute left-3.5 text-gray-500 pointer-events-none flex items-center justify-center">
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
          className={`w-full py-3 ${Icon ? 'pl-10' : 'pl-4'} pr-4 bg-[#161b26] border border-gray-700 rounded-lg text-gray-100 text-sm transition-all outline-none focus:border-blue-600 focus:ring-3 focus:ring-blue-500/20 placeholder-gray-500 ${
            error
              ? 'border-red-500 focus:border-red-500 focus:ring-1 focus:ring-red-500'
              : ''
          } ${className}`}
          {...props}
        />
      </div>
      {error && <span className="text-xs text-red-400 mt-1">{error}</span>}
    </div>
  );
}
