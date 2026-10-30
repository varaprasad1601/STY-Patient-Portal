import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  RotateCcw,
  MoreHorizontal,
  Users,
  CheckCircle2,
  Clock,
  Ban,
  Eye,
  Trash2,
  AlertTriangle,
  Loader2,
  Home,
  ChevronDown,
  User,
  Plus
} from 'lucide-react';
import { Patient } from '../types.ts';
import { PatientDetailModal } from './PatientDetailModal.tsx';
import { formatIndianDate } from '../utils/dateFormatter';

interface Props {
  patients: Patient[];
  loading: boolean;
  onRefresh: () => void;
  onRegisterClick: () => void;
  onDeletePatient: (id: number) => Promise<void>;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onSelectPatient?: (patient: Patient) => void;
}

export const PatientDataScreen: React.FC<Props> = ({
  patients,
  loading,
  onRefresh,
  onRegisterClick,
  onDeletePatient,
  onStatusChange,
  onSelectPatient
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [actionMenuOpenId, setActionMenuOpenId] = useState<number | null>(null);

  // In-app Delete Confirmation Modal State
  const [patientToDelete, setPatientToDelete] = useState<{ id: number; name: string; patient_id: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Ref to close action menu when clicking outside
  const menuRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActionMenuOpenId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered patients matching clinical statuses from document
  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      searchTerm.trim() === '' ||
      patient.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.mobile.includes(searchTerm) ||
      (patient.email && patient.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (patient.chief_complaint &&
        patient.chief_complaint.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus =
      selectedStatus === 'All' ||
      patient.status === selectedStatus ||
      (selectedStatus === 'Completed' && (patient.status === 'Completed' || patient.status === 'Therapy Completed'));

    return matchesSearch && matchesStatus;
  });

  const activeCount = patients.filter((p) => p.status === 'Active').length;
  const assessmentPendingCount = patients.filter((p) => p.status === 'Assessment Pending' || p.status === 'New').length;
  const onHoldCount = patients.filter((p) => p.status === 'On Hold' || p.status === 'Discharged').length;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedStatus, patients.length]);

  const handleResetFilters = () => {
    setSearchTerm('');
    setSelectedStatus('All');
    setCurrentPage(1);
  };

  const handleView = (patient: Patient) => {
    if (onSelectPatient) {
      onSelectPatient(patient);
    } else {
      setSelectedPatient(patient);
      setIsDetailOpen(true);
    }
  };

  const promptDelete = (e: React.MouseEvent, patient: Patient) => {
    e.stopPropagation();
    setPatientToDelete({
      id: patient.id,
      name: patient.full_name,
      patient_id: patient.patient_id
    });
  };

  const confirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await onDeletePatient(patientToDelete.id);
      if (selectedPatient && selectedPatient.id === patientToDelete.id) {
        setIsDetailOpen(false);
        setSelectedPatient(null);
      }
      setPatientToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getInitials = (name: string) => {
    if (!name || name === 'Not added yet') return '';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Avatar background colors matching reference screenshot
  const getAvatarBadgeColor = (index: number, name: string) => {
    if (name === 'Not added yet') {
      return 'bg-slate-100 text-slate-500';
    }
    const colors = [
      'bg-sky-100 text-[#0C4A60]',
      'bg-emerald-100 text-emerald-800',
      'bg-amber-100 text-amber-800',
      'bg-indigo-100 text-indigo-800'
    ];
    return colors[index % colors.length];
  };

  // Status Badge matching the exact clinical workflow statuses in the STY specification document
  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-green-200/50 whitespace-nowrap">
            Active
          </span>
        );
      case 'Therapy Completed':
      case 'Completed':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50 whitespace-nowrap">
            Completed
          </span>
        );
      case 'New':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-sky-50 text-sky-700 border border-sky-200/50 whitespace-nowrap">
            New
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#ffebee] text-[#d32f2f] border border-red-200/50 whitespace-nowrap">
            On Hold
          </span>
        );
      case 'Discharged':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-teal-50 text-teal-700 border border-teal-200/50 whitespace-nowrap">
            Discharged
          </span>
        );
      case 'Referred':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200/50 whitespace-nowrap">
            Referred
          </span>
        );
      case 'Closed':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600 border border-slate-200/50 whitespace-nowrap">
            Closed
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-700 whitespace-nowrap">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Breadcrumb Navigation matching reference image 4 */}
      <nav className="flex items-center text-xs text-slate-500 gap-2">
        <Home className="w-3.5 h-3.5 text-slate-400" />
        <span className="hover:text-slate-900 cursor-pointer">Home</span>
        <span className="text-slate-400">&gt;</span>
        <span className="hover:text-slate-900 cursor-pointer">Patient Management</span>
        <span className="text-slate-400">&gt;</span>
        <span className="text-[#0C4A60] font-semibold">Patients</span>
      </nav>

      {/* Page Title & Add Button matching reference image 4 */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patients
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage all registered patients, clinical history, and examination records.
          </p>
        </div>

        <button
          onClick={onRegisterClick}
          className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#0C4A60] hover:bg-[#083344] px-4 py-2.5 text-sm font-semibold text-white shadow-xs transition-colors self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Patient</span>
        </button>
      </div>

      {/* Main Table Card */}
      <div className="bg-white rounded-lg border border-slate-200/80 shadow-xs p-5 sm:p-6 space-y-5">
        {/* Search, Status Dropdown, and Reset button inside card */}
        <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
          {/* Search bar */}
          <div className="relative flex-1 w-full sm:max-w-xl">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
              <Search className="w-4 h-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search by name, email, ID or mobile..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg bg-white pl-10 pr-4 py-2.5 text-xs sm:text-sm text-slate-800 border border-slate-200 placeholder:text-slate-400 focus:border-[#0C4A60] focus:ring-1 focus:ring-[#0C4A60] transition-colors"
            />
          </div>

          {/* Status dropdown & Reset button */}
          <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
            <div className="relative">
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="appearance-none rounded-lg border border-slate-200 bg-white pl-3.5 pr-8 py-2.5 text-xs sm:text-sm font-medium text-slate-700 focus:border-[#0C4A60] focus:ring-1 focus:ring-[#0C4A60]"
              >
                <option value="All">All Status</option>
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Referred">Referred</option>
                <option value="Closed">Closed</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>

            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Clean, Non-scrollable Data Table without checkboxes, without role, without last login */}
        <div className="w-full overflow-x-auto sm:overflow-x-visible border border-slate-200/70 rounded-md">
          <table className="w-full table-fixed text-left border-collapse min-w-[760px] sm:min-w-0">
            <thead>
              <tr className="border-b border-slate-200 text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-2.5 w-[5%] text-left">#</th>
                <th className="py-3 px-2.5 w-[10%] text-left">PATIENT ID</th>
                <th className="py-3 px-2.5 w-[18%] text-left">NAME</th>
                <th className="py-3 px-2.5 w-[16%] text-left">EMAIL</th>
                <th className="py-3 px-2.5 w-[12%] text-left">MOBILE</th>
                <th className="py-3 px-2.5 w-[11%] text-left">STATUS</th>
                <th className="py-3 px-2.5 w-[21%] text-left">FEEDBACK &amp; FOLLOW-UP</th>
                <th className="py-3 px-2.5 w-[7%] text-right whitespace-nowrap">ACTIONS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-[11px] sm:text-xs">
              {filteredPatients.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    No patient records found matching your filters.
                  </td>
                </tr>
              ) : (
                filteredPatients
                  .slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
                  .map((patient, index) => {
                    const globalIndex = (currentPage - 1) * itemsPerPage + index;
                    const isMenuOpen = actionMenuOpenId === patient.id;

                    return (
                      <tr
                        key={patient.id}
                        onClick={() => handleView(patient)}
                        className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                      >
                        {/* Sequential Number # */}
                        <td className="py-3 px-2.5 text-slate-500 font-normal">
                          {globalIndex + 1}
                        </td>

                        {/* PUBLIC ID */}
                        <td className="py-3 px-2.5 font-bold text-slate-900 truncate hover:text-[#0C4A60]">
                          <span className="truncate block" title={patient.patient_id}>
                            {patient.patient_id}
                          </span>
                        </td>

                        {/* NAME with Avatar matching reference */}
                        <td className="py-3 px-2.5 overflow-hidden">
                          <div className="flex items-center gap-2 min-w-0">
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 ${getAvatarBadgeColor(
                                globalIndex,
                                patient.full_name
                              )}`}
                            >
                              {patient.full_name === 'Not added yet' ? (
                                <User className="w-3.5 h-3.5 text-slate-400" />
                              ) : (
                                getInitials(patient.full_name)
                              )}
                            </div>
                            <span
                              className="font-semibold text-slate-800 truncate block text-[11px] sm:text-xs"
                              title={patient.full_name}
                            >
                              {patient.full_name}
                            </span>
                          </div>
                        </td>

                        {/* EMAIL (decreased width, gracefully truncated with tooltip) */}
                        <td className="py-3 px-2.5 overflow-hidden">
                          <span
                            className="truncate block text-slate-600 text-[11px]"
                            title={patient.email || `${patient.patient_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@stycare.in`}
                          >
                            {patient.email || `${patient.patient_id.toLowerCase().replace(/[^a-z0-9]/g, '')}@stycare.in`}
                          </span>
                        </td>

                        {/* MOBILE */}
                        <td className="py-3 px-2.5 overflow-hidden">
                          <span
                            className="truncate block text-slate-600 text-[11px]"
                            title={patient.mobile}
                          >
                            {patient.mobile}
                          </span>
                        </td>

                        {/* STATUS Badge (increased width to prevent wrapping) */}
                        <td className="py-3 px-2.5 overflow-hidden">
                          {renderStatusBadge(patient.status)}
                        </td>

                        {/* FEEDBACK & FOLLOW-UP (Requirement 6) */}
                        <td className="py-3 px-2.5 overflow-hidden">
                          {(() => {
                            let records: any[] = [];
                            try {
                              if (typeof patient.followup_records === 'string' && patient.followup_records.startsWith('[')) {
                                records = JSON.parse(patient.followup_records);
                              } else if (Array.isArray(patient.followup_records)) {
                                records = patient.followup_records;
                              }
                            } catch {
                              // ignore
                            }
                            const latest = records && records.length > 0 ? records[records.length - 1] : null;

                            if (!latest) {
                              return (
                                <span className="text-[11px] text-slate-400 italic">
                                  No follow-up yet
                                </span>
                              );
                            }

                            return (
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5 flex-wrap">
                                  <span className="text-[10px] font-semibold text-slate-700 font-mono">
                                    {formatIndianDate(latest.followup_date) || 'Recent'}
                                  </span>
                                  {latest.pain_score !== undefined && (
                                    <span className="text-[9px] px-1.5 py-0.2 rounded-full font-bold bg-amber-50 text-amber-800 border border-amber-200">
                                      VAS {latest.pain_score}/10
                                    </span>
                                  )}
                                </div>
                                <p
                                  className="text-[11px] text-slate-600 truncate mt-0.5"
                                  title={latest.feedback || latest.clinical_notes || ''}
                                >
                                  {latest.feedback || latest.clinical_notes || 'Follow-up noted'}
                                </p>
                              </div>
                            );
                          })()}
                        </td>

                        {/* ACTIONS Three Dots menu matching reference image */}
                        <td className="py-3 px-2.5 text-right relative">
                          <div
                            className="inline-block relative"
                            onClick={(e) => e.stopPropagation()}
                            ref={isMenuOpen ? menuRef : null}
                          >
                            <button
                              type="button"
                              onClick={() =>
                                setActionMenuOpenId(
                                  isMenuOpen ? null : patient.id
                                )
                              }
                              className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
                              title="Actions"
                            >
                              <MoreHorizontal className="w-4 h-4" />
                            </button>

                            {/* Dropdown Menu on three dots click */}
                            {isMenuOpen && (
                              <div className="absolute right-0 top-7 z-30 w-36 bg-white rounded-xl shadow-lg border border-slate-200 py-1 text-left text-xs">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setActionMenuOpenId(null);
                                    handleView(patient);
                                  }}
                                  className="w-full px-3 py-1.5 text-slate-700 hover:bg-slate-50 flex items-center gap-2 font-medium cursor-pointer"
                                >
                                  <Eye className="w-3.5 h-3.5 text-slate-400" />
                                  <span>View Profile</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    setActionMenuOpenId(null);
                                    promptDelete(e, patient);
                                  }}
                                  className="w-full px-3 py-1.5 text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-medium cursor-pointer"
                                >
                                  <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                                  <span>Delete Record</span>
                                </button>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
              )}
            </tbody>
          </table>
        </div>

        {/* Footer with Pagination Controls */}
        <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-3">
          <div>
            Showing {filteredPatients.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0} - {Math.min(currentPage * itemsPerPage, filteredPatients.length)} of {filteredPatients.length} patients
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Previous
            </button>
            <span className="px-2 font-semibold text-slate-700">
              Page {currentPage} of {Math.ceil(filteredPatients.length / itemsPerPage) || 1}
            </span>
            <button
              type="button"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, Math.ceil(filteredPatients.length / itemsPerPage) || 1))}
              disabled={currentPage >= Math.ceil(filteredPatients.length / itemsPerPage)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Patient Detail Profile Modal */}
      <PatientDetailModal
        patient={selectedPatient}
        isOpen={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setSelectedPatient(null);
        }}
        onDeleteRequest={(patient) => {
          setPatientToDelete({
            id: patient.id,
            name: patient.full_name,
            patient_id: patient.patient_id
          });
        }}
        onStatusChange={async (id, newStatus) => {
          await onStatusChange(id, newStatus);
          if (selectedPatient) {
            setSelectedPatient({ ...selectedPatient, status: newStatus as any });
          }
        }}
      />

      {/* In-App Delete Confirmation Modal */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-rose-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Delete Patient Record
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 mt-1">
                  Are you sure you want to permanently delete the clinical record for{' '}
                  <strong className="text-slate-900">{patientToDelete.name}</strong>{' '}
                  (<span className="font-mono text-slate-700">{patientToDelete.patient_id}</span>)?
                </p>
                <p className="text-xs text-rose-700 mt-2 bg-rose-50 p-2.5 rounded-lg border border-rose-200/80">
                  This action removes all clinical history, vitals, and examination findings from the database.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPatientToDelete(null)}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-medium text-xs sm:text-sm hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={confirmDelete}
                disabled={isDeleting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs sm:text-sm shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Record</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
