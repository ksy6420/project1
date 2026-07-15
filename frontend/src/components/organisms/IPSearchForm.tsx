import { useState, type FormEvent } from 'react';
import { InputField } from '../atoms/InputField';
import { Button } from '../atoms/Button';
import { Search, RefreshCw } from 'lucide-react';

interface IPSearchFormProps {
  onSearch: (ip: string) => void;
  isLoading: boolean;
  defaultIp?: string;
  variant?: 'full' | 'inline';
}

export function IPSearchForm({
  onSearch,
  isLoading,
  defaultIp = '',
  variant = 'full',
}: IPSearchFormProps) {
  const [ipInput, setIpInput] = useState(defaultIp);
  const [error, setError] = useState('');
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    setIpInput('');
    setError('');
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const ipPattern =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    if (!ipInput.trim()) {
      setError('검색할 IP 주소를 입력해 주세요.');
      return;
    }
    if (!ipPattern.test(ipInput.trim())) {
      setError('올바른 IPv4 형식으로 입력해 주세요. (예: 1.1.1.1)');
      return;
    }

    setError('');
    onSearch(ipInput.trim());
  };

  const renderInline = () => (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 w-full max-w-md"
    >
      <div className="flex-1 min-w-0">
        <InputField
          label=""
          icon={Search}
          type="text"
          value={ipInput}
          onChange={(e) => setIpInput(e.target.value)}
          onFocus={handleFocus}
          placeholder=""
          required
          error={error}
          className="!h-[40px]"
        />
      </div>
      <Button
        type="submit"
        variant="primary"
        disabled={isLoading}
        className="!h-[40px] !w-[70px] !shrink-0 !px-0 !bg-[#f97316] hover:!bg-[#ea580c] !text-white !font-bold !rounded-lg !border-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm whitespace-nowrap"
      >
        {isLoading ? (
          <RefreshCw className="w-4 h-4 animate-spin" />
        ) : (
          <span>Check</span>
        )}
      </Button>
    </form>
  );

  const renderFull = () => (
    <section
      className="shadow-xl transition-colors overflow-hidden"
      style={{
        background: '#4e7e14',
        borderTopLeftRadius: '.5em',
        borderTopRightRadius: '.5em',
        color: '#e3ecd8',
        height: 'auto',
        margin: '7px 0 0',
        padding: '1em',
      }}
    >
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-2 sm:gap-0 items-stretch sm:items-center"
      >
        <span
          className="font-semibold text-base whitespace-nowrap self-center sm:mr-4"
          style={{ color: '#e3ecd8' }}
        >
          Check an IP Address
        </span>
        <div className="flex items-center w-full">
          <div className="flex-1 min-w-0">
            <InputField
              label=""
              icon={Search}
              type="text"
              value={ipInput}
              onChange={(e) => setIpInput(e.target.value)}
              onFocus={handleFocus}
              placeholder={focused ? defaultIp : 'IP 주소 입력 (예: 1.1.1.1)'}
              required
              error={error}
              className="!rounded-r-none !h-[40px] !pr-0 !border-r-0"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={isLoading}
            className="!h-[40px] !w-[70px] !shrink-0 !px-0 !bg-[#f97316] hover:!bg-[#ea580c] !text-white !font-bold !rounded-l-none !rounded-r-lg !border-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center text-sm whitespace-nowrap"
          >
            {isLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <span>Check</span>
            )}
          </Button>
        </div>
      </form>
    </section>
  );

  return variant === 'inline' ? renderInline() : renderFull();
}
