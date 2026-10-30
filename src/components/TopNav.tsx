import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  LogOut,
  ChevronDown
} from 'lucide-react';

interface Props {
  onToggleSidebar: () => void;
  searchTerm?: string;
  onSearchChange?: (value: string) => void;
  onSearchSubmit?: () => void;
  user: { id: number; mobile: string; name: string; role: string } | null;
  onLogout: () => void;
  isSidebarOpen?: boolean;
}

export const TopNav: React.FC<Props> = ({
  onToggleSidebar,
  user,
  onLogout,
  isSidebarOpen
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const displayMobile = user ? user.mobile : '8897182017';
  const formattedMobile = displayMobile.startsWith('+91')
    ? displayMobile
    : `+91 ${displayMobile}`;

  return (
    <header className="sticky top-0 z-30 h-18 bg-white border-b border-slate-200/90 px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left: Hamburger / Sandwich button */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onToggleSidebar}
          className={`p-2 rounded-xl transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#0C4A60]/20 ${
            isSidebarOpen
              ? 'bg-slate-100 text-[#0C4A60]'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
          title="Toggle Navigation Menu"
          aria-label="Toggle Navigation Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
      </div>

      {/* Right: User Profile displaying logged in mobile number */}
      <div className="flex items-center gap-2 sm:gap-4 shrink-0 relative" ref={dropdownRef}>
        <div
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className="flex items-center gap-2.5 pl-1 sm:pl-2 cursor-pointer select-none p-1 rounded-xl hover:bg-slate-50 transition-colors"
        >
          <div className="text-right hidden md:block">
            <div className="text-xs font-bold text-slate-900 font-mono leading-tight">
              {formattedMobile}
            </div>
            <div className="text-[11px] font-medium text-emerald-700 flex items-center justify-end gap-1 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Admin</span>
            </div>
          </div>

          <div className="relative">
            <div className="w-9 h-9 rounded-full bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs ring-2 ring-slate-100 shadow-xs">
              {user?.name ? user.name.replace(/^Dr\.\s*/i, '').split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() : 'VP'}
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden sm:block" />
        </div>

        {/* Profile Dropdown Menu */}
        {dropdownOpen && (
          <div className="absolute right-0 top-14 z-50 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 text-xs">
            <div className="px-3 py-2 border-b border-slate-100 mb-1">
              <p className="font-bold text-slate-900">{user?.name ? user.name.replace(/^Dr\.\s*/i, '') : 'Vara Prasad'}</p>
              <p className="font-mono text-slate-500 mt-0.5">{formattedMobile}</p>
            </div>

            <button
              type="button"
              onClick={() => {
                setDropdownOpen(false);
                onLogout();
              }}
              className="w-full px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 font-medium flex items-center gap-2 transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4 text-rose-500" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
