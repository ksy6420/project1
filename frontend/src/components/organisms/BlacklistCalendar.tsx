import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import {
  format,
  startOfWeek,
  isAfter,
  getYear,
  getMonth,
  setYear,
  setMonth,
} from 'date-fns';
import { ko } from 'date-fns/locale';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../config';
import 'react-big-calendar/lib/css/react-big-calendar.css';

const locales = { ko };
const localizer = dateFnsLocalizer({
  format,
  startOfWeek,
  getDay: (date: Date) => date.getDay(),
  locales,
});

const getTodayString = () => {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
};

interface CalendarEvent {
  title: string;
  start: Date;
  end: Date;
  color?: string;
}

interface CustomEventProps {
  event: CalendarEvent;
}

function EventComponent({ event }: CustomEventProps) {
  return (
    <div
      className="px-1.5 py-0.5 text-[11px] text-white rounded truncate font-medium shadow-sm"
      style={{ backgroundColor: event.color || '#9ca3af' }}
      title={event.title}
    >
      {event.title}
    </div>
  );
}

interface BlacklistCalendarProps {
  dateValue: string;
  ipSearchResult: { found: boolean; dates: string[] } | null;
  onDateSelect: (dateStr: string) => void;
  onNavigate: (date: Date) => void;
  theme: 'dark' | 'light';
  events?: CalendarEvent[];
}

export function BlacklistCalendar({
  dateValue,
  ipSearchResult,
  onDateSelect,
  onNavigate,
  theme,
  events = [],
}: BlacklistCalendarProps) {
  const currentDate = new Date(dateValue + 'T00:00:00');
  const currentYear = getYear(currentDate);
  const currentMonth = getMonth(currentDate);
  const [blacklistDates, setBlacklistDates] = useState<string[]>([]);

  useEffect(() => {
    const fetchDates = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/ip/blacklist/dates`, {
          params: { year: currentYear, month: currentMonth + 1 },
        });
        setBlacklistDates(res.data.dates || []);
      } catch {
        setBlacklistDates([]);
      }
    };
    fetchDates();
  }, [currentYear, currentMonth]);

  const handleYearChange = (year: number) => {
    const nextDate = setYear(currentDate, year);
    onNavigate(nextDate);
  };

  const handleMonthChange = (monthIdx: number) => {
    const nextDate = setMonth(currentDate, monthIdx);
    onNavigate(nextDate);
  };

  return (
    <div
      className={`rounded-lg border p-6 transition-colors w-full max-w-5xl mx-auto ${
        theme === 'dark'
          ? 'bg-[#111827] border-gray-800/90'
          : 'bg-white border-gray-200'
      }`}
    >
      <div className="flex justify-center items-center gap-6 mb-6 text-lg font-semibold">
        <button
          onClick={() => handleYearChange(currentYear - 1)}
          className="text-gray-400 hover:text-blue-500"
        >
          ◀
        </button>
        <button
          onClick={() => handleYearChange(currentYear - 1)}
          className="text-gray-400 text-sm font-normal"
        >
          {currentYear - 1}
        </button>
        <span className="bg-blue-600 text-white px-5 py-1 rounded text-base font-bold shadow-md">
          {currentYear}
        </span>
        <button
          onClick={() => handleYearChange(currentYear + 1)}
          className="text-gray-400 text-sm font-normal"
        >
          {currentYear + 1}
        </button>
        <button
          onClick={() => handleYearChange(currentYear + 1)}
          className="text-gray-400 hover:text-blue-500"
        >
          ▶
        </button>
      </div>

      <div className="flex justify-between items-center bg-gray-50 dark:bg-gray-800 p-2 border border-gray-100 rounded-lg mb-6">
        {Array.from({ length: 12 }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => handleMonthChange(idx)}
            className={`w-10 h-10 flex items-center justify-center text-sm font-medium rounded-full transition-all ${
              currentMonth === idx
                ? 'bg-blue-500 text-white shadow-sm'
                : 'text-gray-500 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {idx + 1}월
          </button>
        ))}
      </div>

      <div className="custom-calendar-container">
        <Calendar
          localizer={localizer}
          views={['month']}
          selectable
          events={events}
          onSelectSlot={({ start }: { start: Date }) => {
            const dateStr = format(start, 'yyyy-MM-dd');
            if (isAfter(start, new Date()) && dateStr !== getTodayString())
              return;
            onDateSelect(dateStr);
          }}
          dayPropGetter={(date: Date) => {
            const dateStr = format(date, 'yyyy-MM-dd');
            const isIpMarked = ipSearchResult?.dates?.includes(dateStr);
            const hasBlacklist = blacklistDates.includes(dateStr);
            const isSelected = dateStr === dateValue;
            if (isIpMarked) return { className: 'ip-marked-date' };
            if (hasBlacklist) return { className: 'blacklist-date' };
            if (isSelected) return { className: 'selected-date' };
            return {};
          }}
          components={{
            event: EventComponent,
          }}
          date={currentDate}
          onNavigate={onNavigate}
          toolbar={false}
          className="rbc-calendar-custom"
          formats={{
            weekdayFormat: (date: Date, culture?: string, localizer?: { format: (date: Date, formatStr: string, culture?: string) => string }) =>
              localizer?.format(date, 'EEE', culture) ?? '',
          }}
          style={{ height: 400 }}
        />
      </div>
    </div>
  );
}