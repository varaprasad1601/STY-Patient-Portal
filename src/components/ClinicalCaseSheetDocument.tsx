import React, { useState } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import {
  Printer,
  Download,
  X,
  Building2,
  Calendar,
  Phone,
  Mail,
  MapPin,
  User,
  HeartPulse,
  Activity,
  AlertTriangle,
  CreditCard,
  FileText,
  Clock,
  CheckCircle2,
  ShieldCheck
} from 'lucide-react';
import {
  Patient,
  MedicalHistory,
  ExamData,
  PaymentRecord,
  InvestigationAttachment,
  WeeklyPractice,
  FollowupFeedbackRecord
} from '../types.ts';
import { formatIndianDate, getIndianCurrentDateTime } from '../utils/dateFormatter';

interface Props {
  patient: Patient;
  onClose?: () => void;
  isModalPreview?: boolean;
}

export const ClinicalCaseSheetDocument: React.FC<Props> = ({
  patient,
  onClose,
  isModalPreview = false
}) => {
  // Parse JSON data safely
  let medHistory: MedicalHistory = {
    hasMajorOperation: false,
    majorOperationDetails: '',
    hasMajorIllness: false,
    majorIllnessDetails: '',
    hasMajorTrauma: false,
    majorTraumaDetails: '',
    hasRadiatingPain: false,
    radiatingPainDetails: '',
    hasNumbness: false,
    numbnessDetails: '',
    hasAbnormalSensation: false,
    abnormalSensationDetails: '',
    hasMotorWeakness: false,
    motorWeaknessDetails: '',
    hasBowelBladderInvolvement: false,
    bowelBladderDetails: '',
    hasWeightLossFever: false,
    weightLossFeverDetails: '',
    hasGiddiness: false,
    giddinessDetails: '',
    hasHeadache: false,
    headacheDetails: '',
    menstrualHistory: '',
    previousEpisodes: '',
    familyHistory: ''
  };

  try {
    if (typeof patient.medical_history === 'string' && patient.medical_history.startsWith('{')) {
      medHistory = { ...medHistory, ...JSON.parse(patient.medical_history) };
    } else if (typeof patient.medical_history === 'object' && patient.medical_history !== null) {
      medHistory = { ...medHistory, ...(patient.medical_history as any) };
    }
  } catch {
    // ignore
  }

  let examData: ExamData = {
    weight: '',
    bp: '',
    pulse: '',
    bmi: '',
    toeWalkingS1: '',
    heelWalkingL5: '',
    oneLegStandingL4: '',
    slrLeft: '',
    slrRight: '',
    sensoryDeficit: '',
    dorsalisPedis: '',
    kneeVarusValgus: '',
    kneeFixedFlexion: '',
    kneeHyperextension: '',
    kneeRangeOfMotion: '',
    kneeTenderness: '',
    kneeEffusion: '',
    kneeStabilityTests: '',
    extremityJointAssessment: '',
    investigations: ''
  };

  try {
    if (typeof patient.exam_data === 'string' && patient.exam_data.startsWith('{')) {
      examData = { ...examData, ...JSON.parse(patient.exam_data) };
    } else if (typeof patient.exam_data === 'object' && patient.exam_data !== null) {
      examData = { ...examData, ...(patient.exam_data as any) };
    }
  } catch {
    // ignore
  }

  const isHtnDiagnosed = Boolean(
    medHistory.hypertension?.present ||
    medHistory.hypertension?.has ||
    medHistory.hypertension?.currentReading ||
    medHistory.hypertension?.pastReading ||
    medHistory.hypertension?.sinceWhen ||
    medHistory.hypertension?.medication ||
    medHistory.hypertension?.medications
  );

  const isDmDiagnosed = Boolean(
    medHistory.diabetes?.present ||
    medHistory.diabetes?.has ||
    medHistory.diabetes?.currentReading ||
    medHistory.diabetes?.pastReading ||
    medHistory.diabetes?.sinceWhen ||
    medHistory.diabetes?.medication ||
    medHistory.diabetes?.medications
  );

  const isThyroidDiagnosed = Boolean(
    medHistory.thyroid?.present ||
    medHistory.thyroid?.has ||
    medHistory.thyroid?.currentReading ||
    medHistory.thyroid?.pastReading ||
    medHistory.thyroid?.sinceWhen ||
    medHistory.thyroid?.medication ||
    medHistory.thyroid?.medications
  );

  let paymentsList: PaymentRecord[] = [];
  try {
    if (typeof patient.payment_records === 'string' && patient.payment_records.startsWith('[')) {
      paymentsList = JSON.parse(patient.payment_records);
    } else if (Array.isArray(patient.payment_records)) {
      paymentsList = patient.payment_records;
    }
  } catch {
    // ignore
  }

  let investigationsList: InvestigationAttachment[] = [];
  try {
    if (typeof patient.investigation_attachments === 'string' && patient.investigation_attachments.startsWith('[')) {
      investigationsList = JSON.parse(patient.investigation_attachments);
    } else if (Array.isArray(patient.investigation_attachments)) {
      investigationsList = patient.investigation_attachments;
    }
  } catch {
    // ignore
  }

  let followupList: FollowupFeedbackRecord[] = [];
  try {
    if (typeof patient.followup_records === 'string' && patient.followup_records.startsWith('[')) {
      followupList = JSON.parse(patient.followup_records);
    } else if (Array.isArray(patient.followup_records)) {
      followupList = patient.followup_records;
    }
  } catch {
    // ignore
  }

  let therapySchedule: WeeklyPractice[] = [];
  try {
    if (typeof patient.therapy_plan === 'string' && patient.therapy_plan.startsWith('[')) {
      therapySchedule = JSON.parse(patient.therapy_plan);
    } else if (Array.isArray(patient.therapy_plan)) {
      therapySchedule = patient.therapy_plan;
    }
  } catch {
    // ignore
  }

  const totalPaid = paymentsList.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  const [downloadingPdf, setDownloadingPdf] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPdf = async () => {
    const element = document.getElementById('clinical-case-sheet-document');
    if (!element) return;
    setDownloadingPdf(true);
    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 1200
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`STY_CaseSheet_${patient.patient_id || 'Patient'}.pdf`);
    } catch (err) {
      console.error('Failed to generate PDF', err);
      window.print();
    } finally {
      setDownloadingPdf(false);
    }
  };

  const documentContent = (
    <div id="clinical-case-sheet-document" className="clinical-case-sheet-print bg-white text-slate-900 font-sans p-6 sm:p-10 w-full max-w-5xl mx-auto leading-normal text-xs print:p-0 print:max-w-none print:text-[11px] print:leading-relaxed">
      {/* 1. OFFICIAL CLINIC HEADER & LETTERHEAD */}
      <header className="border-b-2 border-slate-900 pb-4 mb-5">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <img
              src="/assets/aistudio/70e661c2-7e1f-4652-8fdb-da470c2ff33a_90cb30a0.png"
              alt="Surya Tejas Yogalayam"
              className="w-16 h-16 object-contain shrink-0"
            />
            <div>
              <h1 className="text-lg font-black tracking-wider text-slate-900 uppercase">
                Surya Tejas Yogalayam
              </h1>
              <p className="text-[11px] font-semibold text-slate-700 tracking-wide">
                Institute of Classical Yoga Therapy &bull; Non-Invasive Spine &amp; Joint Rehabilitation
              </p>
              <p className="text-[10px] text-slate-500 italic mt-0.5">
                Clinical Healthcare Directory &bull; Healing Goes Beyond Medicines
              </p>
            </div>
          </div>

          <div className="text-right text-[11px] space-y-0.5">
            <div className="inline-block px-2 py-0.5 rounded bg-slate-100 border border-slate-300 font-bold text-slate-800 uppercase tracking-wider text-[10px]">
              Official Case Sheet
            </div>
            <div className="font-mono font-bold text-slate-900 text-xs mt-1">
              {patient.centre}
            </div>
            <div className="text-slate-500 text-[10px] whitespace-pre-line">
              {patient.centre.includes('Vijayawada')
                ? '59A-15-15 Old P&T Colony, Patamata,\n2nd left after Nirmala Convent,\nDwaraka Suma, beside road of Ice Magic, Bhadraiah Nagar, Vijayawada,\nAndhra Pradesh 520010'
                : 'Madhapur, Hyderabad, Telangana'}
            </div>
          </div>
        </div>

        {/* Case Sheet Registry Strip */}
        <div className="mt-4 pt-2.5 border-t border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px] font-mono bg-slate-50/80 p-2 rounded-md border">
          <div>
            <span className="text-slate-500 block uppercase">Patient ID:</span>
            <span className="font-bold text-slate-900 text-xs">{patient.patient_id}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase">Admission Date:</span>
            <span className="font-bold text-slate-900 text-xs">
              {formatIndianDate(patient.admission_date || patient.created_at) || '-'}
            </span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase">Clinical Status:</span>
            <span className="font-bold text-slate-900 text-xs">{patient.status}</span>
          </div>
          <div>
            <span className="text-slate-500 block uppercase">Document Print Date:</span>
            <span className="font-bold text-slate-900 text-xs">
              {getIndianCurrentDateTime(true)}
            </span>
          </div>
        </div>
      </header>

      {/* 2. PATIENT PROFILE & BASIC INFORMATION (AT TOP) */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Patient Profile &amp; Demographics</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 1</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white space-y-3.5 break-inside-avoid">
          {/* Main Demographics Grid (Order from legal name) */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-3 gap-x-4">
            <div className="sm:col-span-2">
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Full Legal Name</span>
              <span className="font-bold text-slate-900 text-xs block">{patient.full_name}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Preferred Name / Alias</span>
              <span className="font-semibold text-slate-900 block">{patient.preferred_name || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Date of Birth</span>
              <span className="font-semibold text-slate-900 font-mono block">
                {patient.dob ? formatIndianDate(patient.dob) : '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Age (Years)</span>
              <span className="font-semibold text-slate-900 block">
                {patient.age ? `${patient.age} Years` : '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Gender</span>
              <span className="font-semibold text-slate-900 block">
                {patient.gender || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Mobile Number</span>
              <span className="font-semibold text-slate-900 font-mono block">{patient.mobile || '-'}</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Email Address</span>
              <span className="font-semibold text-slate-900 font-mono text-xs break-all block">
                {patient.email || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Preferred Language</span>
              <span className="font-semibold text-slate-900 block">
                {patient.preferred_language || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Occupation / Profession</span>
              <span className="font-semibold text-slate-900 block">
                {patient.occupation || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Work Pattern</span>
              <span className="font-semibold text-slate-900 block">
                {patient.work_pattern || '-'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Physical Activity Level</span>
              <span className="font-semibold text-slate-900 block">
                {patient.physical_activity || '-'}
              </span>
            </div>

            <div className="sm:col-span-3">
              <span className="text-slate-500 text-[10px] block uppercase font-medium">Residential Address</span>
              <span className="font-medium text-slate-800 block">
                {patient.address || '-'}
              </span>
            </div>
          </div>

          {/* Sub-section 1: Emergency Contact Person (Divided inside same card) */}
          <div className="mt-3.5 pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Emergency Contact Person
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Contact Name</span>
                <span className="font-semibold text-slate-900 block">
                  {patient.emergency_name || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Relationship</span>
                <span className="font-semibold text-slate-900 block">
                  {patient.emergency_relationship || '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Emergency Phone</span>
                <span className="font-semibold text-slate-900 font-mono block">
                  {patient.emergency_phone || '-'}
                </span>
              </div>
            </div>
          </div>

          {/* Sub-section 2: Therapist Allocation & Referral (Divided inside same card) */}
          <div className="mt-3.5 pt-3 border-t border-slate-200">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-2">
              Therapist Allocation &amp; Referral
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-2.5 gap-x-4">
              <div>
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Assigned Therapist</span>
                <span className="font-bold text-[#0C4A60] block">
                  {patient.assigned_therapist ? patient.assigned_therapist.replace(/^Dr\.\s*/i, '') : '-'}
                </span>
              </div>
              <div className="sm:col-span-2">
                <span className="text-slate-500 text-[10px] block uppercase font-medium">Referred By (Doctor / Hospital / Self)</span>
                <span className="font-semibold text-slate-900 block">
                  {patient.referred_by || '-'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. SECTION 2: CHIEF COMPLAINT (C/o) & PRESENTING SYMPTOMS */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Chief Complaint (C/o) &amp; Presenting Symptoms</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 2</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white space-y-3 break-inside-avoid">
          <div className="p-3 bg-slate-50 rounded border border-slate-200">
            <span className="text-slate-500 text-[10px] block uppercase font-bold mb-1">
              Primary Presenting Complaint:
            </span>
            <p className="text-slate-900 font-semibold text-xs leading-relaxed">
              {patient.chief_complaint || '-'}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5 text-xs">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Since When?</span>
              <span className="font-bold text-slate-900 block mt-0.5">{patient.complaint_since_when || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Episode Type</span>
              <span className="font-bold text-slate-900 block mt-0.5">{patient.episode_type || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Anatomical Region</span>
              <span className="font-bold text-slate-900 block mt-0.5">{patient.complaint_region || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Affected Side</span>
              <span className="font-bold text-slate-900 block mt-0.5">{patient.complaint_side || '-'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Pain Score (VAS)</span>
              <span className="font-bold text-rose-800 font-mono block mt-0.5">
                {patient.pain_score !== undefined && patient.pain_score !== null ? `${patient.pain_score} / 10` : '-'}
              </span>
            </div>
          </div>

          {patient.complaint_transcript && (
            <div className="text-[11px] bg-slate-50 p-2.5 rounded border border-slate-200">
              <span className="font-bold text-slate-800 block text-[10px] uppercase mb-0.5">
                Intake Audio Recorded Description:
              </span>
              <p className="italic text-slate-700">"{patient.complaint_transcript}"</p>
            </div>
          )}
        </div>
      </section>

      {/* 4. SECTION 3: CHRONIC CONDITION PARAMETERS: HTN, DIABETES & THYROID */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Chronic Condition Parameters: HTN, Diabetes &amp; Thyroid</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 3</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* 1. Hypertension Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 break-inside-avoid">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs">Hypertension (HTN):</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isHtnDiagnosed
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isHtnDiagnosed ? 'Diagnosed' : 'Negative'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Since When:</span>
                  <span className="font-semibold text-slate-900">{medHistory.hypertension?.sinceWhen || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Past BP Reading:</span>
                  <span className="font-mono font-semibold text-slate-800">{medHistory.hypertension?.pastReading || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current BP Reading:</span>
                  <span className="font-mono font-bold text-[#0C4A60]">
                    {medHistory.hypertension?.currentReading || (isHtnDiagnosed ? examData.bp || '-' : '-')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Medications:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px]" title={medHistory.hypertension?.medication || medHistory.hypertension?.medications || '-'}>
                    {medHistory.hypertension?.medication || medHistory.hypertension?.medications || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 2. Diabetes Mellitus Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 break-inside-avoid">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs">Diabetes Mellitus (DM):</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isDmDiagnosed
                      ? 'bg-amber-100 text-amber-800 border border-amber-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isDmDiagnosed ? 'Diagnosed' : 'Negative'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Diabetes Type:</span>
                  <span className="font-semibold text-slate-900">{medHistory.diabetes?.type || (isDmDiagnosed ? 'Type 2' : '-')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Since When:</span>
                  <span className="font-semibold text-slate-900">{medHistory.diabetes?.sinceWhen || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Past Sugar / HbA1c:</span>
                  <span className="font-mono font-semibold text-slate-800">{medHistory.diabetes?.pastReading || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Sugar / HbA1c:</span>
                  <span className="font-mono font-bold text-[#0C4A60]">{medHistory.diabetes?.currentReading || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Medications:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px]" title={medHistory.diabetes?.medication || medHistory.diabetes?.medications || '-'}>
                    {medHistory.diabetes?.medication || medHistory.diabetes?.medications || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* 3. Thyroid Dysfunction Card */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-2.5 break-inside-avoid">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="font-bold text-slate-900 text-xs">Thyroid Dysfunction:</span>
                <span
                  className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold ${
                    isThyroidDiagnosed
                      ? 'bg-purple-100 text-purple-800 border border-purple-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isThyroidDiagnosed ? 'Diagnosed' : 'Negative'}
                </span>
              </div>

              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Thyroid Type:</span>
                  <span className="font-semibold text-slate-900">{medHistory.thyroid?.type || (isThyroidDiagnosed ? 'Hypothyroidism' : '-')}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Since When:</span>
                  <span className="font-semibold text-slate-900">{medHistory.thyroid?.sinceWhen || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Past TSH Reading:</span>
                  <span className="font-mono font-semibold text-slate-800">{medHistory.thyroid?.pastReading || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current TSH Reading:</span>
                  <span className="font-mono font-bold text-[#0C4A60]">{medHistory.thyroid?.currentReading || '-'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-medium">Current Medications:</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[120px]" title={medHistory.thyroid?.medication || medHistory.thyroid?.medications || '-'}>
                    {medHistory.thyroid?.medication || medHistory.thyroid?.medications || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {medHistory.htDmThyroidDetails && !isHtnDiagnosed && !isDmDiagnosed && !isThyroidDiagnosed && (
            <div className="mt-3 p-2.5 bg-slate-50 rounded border border-slate-200 text-xs break-inside-avoid">
              <span className="font-bold text-slate-700 block text-[10px] uppercase mb-0.5">Chronic Condition Notes:</span>
              <p className="text-slate-800">{medHistory.htDmThyroidDetails}</p>
            </div>
          )}
        </div>
      </section>

      {/* 5. SECTION 4: SURGICAL, NEUROLOGICAL & GENERAL MEDICAL HISTORY */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Surgical, Neurological &amp; General Medical History</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 4</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white break-inside-avoid">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Operation:</span>
              <span className={medHistory.hasMajorOperation ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                {medHistory.hasMajorOperation ? `Yes: ${medHistory.majorOperationDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Illness / Hospitalization:</span>
              <span className={medHistory.hasMajorIllness ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                {medHistory.hasMajorIllness ? `Yes: ${medHistory.majorIllnessDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Trauma:</span>
              <span className={medHistory.hasMajorTrauma ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasMajorTrauma ? `Yes: ${medHistory.majorTraumaDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Radiating Pain:</span>
              <span className={medHistory.hasRadiatingPain ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasRadiatingPain ? `Present: ${medHistory.radiatingPainDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Numbness in UL/LL:</span>
              <span className={medHistory.hasNumbness ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasNumbness ? `Present: ${medHistory.numbnessDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Motor Weakness:</span>
              <span className={medHistory.hasMotorWeakness ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                {medHistory.hasMotorWeakness ? `Present: ${medHistory.motorWeaknessDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Bowel / Bladder involvement:</span>
              <span className={medHistory.hasBowelBladderInvolvement ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                {medHistory.hasBowelBladderInvolvement ? `Present: ${medHistory.bowelBladderDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Abnormal Sensation:</span>
              <span className={medHistory.hasAbnormalSensation ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasAbnormalSensation ? `Present: ${medHistory.abnormalSensationDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Giddiness / Dizziness:</span>
              <span className={medHistory.hasGiddiness ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasGiddiness ? `Present: ${medHistory.giddinessDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Headache:</span>
              <span className={medHistory.hasHeadache ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                {medHistory.hasHeadache ? `Present: ${medHistory.headacheDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">H/o Weight Loss / Fever:</span>
              <span className={medHistory.hasWeightLossFever ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                {medHistory.hasWeightLossFever ? `Present: ${medHistory.weightLossFeverDetails || '-'}` : '-'}
              </span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">Previous Similar Episodes:</span>
              <span className="text-slate-700 font-medium">{medHistory.previousEpisodes || '-'}</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">Family Medical History:</span>
              <span className="text-slate-700 font-medium">{medHistory.familyHistory || '-'}</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="font-semibold text-slate-800 block mb-0.5">
                Menstrual &amp; Obstetric History:
              </span>
              <span className="text-slate-700 font-medium">{medHistory.menstrualHistory || '-'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* 6. SECTION 5: PHYSICAL EXAMINATION & CLINICAL BIOMETRICS */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Physical Examination, Functional Tests &amp; Diagnostics</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 5</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white space-y-3.5">
          {/* Vitals Grid */}
          <div className="break-inside-avoid">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Anthropometrics &amp; Vital Signs
            </span>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-500 text-[10px] block">Height:</span>
                <span className="font-bold text-slate-900">
                  {examData.height ? (examData.height.toLowerCase().includes('cm') ? examData.height : `${examData.height} cm`) : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Weight:</span>
                <span className="font-bold text-slate-900">
                  {examData.weight ? (examData.weight.toLowerCase().includes('kg') ? examData.weight : `${examData.weight} kg`) : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Blood Pressure:</span>
                <span className="font-bold text-slate-900">{examData.bp || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Pulse Rate:</span>
                <span className="font-bold text-slate-900">{examData.pulse || '-'}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Body Mass Index:</span>
                <span className="font-bold text-slate-900">{examData.bmi || '-'}</span>
              </div>
            </div>
          </div>

          {/* Spine & Nerve Root Functional Tests */}
          <div className="break-inside-avoid">
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Functional Spine &amp; Lower Extremity Nerve Root Examination
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 text-[10px] block">Toe Walking (S1 Root):</span>
                <span className="font-semibold text-slate-900">{examData.toeWalkingS1 || '-'}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 text-[10px] block">Heel Walking (L5 Root):</span>
                <span className="font-semibold text-slate-900">{examData.heelWalkingL5 || '-'}</span>
              </div>
              <div className="p-2.5 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 text-[10px] block">One Leg Standing (L4 Root):</span>
                <span className="font-semibold text-slate-900">{examData.oneLegStandingL4 || '-'}</span>
              </div>
            </div>
          </div>

          {/* SLR Test & Circulation & Sensory Findings */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs break-inside-avoid">
            <div className="p-2.5 bg-white border border-slate-200 rounded">
              <span className="text-slate-700 font-bold text-[10px] block uppercase">
                Straight Leg Raise (SLR) Test (L4-S1 Tension):
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Left Leg:</span>
                  <span className="font-bold text-slate-900 font-mono">{examData.slrLeft || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Right Leg:</span>
                  <span className="font-bold text-slate-900 font-mono">{examData.slrRight || '-'}</span>
                </div>
              </div>
            </div>

            <div className="p-2.5 bg-white border border-slate-200 rounded">
              <span className="text-slate-700 font-bold text-[10px] block uppercase">
                Circulation &amp; Sensory Findings:
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600">Sensory Deficit:</span>
                  <span className="font-bold text-slate-900">{examData.sensoryDeficit || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Dorsalis Pedis Pulse:</span>
                  <span className="font-bold text-slate-900">{examData.dorsalisPedis || '-'}</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 p-2.5 bg-white border border-slate-200 rounded">
              <span className="text-slate-700 font-bold text-[10px] block uppercase">
                Knee Biometrics &amp; Alignment:
              </span>
              <div className="mt-1 space-y-0.5">
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Alignment:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeVarusValgus || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Flexion Deformity:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeFixedFlexion || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Hyperextension:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeHyperextension || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Range of Motion:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeRangeOfMotion || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Tenderness:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeTenderness || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Effusion:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeEffusion || '-'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 text-[10px]">Stability Tests:</span>
                  <span className="font-semibold text-slate-900">{examData.kneeStabilityTests || '-'}</span>
                </div>
              </div>
            </div>

            <div className="sm:col-span-2 p-2.5 bg-white border border-slate-200 rounded">
              <span className="text-slate-700 font-bold text-[10px] uppercase">
                Extremity Joint Assessment:
              </span>
              <p className="mt-1 text-slate-900 font-semibold">
                {examData.extremityJointAssessment || '-'}
              </p>
            </div>
          </div>

          {/* Knee Joint Assessment & Investigations */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-xs break-inside-avoid">
            <span className="text-slate-600 font-bold text-[10px] block uppercase mb-1">
              Joint Alignment &amp; Diagnostic Imaging Findings:
            </span>
            <p className="text-slate-800 leading-relaxed font-medium">
              {examData.investigations || '-'}
            </p>
            {investigationsList.length > 0 && (
              <div className="mt-3 pt-3 border-t border-slate-200 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-700 block uppercase mb-1">
                  Diagnostic Investigations &amp; Uploads (X-Rays, MRI, Reports) ({investigationsList.length}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {investigationsList.map((doc, idx) => {
                    const imgUrl = doc.file_url || doc.dataUrl || '';
                    return (
                      <div key={idx} className="p-2.5 bg-white border border-slate-200 rounded text-[11px] space-y-1.5 break-inside-avoid">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900">{doc.title}</span>
                          <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-sky-50 text-[#0C4A60] border border-sky-200">{doc.type}</span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono block">Date: {formatIndianDate(doc.date)}</span>
                        {doc.notes && <p className="text-[10px] text-slate-700">{doc.notes}</p>}
                        {imgUrl && (imgUrl.startsWith('data:image') || imgUrl.endsWith('.png') || imgUrl.endsWith('.jpg') || imgUrl.includes('unsplash')) && (
                          <div className="mt-1.5 rounded overflow-hidden border border-slate-200 bg-slate-50 max-h-48 flex items-center justify-center">
                            <img src={imgUrl} alt={doc.title} className="max-h-44 object-contain w-full" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 6. SECTION 6: PRESCRIBED THERAPY PLAN & CLINICAL PRECAUTIONS */}
      <section className="mb-5 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Prescribed Yoga Therapy Protocol &amp; Clinical Contraindications</span>
          <span className="text-[10px] text-slate-300 font-normal">Section 6</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white space-y-3">
          {/* Precautions Box */}
          {patient.therapy_precautions && (
            <div className="p-3 rounded bg-amber-50/80 border border-amber-300 break-inside-avoid">
              <span className="font-bold text-amber-900 block text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Clinical Precautions &amp; Movement Contraindications:
              </span>
              <p className="text-amber-950 text-xs whitespace-pre-wrap leading-relaxed font-medium">
                {patient.therapy_precautions}
              </p>
            </div>
          )}

          {/* Attending Therapist Directives */}
          {patient.notes && (
            <div className="p-3 rounded bg-slate-50 border border-slate-200 break-inside-avoid">
              <span className="font-bold text-slate-800 block text-[11px] uppercase tracking-wider mb-1">
                Attending Therapist Clinical Directive:
              </span>
              <p className="text-slate-800 text-xs whitespace-pre-wrap leading-relaxed">
                {patient.notes}
              </p>
            </div>
          )}

          {/* 3-Month Week-wise Protocol Summary */}
          {therapySchedule.length > 0 && (
            <div>
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-2">
                Prescribed 12-Week Rehabilitation Schedule ({therapySchedule.length} Weeks Outlined):
              </span>
              <div className="space-y-3">
                {therapySchedule.map((week, idx) => {
                  const currentWeekNum = week.weekNumber || week.week || (idx + 1);
                  return (
                    <div
                      key={currentWeekNum}
                      className={`p-3 rounded-xl border text-xs break-inside-avoid ${
                        week.completed
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : 'border-slate-200 bg-slate-50/50'
                      }`}
                    >
                      <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                        <div className="flex items-center gap-2">
                          <span className="w-6 h-6 rounded-md bg-[#0C4A60] text-white flex items-center justify-center font-bold text-[11px]">
                            W{currentWeekNum}
                          </span>
                          <div>
                            <span className="text-xs font-bold text-slate-900 block">
                              Week {currentWeekNum}: {week.theme || week.title || 'Therapeutic Module'}
                            </span>
                            <span className="text-[10px] text-slate-500">{week.duration || week.frequencyDuration || 'Daily Practice'}</span>
                          </div>
                        </div>

                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            week.completed
                              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                              : 'bg-white text-slate-600 border border-slate-200'
                          }`}
                        >
                          {week.completed ? 'Completed' : 'In Progress'}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] mt-1.5">
                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                            Asanas &amp; Physical Practices
                          </span>
                          <p className="text-slate-800 font-medium">{week.practices || '-'}</p>
                        </div>

                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                            Pranayama &amp; Breathwork
                          </span>
                          <p className="text-slate-800 font-medium">{week.pranayama || '-'}</p>
                        </div>

                        <div className="p-2 rounded-lg bg-white border border-slate-200">
                          <span className="text-[9px] font-bold text-slate-400 uppercase block mb-0.5">
                            Therapeutic Props &amp; Notes
                          </span>
                          <p className="text-slate-800 font-medium">
                            {week.props || '-'} {week.notes ? `• ${week.notes}` : ''}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* 7. SECTION 7: CLINICAL FOLLOW-UP & PROGRESS HISTORY */}
      {followupList.length > 0 && (
        <section className="mb-5 print:mb-4">
          <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
            <span>Clinical Follow-up &amp; Progress History</span>
            <span className="text-[10px] text-slate-300 font-normal">Section 7</span>
          </div>
          <div className="border border-t-0 border-slate-300 p-0 rounded-b bg-white overflow-hidden break-inside-avoid">
            <table className="w-full text-left border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-200">
                  <th className="py-2 px-3 w-28">Follow-up Date</th>
                  <th className="py-2 px-3 w-20">VAS Pain</th>
                  <th className="py-2 px-3">Patient Feedback &amp; Clinical Progress</th>
                  <th className="py-2 px-3 w-32">Next Scheduled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {followupList.map((rec, i) => (
                  <tr key={i} className="hover:bg-slate-50 break-inside-avoid">
                    <td className="py-2 px-3 font-mono font-semibold text-slate-900">
                      {formatIndianDate(rec.followup_date)}
                    </td>
                    <td className="py-2 px-3 font-bold text-rose-700 font-mono">
                      {rec.pain_score} / 10
                    </td>
                    <td className="py-2 px-3 text-slate-700">
                      <div className="italic">"{rec.feedback}"</div>
                      {rec.clinical_notes && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Adjustment: {rec.clinical_notes}
                        </div>
                      )}
                    </td>
                    <td className="py-2 px-3 font-mono text-slate-600">
                      {rec.next_followup_date ? formatIndianDate(rec.next_followup_date) : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* 8. SECTION 7: ADMISSION FEE & PAYMENT TRANSACTION DETAILS (AT LAST) */}
      <section className="mb-6 print:mb-4">
        <div className="bg-slate-800 text-white px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded-t flex items-center justify-between">
          <span>Admission Fee Structure &amp; Payment Transaction Ledger</span>
          <span className="text-[10px] text-slate-300 font-normal">Final Section (Financial Record)</span>
        </div>
        <div className="border border-t-0 border-slate-300 p-3.5 rounded-b bg-white space-y-3.5">
          {/* Fee Summary Row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200 break-inside-avoid">
            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Consultation Fee</span>
              <span className="font-bold text-[#0C4A60] text-sm">
                ₹{patient.consultation_fee ? Number(patient.consultation_fee).toLocaleString('en-IN') : '500'}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {patient.consultation_date ? `Date: ${formatIndianDate(patient.consultation_date)}` : 'At admission'}
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Monthly Therapy Fee</span>
              <span className="font-bold text-[#0C4A60] text-sm">
                ₹{patient.monthly_fee ? Number(patient.monthly_fee).toLocaleString('en-IN') : '3,500'} / mo
              </span>
              <span className="text-[10px] text-slate-500 block">Standard clinical package</span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Total Amount Received</span>
              <span className="font-bold text-emerald-700 text-sm font-mono">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[10px] text-slate-500 block">
                {paymentsList.length} transaction(s) recorded
              </span>
            </div>

            <div>
              <span className="text-slate-500 text-[10px] block uppercase">Billing Status</span>
              <span className="inline-block px-2 py-0.5 mt-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                Verified On File
              </span>
            </div>
          </div>

          {/* Payment Receipts Ledger Table */}
          <div>
            <span className="text-[10px] font-bold uppercase text-slate-500 block mb-1">
              Itemized Manual Payment Receipts Ledger:
            </span>
            {paymentsList.length === 0 ? (
              <div className="p-3 text-center text-slate-400 italic border border-dashed rounded bg-slate-50">
                No manual transaction receipts recorded yet.
              </div>
            ) : (
              <div className="border border-slate-200 rounded overflow-hidden">
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-100 text-[10px] font-bold text-slate-700 uppercase border-b border-slate-200">
                      <th className="py-1.5 px-3">Receipt / Trans ID</th>
                      <th className="py-1.5 px-3">Date (DD-MM-YYYY)</th>
                      <th className="py-1.5 px-3">Payment Mode</th>
                      <th className="py-1.5 px-3">Notes &amp; Reference</th>
                      <th className="py-1.5 px-3 text-right">Amount (₹)</th>
                      <th className="py-1.5 px-3 text-center">Receipt Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {paymentsList.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50">
                        <td className="py-1.5 px-3 font-mono font-semibold text-slate-800">{pay.id}</td>
                        <td className="py-1.5 px-3 font-mono text-slate-700">
                          {formatIndianDate(pay.payment_date)}
                        </td>
                        <td className="py-1.5 px-3 text-slate-800 font-medium">{pay.payment_method}</td>
                        <td className="py-1.5 px-3 text-slate-600">{pay.notes || '-'}</td>
                        <td className="py-1.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{Number(pay.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-1.5 px-3 text-center">
                          <span className="text-[10px] font-bold text-emerald-800">Received</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 9. CLINICAL SIGNATURES & VERIFICATION ATTESTATION */}
      <footer className="mt-8 pt-6 border-t-2 border-slate-400 break-inside-avoid">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-center text-xs">
          <div>
            <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1 text-slate-400 italic text-[10px]">
              (Attending Yoga Therapist Signature)
            </div>
            <span className="font-bold text-slate-900 block mt-1.5">
              {patient.assigned_therapist ? patient.assigned_therapist.replace(/^Dr\.\s*/i, '') : '-'}
            </span>
            <span className="text-[10px] text-slate-500 block">Attending Clinical Yoga Therapist</span>
          </div>

          <div>
            <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1 text-slate-400 italic text-[10px]">
              (Patient / Guardian Signature)
            </div>
            <span className="font-bold text-slate-900 block mt-1.5">{patient.full_name}</span>
            <span className="text-[10px] text-slate-500 block">Patient / Authorized Representative</span>
          </div>

          <div className="col-span-2 sm:col-span-1">
            <div className="h-12 border-b border-slate-400 flex items-end justify-center pb-1 text-slate-400 italic text-[10px]">
              (Centre In-charge &bull; Clinical Seal)
            </div>
            <span className="font-bold text-[#0C4A60] block mt-1.5">Surya Tejas Yogalayam</span>
            <span className="text-[10px] text-slate-500 block">Director of Clinical Care &amp; Therapy</span>
          </div>
        </div>

        <div className="mt-6 text-center text-[9px] text-slate-400 border-t border-slate-100 pt-2 font-mono">
          CONFIDENTIAL HEALTHCARE RECORD &bull; FOR CLINICAL USE ONLY &bull; SURYA TEJAS YOGALAYAM ({patient.centre}) &bull; GENERATED VIA STY PORTAL
        </div>
      </footer>
    </div>
  );

  if (!isModalPreview) {
    return documentContent;
  }

  return (
    <div className="case-sheet-modal-backdrop fixed inset-0 z-[9999] bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 md:p-6 print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:inset-auto print:z-auto">
      <div className="case-sheet-modal-container w-full max-w-6xl max-h-[94vh] bg-white rounded-2xl shadow-2xl flex flex-col overflow-hidden border border-slate-300 print:static print:max-w-none print:w-full print:max-h-none print:h-auto print:shadow-none print:border-none print:rounded-none print:overflow-visible print:block print:p-0 print:m-0">
        {/* On-screen Action Toolbar (Fixed at top of modal card, completely hidden on print) */}
        <div className="w-full bg-white px-5 py-3.5 border-b border-slate-200 shadow-xs flex items-center justify-between gap-3 shrink-0 print:hidden">
          <div className="flex items-center gap-3">
            <img
              src="/assets/aistudio/70e661c2-7e1f-4652-8fdb-da470c2ff33a_90cb30a0.png"
              alt="Surya Tejas Yogalayam"
              className="w-9 h-9 object-contain shrink-0"
            />
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Clinical Case Sheet &bull; Document Preview
              </h3>
              <span className="text-[11px] text-slate-500 font-mono">
                Patient ID: {patient.patient_id} &bull; {patient.full_name}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0C4A60] hover:bg-[#083344] text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
              title="Print official case sheet to printer or PDF"
            >
              <Printer className="w-3.5 h-3.5 text-amber-300" />
              <span>Print Case Sheet</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
                title="Close Preview"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Scrollable Document Sheet Paper Viewport */}
        <div className="case-sheet-scroll-viewport flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 md:p-8 bg-slate-100 print:static print:p-0 print:m-0 print:bg-white print:overflow-visible print:block print:h-auto print:max-h-none">
          <div className="case-sheet-paper-wrapper w-full max-w-5xl mx-auto bg-white rounded-xl shadow-md border border-slate-200 overflow-hidden print:static print:max-w-none print:w-full print:shadow-none print:border-none print:rounded-none print:overflow-visible print:block print:p-0 print:m-0">
            {documentContent}
          </div>
        </div>
      </div>
    </div>
  );
};
