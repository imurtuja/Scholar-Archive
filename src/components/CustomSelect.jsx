import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

/**
 * CustomSelect - Reusable custom dropdown component
 * Features: Click outside to close, smart positioning (opens up if near bottom), styled consistently
 */
const CustomSelect = ({
    label,
    icon: Icon,
    value,
    onChange,
    options,
    placeholder = "Select...",
    disabled = false,
    required = false,
    className = "",
    // For options with custom values (array of {label, value} objects)
    optionLabel = null,
    optionValue = null
}) => {
    const [isOpen, setIsOpen] = useState(false);
    const [openUpward, setOpenUpward] = useState(false);
    const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0, width: 0 });
    const ref = useRef(null);
    const buttonRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Calculate dropdown position
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const dropdownHeight = Math.min(options.length * 40 + 16, 240);
            const shouldOpenUp = spaceBelow < dropdownHeight && rect.top > dropdownHeight;

            setOpenUpward(shouldOpenUp);
            setDropdownPos({
                top: shouldOpenUp ? rect.top - dropdownHeight - 8 : rect.bottom + 8,
                left: rect.left,
                width: rect.width
            });
        }
    }, [isOpen, options.length]);

    // Get display value
    const getDisplayValue = () => {
        if (!value) return null;
        if (optionLabel && optionValue) {
            const found = options.find(opt => opt[optionValue] === value);
            return found ? found[optionLabel] : value;
        }
        return value;
    };

    // Get option display label
    const getOptionLabel = (option) => optionLabel ? option[optionLabel] : option;
    const getOptionValue = (option) => optionValue ? option[optionValue] : option;

    return (
        <div ref={ref} className={className}>
            {label && <label className="block text-sm font-medium text-white/60 mb-2">{label}</label>}
            <div className="relative">
                {Icon && (
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
                        <Icon size={16} className="text-white/30" />
                    </div>
                )}
                <button
                    ref={buttonRef}
                    type="button"
                    onClick={() => !disabled && setIsOpen(!isOpen)}
                    disabled={disabled}
                    className={`w-full h-12 ${Icon ? 'pl-11' : 'pl-4'} pr-10 bg-[#1a1a2e] border border-white/10 rounded-xl text-left focus:outline-none focus:border-indigo-500/50 transition-all ${getDisplayValue() ? 'text-white' : 'text-white/30'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    <span className="block truncate">{getDisplayValue() || placeholder}</span>
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
                    <ChevronDown size={16} className={`text-white/40 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                </div>
            </div>
            {isOpen && (
                <div
                    className="fixed py-2 bg-[#1a1a2e] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto"
                    style={{ top: dropdownPos.top, left: dropdownPos.left, width: dropdownPos.width, zIndex: 9999 }}
                >
                    {options.length > 0 ? options.map((option, i) => (
                        <button
                            key={i}
                            type="button"
                            onClick={() => {
                                onChange(getOptionValue(option));
                                setIsOpen(false);
                            }}
                            className={`w-full px-4 py-2.5 text-left hover:bg-white/5 text-sm transition-colors ${value === getOptionValue(option) ? 'text-indigo-400 bg-indigo-500/10' : 'text-white/70'}`}
                        >
                            {getOptionLabel(option)}
                        </button>
                    )) : (
                        <div className="px-4 py-3 text-white/40 text-sm">No options available</div>
                    )}
                </div>
            )}
        </div>
    );
};

export default CustomSelect;
