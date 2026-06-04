import Link from "next/link";
import { BarChart2, Home } from "lucide-react";

export function NavBar() {
  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100/80">
      <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">

        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group"
          aria-label="Navi Borrow-Safe home"
        >
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-600 to-violet-600 shadow-sm group-hover:shadow-md transition-shadow">
            <span className="text-white text-[11px] font-bold leading-none">N</span>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="font-bold text-slate-900 text-[15px] tracking-tight">Borrow</span>
            <span className="font-bold text-indigo-600 text-[15px] tracking-tight">Safe</span>
          </div>
        </Link>

        {/* Nav links */}
        <nav className="flex items-center gap-1">
          <Link
            href="/"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Home</span>
          </Link>
          <Link
            href="/dashboard"
            className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-700 hover:bg-indigo-50 px-2.5 py-1.5 rounded-lg transition-all font-medium"
          >
            <BarChart2 className="w-3.5 h-3.5" />
            Analytics
          </Link>
          <a
            href="https://github.com/Kanik0575/navi-borrow-safe"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400 hover:text-slate-700 hover:bg-slate-50 px-2.5 py-1.5 rounded-lg transition-all"
            aria-label="View source on GitHub"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z" />
            </svg>
            <span className="hidden md:inline">Source</span>
          </a>
        </nav>
      </div>
    </header>
  );
}
