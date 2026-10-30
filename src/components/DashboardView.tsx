import React, { useState } from 'react';
import {
  Users,
  HeartPulse,
  UserPlus,
  ChevronRight,
  CheckCircle2,
  FileSpreadsheet,
  Download
} from 'lucide-react';
import { Patient, DashboardStats } from '../types.ts';

interface Props {
  stats: DashboardStats | null;
  onNavigateRegister: () => void;
  onNavigatePatients?: () => void;
  onSelectPatient?: (patient: Patient) => void;
  onDeletePatient?: (id: number) => Promise<void>;
  onExportAllData?: () => Promise<void>;
}

export const DashboardView: React.FC<Props> = ({
  stats,
  onNavigateRegister,
  onExportAllData
}) => {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    if (onExportAllData) {
      setIsExporting(true);
      try {
        await onExportAllData();
      } finally {
        setIsExporting(false);
      }
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5">
        <span className="hover:text-slate-900 cursor-pointer">Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-900 cursor-pointer">Dashboard</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0C4A60] font-semibold">Overview</span>
      </nav>

      {/* Page Title & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Clinical case records and patient treatment metrics for Surya Tejas Yogalayam.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={onNavigateRegister}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#0C4A60] px-4 py-2.5 text-xs font-semibold text-white shadow-xs hover:bg-[#083344] transition-colors cursor-pointer"
          >
            <UserPlus className="w-3.5 h-3.5 text-amber-300" />
            <span>Register Patient</span>
          </button>

          <button
            type="button"
            onClick={handleExport}
            disabled={isExporting}
            className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white px-4 py-2.5 text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-60"
            title="Export all database tables into one multi-sheet Excel file (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-200" />
            <span>{isExporting ? 'Exporting...' : 'Export All Data (.xlsx)'}</span>
          </button>
        </div>
      </div>

      {/* Row of 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Patients */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Total Patients</span>
            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats ? stats.total : 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Registered files</span>
              <span className="text-emerald-600 font-medium">Database Active</span>
            </div>
          </div>
        </div>

        {/* Card 2: Active Therapy */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Active Therapy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats ? stats.activeCount : 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>In treatment</span>
              <span className="text-emerald-600 font-medium">Ongoing</span>
            </div>
          </div>
        </div>

        {/* Card 3: Completed */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Completed</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats ? stats.completedCount : 0}
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>Discharged / Maintenance</span>
              <span className="text-amber-600 font-medium">Completed</span>
            </div>
          </div>
        </div>

        {/* Card 4: Avg Pain Score */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500">Avg Pain Score</span>
            <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <HeartPulse className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-extrabold text-slate-900 font-mono">
              {stats && typeof stats.avgPainScore === 'number'
                ? stats.avgPainScore.toFixed(1)
                : '0.0'}{' '}
              <span className="text-xs font-normal text-slate-400 font-sans">/ 10</span>
            </div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
              <span>VAS Scale</span>
              <span className="text-emerald-600 font-medium">Therapy Tracked</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

