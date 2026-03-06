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
      {label && (
        <label className="block text-sm font-medium text-slate-700 mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        onClick={() => !disabled && setIsOpen(!isOpen)}
        disabled={disabled}
        className={cn(
          "w-full flex items-center justify-between px-3 py-2 bg-white border border-slate-200 rounded-xl text-sm transition-all duration-200",
          "hover:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500",
          disabled && "opacity-60 cursor-not-allowed bg-slate-50",
          isOpen && "border-emerald-500 ring-2 ring-emerald-500/20",
          className
        )}
      >
        <div className="flex items-center gap-2 truncate">
          {Icon && <Icon size={16} className="text-slate-400 shrink-0" />}
          <span className={cn(
            "truncate font-medium",
            !selectedOption && "text-slate-400",
            selectedOption?.className
          )}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>
        <ChevronDown 
          size={16} 
          className={cn(
            "text-slate-400 transition-transform duration-200 shrink-0 ml-2",
            isOpen && "transform rotate-180"
          )} 
        />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            className="absolute z-50 w-full mt-1 bg-white border border-slate-100 rounded-xl shadow-xl overflow-hidden max-h-60 overflow-y-auto"
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
