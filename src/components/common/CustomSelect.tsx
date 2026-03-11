import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, Check, LucideIcon } from 'lucide-react';
import { cn } from '../../lib/utils';

export interface SelectOption {
  value: string;
  label: string;
  className?: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  icon?: LucideIcon;
  className?: string;
  disabled?: boolean;
  label?: string;
}

export function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Select option',
  icon: Icon,
  className,
  disabled = false,
  label
}: CustomSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selectedOption = options.find(opt => opt.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
  };

  return (
    <div className={cn("relative", className)} ref={containerRef}>
        <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-5 py-3.5 bg-white border border-slate-200 rounded-2xl text-sm transition-all duration-300 shadow-sm relative",
          "hover:border-indigo-400 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50",
          isOpen && "border-indigo-500 ring-2 ring-indigo-500/20 shadow-md",
          className
        )}
      >
        <div className="flex flex-col items-start truncate w-full">
          {label && (
            <span className={cn(
              "text-xs font-bold uppercase tracking-wider transition-all duration-200",
              (value || isOpen) ? "text-indigo-600 -translate-y-0.5" : "text-slate-500 translate-y-0.5"
            )}>
              {label}
            </span>
          )}
          <div className="flex items-center gap-2 w-full truncate mt-1">
            {Icon && <Icon size={16} className={cn("shrink-0 transition-colors", (value || isOpen) ? "text-indigo-500" : "text-slate-400")} />}
            <span className={cn(
              "truncate font-medium text-sm",
              !selectedOption && "text-slate-400",
              selectedOption?.className
            )}>
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>
        </div>
        <ChevronDown 
          size={18} 
          className={cn(
            "text-slate-400 transition-transform duration-300 shrink-0 ml-2",
            isOpen && "transform rotate-180 text-indigo-500"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.98 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-100 rounded-2xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto ring-1 ring-black/5"
          >
            <div className="p-1">
              {options.length > 0 ? (
                options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleSelect(option.value)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-sm rounded-lg transition-colors text-left",
                      option.value === value 
                        ? "bg-emerald-50 text-emerald-700 font-medium" 
                        : "text-slate-700 hover:bg-slate-50",
                      option.className
                    )}
                  >
                    <span className="truncate">{option.label}</span>
                    {option.value === value && (
                      <Check size={14} className="text-emerald-600 shrink-0 ml-2" />
                    )}
                  </button>
                ))
              ) : (
                <div className="px-3 py-2 text-sm text-slate-400 text-center">
                  No options
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
