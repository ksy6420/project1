declare module 'react-big-calendar' {
  import { ComponentType, Ref } from 'react';

  export interface SlotInfo {
    start: Date;
    end: Date;
    slots: Date[];
    action: 'select' | 'click' | 'doubleClick';
    bounds?: { x: number; y: number; width: number; height: number };
    box?: { x: number; y: number };
  }

  export interface CalendarProps {
    localizer: DateLocalizer;
    views?: string[];
    selectable?: boolean;
    onSelectSlot?: (slotInfo: SlotInfo) => void;
    components?: Record<string, ComponentType<any>>;
    date?: Date;
    onNavigate?: (date: Date) => void;
    toolbar?: boolean;
    className?: string;
    [key: string]: any;
  }

  export interface DateLocalizer {
    format: (date: Date, format: string, options?: any) => string;
    startOfWeek: (date: Date) => Date;
    getDay: (date: Date) => number;
    locales: Record<string, any>;
  }

  export function dateFnsLocalizer(config: {
    format: (date: Date, formatStr: string, options?: any) => string;
    startOfWeek: (date: Date) => Date;
    getDay: (date: Date) => number;
    locales: Record<string, any>;
  }): DateLocalizer;

  export const Calendar: ComponentType<CalendarProps>;
}
