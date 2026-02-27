import { SVGProps } from 'react';

export function Logo({ className, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <div className={`flex items-center gap-3 ${className}`}>
      <svg viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-10 h-10 shrink-0" {...props}>
        <rect width="40" height="40" rx="12" fill="url(#logo-grad)" />
        <path d="M12 20L18 26L28 14" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <defs>
          <linearGradient id="logo-grad" x1="0" y1="0" x2="40" y2="40" gradientUnits="userSpaceOnUse">
            <stop stopColor="#10b981" />
            <stop offset="1" stopColor="#0d9488" />
          </linearGradient>
        </defs>
      </svg>
      <div className="flex flex-col">
        <span className="text-xl font-bold leading-none tracking-tight text-slate-800">
          STN Health <span className="text-emerald-600">KPI</span>
        </span>
        <span className="text-[10px] font-medium text-slate-500 tracking-wider uppercase mt-1">
          Satun Provincial Health Office
        </span>
      </div>
    </div>
  );
}
