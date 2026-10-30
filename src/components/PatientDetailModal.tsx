import React, { useState } from 'react';
import {
  X,
  Printer,
  Calendar,
  Phone,
  MapPin,
  HeartPulse,
  Stethoscope,
  Activity,
  AlertTriangle,
  Building2,
  Trash2,
  Clock
} from 'lucide-react';
import { Patient, MedicalHistory, ExamData } from '../types.ts';
import { formatIndianDate } from '../utils/dateFormatter';
import { ClinicalCaseSheetDocument } from './ClinicalCaseSheetDocument';


interface Props {
  patient: Patient | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusChange?: (id: number, newStatus: string) => Promise<void>;
  onDeleteRequest?: (patient: Patient) => void;
}

export const PatientDetailModal: React.FC<Props> = ({
  patient,
  isOpen,
  onClose,
  onStatusChange,
  onDeleteRequest
}) => {
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showPrintSheet, setShowPrintSheet] = useState(false);

  if (!isOpen || !patient) return null;

  // Safely parse JSON or fall back
  let medHistory: MedicalHistory = {
    hasMajorOperation: false,
    majorOperationDetails: '',
    hasMajorIllness: false,
    majorIllnessDetails: '',
    hasHT_DM_Thyroid: false,
    htDmThyroidDetails: '',
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
    menstrualHistory: ''
  };

  try {
    if (typeof patient.medical_history === 'string' && patient.medical_history.startsWith('{')) {
      medHistory = JSON.parse(patient.medical_history);
    } else if (typeof patient.medical_history === 'object' && patient.medical_history !== null) {
      medHistory = patient.medical_history as any;
    }
  } catch (e) {
    console.error('Error parsing medical_history', e);
  }

  let exam: ExamData = {
    weight: '-',
    bp: '-',
    pulse: '-',
    bmi: '-',
    toeWalkingS1: '-',
    heelWalkingL5: '-',
    oneLegStandingL4: '-',
    slrLeft: '-',
    slrRight: '-',
    sensoryDeficit: '-',
    dorsalisPedis: '-',
    kneeVarusValgus: '-',
    kneeFixedFlexion: '-',
    kneeHyperextension: '-',
    investigations: '-'
  };

  try {
    if (typeof patient.exam_data === 'string' && patient.exam_data.startsWith('{')) {
      exam = JSON.parse(patient.exam_data);
    } else if (typeof patient.exam_data === 'object' && patient.exam_data !== null) {
      exam = patient.exam_data as any;
    }
  } catch (e) {
    console.error('Error parsing exam_data', e);
  }

  const handleStatusSelect = async (newStatus: string) => {
    if (onStatusChange && patient.id) {
      setUpdatingStatus(true);
      await onStatusChange(patient.id, newStatus);
      setUpdatingStatus(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden">
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[92vh] overflow-hidden shadow-xl flex flex-col border border-slate-200">
        {/* Header - Clean, luminous medical card */}
        <div className="p-5 sm:p-6 border-b border-slate-200 bg-white flex items-start justify-between gap-4 print:hidden">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-slate-100 text-[#0C4A60] flex items-center justify-center font-bold text-base border border-slate-200">
              {patient.full_name ? patient.full_name.charAt(0).toUpperCase() : 'P'}
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-xl font-bold text-slate-900">{patient.full_name}</h2>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                  {patient.patient_id}
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <span className="font-medium text-slate-700">{patient.centre}</span>
                <span>&bull;</span>
                <span>{patient.gender}</span>
                <span>&bull;</span>
                <span>{patient.age ? `${patient.age} years` : 'Age N/A'}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowPrintSheet(true)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Print Professional Case Sheet"
            >
              <Printer className="w-3.5 h-3.5 text-slate-500" />
              <span>Print Case Sheet</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Case Header */}
        <div className="hidden print:block p-6 border-b border-slate-300 text-center">
          <h1 className="text-xl font-bold text-slate-900 uppercase tracking-wider">
            Surya Tejas Yogalayam &bull; Patient History Portal
          </h1>
          <p className="text-xs text-slate-600">
            Clinical Patient Case Record &bull; {patient.centre} &bull; Healing Goes Beyond Medicines
          </p>
          <div className="mt-2 text-xs font-mono font-bold">
            Patient ID: {patient.patient_id} | Date: {formatIndianDate(patient.created_at, true)}
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto custom-scrollbar space-y-6 text-sm text-slate-700 leading-relaxed print:p-0 print:overflow-visible">
          {/* Quick Info & Status Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-xl bg-slate-50/80 border border-slate-200 text-xs">
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Contact Phone</span>
              <span className="font-semibold text-slate-900 font-mono">
                {patient.mobile}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Assigned Therapist</span>
              <span className="font-semibold text-slate-900">
                {patient.assigned_therapist ? patient.assigned_therapist.replace(/^Dr\.\s*/i, '') : 'Surya Teja'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Date of Admission</span>
              <span className="font-semibold text-slate-900 font-mono">
                {formatIndianDate(patient.admission_date || patient.created_at) || 'At intake'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Treatment Status</span>
              <select
                value={patient.status}
                disabled={updatingStatus}
                onChange={(e) => handleStatusSelect(e.target.value)}
                className="bg-white border border-slate-300 font-semibold rounded-md px-2 py-0.5 text-xs text-[#0C4A60]"
              >
                <option value="New">New</option>
                <option value="Active">Active</option>
                <option value="Completed">Completed</option>
                <option value="On Hold">On Hold</option>
                <option value="Referred">Referred</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            {/* Fee summary row */}
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Payment Date</span>
              <span className="font-semibold text-slate-900 font-mono">
                {patient.consultation_date ? formatIndianDate(patient.consultation_date) : (patient.admission_date ? formatIndianDate(patient.admission_date) : 'At intake')}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Payment Method</span>
              <span className="font-semibold text-slate-900">
                {(() => {
                  try {
                    if (typeof patient.payment_records === 'string' && patient.payment_records.startsWith('[')) {
                      const recs = JSON.parse(patient.payment_records);
                      if (recs.length > 0) return recs[0].method || recs[0].payment_method || 'UPI';
                    } else if (Array.isArray(patient.payment_records) && patient.payment_records.length > 0) {
                      return (patient.payment_records[0] as any).method || (patient.payment_records[0] as any).payment_method || 'UPI';
                    }
                  } catch (e) {}
                  return 'UPI';
                })()}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Consultation Fee</span>
              <span className="font-semibold text-[#0C4A60]">
                ₹{patient.consultation_fee || '500'}
              </span>
            </div>
            <div>
              <span className="block text-slate-400 font-medium mb-0.5">Monthly Fee</span>
              <span className="font-semibold text-[#0C4A60]">
                ₹{patient.monthly_fee || '3,500'} / month
              </span>
            </div>
            <div className="sm:col-span-2">
              <span className="block text-slate-400 font-medium mb-0.5">Emergency Contact</span>
              {patient.emergency_phone ? (
                <div>
                  <span className="font-bold text-slate-900 font-mono text-xs block">
                    {patient.emergency_phone}
                  </span>
                  <span className="text-[10px] text-slate-500 block">
                    {[patient.emergency_name, patient.emergency_relationship ? `(${patient.emergency_relationship})` : ''].filter(Boolean).join(' ')}
                  </span>
                </div>
              ) : (
                <span className="font-semibold text-slate-900">
                  {patient.emergency_name ? `${patient.emergency_name} (${patient.emergency_relationship || 'Contact'})` : 'Recorded on file'}
                </span>
              )}
            </div>
          </div>

          {/* Chief Complaint & Pain Level */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm">
                <Activity className="w-4 h-4 text-[#0C4A60]" />
                Chief Complaint (C/o) &amp; Symptoms
              </h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-500 font-medium">
                  {patient.complaint_region || 'Spine'} &bull; {patient.complaint_side || 'Bilateral'}
                </span>
                <span className="text-xs font-mono font-bold bg-slate-100 text-slate-800 px-2 py-0.5 rounded">
                  VAS: {patient.pain_score ?? 0}/10
                </span>
              </div>
            </div>
            <p className="text-slate-800 bg-slate-50/70 p-3 rounded-lg border border-slate-200 text-sm">
              "{patient.chief_complaint || 'No complaint details documented.'}"
            </p>
            <div className="mt-2.5 flex flex-wrap gap-4 text-xs text-slate-500">
              <span><strong>Episode:</strong> {patient.episode_type || 'First'}</span>
              <span><strong>Occupation:</strong> {patient.occupation || 'N/A'}</span>
              <span><strong>Language:</strong> {patient.preferred_language || 'Telugu'}</span>
            </div>
          </div>

          {/* Medical History */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm mb-3">
              <HeartPulse className="w-4 h-4 text-emerald-700" />
              Medical History &amp; Systemic Conditions
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Operation:</span>
                <span className={medHistory.hasMajorOperation ? 'text-amber-800 font-medium' : 'text-slate-500'}>
                  {medHistory.hasMajorOperation
                    ? `Yes: ${medHistory.majorOperationDetails || 'Documented'}`
                    : 'Nil / No history'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Illness / Hospitalization:</span>
                <span className={medHistory.hasMajorIllness ? 'text-amber-800 font-medium' : 'text-slate-500'}>
                  {medHistory.hasMajorIllness
                    ? `Yes: ${medHistory.majorIllnessDetails || 'Documented'}`
                    : 'Nil / No history'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">Hypertension (HTN):</span>
                <span className={medHistory.hypertension?.present || medHistory.hypertension?.has ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                  {medHistory.hypertension?.present || medHistory.hypertension?.has
                    ? `Since: ${medHistory.hypertension?.sinceWhen || 'Recorded'} | Past: ${medHistory.hypertension?.pastReading || '-'} | Cur: ${medHistory.hypertension?.currentReading || exam.bp || '-'}`
                    : 'Negative / Normal BP'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">Diabetes Mellitus (DM):</span>
                <span className={medHistory.diabetes?.present || medHistory.diabetes?.has ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                  {medHistory.diabetes?.present || medHistory.diabetes?.has
                    ? `Type: ${medHistory.diabetes?.type || 'Type 2'} | Since: ${medHistory.diabetes?.sinceWhen || 'Recorded'} | Past: ${medHistory.diabetes?.pastReading || '-'} | Cur: ${medHistory.diabetes?.currentReading || '-'}`
                    : 'Negative / Normal Glycemia'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">Thyroid Dysfunction:</span>
                <span className={medHistory.thyroid?.present || medHistory.thyroid?.has ? 'text-purple-800 font-semibold' : 'text-slate-500'}>
                  {medHistory.thyroid?.present || medHistory.thyroid?.has
                    ? `Type: ${medHistory.thyroid?.type || 'Hypothyroidism'} | Since: ${medHistory.thyroid?.sinceWhen || 'Recorded'} | Past: ${medHistory.thyroid?.pastReading || '-'} | Cur: ${medHistory.thyroid?.currentReading || '-'}`
                    : 'Negative / Euthyroid'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Trauma:</span>
                <span className={medHistory.hasMajorTrauma ? 'text-rose-700 font-medium' : 'text-slate-500'}>
                  {medHistory.hasMajorTrauma
                    ? `Yes: ${medHistory.majorTraumaDetails || 'Trauma reported'}`
                    : 'Nil / No history'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Radiating Pain:</span>
                <span className={medHistory.hasRadiatingPain ? 'text-rose-700 font-medium' : 'text-slate-500'}>
                  {medHistory.hasRadiatingPain
                    ? `Present: ${medHistory.radiatingPainDetails || 'Reported'}`
                    : 'Absent'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Numbness in UL/LL:</span>
                <span className={medHistory.hasNumbness ? 'text-rose-700 font-medium' : 'text-slate-500'}>
                  {medHistory.hasNumbness
                    ? `Present: ${medHistory.numbnessDetails || 'Reported'}`
                    : 'Absent'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Abnormal Sensation:</span>
                <span className={medHistory.hasAbnormalSensation ? 'text-amber-800 font-medium' : 'text-slate-500'}>
                  {medHistory.hasAbnormalSensation
                    ? `Present: ${medHistory.abnormalSensationDetails || 'Reported'}`
                    : 'Absent'}
                </span>
              </div>

              <div className="p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Motor Weakness:</span>
                <span className={medHistory.hasMotorWeakness ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                  {medHistory.hasMotorWeakness
                    ? `Present: ${medHistory.motorWeaknessDetails || 'Reported'}`
                    : 'Absent'}
                </span>
              </div>

              {medHistory.menstrualHistory && (
                <div className="md:col-span-2 p-3 bg-slate-50/60 rounded-lg border border-slate-200">
                  <span className="font-semibold text-slate-800 block mb-0.5">
                    Menstrual &amp; Obstetric History:
                  </span>
                  <span className="text-slate-700 font-medium">{medHistory.menstrualHistory}</span>
                </div>
              )}
            </div>
          </div>

          {/* Objective Examination (O/E) */}
          <div className="border border-slate-200 rounded-xl p-4 sm:p-5">
            <h3 className="font-bold text-slate-900 flex items-center gap-1.5 text-sm mb-3">
              <Stethoscope className="w-4 h-4 text-[#0C4A60]" />
              On Examination (O/E) &amp; Neurological Screen
            </h3>

            {/* Vitals */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-3 bg-slate-50 p-3 rounded-lg text-center text-xs">
              <div>
                <span className="text-slate-400 block text-[11px]">Height</span>
                <span className="font-bold text-[#0C4A60]">{exam.height ? `${exam.height} cm` : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Weight</span>
                <span className="font-bold text-slate-800">{exam.weight ? `${exam.weight} kg` : '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">BP</span>
                <span className="font-bold text-slate-800">{exam.bp || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Pulse</span>
                <span className="font-bold text-slate-800">{exam.pulse || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">BMI</span>
                <span className="font-bold text-slate-800">{exam.bmi || '-'}</span>
              </div>
            </div>

            {/* Neuro Tests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-3">
              <div className="p-2.5 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Toe Walking (S1):</span>
                <span className="font-medium text-slate-800">{exam.toeWalkingS1 || 'Normal'}</span>
              </div>
              <div className="p-2.5 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Heel Walking (L5):</span>
                <span className="font-medium text-slate-800">{exam.heelWalkingL5 || 'Normal'}</span>
              </div>
              <div className="p-2.5 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[11px]">One Leg Standing (L4):</span>
                <span className="font-medium text-slate-800">{exam.oneLegStandingL4 || 'Normal'}</span>
              </div>
            </div>

            {/* Special Tests */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs mb-3">
              <div className="p-2.5 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Straight Leg Raise (SLR):</span>
                <span className="font-medium text-slate-800">
                  Left: {exam.slrLeft || '-'} | Right: {exam.slrRight || '-'}
                </span>
              </div>
              <div className="p-2.5 border border-slate-200 rounded-lg">
                <span className="text-slate-400 block text-[11px]">Dorsalis Pedis &amp; Sensation:</span>
                <span className="font-medium text-slate-800">
                  Pulse: {exam.dorsalisPedis || '-'} | Sensory: {exam.sensoryDeficit || 'Normal'}
                </span>
              </div>
              <div className="p-2.5 border border-slate-200 rounded-lg sm:col-span-2">
                <span className="text-slate-400 block text-[11px]">Knee Biomechanics:</span>
                <span className="font-medium text-slate-800">
                  Alignment: {exam.kneeVarusValgus || 'Normal'} &bull; Fixed Flexion: {exam.kneeFixedFlexion || 'Nil'} &bull; Hyperextension: {exam.kneeHyperextension || 'Nil'}
                </span>
              </div>
            </div>

            {exam.investigations && (
              <div className="p-3 bg-slate-50/80 rounded-lg border border-slate-200 text-xs">
                <span className="font-semibold text-slate-700 block mb-0.5">
                  Investigations:
                </span>
                <span className="text-slate-800">{exam.investigations}</span>
              </div>
            )}
          </div>

          {/* Therapy Precautions */}
          {patient.therapy_precautions && (
            <div className="border border-amber-300 rounded-xl p-4 bg-amber-50/70">
              <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                Therapy Precautions &amp; Contraindications
              </h3>
              <p className="text-amber-950 text-xs whitespace-pre-wrap">{patient.therapy_precautions}</p>
            </div>
          )}

          {/* Notes */}
          {patient.notes && (
            <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/50">
              <h3 className="font-bold text-slate-800 text-xs uppercase tracking-wider mb-1">
                Yoga Therapy Notes &amp; Protocol
              </h3>
              <p className="text-slate-700 text-xs whitespace-pre-wrap">{patient.notes}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="text-[11px] text-slate-400 flex justify-between border-t border-slate-100 pt-3">
            <span>Created: {formatIndianDate(patient.created_at, true)}</span>
            <span>Last Updated: {formatIndianDate(patient.updated_at, true)}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between print:hidden">
          {onDeleteRequest ? (
            <button
              onClick={() => onDeleteRequest(patient)}
              className="px-3.5 py-2 text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-lg font-medium text-xs sm:text-sm border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Record</span>
            </button>
          ) : (
            <div />
          )}
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-medium text-xs sm:text-sm transition-colors"
          >
            Close Record
          </button>
        </div>
      </div>



      {showPrintSheet && (
        <ClinicalCaseSheetDocument
          patient={patient}
          isModalPreview={true}
          onClose={() => setShowPrintSheet(false)}
        />
      )}
    </div>
  );
};
