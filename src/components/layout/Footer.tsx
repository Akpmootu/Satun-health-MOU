import { Code } from 'lucide-react';

export function Footer() {
  return (
    <footer className="bg-white border-t border-slate-200 mt-auto">
      <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-sm text-slate-500 font-medium">
          &copy; {new Date().getFullYear()} ระบบประเมินผลการดำเนินงานตามตัวชี้วัด MOU
        </p>
        <div className="flex items-center gap-2 text-sm text-slate-400 hover:text-emerald-600 transition-colors cursor-default">
          <Code size={16} />
          <span>พัฒนาโดย IT SSJ Satun 2569</span>
        </div>
      </div>
    </footer>
  );
}
