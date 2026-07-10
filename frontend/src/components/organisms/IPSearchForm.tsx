import { useState, type FormEvent } from 'react';
import { InputField } from '../atoms/InputField';
import { Button } from '../atoms/Button';
import { Search, RefreshCw } from 'lucide-react';

interface IPSearchFormProps {
  onSearch: (ip: string) => void;
  isLoading: boolean;
  initialIp?: string;
}

export function IPSearchForm({
  onSearch,
  isLoading,
  initialIp = '',
}: IPSearchFormProps) {
  const [ipInput, setIpInput] = useState(initialIp);
  const [error, setError] = useState('');

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

  return (
    <section className="bg-[#111827] rounded-xl border border-gray-800/90 px-4 py-3 shadow-xl">
      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 items-stretch"
      >
        <div className="flex-1">
          <InputField
            label=""
            icon={Search}
            type="text"
            value={ipInput}
            onChange={(e) => setIpInput(e.target.value)}
            placeholder="IP 주소 입력 (예: 1.1.1.1)"
            required
            error={error}
          />
        </div>

        <div className="flex items-end">
          <Button
            type="submit"
            variant="orange"
            disabled={isLoading}
            className="w-full sm:w-auto h-[46px] px-8 hover:!bg-[#EA580C] !text-white !font-bold !rounded-lg !border-none transition-all duration-200 active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>분석 중...</span>
              </>
            ) : (
              <>
                <Search className="w-4 h-4" />
                <span>검색</span>
              </>
            )}
          </Button>
        </div>
      </form>
    </section>
  );
}
