import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  Clock,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Sparkles,
  BookOpen,
  Bell,
  Sun,
  AlertCircle,
  CheckCircle2,
  MapPin,
  SlidersHorizontal,
  Info,
  X,
  ArrowRight,
} from 'lucide-react';
import {
  AcademicYearRecord,
  AcademicTermInfo,
  TimetableSlotItem,
  dataLayer,
} from '../services/dataLayer.ts';

export type CalendarViewMode = 'month' | 'week' | 'day' | 'agenda';

interface CalendarEventItem {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time?: string;
  type: 'milestone' | 'holiday' | 'pause' | 'lesson' | 'notice' | 'assessment';
  details?: string;
  color?: string;
  grade?: string;
  subject?: string;
  room?: string;
}

interface SchoolCalendarViewProps {
  activeAcademicYear: AcademicYearRecord | null;
  termInfo: AcademicTermInfo;
  storedTimetableSlots: TimetableSlotItem[];
  todayDayName: string;
  todayIsoDate: string;
  upcomingEvents: Array<{
    id: string;
    title: string;
    date: string;
    displayDate: string;
    type: string;
    details: string;
    targetNav: any;
  }>;
  onNavigateTab: (tab: any) => void;
}

export const SchoolCalendarView: React.FC<SchoolCalendarViewProps> = ({
  activeAcademicYear,
  termInfo,
  storedTimetableSlots,
  todayDayName,
  todayIsoDate,
  upcomingEvents,
  onNavigateTab,
}) => {
  // ---------------------------------------------------------------------------
  // 1. REAL LIVE TIME CLOCK (UPDATES EVERY SECOND - GOOGLE CALENDAR STYLE)
  // ---------------------------------------------------------------------------
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [timeZoneName, setTimeZoneName] = useState<string>('EAT (UTC+3)');

  useEffect(() => {
    // Determine local timezone
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) {
        setTimeZoneName(tz.includes('Nairobi') ? 'EAT (UTC+3)' : tz);
      }
    } catch {
      setTimeZoneName('EAT (UTC+3)');
    }

    const timer = setInterval(() => {
      setCurrentDate(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Formatted clock components
  const liveClockString = useMemo(() => {
    return currentDate.toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  }, [currentDate]);

  const liveDateString = useMemo(() => {
    return currentDate.toLocaleDateString('en-GB', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [currentDate]);

  // Current school session status based on real hour
  const schoolStatus = useMemo(() => {
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const currentMin = hours * 60 + minutes;
    const day = currentDate.getDay(); // 0 = Sun, 6 = Sat

    if (day === 0 || day === 6) {
      return {
        label: 'Weekend • Campus Closed',
        color: 'text-slate-400 bg-slate-800/80 border-slate-700',
        dot: 'bg-slate-400',
      };
    }

    // Mon-Fri: 07:00 - 08:00 (Prep / Assembly)
    if (currentMin >= 420 && currentMin < 480) {
      return {
        label: 'Morning Prep & Assembly',
        color: 'text-cyan-300 bg-cyan-950/60 border-cyan-800/50',
        dot: 'bg-cyan-400 animate-pulse',
      };
    }
    // 08:00 - 13:00 (Morning Lessons)
    if (currentMin >= 480 && currentMin < 780) {
      return {
        label: 'School In Session • Morning Classes',
        color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50',
        dot: 'bg-emerald-400 animate-ping',
      };
    }
    // 13:00 - 14:00 (Lunch Break)
    if (currentMin >= 780 && currentMin < 840) {
      return {
        label: 'Lunch Break & Play',
        color: 'text-amber-300 bg-amber-950/60 border-amber-800/50',
        dot: 'bg-amber-400',
      };
    }
    // 14:00 - 16:30 (Afternoon Lessons)
    if (currentMin >= 840 && currentMin < 990) {
      return {
        label: 'School In Session • Afternoon Classes',
        color: 'text-emerald-300 bg-emerald-950/60 border-emerald-800/50',
        dot: 'bg-emerald-400 animate-ping',
      };
    }
    // 16:30 - 18:00 (Games / Extracurricular)
    if (currentMin >= 990 && currentMin < 1080) {
      return {
        label: 'Co-Curricular Activities & Games',
        color: 'text-purple-300 bg-purple-950/60 border-purple-800/50',
        dot: 'bg-purple-400 animate-pulse',
      };
    }
    // After 18:00
    return {
      label: 'Campus Closed • After Hours',
      color: 'text-slate-400 bg-slate-800/80 border-slate-700',
      dot: 'bg-slate-400',
    };
  }, [currentDate]);

  // ---------------------------------------------------------------------------
  // 2. CALENDAR NAVIGATION STATE (MONTH / YEAR / VIEW MODE)
  // ---------------------------------------------------------------------------
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');
  const [navDate, setNavDate] = useState<Date>(() => new Date());
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [selectedDayDrawerOpen, setSelectedDayDrawerOpen] = useState<boolean>(false);

  // Month & Year of currently navigated calendar
  const currentNavYear = navDate.getFullYear();
  const currentNavMonth = navDate.getMonth(); // 0-indexed (0 = Jan)

  const monthName = useMemo(() => {
    return navDate.toLocaleDateString('en-GB', { month: 'long', year: 'numeric' });
  }, [navDate]);

  // Quick navigation handlers
  const handlePrevMonth = () => {
    setNavDate(new Date(currentNavYear, currentNavMonth - 1, 1));
  };

  const handleNextMonth = () => {
    setNavDate(new Date(currentNavYear, currentNavMonth + 1, 1));
  };

  const handleTodayJump = () => {
    const today = new Date();
    setNavDate(today);
    setSelectedDate(today);
  };

  // ---------------------------------------------------------------------------
  // 3. MAP REAL EVENTS & TIMETABLE SLOTS TO CALENDAR DATES
  // ---------------------------------------------------------------------------
  const calendarEvents = useMemo(() => {
    const map = new Map<string, CalendarEventItem[]>();

    const addEvent = (dateStr: string, item: CalendarEventItem) => {
      const existing = map.get(dateStr) || [];
      existing.push(item);
      map.set(dateStr, existing);
    };

    // 1. Term open & close dates from activeAcademicYear or dataLayer
    if (activeAcademicYear?.terms) {
      activeAcademicYear.terms.forEach((t) => {
        if (t.openDate) {
          addEvent(t.openDate, {
            id: `term_open_${t.term}`,
            title: `${t.term} Opening Day`,
            date: t.openDate,
            type: 'milestone',
            color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            details: `Official commencement of ${t.term} for Little Roses Academy`,
          });
        }
        if (t.closeDate) {
          addEvent(t.closeDate, {
            id: `term_close_${t.term}`,
            title: `${t.term} Closing Day`,
            date: t.closeDate,
            type: 'milestone',
            color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            details: `End of ${t.term} and commencement of school holidays`,
          });
        }
        if (t.halfTermStart) {
          addEvent(t.halfTermStart, {
            id: `half_term_${t.term}`,
            title: `${t.term} Mid-Term Break`,
            date: t.halfTermStart,
            type: 'pause',
            color: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            details: `Mid-term break until ${t.halfTermEnd || t.halfTermStart}`,
          });
        }
      });
    }

    // 2. Official holidays
    if (activeAcademicYear?.holidays) {
      activeAcademicYear.holidays.forEach((h) => {
        if (h.startDate) {
          addEvent(h.startDate, {
            id: `holiday_${h.id}`,
            title: h.name,
            date: h.startDate,
            type: 'holiday',
            color: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
            details: `Public Holiday • School Closed (${h.startDate}${h.endDate !== h.startDate ? ' to ' + h.endDate : ''})`,
          });
        }
      });
    }

    // 3. Activity Pauses
    const termDatesConfig = dataLayer.getTermDates();
    if (termDatesConfig?.activityPauses) {
      termDatesConfig.activityPauses.forEach((p) => {
        if (p.startDate) {
          addEvent(p.startDate, {
            id: `pause_${p.id}`,
            title: p.reason || 'Activity Pause',
            date: p.startDate,
            type: 'pause',
            color: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
            details: `Scheduled activity pause until ${p.endDate}`,
          });
        }
      });
    }

    // 4. Assignments / Assessments
    const assignments = dataLayer.getAssignments({ approvedOnly: true });
    assignments.forEach((a) => {
      if (a.dueDate) {
        addEvent(a.dueDate, {
          id: `asg_${a.id}`,
          title: `${a.subject}: ${a.title}`,
          date: a.dueDate,
          type: 'assessment',
          grade: a.grade,
          subject: a.subject,
          color: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
          details: `${a.grade} assessment submission deadline`,
        });
      }
    });

    // 5. School Notices for specific dates
    try {
      const savedNotices = localStorage.getItem('lra_school_notices');
      if (savedNotices) {
        const notices = JSON.parse(savedNotices);
        if (Array.isArray(notices)) {
          notices.forEach((n: any) => {
            if (n.date) {
              addEvent(n.date, {
                id: `notice_${n.id}`,
                title: n.title,
                date: n.date,
                type: 'notice',
                color: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
                details: n.content || n.title,
              });
            }
          });
        }
      }
    } catch {}

    return map;
  }, [activeAcademicYear]);

  // Timetable lessons mapped by day name ("Monday", "Tuesday", etc.)
  const timetableByDay = useMemo(() => {
    const map = new Map<string, TimetableSlotItem[]>();
    storedTimetableSlots.forEach((slot) => {
      if (slot.day) {
        const key = slot.day.toLowerCase();
        const existing = map.get(key) || [];
        existing.push(slot);
        map.set(key, existing);
      }
    });
    return map;
  }, [storedTimetableSlots]);

  // ---------------------------------------------------------------------------
  // 4. MONTH GRID CALCULATION (GOOGLE CALENDAR 7-COLUMN MATRIX)
  // ---------------------------------------------------------------------------
  interface CalendarDayCell {
    date: Date;
    dateString: string; // YYYY-MM-DD
    dayNumber: number;
    isCurrentMonth: boolean;
    isToday: boolean;
    isSelected: boolean;
    isWeekend: boolean;
    dayName: string;
    events: CalendarEventItem[];
    timetableSlots: TimetableSlotItem[];
  }

  const calendarGrid = useMemo(() => {
    const cells: CalendarDayCell[] = [];
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDate = today.getDate();

    const firstDayOfMonth = new Date(currentNavYear, currentNavMonth, 1);
    const lastDayOfMonth = new Date(currentNavYear, currentNavMonth + 1, 0);

    // Day of the week for the 1st of this month: 0 (Sun) to 6 (Sat)
    const firstDayIndex = firstDayOfMonth.getDay();
    const totalDaysInMonth = lastDayOfMonth.getDate();

    // Previous month trailing days
    const prevMonthLastDate = new Date(currentNavYear, currentNavMonth, 0).getDate();
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = prevMonthLastDate - i;
      const dateObj = new Date(currentNavYear, currentNavMonth - 1, d);
      const isoStr = dateObj.toISOString().split('T')[0];
      const dayOfWeek = dateObj.getDay();
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      cells.push({
        date: dateObj,
        dateString: isoStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday:
          dateObj.getFullYear() === todayYear &&
          dateObj.getMonth() === todayMonth &&
          dateObj.getDate() === todayDate,
        isSelected:
          selectedDate &&
          dateObj.getFullYear() === selectedDate.getFullYear() &&
          dateObj.getMonth() === selectedDate.getMonth() &&
          dateObj.getDate() === selectedDate.getDate(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        dayName,
        events: calendarEvents.get(isoStr) || [],
        timetableSlots: timetableByDay.get(dayName) || [],
      });
    }

    // Current month days
    for (let d = 1; d <= totalDaysInMonth; d++) {
      const dateObj = new Date(currentNavYear, currentNavMonth, d);
      const isoStr = `${currentNavYear}-${String(currentNavMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const dayOfWeek = dateObj.getDay();
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      cells.push({
        date: dateObj,
        dateString: isoStr,
        dayNumber: d,
        isCurrentMonth: true,
        isToday:
          dateObj.getFullYear() === todayYear &&
          dateObj.getMonth() === todayMonth &&
          dateObj.getDate() === todayDate,
        isSelected:
          selectedDate &&
          dateObj.getFullYear() === selectedDate.getFullYear() &&
          dateObj.getMonth() === selectedDate.getMonth() &&
          dateObj.getDate() === selectedDate.getDate(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        dayName,
        events: calendarEvents.get(isoStr) || [],
        timetableSlots: timetableByDay.get(dayName) || [],
      });
    }

    // Trailing days from next month to fill complete 35 or 42 grid cells
    const remainingCells = (7 - (cells.length % 7)) % 7;
    const targetLength = cells.length + remainingCells < 35 ? 35 : cells.length + remainingCells;
    const additionalNeeded = targetLength - cells.length;

    for (let d = 1; d <= additionalNeeded; d++) {
      const dateObj = new Date(currentNavYear, currentNavMonth + 1, d);
      const isoStr = dateObj.toISOString().split('T')[0];
      const dayOfWeek = dateObj.getDay();
      const dayName = dateObj.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();

      cells.push({
        date: dateObj,
        dateString: isoStr,
        dayNumber: d,
        isCurrentMonth: false,
        isToday:
          dateObj.getFullYear() === todayYear &&
          dateObj.getMonth() === todayMonth &&
          dateObj.getDate() === todayDate,
        isSelected:
          selectedDate &&
          dateObj.getFullYear() === selectedDate.getFullYear() &&
          dateObj.getMonth() === selectedDate.getMonth() &&
          dateObj.getDate() === selectedDate.getDate(),
        isWeekend: dayOfWeek === 0 || dayOfWeek === 6,
        dayName,
        events: calendarEvents.get(isoStr) || [],
        timetableSlots: timetableByDay.get(dayName) || [],
      });
    }

    return cells;
  }, [currentNavYear, currentNavMonth, selectedDate, calendarEvents, timetableByDay]);

  // Selected date details
  const selectedDateIso = useMemo(() => {
    return `${selectedDate.getFullYear()}-${String(selectedDate.getMonth() + 1).padStart(2, '0')}-${String(selectedDate.getDate()).padStart(2, '0')}`;
  }, [selectedDate]);

  const selectedDateEvents = useMemo(() => {
    return calendarEvents.get(selectedDateIso) || [];
  }, [calendarEvents, selectedDateIso]);

  const selectedDateDayName = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  }, [selectedDate]);

  const selectedDateTimetable = useMemo(() => {
    return timetableByDay.get(selectedDateDayName) || [];
  }, [timetableByDay, selectedDateDayName]);

  const isSelectedDateToday = useMemo(() => {
    const today = new Date();
    return (
      selectedDate.getFullYear() === today.getFullYear() &&
      selectedDate.getMonth() === today.getMonth() &&
      selectedDate.getDate() === today.getDate()
    );
  }, [selectedDate]);

  // Handle cell click
  const handleSelectDay = (cell: CalendarDayCell) => {
    setSelectedDate(cell.date);
    if (!cell.isCurrentMonth) {
      setNavDate(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
    }
    setSelectedDayDrawerOpen(true);
  };

  // Google Calendar red line current-time position for Week/Day view (08:00 - 17:00)
  const currentMinuteRatio = useMemo(() => {
    const hours = currentDate.getHours();
    const minutes = currentDate.getMinutes();
    const startHour = 8;
    const endHour = 17;
    const totalMinutes = (endHour - startHour) * 60;
    const currentFromStart = (hours - startHour) * 60 + minutes;

    if (currentFromStart < 0) return 0;
    if (currentFromStart > totalMinutes) return 100;
    return (currentFromStart / totalMinutes) * 100;
  }, [currentDate]);

  const isCurrentTimeInSchoolHours = useMemo(() => {
    const hours = currentDate.getHours();
    return hours >= 8 && hours < 17;
  }, [currentDate]);

  const dayHeaders = ['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'];

  return (
    <div className="space-y-4">
      {/* -------------------------------------------------------------
          TOP BAR: GOOGLE CALENDAR HEADER & REAL-TIME CLOCK
          ------------------------------------------------------------- */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#080E24] shadow-xl">
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
          
          {/* LEFT: Google Calendar Navigation */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Today Button (Google Calendar Signature) */}
            <button
              onClick={handleTodayJump}
              className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center gap-1.5 shadow-sm active:scale-95"
              title="Jump to today's date"
            >
              <CalendarDays className="w-3.5 h-3.5 text-blue-400" />
              <span>Today</span>
            </button>

            {/* Navigation Arrows */}
            <div className="flex items-center rounded-xl border border-slate-800 bg-slate-900/90 p-0.5">
              <button
                onClick={handlePrevMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Previous month"
                aria-label="Previous month"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                title="Next month"
                aria-label="Next month"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month & Year Title */}
            <div>
              <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                <span>{monthName}</span>
                {activeAcademicYear && (
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30 font-medium">
                    {activeAcademicYear.year} CBC
                  </span>
                )}
              </h2>
            </div>
          </div>

          {/* CENTER / RIGHT: REAL-TIME TIME CLOCK (GOOGLE CALENDAR TICKING CLOCK) */}
          <div className="flex flex-wrap items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800/80">
            {/* Live Time Clock Widget */}
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner">
              <div className="relative flex items-center justify-center">
                <Clock className="w-4 h-4 text-emerald-400" />
                <span className="absolute -top-0.5 -right-0.5 w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono text-sm sm:text-base font-black text-white tracking-wider">
                    {liveClockString}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-semibold">
                    {timeZoneName}
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${schoolStatus.dot}`} />
                  <span className="text-[10px] text-slate-300 font-medium truncate max-w-[200px] sm:max-w-none">
                    {schoolStatus.label}
                  </span>
                </div>
              </div>
            </div>

            {/* View Mode Switcher (Google Calendar Segmented Control) */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950/80 border border-slate-800 text-xs font-semibold">
              <button
                onClick={() => setViewMode('month')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'month'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Month
              </button>
              <button
                onClick={() => setViewMode('week')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'week'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Week
              </button>
              <button
                onClick={() => setViewMode('day')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'day'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setViewMode('agenda')}
                className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                  viewMode === 'agenda'
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Agenda
              </button>
            </div>
          </div>
        </div>

        {/* Real Term Vitals Strip */}
        {activeAcademicYear && termInfo?.isConfigured && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold">{termInfo.term}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-300 font-medium">Week {termInfo.weekNumber} of {termInfo.totalWeeks}</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                {termInfo.termStart} to {termInfo.termEnd}
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-400">
                Teaching Days Remaining:{' '}
                <strong className="text-white font-mono">{termInfo.teachingDaysRemaining} Days</strong>
              </span>
              <button
                onClick={() => onNavigateTab('settings')}
                className="text-[11px] text-blue-400 hover:underline cursor-pointer"
              >
                Manage Dates
              </button>
            </div>
          </div>
        )}
      </div>

      {/* -------------------------------------------------------------
          VIEW 1: MONTH GRID (SIGNATURE GOOGLE CALENDAR VIEW)
          ------------------------------------------------------------- */}
      {viewMode === 'month' && (
        <div className="p-3 sm:p-5 rounded-2xl border border-slate-800 bg-[#080E24] shadow-xl overflow-hidden">
          {/* Day of Week Headers (SUN, MON, TUE, WED, THU, FRI, SAT) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2 mb-2 text-center">
            {dayHeaders.map((day, idx) => {
              const isWeekend = idx === 0 || idx === 6;
              return (
                <div
                  key={day}
                  className={`py-2 text-[10px] sm:text-xs font-bold tracking-wider uppercase ${
                    isWeekend ? 'text-slate-500' : 'text-slate-300'
                  }`}
                >
                  {day}
                </div>
              );
            })}
          </div>

          {/* Month Matrix (35 or 42 cells) */}
          <div className="grid grid-cols-7 gap-1 sm:gap-2">
            {calendarGrid.map((cell, idx) => {
              const hasEvents = cell.events.length > 0;
              const hasTimetable = cell.timetableSlots.length > 0;

              return (
                <div
                  key={`${cell.dateString}-${idx}`}
                  onClick={() => handleSelectDay(cell)}
                  className={`min-h-[72px] sm:min-h-[105px] p-1.5 sm:p-2 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group ${
                    cell.isSelected
                      ? 'border-blue-500 bg-blue-950/30 ring-2 ring-blue-500/40'
                      : cell.isCurrentMonth
                      ? 'border-slate-800/80 bg-slate-900/60 hover:bg-slate-800/60 hover:border-slate-700'
                      : 'border-slate-900/50 bg-slate-950/40 opacity-40 hover:opacity-80'
                  }`}
                >
                  {/* Top Row: Day Number & Today Highlight */}
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs font-semibold ${
                        cell.isToday
                          ? 'w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center shadow-md -ml-0.5'
                          : cell.isCurrentMonth
                          ? 'text-slate-200 group-hover:text-white'
                          : 'text-slate-500'
                      }`}
                    >
                      {cell.dayNumber}
                    </span>

                    {/* Indicator dots for mobile */}
                    <div className="flex sm:hidden items-center gap-0.5">
                      {hasEvents && <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />}
                      {hasTimetable && <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />}
                    </div>
                  </div>

                  {/* Desktop Event Pills / Badges (Google Calendar Style) */}
                  <div className="hidden sm:flex flex-col gap-1 mt-1 overflow-hidden">
                    {/* Real Calendar Events */}
                    {cell.events.slice(0, 2).map((evt) => (
                      <div
                        key={evt.id}
                        className={`px-1.5 py-0.5 rounded text-[10px] font-medium truncate border leading-tight ${evt.color || 'bg-blue-500/20 text-blue-300 border-blue-500/30'}`}
                        title={`${evt.title}${evt.details ? ' • ' + evt.details : ''}`}
                      >
                        {evt.title}
                      </div>
                    ))}

                    {/* Real Timetable lessons indicator */}
                    {cell.events.length < 2 && hasTimetable && !cell.isWeekend && (
                      <div
                        className="px-1.5 py-0.5 rounded text-[10px] font-mono font-medium truncate border bg-slate-800/80 text-cyan-300 border-slate-700 leading-tight"
                        title={`${cell.timetableSlots.length} timetable periods allocated for ${cell.dayName}`}
                      >
                        {cell.timetableSlots.length} Periods Scheduled
                      </div>
                    )}

                    {/* +N More indicator */}
                    {cell.events.length > 2 && (
                      <span className="text-[9px] font-semibold text-blue-400 hover:text-blue-300 pl-0.5">
                        +{cell.events.length - 2} more
                      </span>
                    )}
                  </div>

                  {/* Empty state bottom spacer */}
                  {!hasEvents && !hasTimetable && (
                    <div className="hidden sm:block h-3" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 2: WEEK VIEW (GOOGLE CALENDAR 7-DAY WITH LIVE RED TIME LINE)
          ------------------------------------------------------------- */}
      {viewMode === 'week' && (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#080E24] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">Week View (7 Days Schedule)</h3>
              <p className="text-xs text-slate-400">Timetable classes, academic term pacing, and real-time schedule</p>
            </div>
            {isCurrentTimeInSchoolHours && (
              <div className="flex items-center gap-1.5 text-xs text-red-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                <span>Live Time Indicator Active</span>
              </div>
            )}
          </div>

          {/* 7 Columns for Days of Current Week */}
          <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
            {calendarGrid.slice(0, 7).map((dayCell) => {
              const isToday = dayCell.isToday;
              const slots = dayCell.timetableSlots;
              const events = dayCell.events;

              return (
                <div
                  key={dayCell.dateString}
                  onClick={() => handleSelectDay(dayCell)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    dayCell.isSelected
                      ? 'border-blue-500 bg-blue-950/20'
                      : isToday
                      ? 'border-blue-600/80 bg-slate-900/90 ring-1 ring-blue-500/50'
                      : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                    <span className="text-xs font-bold uppercase text-slate-400">
                      {dayCell.dayName.slice(0, 3)}
                    </span>
                    <span
                      className={`text-xs font-bold ${
                        isToday
                          ? 'w-6 h-6 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold'
                          : 'text-slate-200'
                      }`}
                    >
                      {dayCell.dayNumber}
                    </span>
                  </div>

                  {/* Events & Timetable */}
                  <div className="mt-3 space-y-2">
                    {/* Events */}
                    {events.map((evt) => (
                      <div
                        key={evt.id}
                        className={`p-1.5 rounded-lg text-[10px] font-medium border leading-tight ${evt.color || 'bg-blue-500/20 text-blue-300'}`}
                      >
                        <div className="font-bold truncate">{evt.title}</div>
                        {evt.details && <div className="text-[9px] opacity-80 truncate">{evt.details}</div>}
                      </div>
                    ))}

                    {/* Classes */}
                    {slots.length > 0 ? (
                      slots.slice(0, 4).map((slot, sIdx) => (
                        <div
                          key={`${slot.id || sIdx}`}
                          className="p-1.5 rounded-lg bg-slate-950 border border-slate-800 text-[10px] text-slate-300"
                        >
                          <div className="flex items-center justify-between font-mono text-[9px] text-cyan-400">
                            <span>{slot.time || '08:30'}</span>
                            <span>{slot.grade}</span>
                          </div>
                          <div className="font-bold text-white truncate">{slot.subject}</div>
                          {slot.room && <div className="text-[9px] text-slate-400 truncate">Room: {slot.room}</div>}
                        </div>
                      ))
                    ) : (
                      !dayCell.isWeekend && (
                        <div className="text-[10px] text-slate-500 italic py-2 text-center">
                          No lessons scheduled
                        </div>
                      )
                    )}

                    {dayCell.isWeekend && (
                      <div className="text-[10px] text-slate-500 italic py-4 text-center">
                        Weekend
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 3: DAY VIEW (GOOGLE CALENDAR SINGLE DAY HOURLY TIMELINE)
          ------------------------------------------------------------- */}
      {viewMode === 'day' && (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#080E24] shadow-xl space-y-4">
          <div className="flex flex-wrap items-center justify-between pb-3 border-b border-slate-800 gap-2">
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>
                  {selectedDate.toLocaleDateString('en-GB', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
                {isSelectedDateToday && (
                  <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                    TODAY
                  </span>
                )}
              </h3>
              <p className="text-xs text-slate-400">
                Detailed hourly schedule, lessons, and school milestones
              </p>
            </div>

            {/* Quick date switch buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() - 1);
                  setSelectedDate(d);
                }}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                title="Previous Day"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setSelectedDate(new Date())}
                className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white text-xs font-semibold cursor-pointer"
              >
                Today
              </button>
              <button
                onClick={() => {
                  const d = new Date(selectedDate);
                  d.setDate(d.getDate() + 1);
                  setSelectedDate(d);
                }}
                className="p-1.5 rounded-lg border border-slate-700 bg-slate-800 text-slate-200 hover:text-white cursor-pointer"
                title="Next Day"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Special Day Events Banner */}
          {selectedDateEvents.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Events on this day</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {selectedDateEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-3 rounded-xl border flex items-start gap-2.5 ${evt.color || 'bg-blue-500/20 text-blue-300'}`}
                  >
                    <CalendarIcon className="w-4 h-4 mt-0.5 shrink-0" />
                    <div>
                      <h5 className="font-bold text-xs">{evt.title}</h5>
                      {evt.details && <p className="text-[11px] opacity-90">{evt.details}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Hourly Timeline with Real-Time Indicator Line */}
          <div className="relative pt-2">
            {/* GOOGLE CALENDAR RED CURRENT TIME LINE (If viewing today) */}
            {isSelectedDateToday && isCurrentTimeInSchoolHours && (
              <div
                className="absolute left-0 right-0 z-20 flex items-center pointer-events-none transition-all"
                style={{ top: `${currentMinuteRatio}%` }}
              >
                {/* Red Circle Indicator */}
                <div className="w-3 h-3 rounded-full bg-red-500 shadow-md -ml-1.5" />
                {/* Red Line */}
                <div className="flex-1 h-0.5 bg-red-500" />
                {/* Current Time Badge */}
                <span className="px-2 py-0.5 rounded bg-red-500 text-white font-mono text-[10px] font-bold shadow-md -mr-1">
                  {liveClockString}
                </span>
              </div>
            )}

            {/* Standard School Hours (08:00 to 16:30) */}
            <div className="space-y-3">
              {[
                { time: '08:00 - 08:30', title: 'Morning Assembly & Devotion', type: 'assembly' },
                { time: '08:30 - 09:15', title: 'Period 1: Mathematics & Numeracy', type: 'lesson' },
                { time: '09:15 - 10:00', title: 'Period 2: English Language Activities', type: 'lesson' },
                { time: '10:00 - 10:30', title: 'Period 3: Kiswahili Lugha', type: 'lesson' },
                { time: '10:30 - 11:00', title: 'Tea Break & Snack Time', type: 'break' },
                { time: '11:00 - 11:45', title: 'Period 4: Science & Technology', type: 'lesson' },
                { time: '11:45 - 12:30', title: 'Period 5: Social Studies', type: 'lesson' },
                { time: '12:30 - 13:15', title: 'Period 6: Religious Education (CRE/IRE)', type: 'lesson' },
                { time: '13:15 - 14:15', title: 'Lunch Break & Supervised Play', type: 'break' },
                { time: '14:15 - 15:00', title: 'Period 7: Creative Arts & Sports', type: 'lesson' },
                { time: '15:00 - 15:45', title: 'Period 8: Indigenous Language / Reading', type: 'lesson' },
                { time: '15:45 - 16:30', title: 'After-School Remedial & Club Activities', type: 'clubs' },
              ].map((period, pIdx) => {
                // Find if there is a matching timetable slot from storedTimetableSlots
                const matchingSlot = selectedDateTimetable[pIdx];

                return (
                  <div
                    key={period.time}
                    className={`p-3 rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-xs transition-colors ${
                      period.type === 'break'
                        ? 'bg-amber-950/20 border-amber-900/40 text-amber-200'
                        : period.type === 'assembly'
                        ? 'bg-cyan-950/20 border-cyan-900/40 text-cyan-200'
                        : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-slate-400 font-semibold text-[11px] w-28 shrink-0">
                        {period.time}
                      </span>
                      <div>
                        <h5 className="font-bold text-white">
                          {matchingSlot ? `${matchingSlot.subject} (${matchingSlot.grade})` : period.title}
                        </h5>
                        {matchingSlot?.teacher && (
                          <p className="text-[11px] text-slate-400">Teacher: {matchingSlot.teacher}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {matchingSlot?.room && (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-mono text-[10px]">
                          Room {matchingSlot.room}
                        </span>
                      )}
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          period.type === 'break'
                            ? 'bg-amber-500/20 text-amber-300'
                            : period.type === 'assembly'
                            ? 'bg-cyan-500/20 text-cyan-300'
                            : 'bg-emerald-500/20 text-emerald-300'
                        }`}
                      >
                        {period.type === 'break' ? 'Break' : period.type === 'assembly' ? 'Assembly' : 'Class Period'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* -------------------------------------------------------------
          VIEW 4: AGENDA VIEW (CHRONOLOGICAL EVENT STREAM)
          ------------------------------------------------------------- */}
      {viewMode === 'agenda' && (
        <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#080E24] shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="text-sm font-bold text-white">School Agenda & Upcoming Milestones</h3>
              <p className="text-xs text-slate-400">Official academic term dates, holidays, and schedule notices</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs font-mono font-bold">
              {upcomingEvents.length} Upcoming
            </span>
          </div>

          {upcomingEvents.length > 0 ? (
            <div className="space-y-2.5">
              {upcomingEvents.map((evt) => (
                <div
                  key={evt.id}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex flex-col items-center justify-center font-mono">
                      <span className="text-[10px] uppercase text-slate-400">
                        {new Date(evt.date).toLocaleDateString('en-GB', { month: 'short' })}
                      </span>
                      <span className="font-bold text-white text-xs">
                        {new Date(evt.date).getDate()}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">{evt.title}</h4>
                      <p className="text-xs text-slate-400">{evt.details}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 rounded-full bg-purple-500/20 text-purple-300 font-mono text-[10px] font-bold">
                      {evt.type}
                    </span>
                    {evt.targetNav && (
                      <button
                        onClick={() => onNavigateTab(evt.targetNav)}
                        className="px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold cursor-pointer flex items-center gap-1"
                      >
                        <span>Open</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-12 text-center space-y-2 border border-dashed border-slate-800 rounded-2xl">
              <div className="w-12 h-12 rounded-2xl bg-slate-900 text-slate-400 flex items-center justify-center text-xl mx-auto">
                📅
              </div>
              <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                NO UPCOMING EVENTS RECORDED
              </h4>
              <p className="text-xs text-slate-400 max-w-sm mx-auto leading-relaxed">
                All term milestones, assignments, and school pauses will appear here automatically.
              </p>
            </div>
          )}
        </div>
      )}

      {/* -------------------------------------------------------------
          MODAL / DRAWER: SELECTED DAY DETAILS (CLICKING ANY DAY)
          ------------------------------------------------------------- */}
      {selectedDayDrawerOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedDayDrawerOpen(false)}
        >
          <div
            className="w-full max-w-lg rounded-2xl border border-slate-800 bg-[#080E24] shadow-2xl p-5 space-y-4 max-h-[85vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
                  {selectedDate.getDate()}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-white">
                    {selectedDate.toLocaleDateString('en-GB', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {isSelectedDateToday ? 'Current Day • ' + liveClockString : 'School Schedule & Day View'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedDayDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Special Events on this day */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Events & Milestones
              </h4>
              {selectedDateEvents.length > 0 ? (
                <div className="space-y-2">
                  {selectedDateEvents.map((evt) => (
                    <div
                      key={evt.id}
                      className={`p-3 rounded-xl border flex items-start gap-2.5 ${evt.color || 'bg-blue-500/20 text-blue-300'}`}
                    >
                      <CalendarIcon className="w-4 h-4 mt-0.5 shrink-0" />
                      <div>
                        <h5 className="font-bold text-xs">{evt.title}</h5>
                        {evt.details && <p className="text-[11px] opacity-90">{evt.details}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  No special holiday, term milestone, or pause on this date.
                </p>
              )}
            </div>

            {/* Timetable Lessons on this day */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Timetable Allocation ({selectedDateDayName})
                </h4>
                <button
                  onClick={() => {
                    setSelectedDayDrawerOpen(false);
                    onNavigateTab('timetable');
                  }}
                  className="text-[11px] text-blue-400 hover:underline cursor-pointer"
                >
                  Open Full Timetable
                </button>
              </div>

              {selectedDateTimetable.length > 0 ? (
                <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
                  {selectedDateTimetable.map((slot, idx) => (
                    <div
                      key={slot.id || idx}
                      className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs"
                    >
                      <div>
                        <span className="font-bold text-white">{slot.subject}</span>
                        <div className="text-[11px] text-slate-400">
                          {slot.grade} {slot.teacher ? `• ${slot.teacher}` : ''}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="font-mono text-cyan-400 font-semibold">{slot.time}</span>
                        {slot.room && <div className="text-[10px] text-slate-500">Rm {slot.room}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-500 italic bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {selectedDate.getDay() === 0 || selectedDate.getDay() === 6
                    ? 'Weekend: No classes scheduled.'
                    : 'No lessons allocated for this day of the week.'}
                </p>
              )}
            </div>

            {/* Footer Actions */}
            <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
              <button
                onClick={() => {
                  setViewMode('day');
                  setSelectedDayDrawerOpen(false);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-colors cursor-pointer"
              >
                Switch to Day View
              </button>
              <button
                onClick={() => setSelectedDayDrawerOpen(false)}
                className="px-3.5 py-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
