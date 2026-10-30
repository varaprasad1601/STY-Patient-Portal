import React from 'react';
import {
  Activity,
  UserPlus,
  Users,
  Home
} from 'lucide-react';

interface Props {
  currentTab: 'home' | 'register' | 'patients';
  onSelectTab: (tab: 'home' | 'register' | 'patients') => void;
  patientCount: number;
}

export const Navbar: React.FC<Props> = ({ currentTab, onSelectTab, patientCount }) => {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Brand & Clinic Subtitle */}
          <div
            onClick={() => onSelectTab('home')}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <div className="w-10 h-10 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs group-hover:bg-[#0C4A60] transition-colors">
              <Activity className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-900 text-lg tracking-tight group-hover:text-[#0C4A60] transition-colors">
                  Patient History Portal
                </span>
                <span className="text-slate-300 font-light text-sm">|</span>
                <span className="text-xs font-semibold uppercase tracking-wider text-teal-800">
                  Surya Tejas Yogalayam
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal">
                Clinical Yoga Therapy Records &bull; Vijayawada &amp; Hyderabad
              </p>
            </div>
          </div>

          {/* Navigation Links - Clean Minimalist Professional Tab Bar */}
          <nav className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onSelectTab('home')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === 'home'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Home className="w-4 h-4 text-slate-500" />
              <span>Home</span>
            </button>

            <button
              onClick={() => onSelectTab('patients')}
              className={`px-3.5 py-2 rounded-lg text-xs sm:text-sm font-medium flex items-center gap-2 transition-all ${
                currentTab === 'patients'
                  ? 'bg-slate-100 text-slate-900 font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Users className="w-4 h-4 text-slate-500" />
              <span>Patient Directory</span>
              {patientCount > 0 && (
                <span className="text-xs font-mono bg-slate-200/80 text-slate-700 px-1.5 py-0.2 rounded-md">
                  {patientCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onSelectTab('register')}
              className={`ml-1 px-4 py-2 rounded-lg text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all shadow-xs ${
                currentTab === 'register'
                  ? 'bg-[#0C4A60] text-white ring-2 ring-[#0C4A60]/30'
                  : 'bg-[#0C4A60] hover:bg-[#083344] text-white'
              }`}
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>New Registration</span>
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};
