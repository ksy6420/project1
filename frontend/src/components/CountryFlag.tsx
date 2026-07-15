import React from 'react';
import * as Flags from 'country-flag-icons/react/3x2';
import { hasFlag } from 'country-flag-icons';

interface CountryFlagProps {
  countryCode: string;
  className?: string;
}

const CountryFlag: React.FC<CountryFlagProps> = ({
  countryCode,
  className = '',
}) => {
  const upperCode = countryCode.toUpperCase();

  // 올바른 ISO 2자리 국가 코드인지 체크 (스켈레톤 fallback)
  if (!upperCode || !hasFlag(upperCode)) {
    return (
      <span
        className={`inline-block w-[1.5em] h-[1em] bg-gray-200/50 rounded-sm shrink-0 ${className}`}
      />
    );
  }

  const FlagComponent = Flags[upperCode as keyof typeof Flags];

  return (
    <span
      className={`
        inline-flex 
        items-center 
        shrink-0 
        overflow-hidden 
        rounded-[3px] 
        shadow-sm 
        border 
        border-gray-200/10 
        w-[1em] 
        ${className}
      `}
    >
      <FlagComponent />
    </span>
  );
};

export default CountryFlag;
