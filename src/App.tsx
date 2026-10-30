/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import { Sidebar } from './components/Sidebar.tsx';
import { TopNav } from './components/TopNav.tsx';
import { DashboardView } from './components/DashboardView.tsx';
import { PatientDataScreen } from './components/PatientDataScreen.tsx';
import { PatientRegistrationForm } from './components/PatientRegistrationForm.tsx';
import { PatientProfileView } from './components/PatientProfileView.tsx';
import { PatientEditModal } from './components/PatientEditModal.tsx';
import { LoginView } from './components/LoginView.tsx';
import { Patient, DashboardStats } from './types.ts';
import { CheckCircle2, AlertCircle, AlertTriangle } from 'lucide-react';
import {
  apiGetPatients,
  apiGetStats,
  apiDeletePatient,
  apiUpdatePatient,
  apiExportExcel
} from './utils/apiClient';

interface AuthUser {
  id: number;
  mobile: string;
  name: string;
  role: string;
}

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    try {
      const stored = localStorage.getItem('sty_user');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed && parsed.name) {
          parsed.name = parsed.name.replace(/^Dr\.\s*/i, '');
          localStorage.setItem('sty_user', JSON.stringify(parsed));
          return parsed;
        }
      }
    } catch (e) {
      console.error('Failed to parse local user state', e);
    }
    return null;
  });

  const [currentView, setCurrentView] = useState<'dashboard' | 'patients' | 'register' | 'profile' | 'edit'>('dashboard');
  const [editSection, setEditSection] = useState<'section1' | 'section2' | 'section3' | 'section4' | 'section5'>('section1');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [isSidebarOpenMobile, setIsSidebarOpenMobile] = useState(false);
  const [isSidebarOpenDesktop, setIsSidebarOpenDesktop] = useState(true);

  const handleToggleSidebar = () => {
    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
      setIsSidebarOpenMobile((prev) => !prev);
    } else {
      setIsSidebarOpenDesktop((prev) => !prev);
    }
  };

  // Selected patient for detail profile view
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Filter state across sidebar
  const [selectedCentreFilter, setSelectedCentreFilter] = useState('All');

  // Search state across TopNav
  const [globalSearchTerm, setGlobalSearchTerm] = useState('');

  // Toast notifications
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // In-App Delete Confirmation State
  const [patientToDelete, setPatientToDelete] = useState<Patient | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const data = await apiGetPatients();
      setPatients(data);
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const data = await apiGetStats();
      setStats(data);
    } catch (err) {
      console.error('Failed to load stats', err);
    }
  }, []);

  useEffect(() => {
    if (currentUser) {
      fetchPatients();
      fetchStats();
    }
  }, [currentUser, fetchPatients, fetchStats]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, selectedPatient]);

  const handleRegisterSuccess = (newPatient: Patient) => {
    fetchPatients();
    fetchStats();
    showToast(`Patient "${newPatient.full_name}" registered successfully with ID ${newPatient.patient_id}!`);
    setSelectedPatient(newPatient);
    setCurrentView('profile');
  };

  const handleDeletePatient = async (id: number) => {
    try {
      await apiDeletePatient(id);
      showToast('Patient record deleted successfully.');
      if (selectedPatient && selectedPatient.id === id) {
        setSelectedPatient(null);
        setCurrentView('patients');
      }
      fetchPatients();
      fetchStats();
    } catch (err) {
      showToast('Error deleting patient.', 'error');
    }
  };

  const handleConfirmDelete = async () => {
    if (!patientToDelete) return;
    setIsDeleting(true);
    try {
      await handleDeletePatient(patientToDelete.id);
    } finally {
      setIsDeleting(false);
      setPatientToDelete(null);
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const patientToUpdate = patients.find((p) => p.id === id);
    if (!patientToUpdate) return;

    try {
      await apiUpdatePatient(id, { ...patientToUpdate, status: newStatus });
      showToast(`Patient status updated to "${newStatus}".`);
      fetchPatients();
      fetchStats();
      if (selectedPatient && selectedPatient.id === id) {
        setSelectedPatient({ ...selectedPatient, status: newStatus as any });
      }
    } catch (err) {
      showToast('Failed to update status.', 'error');
    }
  };

  const handleGlobalSearchSubmit = () => {
    setCurrentView('patients');
  };

  const handleLogout = () => {
    localStorage.removeItem('sty_user');
    setCurrentUser(null);
    showToast('Signed out successfully.');
  };

  const handleUpdatePatient = async (updatedPatient: Patient) => {
    try {
      const saved = await apiUpdatePatient(updatedPatient.id, updatedPatient);
      showToast('Patient record updated successfully.');
      setSelectedPatient(saved);
      setPatients((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
      fetchStats();
    } catch (err) {
      showToast('Error updating patient record.', 'error');
    }
  };

  const handleExportAllData = async () => {
    try {
      showToast('Preparing multi-sheet Excel export...');
      await apiExportExcel();
      showToast('Database exported successfully as multi-sheet Excel workbook (.xlsx)!');
    } catch (err: any) {
      console.error('Export failed:', err);
      showToast(err.message || 'Failed to export database', 'error');
    }
  };

  // If user is not authenticated, render LoginView
  if (!currentUser) {
    return (
      <LoginView
        onLoginSuccess={(user) => {
          setCurrentUser(user);
          showToast(`Welcome back, ${user.name}! Signed in with ${user.mobile}.`);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased font-sans selection:bg-[#0C4A60] selection:text-white print:bg-white print:min-h-0 print:block">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border bg-slate-900 text-white text-xs sm:text-sm animate-bounce-short print:hidden">
          {toast.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0" />
          )}
          <span>{toast.message}</span>
        </div>
      )}

      {/* Left Sidebar (Desktop collapsible, Mobile off-canvas) */}
      <Sidebar
        currentView={currentView}
        onNavigate={(view) => {
          setCurrentView(view);
          if (view !== 'profile') setSelectedPatient(null);
        }}
        isOpenMobile={isSidebarOpenMobile}
        isOpenDesktop={isSidebarOpenDesktop}
        onCloseMobile={() => setIsSidebarOpenMobile(false)}
        selectedCentreFilter={selectedCentreFilter}
        onSelectCentreFilter={(centre) => setSelectedCentreFilter(centre)}
      />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out print:pl-0 print:m-0 print:p-0 ${
          isSidebarOpenDesktop ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        {/* Top App Bar Header with Logged-in Mobile Display */}
        <TopNav
          onToggleSidebar={handleToggleSidebar}
          isSidebarOpen={
            typeof window !== 'undefined' && window.innerWidth < 1024
              ? isSidebarOpenMobile
              : isSidebarOpenDesktop
          }
          searchTerm={globalSearchTerm}
          onSearchChange={(val) => setGlobalSearchTerm(val)}
          onSearchSubmit={handleGlobalSearchSubmit}
          user={currentUser}
          onLogout={handleLogout}
        />

        {/* View Content */}
        <main
          className={`flex-1 w-full mx-auto print:p-0 print:m-0 print:max-w-none ${
            currentView === 'edit'
              ? 'p-0 max-w-none'
              : 'px-4 sm:px-8 py-6 sm:py-8 max-w-7xl'
          } ${
            currentView === 'profile' ? 'patient-profile-container no-scrollbar' : ''
          }`}
        >
          {/* 1. Dashboard Overview */}
          {currentView === 'dashboard' && (
            <DashboardView
              stats={stats}
              onNavigateRegister={() => setCurrentView('register')}
              onNavigatePatients={() => setCurrentView('patients')}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setCurrentView('profile');
              }}
              onDeletePatient={handleDeletePatient}
              onExportAllData={handleExportAllData}
            />
          )}

          {/* 2. Patient Directory Table */}
          {currentView === 'patients' && (
            <PatientDataScreen
              patients={
                selectedCentreFilter === 'All'
                  ? patients
                  : patients.filter((p) => p.centre === selectedCentreFilter)
              }
              loading={loading}
              onRefresh={() => {
                fetchPatients();
                fetchStats();
                showToast('Refreshed patient data from database.');
              }}
              onRegisterClick={() => setCurrentView('register')}
              onDeletePatient={handleDeletePatient}
              onStatusChange={handleStatusChange}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                setCurrentView('profile');
              }}
            />
          )}

          {/* 3. Patient Intake Registration Form */}
          {currentView === 'register' && (
            <PatientRegistrationForm
              onSuccess={handleRegisterSuccess}
              onCancel={() => setCurrentView('patients')}
            />
          )}

          {/* 4. Full Patient Details & Case History */}
          {currentView === 'profile' && selectedPatient && (
            <PatientProfileView
              patient={selectedPatient}
              onBack={() => setCurrentView('patients')}
              onStatusChange={handleStatusChange}
              onUpdatePatient={handleUpdatePatient}
              onDeleteRequest={(p) => setPatientToDelete(p)}
              onEditClick={(sec) => {
                setEditSection(sec || 'section1');
                setCurrentView('edit');
              }}
            />
          )}

          {/* 5. Full Screen Edit Patient View */}
          {currentView === 'edit' && selectedPatient && (
            <PatientEditModal
              patient={selectedPatient}
              isOpen={true}
              onClose={() => setCurrentView('profile')}
              onSave={handleUpdatePatient}
              initialSection={editSection}
            />
          )}
        </main>
      </div>

      {/* Confirmation Modal Before Deleting Patient Record */}
      {patientToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in zoom-in-95 duration-150">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 border border-rose-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-slate-900">
                  Confirm Delete Patient Record
                </h3>
                <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                  Are you sure you want to permanently delete the clinical record for{' '}
                  <strong className="text-slate-900">{patientToDelete.full_name}</strong>{' '}
                  (<span className="font-mono text-slate-700 font-semibold">{patientToDelete.patient_id}</span>)?
                </p>
                <p className="text-[11px] text-rose-600 font-medium mt-2 bg-rose-50/80 p-2 rounded-lg border border-rose-100">
                  This action is permanent and cannot be undone. All clinical case sheets, medical history, physical exams, and fee records will be removed.
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setPatientToDelete(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDelete}
                className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 transition-colors shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? 'Deleting Record...' : 'Yes, Delete Record'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
