import React, { useState, useEffect } from 'react';
import {
  User,
  ShieldAlert,
  Loader2,
  Check,
  Building2,
  Calendar,
  CreditCard,
  Phone
} from 'lucide-react';
import { PaymentRecord } from '../types.ts';

interface Props {
  onSuccess: (newPatient: any) => void;
  onCancel: () => void;
}

export const PatientRegistrationForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  // Centres & Identification
  const [centre, setCentre] = useState<'STY Vijayawada' | 'STY Hyderabad' | ''>('STY Vijayawada');
  const [patientId, setPatientId] = useState('');
  const [loadingId, setLoadingId] = useState(false);
  const [status, setStatus] = useState('');

  // Helper for today's local date in YYYY-MM-DD
  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Section 1: Patient Admission & Personal Details
  const [admissionDate, setAdmissionDate] = useState(getTodayStr);
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');

  // Occupation & Lifestyle
  const [occupation, setOccupation] = useState('');
  const [workPattern, setWorkPattern] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');

  // Emergency contact details
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Care allocation
  const [assignedTherapist, setAssignedTherapist] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Fee & Payment details (all pre-text removed)
  const [consultationFee, setConsultationFee] = useState('');
  const [consultationDate, setConsultationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [monthlyFee, setMonthlyFee] = useState('');
  const [recordInitialPayment, setRecordInitialPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | ''>('');
  const [paymentNotes, setPaymentNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Auto-fetch next unique ID when centre changes
  useEffect(() => {
    let isMounted = true;
    if (!centre) {
      setPatientId('');
      return;
    }
    const fetchNextId = async () => {
      setLoadingId(true);
      try {
        const res = await fetch(`/api/patients/next-id?centre=${encodeURIComponent(centre)}`);
        if (res.ok) {
          const data = await res.json();
          if (isMounted && data.nextId) {
            setPatientId(data.nextId);
            setLoadingId(false);
            return;
          }
        }
      } catch (err) {
        console.error('Failed to get next ID', err);
      }
      if (isMounted) {
        const prefix = centre === 'STY Hyderabad' ? 'STY-HYD-' : 'STY-VJA-';
        const fallbackId = prefix + Math.floor(1000 + Math.random() * 9000);
        setPatientId(fallbackId);
        setLoadingId(false);
      }
    };

    fetchNextId();
    return () => {
      isMounted = false;
    };
  }, [centre]);

  // Handle DOB change and auto-compute Age
  const handleDobChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDob(value);
    if (value) {
      const birthDate = new Date(value);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0 && calculatedAge < 125) {
        setAge(calculatedAge.toString());
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!centre) {
      setErrorMsg('Please select a Branch Centre.');
      return;
    }
    if (!fullName.trim()) {
      setErrorMsg('Full Legal Name is required.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Contact Mobile number is required.');
      return;
    }
    if (!gender) {
      setErrorMsg('Please select Gender.');
      return;
    }
    if (!preferredLanguage) {
      setErrorMsg('Please select Preferred Language.');
      return;
    }
    if (!emergencyName.trim()) {
      setErrorMsg('Emergency Contact Name is required.');
      return;
    }
    if (!emergencyPhone.trim()) {
      setErrorMsg('Emergency Phone number is required.');
      return;
    }
    if (!assignedTherapist.trim()) {
      setErrorMsg('Assigned Therapist is required.');
      return;
    }

    setSubmitting(true);
    setErrorMsg(null);

    // Initial Payment Record if recorded
    const initialPayments: PaymentRecord[] = [];
    if (recordInitialPayment && paymentAmount && parseFloat(paymentAmount) > 0) {
      initialPayments.push({
        id: 'PAY-' + Date.now(),
        date: consultationDate || admissionDate,
        amount: parseFloat(paymentAmount),
        method: paymentMethod || 'Cash',
        receiptNo: `STY-RCP-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: paymentNotes || 'Initial registration payment',
        recorded_by: 'Staff Admin'
      });
    }

    const payload = {
      patient_id: patientId || undefined,
      full_name: fullName.trim(),
      preferred_name: preferredName.trim(),
      dob,
      age: age ? parseInt(age, 10) : null,
      gender: gender || 'Not specified',
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      preferred_language: preferredLanguage || 'Telugu',

      // Section 1: Admission & Financial Ledger
      admission_date: admissionDate,
      emergency_name: emergencyName.trim(),
      emergency_relationship: emergencyRelationship.trim(),
      emergency_phone: emergencyPhone.trim(),
      consultation_fee: consultationFee.trim() || '0',
      consultation_date: consultationDate,
      monthly_fee: monthlyFee.trim() || '0',
      payment_records: initialPayments,

      centre: centre || 'STY Vijayawada',
      assigned_therapist: assignedTherapist.trim(),
      referred_by: referredBy.trim(),
      status: status || 'New',

      // Occupation & Lifestyle Profile
      occupation: occupation.trim(),
      work_pattern: workPattern.trim(),
      physical_activity: physicalActivity.trim(),
      chief_complaint: '',
      complaint_since_when: '',
      complaint_audio: '',
      complaint_transcript: '',
      complaint_region: '',
      complaint_side: '',
      episode_type: '',
      pain_score: 0,
      medical_history: {},
      exam_data: {},
      investigation_attachments: [],
      therapy_plan: [], // Zero pre-configuration per user requirement
      therapy_precautions: '',
      followup_records: [],
      notes: ''
    };

    try {
      const response = await fetch('/api/patients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save patient record.');
      }

      const savedPatient = await response.json();
      onSuccess(savedPatient);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error occurred while registering patient.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="w-full space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Intake Registration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Section 1: Demographics, Admission Date, Emergency Contact, and Fee Structure
          </p>
        </div>

        {/* Patient ID Banner */}
        <div className="bg-white border-2 border-sky-100 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-[#0C4A60] text-amber-300 flex items-center justify-center font-bold text-sm">
            ID
          </div>
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
              Assigned Patient ID
            </span>
            <span className="font-mono text-base font-extrabold text-[#0C4A60]">
              {loadingId ? 'generating...' : (patientId || 'Pending')}
            </span>
          </div>
        </div>
      </div>

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Patient Admission & Personal Details */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Section 1: Demographics, Admission &amp; Billing
                </h2>
                <p className="text-xs text-slate-500">
                  Personal profile, centre location, emergency contact, and fee schedule
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Centre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                STY Branch Centre <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <select
                  value={centre}
                  onChange={(e) => setCentre(e.target.value as any)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                >
                  <option value="">Select Branch Centre</option>
                  <option value="STY Vijayawada">STY Vijayawada (Governorpet)</option>
                  <option value="STY Hyderabad">STY Hyderabad (Madhapur)</option>
                </select>
              </div>
            </div>

            {/* Admission Date */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  Admission Date <span className="text-rose-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => setAdmissionDate(getTodayStr())}
                  className="text-[11px] font-semibold text-[#0C4A60] hover:text-[#072d3b] hover:underline cursor-pointer"
                  title="Update admission date to today"
                >
                  Set Today
                </button>
              </div>
              <div className="relative">
                <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="date"
                  value={admissionDate}
                  onChange={(e) => setAdmissionDate(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              >
                <option value="">Select Initial Status</option>
                <option value="New">New Intake</option>
                <option value="Active">Active Patient</option>
                <option value="Assessment Pending">Assessment Pending</option>
              </select>
            </div>

            {/* Full Legal Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Full Legal Name <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  placeholder="Enter Full Legal Name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Name / Alias
              </label>
              <input
                type="text"
                placeholder="Enter Preferred Name"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Birth
              </label>
              <input
                type="date"
                value={dob}
                onChange={handleDobChange}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Age (Years)
              </label>
              <input
                type="number"
                placeholder="Enter Age"
                min="1"
                max="120"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Gender <span className="text-rose-500">*</span>
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Mobile */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="tel"
                  placeholder="Enter Mobile Number"
                  value={mobile}
                  onChange={(e) => setMobile(e.target.value)}
                  required
                  className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Language <span className="text-rose-500">*</span>
              </label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              >
                <option value="">Select Preferred Language</option>
                <option value="Telugu">Telugu (తెలుగు)</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi (हिंदी)</option>
                <option value="Tamil">Tamil</option>
                <option value="Other">Other</option>
              </select>
            </div>

            {/* Residential Address */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Residential Address
              </label>
              <input
                type="text"
                placeholder="Enter Residential Address"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>
          </div>

          {/* Occupation & Lifestyle Sub-section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Occupation, Work Pattern &amp; Lifestyle
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Occupation / Profession
                </label>
                <input
                  type="text"
                  placeholder="Enter Occupation"
                  value={occupation}
                  onChange={(e) => setOccupation(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Work Pattern / Lifestyle
                </label>
                <input
                  type="text"
                  placeholder="Enter Work Pattern"
                  value={workPattern}
                  onChange={(e) => setWorkPattern(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Physical Activity Level
                </label>
                <input
                  type="text"
                  placeholder="Enter Activity Level"
                  value={physicalActivity}
                  onChange={(e) => setPhysicalActivity(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>
          </div>

          {/* Emergency Contact Sub-section */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Emergency Contact Person
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Contact Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Emergency Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Relationship
                </label>
                <input
                  type="text"
                  placeholder="Enter Relationship"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Phone <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter Emergency Phone"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>
          </div>

          {/* Care Allocation */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
              Therapist Allocation &amp; Referral
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Assigned Therapist <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Assigned Therapist Name"
                  value={assignedTherapist}
                  onChange={(e) => setAssignedTherapist(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Referred By (Doctor / Hospital / Self)
                </label>
                <input
                  type="text"
                  placeholder="Enter Referred By"
                  value={referredBy}
                  onChange={(e) => setReferredBy(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm"
                />
              </div>
            </div>
          </div>

          {/* Fee & Payment Ledger Initialization */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
            <div className="flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-[#0C4A60]" />
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Admission Fee Structure &amp; Initial Receipt
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter Consultation Fee"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#0C4A60]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Consultation Date
                </label>
                <input
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Monthly Package Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter Monthly Package Fee"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#0C4A60]"
                />
              </div>
            </div>

            {/* Record initial payment checkbox */}
            <div className="pt-3 mt-3 border-t border-slate-200">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 mb-3 select-none">
                <input
                  type="checkbox"
                  checked={recordInitialPayment}
                  onChange={(e) => setRecordInitialPayment(e.target.checked)}
                  className="w-4 h-4 text-[#0C4A60] rounded accent-[#0C4A60]"
                />
                <span>Issue &amp; record initial payment receipt upon admission</span>
              </label>

              {recordInitialPayment && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 bg-white p-3.5 rounded-lg border border-slate-200">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Amount Paid (₹)</label>
                    <input
                      type="number"
                      placeholder="Enter Amount Paid"
                      value={paymentAmount}
                      onChange={(e) => setPaymentAmount(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-emerald-700"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs bg-white"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="UPI">UPI / QR Code / GPay</option>
                      <option value="Cash">Cash</option>
                      <option value="Card">Card POS</option>
                      <option value="Bank Transfer">NEFT / Bank Transfer</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Receipt Note / Ref</label>
                    <input
                      type="text"
                      placeholder="Enter Receipt Note / Ref"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-medium text-sm hover:bg-slate-50 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="px-6 py-2.5 rounded-xl bg-[#0C4A60] hover:bg-[#083344] text-white font-semibold text-sm shadow-xs transition-colors flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Registering Patient...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Register Patient (Section 1)</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
