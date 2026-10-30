import React, { useState } from 'react';
import {
  UserPlus,
  Users,
  Building2,
  ArrowRight,
  ShieldCheck,
  ClipboardList,
  Eye,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { Patient, DashboardStats } from '../types.ts';

interface Props {
  stats: DashboardStats | null;
  onNavigateRegister: () => void;
  onNavigatePatients: () => void;
  onSelectPatient: (patient: Patient) => void;
  onExportAllData?: () => Promise<void>;
}

export const HomeDashboard: React.FC<Props> = ({
  stats,
  onNavigateRegister,
  onNavigatePatients,
  onSelectPatient,
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

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500" />
            Active
          </span>
        );
      case 'Assessment Pending':
        return (
          <span className="inline-flex items-center rounded-md bg-amber-50 px-2 py-1 text-xs font-medium text-amber-800 ring-1 ring-inset ring-amber-600/20">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-amber-500" />
            Pending
          </span>
        );
      case 'New':
        return (
          <span className="inline-flex items-center rounded-md bg-sky-50 px-2 py-1 text-xs font-medium text-sky-700 ring-1 ring-inset ring-sky-700/10">
            <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-sky-500" />
            New
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-md bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Tailwind UI Page Header Card */}
      <div className="overflow-hidden rounded-xl bg-white shadow-xs ring-1 ring-slate-900/5 p-6 sm:p-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#0C4A60] tracking-wider uppercase">
              <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>Surya Tejas Yogalayam &bull; Clinical Portal</span>
            </div>
            <h1 className="mt-2 text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
              Patient Case History &amp; Records System
            </h1>
            <p className="mt-2 text-xs sm:text-sm text-slate-500 leading-relaxed">
              Clinical case management system serving STY Vijayawada and STY Hyderabad. Complete intake, medical conditions, and objective neurological examination records are stored in the database.
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onNavigateRegister}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-[#0C4A60] px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-[#083344] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0C4A60]"
              >
                <UserPlus className="h-4 w-4 text-amber-300" />
                <span>New Patient Registration</span>
              </button>
              <button
                type="button"
                onClick={handleExport}
                disabled={isExporting}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-emerald-700 px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-white shadow-xs hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-700 disabled:opacity-60 cursor-pointer"
                title="Export all database tables into one multi-sheet Excel file (.xlsx)"
              >
                <FileSpreadsheet className="h-4 w-4 text-emerald-200" />
                <span>{isExporting ? 'Exporting...' : 'Export All Data (.xlsx)'}</span>
              </button>
              <button
                type="button"
                onClick={onNavigatePatients}
                className="inline-flex items-center gap-x-1.5 rounded-lg bg-white px-3.5 py-2.5 text-xs sm:text-sm font-semibold text-slate-900 shadow-xs ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
              >
                <Users className="h-4 w-4 text-slate-500" />
                <span>Browse Patient Directory ({stats?.total ?? 0})</span>
              </button>
            </div>
          </div>

          {/* Quick Summary Widget */}
          <div className="mt-6 sm:mt-0 sm:ml-8 border-t sm:border-t-0 sm:border-l border-slate-200 pt-6 sm:pt-0 sm:pl-8">
            <dl className="grid grid-cols-2 gap-4">
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-medium text-slate-500 truncate">STY Vijayawada</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900 font-mono">{stats?.vjaCount ?? 0}</dd>
              </div>
              <div className="rounded-lg bg-slate-50 p-3 ring-1 ring-slate-200">
                <dt className="text-xs font-medium text-slate-500 truncate">STY Hyderabad</dt>
                <dd className="mt-1 text-xl font-bold text-slate-900 font-mono">{stats?.hydCount ?? 0}</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* Tailwind UI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-xs ring-1 ring-slate-900/5">
          <dt className="text-xs font-medium text-slate-500 truncate flex items-center justify-between">
            <span>Total Patients</span>
            <Users className="h-4 w-4 text-slate-400" />
          </dt>
          <dd className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {stats ? stats.total : 0}
          </dd>
          <p className="mt-1 text-[11px] text-slate-400">Total active files in system</p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-xs ring-1 ring-slate-900/5">
          <dt className="text-xs font-medium text-slate-500 truncate flex items-center justify-between">
            <span>Vijayawada Centre</span>
            <Building2 className="h-4 w-4 text-emerald-600" />
          </dt>
          <dd className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {stats ? stats.vjaCount : 0}
          </dd>
          <p className="mt-1 text-[11px] text-slate-400">Main Andhra Pradesh centre</p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-xs ring-1 ring-slate-900/5">
          <dt className="text-xs font-medium text-slate-500 truncate flex items-center justify-between">
            <span>Hyderabad Centre</span>
            <Building2 className="h-4 w-4 text-amber-600" />
          </dt>
          <dd className="mt-2 text-2xl sm:text-3xl font-extrabold text-slate-900 font-mono">
            {stats ? stats.hydCount : 0}
          </dd>
          <p className="mt-1 text-[11px] text-slate-400">Telangana centre</p>
        </div>

        <div className="overflow-hidden rounded-xl bg-white p-5 shadow-xs ring-1 ring-slate-900/5">
          <dt className="text-xs font-medium text-slate-500 truncate flex items-center justify-between">
            <span>Database Storage</span>
            <ShieldCheck className="h-4 w-4 text-[#0C4A60]" />
          </dt>
          <dd className="mt-2 text-lg sm:text-xl font-bold text-slate-900 flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>SQLite Active</span>
          </dd>
          <p className="mt-1 text-[11px] text-slate-400">WAL mode persistent engine</p>
        </div>
      </div>

      {/* Two Feature Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div
          onClick={onNavigateRegister}
          className="group cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-xs ring-1 ring-slate-900/5 hover:ring-[#0C4A60] transition-all flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-[#0C4A60] flex items-center justify-center mb-4 group-hover:bg-[#0C4A60] group-hover:text-amber-300 transition-colors">
              <UserPlus className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0C4A60] transition-colors">
              Patient Registration &amp; Clinical Intake
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Register new intake with unique ID assignment, duplicate verification, chief complaint, medical history checklist, and baseline physical vitals.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-[#0C4A60]">
            <span>Open registration form</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>

        <div
          onClick={onNavigatePatients}
          className="group cursor-pointer overflow-hidden rounded-xl bg-white p-6 shadow-xs ring-1 ring-slate-900/5 hover:ring-emerald-700 transition-all flex flex-col justify-between"
        >
          <div>
            <div className="h-10 w-10 rounded-lg bg-slate-100 text-emerald-700 flex items-center justify-center mb-4 group-hover:bg-emerald-700 group-hover:text-white transition-colors">
              <ClipboardList className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
              Patient Records &amp; Directory
            </h3>
            <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">
              Access the clinical database to search patients, filter by centre or status, review Straight Leg Raise (SLR) results, update statuses, or print case sheets.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-emerald-700">
            <span>View all {stats?.total ?? 0} records</span>
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* Tailwind UI Table: Recent Patient Registrations */}
      {stats && stats.recentRegistrations && stats.recentRegistrations.length > 0 && (
        <div className="overflow-hidden shadow-xs ring-1 ring-slate-900/5 sm:rounded-xl bg-white">
          <div className="px-4 py-4 sm:px-6 flex items-center justify-between border-b border-slate-200">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Recent Registrations</h2>
              <p className="text-xs text-slate-500 mt-0.5">Latest clinical intake records added to the database</p>
            </div>
            <button
              type="button"
              onClick={onNavigatePatients}
              className="text-xs font-semibold text-[#0C4A60] hover:text-[#083344] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200">
              <thead className="bg-slate-50">
                <tr>
                  <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-xs font-semibold text-slate-900 sm:pl-6">
                    Patient ID
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900">
                    Patient Name
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900">
                    Centre
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900">
                    Mobile
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900">
                    Chief Complaint
                  </th>
                  <th scope="col" className="px-3 py-3.5 text-left text-xs font-semibold text-slate-900">
                    Status
                  </th>
                  <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6 text-right text-xs font-semibold text-slate-900">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {stats.recentRegistrations.map((patient) => (
                  <tr
                    key={patient.id}
                    onClick={() => onSelectPatient(patient)}
                    className="hover:bg-slate-50/75 transition-colors cursor-pointer"
                  >
                    <td className="whitespace-nowrap py-3.5 pl-4 pr-3 text-xs font-mono font-bold text-[#0C4A60] sm:pl-6">
                      {patient.patient_id}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs font-semibold text-slate-900">
                      {patient.full_name}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs text-slate-600">
                      {patient.centre}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs font-mono text-slate-600">
                      {patient.mobile}
                    </td>
                    <td className="px-3 py-3.5 text-xs text-slate-600 max-w-xs truncate">
                      {patient.chief_complaint || '-'}
                    </td>
                    <td className="whitespace-nowrap px-3 py-3.5 text-xs">
                      {renderStatusBadge(patient.status)}
                    </td>
                    <td className="whitespace-nowrap py-3.5 pl-3 pr-4 text-right text-xs font-medium sm:pr-6">
                      <span className="text-[#0C4A60] hover:text-[#083344] font-semibold inline-flex items-center gap-1">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View</span>
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
