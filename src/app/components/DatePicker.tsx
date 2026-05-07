import { useState, useEffect } from 'react';
import { Calendar as CalendarIcon, ChevronDown } from 'lucide-react';

interface DatePickerProps {
  value: string;
  onChange: (date: string) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  icon?: React.ReactNode;
  className?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = 'Select a date',
  disabled = false,
  label,
  icon,
  className = ''
}: DatePickerProps) {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<number | null>(null);

  // Initialize from value
  useEffect(() => {
    if (value) {
      const date = new Date(value);
      setSelectedYear(date.getFullYear());
      setSelectedMonth(date.getMonth() + 1); // Months are 0-indexed
      setSelectedDay(date.getDate());
    } else {
      setSelectedYear(null);
      setSelectedMonth(null);
      setSelectedDay(null);
    }
  }, [value]);

  const formatDisplayDate = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  // Generate year range
  const getYearRange = () => {
    const currentYear = new Date().getFullYear();
    const minYear = minDate ? new Date(minDate).getFullYear() : currentYear - 100;
    const maxYear = maxDate ? new Date(maxDate).getFullYear() : currentYear + 10;

    const years = [];
    for (let year = maxYear; year >= minYear; year--) {
      years.push(year);
    }
    return years;
  };

  // Month names
  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  // Get days in selected month
  const getDaysInMonth = () => {
    if (!selectedYear || !selectedMonth) return [];

    const daysInMonth = new Date(selectedYear, selectedMonth, 0).getDate();
    const days = [];
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }
    return days;
  };

  // Check if a specific date is valid
  const isDateValid = (year: number, month: number, day: number) => {
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    if (minDate && dateStr < minDate) return false;
    if (maxDate && dateStr > maxDate) return false;
    return true;
  };

  // Handle year change
  const handleYearChange = (year: number) => {
    setSelectedYear(year);

    // If month and day are already selected, try to update the date
    if (selectedMonth && selectedDay) {
      // Check if the day is valid for this month/year combo
      const daysInMonth = new Date(year, selectedMonth, 0).getDate();
      const validDay = selectedDay <= daysInMonth ? selectedDay : daysInMonth;

      if (isDateValid(year, selectedMonth, validDay)) {
        const dateStr = `${year}-${String(selectedMonth).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
        onChange(dateStr);
        if (validDay !== selectedDay) {
          setSelectedDay(validDay);
        }
      }
    }
  };

  // Handle month change
  const handleMonthChange = (month: number) => {
    setSelectedMonth(month);

    // If year and day are already selected, try to update the date
    if (selectedYear && selectedDay) {
      // Check if the day is valid for this month/year combo
      const daysInMonth = new Date(selectedYear, month, 0).getDate();
      const validDay = selectedDay <= daysInMonth ? selectedDay : daysInMonth;

      if (isDateValid(selectedYear, month, validDay)) {
        const dateStr = `${selectedYear}-${String(month).padStart(2, '0')}-${String(validDay).padStart(2, '0')}`;
        onChange(dateStr);
        if (validDay !== selectedDay) {
          setSelectedDay(validDay);
        }
      }
    }
  };

  // Handle day change
  const handleDayChange = (day: number) => {
    setSelectedDay(day);

    // If year and month are already selected, update the date
    if (selectedYear && selectedMonth) {
      if (isDateValid(selectedYear, selectedMonth, day)) {
        const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
        onChange(dateStr);
      }
    }
  };

  const handleClear = () => {
    setSelectedYear(null);
    setSelectedMonth(null);
    setSelectedDay(null);
    onChange('');
  };

  const years = getYearRange();
  const days = getDaysInMonth();

  return (
    <div className="relative">
      {label && (
        <label className="text-sm text-slate-600 mb-2 block">{label}</label>
      )}

      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 z-10">
            {icon}
          </div>
        )}

        <button
          type="button"
          onClick={() => !disabled && setShowPicker(!showPicker)}
          disabled={disabled}
          className={`w-full ${icon ? 'pl-12' : 'pl-4'} pr-12 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-left transition-all ${
            disabled ? 'bg-slate-50 text-slate-600 cursor-not-allowed' : 'bg-white hover:border-blue-400'
          } ${className}`}
        >
          {value ? formatDisplayDate(value) : <span className="text-slate-400">{placeholder}</span>}
        </button>

        <CalendarIcon className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
      </div>

      {showPicker && !disabled && (
        <div className="absolute z-50 mt-2 bg-white rounded-2xl shadow-2xl border-2 border-blue-200 p-6 w-full min-w-[320px]">
          <h3 className="text-lg text-slate-800 mb-4">Select Date</h3>

          {/* Year Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-600 mb-2">Year</label>
            <div className="relative">
              <select
                value={selectedYear || ''}
                onChange={(e) => handleYearChange(Number(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
              >
                <option value="">Select Year</option>
                {years.map(year => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Month Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-600 mb-2">Month</label>
            <div className="relative">
              <select
                value={selectedMonth || ''}
                onChange={(e) => handleMonthChange(Number(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                disabled={!selectedYear}
              >
                <option value="">Select Month</option>
                {months.map(month => (
                  <option key={month.value} value={month.value}>
                    {month.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Day Selection */}
          <div className="mb-4">
            <label className="block text-sm text-slate-600 mb-2">Day</label>
            <div className="relative">
              <select
                value={selectedDay || ''}
                onChange={(e) => handleDayChange(Number(e.target.value))}
                className="w-full px-4 py-3 pr-10 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                disabled={!selectedYear || !selectedMonth}
              >
                <option value="">Select Day</option>
                {days.map(day => (
                  <option key={day} value={day}>
                    {day}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 pointer-events-none" />
            </div>
          </div>

          {/* Selected Date Preview */}
          {selectedYear && selectedMonth && selectedDay && (
            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-slate-600 mb-1">Selected Date:</p>
              <p className="text-blue-700 font-medium">
                {formatDisplayDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`)}
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-lg transition-all"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={() => setShowPicker(false)}
              className="flex-1 py-2 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-all"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
