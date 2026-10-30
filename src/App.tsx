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
import { LoginView } from './components/LoginView.tsx';
import { Patient, DashboardStats } from './types.ts';
import { CheckCircle2, AlertCircle } from 'lucide-react';

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

  const [currentView, setCurrentView] = useState<'dashboard' | 'patients' | 'register' | 'profile'>('dashboard');
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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const fetchPatients = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/patients');
      if (res.ok) {
        const data = await res.json();
        setPatients(data);
      }
    } catch (err) {
      console.error('Failed to load patients', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    try {
      const res = await fetch('/api/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
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
      const res = await fetch(`/api/patients/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Patient record deleted successfully from database.');
        if (selectedPatient && selectedPatient.id === id) {
          setSelectedPatient(null);
          setCurrentView('patients');
        }
        fetchPatients();
        fetchStats();
      } else {
        showToast('Failed to delete patient record.', 'error');
      }
    } catch (err) {
      showToast('Error deleting patient.', 'error');
    }
  };

  const handleStatusChange = async (id: number, newStatus: string) => {
    const patientToUpdate = patients.find((p) => p.id === id);
    if (!patientToUpdate) return;

    try {
      const res = await fetch(`/api/patients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...patientToUpdate, status: newStatus })
      });
      if (res.ok) {
        showToast(`Patient status updated to "${newStatus}".`);
        fetchPatients();
        fetchStats();
        if (selectedPatient && selectedPatient.id === id) {
          setSelectedPatient({ ...selectedPatient, status: newStatus as any });
        }
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
      const res = await fetch(`/api/patients/${updatedPatient.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedPatient)
      });
      if (res.ok) {
        const saved = await res.json();
        showToast('Patient record updated successfully.');
        setSelectedPatient(saved);
        setPatients((prev) => prev.map((p) => (p.id === saved.id ? saved : p)));
        fetchStats();
      } else {
        showToast('Failed to update patient record.', 'error');
      }
    } catch (err) {
      showToast('Error updating patient record.', 'error');
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
    <div className="min-h-screen bg-[#F8FAFC] flex text-slate-800 antialiased font-sans selection:bg-[#0C4A60] selection:text-white">
      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl shadow-xl border bg-slate-900 text-white text-xs sm:text-sm animate-bounce-short">
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
        className={`flex-1 flex flex-col min-w-0 transition-all duration-300 ease-in-out ${
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
          className={`flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto ${
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
              onDeleteRequest={(p) => handleDeletePatient(p.id)}
            />
          )}
        </main>
      </div>
    </div>
  );
}
