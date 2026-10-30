import React, { useState } from 'react';
import {
  LayoutDashboard,
  Users,
  ChevronDown,
  ChevronRight,
  UserPlus,
  Activity,
  X
} from 'lucide-react';

interface Props {
  currentView: 'dashboard' | 'patients' | 'register' | 'profile' | 'edit';
  onNavigate: (view: 'dashboard' | 'patients' | 'register' | 'profile' | 'edit') => void;
  isOpenMobile: boolean;
  isOpenDesktop?: boolean;
  onCloseMobile: () => void;
  selectedCentreFilter: string;
  onSelectCentreFilter: (centre: string) => void;
}

export const Sidebar: React.FC<Props> = ({
  currentView,
  onNavigate,
  isOpenMobile,
  isOpenDesktop = true,
  onCloseMobile,
  selectedCentreFilter,
  onSelectCentreFilter
}) => {
  const [patientMenuOpen, setPatientMenuOpen] = useState(true);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpenMobile && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-xs lg:hidden print:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 flex flex-col transition-transform duration-300 ease-in-out print:hidden ${
          isOpenMobile ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        } ${
          isOpenDesktop ? 'lg:translate-x-0' : 'lg:-translate-x-full'
        }`}
      >
        {/* Brand Header matching Screenshot (NO logo image, pure typographic icon mark) */}
        <div className="h-18 flex items-center justify-between px-5 border-b border-slate-200/80">
          <div
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#0C4A60] to-[#0284C7] text-white flex items-center justify-center font-bold shadow-xs">
              <Activity className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="text-base font-extrabold text-slate-900 tracking-tight leading-none group-hover:text-[#0C4A60] transition-colors">
                Patient Portal
              </div>
              <div className="text-[11px] text-slate-400 font-medium mt-1 leading-none">
                Surya Tejas Yogalayam
              </div>
            </div>
          </div>
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Menu Links */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1.5 text-xs font-medium text-slate-600">
          {/* 1. Dashboard */}
          <button
            type="button"
            onClick={() => {
              onNavigate('dashboard');
              onCloseMobile();
            }}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
              currentView === 'dashboard'
                ? 'bg-sky-50 text-[#0C4A60] font-bold border-l-4 border-[#0C4A60] pl-2'
                : 'hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <LayoutDashboard className={`w-4 h-4 ${currentView === 'dashboard' ? 'text-[#0C4A60]' : 'text-slate-400'}`} />
            <span>Dashboard</span>
          </button>

          {/* 2. Patient Management (Expandable like 'User Management' in screenshot) */}
          <div>
            <button
              type="button"
              onClick={() => setPatientMenuOpen(!patientMenuOpen)}
              className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-slate-50 text-slate-700 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Users className="w-4 h-4 text-slate-400" />
                <span className="font-semibold text-slate-800">Patient Management</span>
              </div>
              {patientMenuOpen ? (
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              ) : (
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
              )}
            </button>

            {patientMenuOpen && (
              <div className="mt-1 pl-7 pr-1 space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    onSelectCentreFilter('All');
                    onNavigate('patients');
                    onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    currentView === 'patients' && selectedCentreFilter === 'All'
                      ? 'bg-sky-50 text-[#0C4A60] font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span>All Patients</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onNavigate('register');
                    onCloseMobile();
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center justify-between ${
                    currentView === 'register'
                      ? 'bg-sky-50 text-[#0C4A60] font-bold'
                      : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <span className="flex items-center gap-1.5">
                    <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                    <span>New Registration</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Footer / Database Indicator */}
        <div className="p-4 border-t border-slate-200/80 bg-slate-50/60">
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="font-semibold">SQLite Storage</span>
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">
            Local persistent database
          </div>
        </div>
      </aside>
    </>
  );
};
