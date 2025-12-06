import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';

/**
 * CustomDatePicker - A dark-themed date picker matching the app's design
 */
const CustomDatePicker = ({ label, value, onChange, placeholder = "Select Date", minDate = null }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
    const ref = useRef(null);
    const buttonRef = useRef(null);

    // Parse value to Date object
    const selectedDate = value ? new Date(value) : null;

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const calendarHeight = 340;
            const shouldOpenUp = spaceBelow < calendarHeight && rect.top > calendarHeight;
            setDropdownPos({
                top: shouldOpenUp ? rect.top - calendarHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: Math.max(rect.width, 280)
            });
        }
    }, [isOpen]);

    // Set current month to selected date's month when opening
    useEffect(() => {
        if (isOpen && selectedDate) {
            setCurrentMonth(new Date(selectedDate));
        }
    }, [isOpen]);

    const months = ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'];

    const daysOfWeek = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const daysInPrevMonth = new Date(year, month, 0).getDate();

        const days = [];

        // Previous month days
        for (let i = firstDay - 1; i >= 0; i--) {
            days.push({ day: daysInPrevMonth - i, isCurrentMonth: false, isPrev: true });
        }

        // Current month days
        for (let i = 1; i <= daysInMonth; i++) {
            days.push({ day: i, isCurrentMonth: true });
        }

        // Next month days to fill the grid
        const remaining = 42 - days.length;
        for (let i = 1; i <= remaining; i++) {
            days.push({ day: i, isCurrentMonth: false, isNext: true });
        }

        return days;
    };

    const handlePrevMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    };

    const handleDateSelect = (day) => {
        if (!day.isCurrentMonth) return;

        const newDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.day);

        // Check if date is before minDate
        if (minDate && newDate < new Date(minDate)) return;

        // Format as YYYY-MM-DD
        const year = newDate.getFullYear();
        const month = String(newDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(day.day).padStart(2, '0');

        onChange(`${year}-${month}-${dayStr}`);
        setIsOpen(false);
    };

    const isSelected = (day) => {
        if (!selectedDate || !day.isCurrentMonth) return false;
        return selectedDate.getDate() === day.day &&
            selectedDate.getMonth() === currentMonth.getMonth() &&
            selectedDate.getFullYear() === currentMonth.getFullYear();
    };

    const isToday = (day) => {
        if (!day.isCurrentMonth) return false;
        const today = new Date();
        return today.getDate() === day.day &&
            today.getMonth() === currentMonth.getMonth() &&
            today.getFullYear() === currentMonth.getFullYear();
    };

    const isDisabled = (day) => {
        if (!day.isCurrentMonth) return true;
        if (!minDate) return false;
        const date = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day.day);
        return date < new Date(minDate);
    };

    const formatDisplayDate = (dateStr) => {
        if (!dateStr) return '';
        const date = new Date(dateStr);
        return date.toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    return (
        <div ref={ref}>
            {label && <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>}
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full h-12 px-4 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all flex items-center gap-3 ${value ? 'text-white' : 'text-white/30'}`}
            >
                <Calendar size={16} className="text-white/30" />
                <span className="flex-1 truncate">{value ? formatDisplayDate(value) : placeholder}</span>
            </button>

            {isOpen && (
                <div
                    className="fixed p-4 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={handlePrevMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                            <ChevronLeft size={18} />
                        </button>
                        <span className="text-white font-medium">
                            {months[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                        </span>
                        <button
                            type="button"
                            onClick={handleNextMonth}
                            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-white/5 text-white/60 hover:text-white transition-colors"
                        >
                            <ChevronRight size={18} />
                        </button>
                    </div>

                    {/* Days of week */}
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {daysOfWeek.map((day) => (
                            <div key={day} className="h-8 flex items-center justify-center text-xs text-white/40 font-medium">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Calendar grid */}
                    <div className="grid grid-cols-7 gap-1">
                        {getDaysInMonth(currentMonth).map((day, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => handleDateSelect(day)}
                                disabled={isDisabled(day)}
                                className={`
                                    h-9 flex items-center justify-center rounded-lg text-sm transition-all
                                    ${!day.isCurrentMonth ? 'text-white/20 cursor-default' : ''}
                                    ${day.isCurrentMonth && !isDisabled(day) ? 'hover:bg-white/5 cursor-pointer' : ''}
                                    ${isSelected(day) ? 'bg-indigo-500 text-white hover:bg-indigo-600' : ''}
                                    ${isToday(day) && !isSelected(day) ? 'border border-indigo-500/50 text-indigo-400' : ''}
                                    ${day.isCurrentMonth && !isSelected(day) && !isToday(day) ? 'text-white/70' : ''}
                                    ${isDisabled(day) && day.isCurrentMonth ? 'text-white/20 cursor-not-allowed' : ''}
                                `}
                            >
                                {day.day}
                            </button>
                        ))}
                    </div>

                    {/* Quick actions */}
                    <div className="mt-3 pt-3 border-t border-white/10 flex gap-2">
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date();
                                const dateStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
                                onChange(dateStr);
                                setIsOpen(false);
                            }}
                            className="flex-1 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Today
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const tomorrow = new Date();
                                tomorrow.setDate(tomorrow.getDate() + 1);
                                const dateStr = `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, '0')}-${String(tomorrow.getDate()).padStart(2, '0')}`;
                                onChange(dateStr);
                                setIsOpen(false);
                            }}
                            className="flex-1 py-2 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                        >
                            Tomorrow
                        </button>
                        {value && (
                            <button
                                type="button"
                                onClick={() => { onChange(''); setIsOpen(false); }}
                                className="px-3 py-2 text-sm text-red-400/60 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default CustomDatePicker;
