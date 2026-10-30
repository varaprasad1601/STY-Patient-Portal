import React, { useState, useRef, useEffect } from 'react';
import {
  ChevronRight,
  User,
  Calendar,
  Phone,
  Mail,
  MapPin,
  HeartPulse,
  Stethoscope,
  Activity,
  Building2,
  Printer,
  Trash2,
  Edit,
  ArrowLeft,
  Briefcase,
  Layers,
  FileText,
  Clock,
  IdCard,
  CheckCircle2,
  Mic,
  MicOff,
  Volume2,
  CreditCard,
  FileUp,
  Download,
  AlertTriangle,
  MessageSquare,
  Plus,
  Save,
  Check,
  X,
  ShieldAlert,
  Sparkles,
  Pencil
} from 'lucide-react';
import {
  Patient,
  MedicalHistory,
  ExamData,
  PaymentRecord,
  InvestigationAttachment,
  WeeklyPractice,
  FollowupFeedbackRecord,
  DiseaseReading
} from '../types.ts';
import { formatIndianDate } from '../utils/dateFormatter';
import { ClinicalCaseSheetDocument } from './ClinicalCaseSheetDocument';
import { isTeluguText } from '../utils/textHelper';


interface Props {
  patient: Patient;
  onBack: () => void;
  onStatusChange: (id: number, newStatus: string) => Promise<void>;
  onUpdatePatient?: (updatedPatient: Patient) => Promise<void>;
  onDeleteRequest: (patient: Patient) => void;
  onEditClick?: (section?: 'section1' | 'section2' | 'section3' | 'section4' | 'section5') => void;
}

export const PatientProfileView: React.FC<Props> = ({
  patient,
  onBack,
  onStatusChange,
  onUpdatePatient,
  onDeleteRequest,
  onEditClick
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'billing' | 'medical' | 'exam' | 'plan' | 'followup' | 'activity'>('overview');
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPrintSheet, setShowPrintSheet] = useState(false);

  // Parse Medical History
  const parseMedicalHistory = (): MedicalHistory => {
    let med: MedicalHistory = {
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
      hasBowelBladderInvolvement: false,
      bowelBladderDetails: '',
      hasWeightLossFever: false,
      weightLossFeverDetails: '',
      menstrualHistory: '',
      previousEpisodes: '',
      familyHistory: '',
      hypertension: { present: false, sinceWhen: '', pastReading: '', currentReading: '', medication: '' },
      diabetes: { present: false, sinceWhen: '', pastReading: '', currentReading: '', medication: '' },
      thyroid: { present: false, sinceWhen: '', pastReading: '', currentReading: '', medication: '' }
    };

    try {
      if (typeof patient.medical_history === 'string' && patient.medical_history.startsWith('{')) {
        const parsed = JSON.parse(patient.medical_history);
        med = { ...med, ...parsed };
      } else if (typeof patient.medical_history === 'object' && patient.medical_history !== null) {
        med = { ...med, ...(patient.medical_history as any) };
      }
    } catch (e) {
      console.error(e);
    }
    return med;
  };

  const medHistory = parseMedicalHistory();

  // Parse Exam Data
  const parseExamData = (): ExamData => {
    let ex: ExamData = {
      height: '',
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
      kneeRangeOfMotion: '-',
      kneeTenderness: '-',
      kneeEffusion: '-',
      kneeStabilityTests: '-',
      extremityJointAssessment: '-',
      investigations: '-'
    };

    try {
      if (typeof patient.exam_data === 'string' && patient.exam_data.startsWith('{')) {
        ex = { ...ex, ...JSON.parse(patient.exam_data) };
      } else if (typeof patient.exam_data === 'object' && patient.exam_data !== null) {
        ex = { ...ex, ...(patient.exam_data as any) };
      }
    } catch (e) {
      console.error(e);
    }
    return ex;
  };

  const exam = parseExamData();

  // Parse Payments
  const parsePayments = (): PaymentRecord[] => {
    try {
      if (typeof patient.payment_records === 'string' && patient.payment_records.startsWith('[')) {
        const parsed = JSON.parse(patient.payment_records);
        if (Array.isArray(parsed)) return parsed;
      } else if (Array.isArray(patient.payment_records)) {
        return patient.payment_records;
      }
    } catch {
      // ignore
    }
    return [];
  };

  // Parse Investigations
  const parseInvestigations = (): InvestigationAttachment[] => {
    try {
      if (typeof patient.investigation_attachments === 'string' && patient.investigation_attachments.startsWith('[')) {
        return JSON.parse(patient.investigation_attachments);
      } else if (Array.isArray(patient.investigation_attachments)) {
        return patient.investigation_attachments;
      }
    } catch {
      // ignore
    }
    return [];
  };

  // Parse Therapy Plan (not pre-configured; blank until entered by user)
  const parseTherapyPlan = (): WeeklyPractice[] => {
    try {
      if (typeof patient.therapy_plan === 'string' && patient.therapy_plan.startsWith('[')) {
        return JSON.parse(patient.therapy_plan);
      } else if (Array.isArray(patient.therapy_plan)) {
        return patient.therapy_plan;
      }
    } catch {
      // ignore
    }
    return [];
  };

  const getInitialPrecautions = (): string => {
    return patient.therapy_precautions || '';
  };

  // Parse Followup records
  const parseFollowups = (): FollowupFeedbackRecord[] => {
    try {
      if (typeof patient.followup_records === 'string' && patient.followup_records.startsWith('[')) {
        return JSON.parse(patient.followup_records);
      } else if (Array.isArray(patient.followup_records)) {
        return patient.followup_records;
      }
    } catch {
      // ignore
    }
    return [];
  };

  // Component local states for enhancements
  const [paymentsList, setPaymentsList] = useState<PaymentRecord[]>(parsePayments());
  const [investigationsList, setInvestigationsList] = useState<InvestigationAttachment[]>(parseInvestigations());
  const [therapySchedule, setTherapySchedule] = useState<WeeklyPractice[]>(parseTherapyPlan());
  const [followupList, setFollowupList] = useState<FollowupFeedbackRecord[]>(parseFollowups());
  const [precautionsText, setPrecautionsText] = useState<string>(getInitialPrecautions());


  // Chief Complaint Description state
  const [chiefComplaintText, setChiefComplaintText] = useState(patient.chief_complaint || '');
  const [isEditingComplaint, setIsEditingComplaint] = useState(false);

  // Audio / Speech Transcript review
  const [transcriptText, setTranscriptText] = useState(patient.complaint_transcript || patient.chief_complaint || '');
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Selected Month filter for 3-Month Plan (Month 1: Weeks 1-4, Month 2: Weeks 5-8, Month 3: Weeks 9-12)
  const [selectedMonth, setSelectedMonth] = useState<1 | 2 | 3>(1);

  // New Payment Form Modal/Inline state
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | 'Cheque'>('UPI');
  const [paymentAmount, setPaymentAmount] = useState<number>(Number(patient.monthly_fee) || 0);
  const [paymentNotes, setPaymentNotes] = useState('Monthly Yoga Therapy Fee');

  // New Follow-up Form Modal/Inline state
  const [showAddFollowup, setShowAddFollowup] = useState(false);
  const [newFollowupDate, setNewFollowupDate] = useState(new Date().toISOString().split('T')[0]);
  const [newPainScore, setNewPainScore] = useState<number>(patient.pain_score || 3);
  const [newFeedback, setNewFeedback] = useState('');
  const [newClinicalNotes, setNewClinicalNotes] = useState('');
  const [nextFollowupDate, setNextFollowupDate] = useState('');

  // New Investigation Upload inline modal state
  const [showAddInvestigation, setShowAddInvestigation] = useState(false);
  const [investigationTitle, setInvestigationTitle] = useState('');
  const [investigationType, setInvestigationType] = useState<'X-Ray' | 'MRI' | 'CT Scan' | 'Lab Report' | 'Other'>('X-Ray');
  const [investigationDate, setInvestigationDate] = useState(new Date().toISOString().split('T')[0]);
  const [investigationNotes, setInvestigationNotes] = useState('');
  const [fileDataUrl, setFileDataUrl] = useState<string>('');
  const [fileName, setFileName] = useState('');

  // Selected preview file for lightbox
  const [previewAttachment, setPreviewAttachment] = useState<InvestigationAttachment | null>(null);

  // Sync state if patient prop updates
  useEffect(() => {
    setPaymentsList(parsePayments());
    setInvestigationsList(parseInvestigations());
    setTherapySchedule(parseTherapyPlan());
    setFollowupList(parseFollowups());
    setChiefComplaintText(patient.chief_complaint || '');
    setTranscriptText(patient.complaint_transcript || patient.chief_complaint || '');
    setPrecautionsText(patient.therapy_precautions || getInitialPrecautions());
  }, [patient]);

  // Handle Voice Recording using Web Speech API
  const startRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech Recognition is not supported in this browser. You can type or edit the transcript directly.');
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      
      const prefLang = (patient.preferred_language || '').toLowerCase();
      if (prefLang.includes('telugu')) {
        recognition.lang = 'te-IN';
      } else if (prefLang.includes('hindi')) {
        recognition.lang = 'hi-IN';
      } else {
        recognition.lang = 'en-IN';
      }

      recognition.onstart = () => {
        setIsRecording(true);
      };

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = 0; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript + ' ';
        }
        setTranscriptText(currentTranscript.trim());
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (err) {
      console.error('Failed to start voice recognition:', err);
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      setIsRecording(false);
    }
  };

  // Save changes to backend via onUpdatePatient
  const persistPatientChanges = async (updates: Partial<Patient>) => {
    if (!onUpdatePatient) return;
    setIsSaving(true);
    try {
      const updated: Patient = {
        ...patient,
        ...updates
      };
      await onUpdatePatient(updated);
    } catch (err) {
      console.error('Failed to persist updates:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // Save Chief Complaint Description
  const handleSaveChiefComplaint = async () => {
    await persistPatientChanges({
      chief_complaint: chiefComplaintText
    });
    setIsEditingComplaint(false);
  };

  // Save reviewed transcript
  const handleSaveTranscript = async () => {
    await persistPatientChanges({
      complaint_transcript: transcriptText
    });
    setIsEditingTranscript(false);
  };

  // Add Payment Handler
  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount || paymentAmount <= 0) return;

    const newPayment: PaymentRecord = {
      id: 'PAY-' + Date.now(),
      payment_date: paymentDate,
      payment_method: paymentMethod,
      amount: Number(paymentAmount),
      notes: paymentNotes,
      received_by: 'Staff Admin'
    };

    const updatedPayments = [newPayment, ...paymentsList];
    setPaymentsList(updatedPayments);
    setShowAddPayment(false);
    setPaymentNotes('');

    await persistPatientChanges({
      payment_records: JSON.stringify(updatedPayments)
    });
  };

  // Add Follow-up Handler
  const handleAddFollowup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFeedback && !newClinicalNotes) return;

    const newRecord: FollowupFeedbackRecord = {
      id: 'FOL-' + Date.now(),
      followup_date: newFollowupDate,
      pain_score: Number(newPainScore),
      feedback: newFeedback,
      clinical_notes: newClinicalNotes,
      therapist_name: patient.assigned_therapist ? patient.assigned_therapist.replace(/^Dr\.\s*/i, '') : 'Surya Teja',
      next_followup_date: nextFollowupDate || undefined
    };

    const updatedFollowups = [newRecord, ...followupList];
    setFollowupList(updatedFollowups);
    setShowAddFollowup(false);
    setNewFeedback('');
    setNewClinicalNotes('');

    await persistPatientChanges({
      followup_records: JSON.stringify(updatedFollowups),
      pain_score: Number(newPainScore)
    });
  };

  // Add Diagnostic Investigation Attachment Handler
  const handleAddInvestigation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!investigationTitle) return;

    const newAtt: InvestigationAttachment = {
      id: 'INV-' + Date.now(),
      title: investigationTitle,
      type: investigationType,
      date: investigationDate,
      file_name: fileName || `${investigationType.toLowerCase()}_report.pdf`,
      file_url: fileDataUrl || 'https://images.unsplash.com/photo-1516549655169-df83a0774514?auto=format&fit=crop&w=800&q=80',
      notes: investigationNotes
    };

    const updatedList = [newAtt, ...investigationsList];
    setInvestigationsList(updatedList);
    setShowAddInvestigation(false);
    setInvestigationTitle('');
    setInvestigationNotes('');
    setFileDataUrl('');
    setFileName('');

    await persistPatientChanges({
      investigation_attachments: JSON.stringify(updatedList)
    });
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = () => {
      setFileDataUrl(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Update a practice week note or completion
  const handleToggleWeekComplete = async (weekNumber: number) => {
    const updated = therapySchedule.map((w) =>
      w.week === weekNumber ? { ...w, completed: !w.completed } : w
    );
    setTherapySchedule(updated);
    await persistPatientChanges({
      therapy_plan: JSON.stringify(updated)
    });
  };

  const handleSavePrecautions = async () => {
    await persistPatientChanges({
      therapy_precautions: precautionsText
    });
  };

  const handleStatusSelect = async (newStatus: string) => {
    setUpdatingStatus(true);
    await onStatusChange(patient.id, newStatus);
    setUpdatingStatus(false);
  };

  const getInitials = (name: string) => {
    if (!name) return 'PT';
    return name
      .split(' ')
      .map((n) => n[0])
      .filter(Boolean)
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  const totalPaid = paymentsList.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'Active':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#e8f5e9] text-[#2e7d32] border border-green-200/50">
            Active
          </span>
        );
      case 'Therapy Completed':
      case 'Completed':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200/50">
            Completed
          </span>
        );
      case 'New':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-50 text-sky-700 border border-sky-200/50">
            New
          </span>
        );
      case 'On Hold':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#ffebee] text-[#d32f2f] border border-red-200/50">
            On Hold
          </span>
        );
      case 'Discharged':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200/50">
            Discharged
          </span>
        );
      case 'Referred':
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200/50">
            Referred
          </span>
        );
      default:
        return (
          <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 pb-16 patient-profile-view no-scrollbar">
      {/* Screen-Only Web Application View (Completely Hidden on Print) */}
      <div className="patient-profile-screen-only print:hidden space-y-6">
      {/* Lightbox / Modal for Investigation Document Preview */}
      {previewAttachment && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
            <div className="p-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h4 className="text-sm font-bold text-slate-900">{previewAttachment.title}</h4>
                <span className="text-xs text-slate-500">
                  {previewAttachment.type} &bull; Date: {formatIndianDate(previewAttachment.date)}
                </span>
              </div>
              <button
                onClick={() => setPreviewAttachment(null)}
                className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 flex-1 overflow-auto no-scrollbar flex items-center justify-center bg-slate-950/5 min-h-[300px]">
              {(() => {
                const url = previewAttachment.file_url || previewAttachment.dataUrl || '';
                if (url.startsWith('data:image') || url.endsWith('.png') || url.endsWith('.jpg') || url.includes('unsplash')) {
                  return (
                    <img
                      src={url}
                      alt={previewAttachment.title || previewAttachment.name}
                      className="max-h-[60vh] max-w-full rounded-lg object-contain shadow-md"
                    />
                  );
                }
                return (
                  <div className="text-center p-8 bg-white rounded-xl border border-slate-200 shadow-xs max-w-md">
                    <FileText className="w-14 h-14 text-[#0C4A60] mx-auto mb-3" />
                    <p className="text-sm font-semibold text-slate-800">{previewAttachment.file_name || previewAttachment.name}</p>
                    <p className="text-xs text-slate-500 mt-1">Diagnostic Report / Clinical Document</p>
                    <a
                      href={url}
                      download={previewAttachment.file_name || previewAttachment.name}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-[#0C4A60] text-white text-xs font-semibold hover:bg-[#083344]"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download Document</span>
                    </a>
                  </div>
                );
              })()}
            </div>
            {previewAttachment.notes && (
              <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-700">
                <span className="font-semibold text-slate-900">Therapist Notes: </span>
                {previewAttachment.notes}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Top Header Section with Breadcrumb Navigation & Quick Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs">
        <nav className="flex items-center text-xs text-slate-500 gap-1.5 flex-wrap">
          <span onClick={onBack} className="hover:text-slate-900 cursor-pointer">Home</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span onClick={onBack} className="hover:text-slate-900 cursor-pointer">Patient Management</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span onClick={onBack} className="hover:text-slate-900 cursor-pointer">Patients</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-[#0C4A60] font-mono font-bold">{patient.patient_id}</span>
        </nav>

        {/* Quick Action Buttons (Top of Header Section) */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onEditClick?.('section1')}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0C4A60] hover:bg-[#083344] transition-all shadow-xs cursor-pointer hover:shadow"
            title="Edit patient demographics, medical history, physical examination, and 12-week therapy plan"
          >
            <Pencil className="w-3.5 h-3.5 text-amber-300" />
            <span>Edit Patient</span>
          </button>

          <button
            onClick={() => setShowPrintSheet(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 transition-colors shadow-2xs cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Case Sheet</span>
          </button>

          <button
            onClick={() => onDeleteRequest(patient)}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium text-rose-700 bg-rose-50 border border-rose-200 hover:bg-rose-100 transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {/* Top Profile Header Card */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="p-6 sm:p-7 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            {/* Clean Initials Avatar */}
            <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-sky-100 text-[#0C4A60] flex items-center justify-center font-bold text-xl sm:text-2xl shrink-0 shadow-xs">
              {getInitials(patient.full_name)}
            </div>

            {/* Patient Name and Details */}
            <div>
              <div className="flex items-center gap-3 flex-wrap">
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                  {patient.full_name}
                </h1>
                {renderStatusBadge(patient.status)}
              </div>

              <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                <span className="flex items-center gap-1.5 font-mono font-semibold text-slate-700">
                  <span className="text-slate-400">Patient ID:</span> {patient.patient_id}
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Joined: {formatIndianDate(patient.admission_date || patient.created_at) || 'Recently'}</span>
                </span>
                <span>&bull;</span>
                <span className="flex items-center gap-1.5 text-[#0C4A60] font-medium">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>{patient.centre}</span>
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs covering all 6 document enhancements */}
        <div className="px-6 border-t border-slate-100 flex items-center gap-6 sm:gap-8 text-xs font-semibold overflow-x-auto bg-slate-50/40 no-scrollbar">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveTab('billing')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'billing'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Admission &amp; Billing</span>
            {paymentsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-[#0C4A60] font-mono">
                {paymentsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('medical')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'medical'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>Chief Complaint &amp; Medical History</span>
          </button>

          <button
            onClick={() => setActiveTab('exam')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'exam'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Physical Exam &amp; Diagnostics</span>
            {investigationsList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-slate-200 text-slate-700 font-mono">
                {investigationsList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('plan')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'plan'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>3-Month Therapy Plan &amp; Precautions</span>
            <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-sky-100 text-[#0C4A60] font-mono font-bold">
              12 Weeks
            </span>
          </button>

          <button
            onClick={() => setActiveTab('followup')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'followup'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Follow-up &amp; Feedback</span>
            {followupList.length > 0 && (
              <span className="ml-1 px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-100 text-emerald-800 font-mono font-bold">
                {followupList.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('activity')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'activity'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Activity Logs</span>
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB: Personal Information and Contact & Emergency */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-in fade-in duration-150">
          {/* Card 1: Personal Information */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Personal Information</h3>
              <span className="text-xs text-slate-400 font-medium">Demographics</span>
            </div>

            <div className="space-y-4">
              {/* Full Name */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Full Name</span>
                  <span className="text-sm font-semibold text-slate-900">{patient.full_name}</span>
                </div>
              </div>

              {/* Date of Birth & Age */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Date of Birth &amp; Age</span>
                  <span className="text-sm font-semibold text-slate-900 font-mono">
                    {patient.dob ? formatIndianDate(patient.dob) : 'Not recorded'} {patient.age ? `(${patient.age} years old)` : ''}
                  </span>
                </div>
              </div>

              {/* Admission / Joining Date */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0C4A60] flex items-center justify-center shrink-0">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Date of Joining / Admission (DD-MM-YYYY)</span>
                  <span className="text-sm font-semibold text-slate-900 font-mono">
                    {formatIndianDate(patient.admission_date || patient.created_at) || 'Recorded on intake'}
                  </span>
                </div>
              </div>

              {/* Gender & Language */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Layers className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Gender &amp; Preferred Language</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.gender || 'Not specified'} &bull; {patient.preferred_language || 'Telugu'}
                  </span>
                </div>
              </div>

              {/* Occupation */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Occupation / Profession</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.occupation || '-'}
                  </span>
                </div>
              </div>

              {/* Work Pattern */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Work Pattern</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.work_pattern || '-'}
                  </span>
                </div>
              </div>

              {/* Physical Activity Level */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Physical Activity Level</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.physical_activity || '-'}
                  </span>
                </div>
              </div>

              {/* Residential Address */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Residential Address</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.address || '-'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Card 2: Contact, Emergency & Care Allocation */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Contact &amp; Care Management</h3>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Status:</span>
                <select
                  value={patient.status}
                  disabled={updatingStatus}
                  onChange={(e) => handleStatusSelect(e.target.value)}
                  className="rounded-lg border border-slate-300 bg-white py-1 pl-2 pr-6 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  <option value="New">New</option>
                  <option value="Active">Active</option>
                  <option value="Completed">Completed</option>
                  <option value="On Hold">On Hold</option>
                  <option value="Referred">Referred</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {/* Primary Mobile */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Primary Mobile Number</span>
                  <span className="text-sm font-semibold text-slate-900 font-mono">
                    {patient.mobile || '-'}
                  </span>
                </div>
              </div>

              {/* Emergency Contact Number */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Emergency Contact</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.emergency_phone ? (
                      <>
                        <span className="font-mono">{patient.emergency_phone}</span>
                        {patient.emergency_name && ` (${patient.emergency_name}${patient.emergency_relationship ? ` - ${patient.emergency_relationship}` : ''})`}
                      </>
                    ) : (
                      '-'
                    )}
                  </span>
                </div>
              </div>

              {/* Email Address */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Email Address</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.email || '-'}
                  </span>
                </div>
              </div>

              {/* Assigned Therapist */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Assigned Therapist</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.assigned_therapist ? patient.assigned_therapist.replace(/^Dr\.\s*/i, '') : '-'}
                  </span>
                </div>
              </div>

              {/* Referred By */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <User className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Referred By</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.referred_by || '-'}
                  </span>
                </div>
              </div>

              {/* Registered Centre */}
              <div className="flex items-center gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[11px] font-medium text-slate-400 block">Registered Centre</span>
                  <span className="text-sm font-semibold text-slate-900">
                    {patient.centre}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. ADMISSION & BILLING TAB (Requirement 1) */}
      {activeTab === 'billing' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Summary Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">DATE OF JOINING / ADMISSION</span>
              <span className="text-xl font-bold text-slate-900 font-mono">
                {formatIndianDate(patient.admission_date || patient.created_at) || 'Recent'}
              </span>
              <span className="text-[11px] text-slate-400 block mt-1">Official registry entry (DD-MM-YYYY)</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">CONSULTATION FEE</span>
              <span className="text-xl font-bold text-[#0C4A60]">
                ₹{patient.consultation_fee != null && patient.consultation_fee !== '' ? Number(patient.consultation_fee).toLocaleString('en-IN') : '0'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">
                Consulted on: {formatIndianDate(patient.consultation_date) || 'At admission'}
              </span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">MONTHLY THERAPY FEE</span>
              <span className="text-xl font-bold text-[#0C4A60]">
                ₹{patient.monthly_fee != null && patient.monthly_fee !== '' ? Number(patient.monthly_fee).toLocaleString('en-IN') : '0'}
              </span>
              <span className="text-[11px] text-slate-500 block mt-1">Per month subscription</span>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 block mb-1">TOTAL AMOUNT PAID</span>
              <span className="text-xl font-bold text-emerald-700">
                ₹{totalPaid.toLocaleString('en-IN')}
              </span>
              <span className="text-[11px] text-emerald-600 block mt-1">
                {paymentsList.length} manual transaction(s)
              </span>
            </div>
          </div>

          {/* Payment Details & Receipts Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#0C4A60]" />
                  <span>Payment Details &amp; Receipts Ledger</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified billing receipts and consultation collections on file. Record new manual payment transactions below.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddPayment((prev) => !prev)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0C4A60] hover:bg-[#083344] text-white text-xs font-bold transition-all shadow-xs cursor-pointer hover:shadow shrink-0"
              >
                <Plus className="w-3.5 h-3.5 text-amber-300" />
                <span>{showAddPayment ? 'Close Payment Form' : 'Record Manual Payment'}</span>
              </button>
            </div>

            {/* Collapsible Manual Payment Form */}
            {showAddPayment && (
              <form onSubmit={handleAddPayment} className="mb-6 p-4.5 rounded-2xl bg-sky-50/60 border border-sky-100 space-y-4 animate-in fade-in duration-150">
                <div className="flex items-center justify-between border-b border-sky-100 pb-2.5">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4 text-[#0C4A60]" />
                    Record Manual Payment Entry
                  </h4>
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="p-1 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-white transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 text-xs">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Amount (₹) <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      placeholder="Enter Amount (₹)"
                      value={paymentAmount || ''}
                      onChange={(e) => setPaymentAmount(Number(e.target.value))}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Date <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Payment Method <span className="text-rose-500">*</span>
                    </label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    >
                      <option value="UPI">UPI / GPay / PhonePe</option>
                      <option value="Cash">Cash Payment</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">Bank Transfer / NEFT</option>
                      <option value="Cheque">Cheque</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                      Notes / Reference
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Consultation or monthly fee"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-sky-100">
                  <button
                    type="button"
                    onClick={() => setShowAddPayment(false)}
                    className="px-3.5 py-1.5 rounded-lg border border-slate-300 bg-white text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0C4A60] hover:bg-[#083344] text-white text-xs font-bold shadow-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Check className="w-3.5 h-3.5 text-amber-300" />
                    <span>Save Payment Entry</span>
                  </button>
                </div>
              </form>
            )}

            {/* Payment Ledger Table */}
            {paymentsList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <CreditCard className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No payment receipts recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Record Manual Payment" above to add a new transaction.</p>
              </div>
            ) : (
              <div className="overflow-x-auto no-scrollbar border border-slate-200/80 rounded-md">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-[10px] font-bold text-slate-500 uppercase">
                      <th className="py-2.5 px-3">Receipt / ID</th>
                      <th className="py-2.5 px-3">Payment Date</th>
                      <th className="py-2.5 px-3">Payment Method</th>
                      <th className="py-2.5 px-3">Notes &amp; Reference</th>
                      <th className="py-2.5 px-3 text-right">Amount Paid</th>
                      <th className="py-2.5 px-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {paymentsList.map((pay) => (
                      <tr key={pay.id} className="hover:bg-slate-50/70">
                        <td className="py-2.5 px-3 font-mono font-semibold text-slate-700">{pay.id}</td>
                        <td className="py-2.5 px-3 text-slate-600 font-mono">{formatIndianDate(pay.payment_date || pay.date || '')}</td>
                        <td className="py-2.5 px-3">
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
                            {pay.payment_method || pay.method || 'UPI'}
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-slate-600">{pay.notes || '-'}</td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-700">
                          ₹{Number(pay.amount).toLocaleString('en-IN')}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                            <Check className="w-3 h-3" /> Received
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 3. CHIEF COMPLAINT & MEDICAL HISTORY (Requirements 2 & 3) */}
      {activeTab === 'medical' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Card: Chief Complaint with Audio, Transcript, Since When, and Episode Type */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0C4A60]" />
                  <span>Chief Complaint (C/o) &amp; Voice Narrative</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Patient explanation audio and reviewable transcript.
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Pain Score: {patient.pain_score ?? 0} / 10
                </span>
              </div>
            </div>

            {/* Chief Complaint Description Box (Read-Only) */}
            <div className="mb-4 p-4 rounded-xl bg-[#0C4A60]/5 border border-[#0C4A60]/15 space-y-2">
              <label className="text-xs font-bold text-[#0C4A60] flex items-center gap-1.5 uppercase tracking-wide">
                <FileText className="w-3.5 h-3.5" />
                <span>Chief Complaint Description</span>
              </label>

              <p className="text-xs sm:text-sm font-semibold text-slate-900 leading-relaxed whitespace-pre-line">
                {patient.chief_complaint || chiefComplaintText ? (
                  patient.chief_complaint || chiefComplaintText
                ) : (
                  <span className="text-slate-400 italic font-normal">No chief complaint description recorded. Use the "Edit Patient" button to add clinical details.</span>
                )}
              </p>
            </div>

            {/* Episode details row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-4">
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Since When?</span>
                <span className="font-bold text-slate-900">
                  {patient.complaint_since_when || 'Not specified'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Episode Type</span>
                <span className="font-bold text-slate-900">
                  {patient.episode_type || 'Recurring'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Anatomical Region</span>
                <span className="font-bold text-slate-900">
                  {patient.complaint_region || 'Lumbar Spine'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block font-medium">Affected Side</span>
                <span className="font-bold text-slate-900">
                  {patient.complaint_side || 'Bilateral'}
                </span>
              </div>
            </div>

            {/* Audio Recording Playback if available */}
            {patient.complaint_audio && (
              <div className="p-3.5 rounded-xl bg-sky-50/60 border border-sky-200 mb-4 flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center shrink-0">
                    <Volume2 className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-slate-900 block">Patient Voice Recording</span>
                    <span className="text-[11px] text-slate-500">Audio captured during consultation</span>
                  </div>
                </div>

                <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
                  <audio controls src={patient.complaint_audio} className="h-8 max-w-[220px]" />
                  <button
                    type="button"
                    onClick={async () => {
                      if (window.confirm('Are you sure you want to remove this recorded audio?')) {
                        await persistPatientChanges({ complaint_audio: '' });
                      }
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold shrink-0 transition-colors cursor-pointer"
                    title="Remove recorded audio"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                    <span>Remove Audio</span>
                  </button>
                </div>
              </div>
            )}

            {/* Speech Transcript (Read-Only) */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-500" />
                <span>Speech-to-Text Transcript</span>
              </label>

              <div className={`p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 leading-relaxed ${isTeluguText(patient.complaint_transcript || transcriptText) ? 'font-telugu' : 'font-sans'}`} lang={isTeluguText(patient.complaint_transcript || transcriptText) ? 'te' : 'en'}>
                {patient.complaint_transcript || transcriptText ? (
                  `"${patient.complaint_transcript || transcriptText}"`
                ) : (
                  <span className="text-slate-400 italic">No audio transcript recorded. Use "Edit Patient" to record voice narrative or update symptoms.</span>
                )}
              </div>
            </div>
          </div>

          {/* Dedicated Separate Cards for Hypertension, Diabetes, and Thyroid */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-emerald-700" />
                <span>Chronic Condition Parameters: HTN, Diabetes &amp; Thyroid</span>
              </h3>
              <p className="text-xs text-slate-500">
                Individual tracking for Hypertension, Diabetes Mellitus, and Thyroid with past and current readings.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 1. Hypertension Card */}
              {(() => {
                const isHtn = Boolean(
                  medHistory.hypertension?.present ||
                  medHistory.hypertension?.has ||
                  medHistory.hypertension?.currentReading ||
                  medHistory.hypertension?.pastReading ||
                  medHistory.hypertension?.sinceWhen ||
                  medHistory.hypertension?.medication ||
                  medHistory.hypertension?.medications
                );
                const isDm = Boolean(
                  medHistory.diabetes?.present ||
                  medHistory.diabetes?.has ||
                  medHistory.diabetes?.currentReading ||
                  medHistory.diabetes?.pastReading ||
                  medHistory.diabetes?.sinceWhen ||
                  medHistory.diabetes?.medication ||
                  medHistory.diabetes?.medications
                );
                const isThyroid = Boolean(
                  medHistory.thyroid?.present ||
                  medHistory.thyroid?.has ||
                  medHistory.thyroid?.currentReading ||
                  medHistory.thyroid?.pastReading ||
                  medHistory.thyroid?.sinceWhen ||
                  medHistory.thyroid?.medication ||
                  medHistory.thyroid?.medications
                );

                return (
                  <>
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Hypertension (HTN)</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            isHtn
                              ? 'bg-rose-100 text-rose-800 border border-rose-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isHtn ? 'Diagnosed' : 'Negative'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80">
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
                          <span className="font-mono font-bold text-[#0C4A60]">{medHistory.hypertension?.currentReading || (isHtn ? exam.bp || '-' : '-')}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Current Medications:</span>
                          <span className="font-semibold text-slate-900">{medHistory.hypertension?.medication || medHistory.hypertension?.medications || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 2. Diabetes Mellitus Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Diabetes Mellitus (DM)</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            isDm
                              ? 'bg-amber-100 text-amber-800 border border-amber-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isDm ? 'Diagnosed' : 'Negative'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Diabetes Type:</span>
                          <span className="font-semibold text-slate-900">{medHistory.diabetes?.type || (isDm ? 'Type 2' : '-')}</span>
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
                          <span className="font-semibold text-slate-900">{medHistory.diabetes?.medication || medHistory.diabetes?.medications || '-'}</span>
                        </div>
                      </div>
                    </div>

                    {/* 3. Thyroid Dysfunction Card */}
                    <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">Thyroid Dysfunction</span>
                        <span
                          className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold ${
                            isThyroid
                              ? 'bg-purple-100 text-purple-800 border border-purple-200'
                              : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isThyroid ? 'Diagnosed' : 'Negative'}
                        </span>
                      </div>

                      <div className="space-y-2 text-xs pt-2 border-t border-slate-200/80">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500 font-medium">Thyroid Type:</span>
                          <span className="font-semibold text-slate-900">{medHistory.thyroid?.type || (isThyroid ? 'Hypothyroidism' : '-')}</span>
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
                          <span className="font-semibold text-slate-900">{medHistory.thyroid?.medication || medHistory.thyroid?.medications || '-'}</span>
                        </div>
                      </div>
                    </div>
                  </>
                );
              })()}
            </div>
          </div>

          {/* Documented Medical & Surgical History */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-700" />
              <span>Surgical, Neurological &amp; General Medical History</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Operation:</span>
                <span className={medHistory.hasMajorOperation ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasMajorOperation ? `Yes: ${medHistory.majorOperationDetails}` : 'Nil / None'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Illness / Hospitalization:</span>
                <span className={medHistory.hasMajorIllness ? 'text-amber-800 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasMajorIllness ? `Yes: ${medHistory.majorIllnessDetails}` : 'Nil / None'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Major Trauma:</span>
                <span className={medHistory.hasMajorTrauma ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasMajorTrauma ? `Yes: ${medHistory.majorTraumaDetails}` : 'Nil / None'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Radiating Pain:</span>
                <span className={medHistory.hasRadiatingPain ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasRadiatingPain ? `Present: ${medHistory.radiatingPainDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Numbness in UL/LL:</span>
                <span className={medHistory.hasNumbness ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasNumbness ? `Present: ${medHistory.numbnessDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Abnormal Sensation:</span>
                <span className={medHistory.hasAbnormalSensation ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasAbnormalSensation ? `Present: ${medHistory.abnormalSensationDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Motor Weakness:</span>
                <span className={medHistory.hasMotorWeakness ? 'text-rose-700 font-bold' : 'text-slate-500'}>
                  {medHistory.hasMotorWeakness ? `Present: ${medHistory.motorWeaknessDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Bowel / Bladder involvement:</span>
                <span className={medHistory.hasBowelBladderInvolvement ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasBowelBladderInvolvement ? `Present: ${medHistory.bowelBladderDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Giddiness / Dizziness:</span>
                <span className={medHistory.hasGiddiness ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasGiddiness ? `Present: ${medHistory.giddinessDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Headache:</span>
                <span className={medHistory.hasHeadache ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasHeadache ? `Present: ${medHistory.headacheDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">H/o Weight Loss / Fever:</span>
                <span className={medHistory.hasWeightLossFever ? 'text-rose-700 font-semibold' : 'text-slate-500'}>
                  {medHistory.hasWeightLossFever ? `Present: ${medHistory.weightLossFeverDetails}` : 'Absent'}
                </span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">Previous Similar Episodes:</span>
                <span className="text-slate-700 font-medium">{medHistory.previousEpisodes || '-'}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">Family Medical History:</span>
                <span className="text-slate-700 font-medium">{medHistory.familyHistory || '-'}</span>
              </div>

              <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60">
                <span className="font-semibold text-slate-800 block mb-0.5">
                  Menstrual &amp; Obstetric History:
                </span>
                <span className="text-slate-700 font-medium">
                  {medHistory.menstrualHistory || 'Nil / Not applicable'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. PHYSICAL EXAM & DIAGNOSTIC INVESTIGATIONS (Requirement 4) */}
      {activeTab === 'exam' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Vitals including Height (cm) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Stethoscope className="w-4 h-4 text-[#0C4A60]" />
              <span>Objective Assessment &amp; Clinical Vitals</span>
            </h3>

            {/* Vitals row with Height */}
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs mb-4">
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Height (cm)</span>
                <span className="font-bold text-[#0C4A60] text-sm">
                  {exam.height ? `${exam.height} cm` : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Weight</span>
                <span className="font-bold text-slate-900 text-sm">
                  {exam.weight ? `${exam.weight} kg` : '-'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Blood Pressure</span>
                <span className="font-bold text-slate-900 text-sm">{exam.bp || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">Pulse Rate</span>
                <span className="font-bold text-slate-900 text-sm">{exam.pulse || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px] font-medium">BMI</span>
                <span className="font-bold text-slate-900 text-sm">{exam.bmi || '-'}</span>
              </div>
            </div>

            {/* Gait and Neuro Tests */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs mb-4">
              <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                <span className="text-slate-400 block text-[11px]">Toe Walking (S1 nerve root):</span>
                <span className="font-semibold text-slate-900 mt-1 block">{exam.toeWalkingS1 || 'Normal'}</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                <span className="text-slate-400 block text-[11px]">Heel Walking (L5 nerve root):</span>
                <span className="font-semibold text-slate-900 mt-1 block">{exam.heelWalkingL5 || 'Normal'}</span>
              </div>
              <div className="p-3.5 border border-slate-200 rounded-xl bg-white">
                <span className="text-slate-400 block text-[11px]">One Leg Standing (L4 nerve root):</span>
                <span className="font-semibold text-slate-900 mt-1 block">{exam.oneLegStandingL4 || 'Normal'}</span>
              </div>
            </div>

            {/* SLR and Circulation & Sensory Findings */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-4">
              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Straight Leg Raise (SLR):</span>
                <div className="font-semibold text-slate-900 text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Left Leg:</span>
                    <span className="font-bold text-slate-900">{exam.slrLeft || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Right Leg:</span>
                    <span className="font-bold text-slate-900">{exam.slrRight || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="p-3.5 border border-slate-200 rounded-xl bg-white space-y-1">
                <span className="text-slate-400 block text-[11px] font-medium uppercase tracking-wider">Circulation &amp; Sensory Findings:</span>
                <div className="font-semibold text-slate-900 text-xs space-y-0.5">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Sensory Deficit:</span>
                    <span className="font-bold text-slate-900">{exam.sensoryDeficit || '-'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Dorsalis Pedis Pulse:</span>
                    <span className="font-bold text-slate-900">{exam.dorsalisPedis || '-'}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#0C4A60]" />
                <span>Knee Biometrics &amp; Alignment</span>
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Alignment</span>
                  <span className="font-semibold text-slate-900">{exam.kneeVarusValgus || 'Normal'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Fixed Flexion</span>
                  <span className="font-semibold text-slate-900">{exam.kneeFixedFlexion || 'Nil'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Hyperextension</span>
                  <span className="font-semibold text-slate-900">{exam.kneeHyperextension || 'Nil'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Range of Motion</span>
                  <span className="font-semibold text-slate-900">{exam.kneeRangeOfMotion || '-'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Joint Tenderness</span>
                  <span className="font-semibold text-slate-900">{exam.kneeTenderness || '-'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Joint Effusion</span>
                  <span className="font-semibold text-slate-900">{exam.kneeEffusion || '-'}</span>
                </div>
                <div className="p-3 border border-slate-200 rounded-xl bg-slate-50/50 sm:col-span-2">
                  <span className="text-slate-500 block text-[10px] uppercase font-bold mb-1">Stability / Special Tests</span>
                  <span className="font-semibold text-slate-900">{exam.kneeStabilityTests || '-'}</span>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs mt-6">
              <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-[#0C4A60]" />
                <span>Extremity Joint Assessment</span>
              </h3>
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 text-xs font-semibold text-slate-900">
                {exam.extremityJointAssessment || 'No joint assessment documented.'}
              </div>
            </div>
          </div>

          {/* Diagnostic Investigations & File Attachments (Requirement 4) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            {/* Diagnostic Investigations Text Findings */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs mb-5">
              <span className="text-slate-500 font-bold block text-[11px] uppercase tracking-wider mb-1">
                Diagnostic Investigations Findings (X-Ray, MRI, CT, Blood Lab Reports)
              </span>
              <p className="text-slate-800 font-semibold leading-relaxed">
                {exam.investigations || '-'}
              </p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <FileUp className="w-4 h-4 text-[#0C4A60]" />
                  <span>Diagnostic Investigations &amp; Uploads (X-Rays, MRI, Reports)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  View and upload clinical imaging, X-ray films, MRI scans, and laboratory documentation.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddInvestigation(!showAddInvestigation)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0C4A60] hover:bg-[#083344] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddInvestigation ? 'Cancel' : 'Upload Investigation'}</span>
              </button>
            </div>

            {/* Upload Modal / Form */}
            {showAddInvestigation && (
              <form onSubmit={handleAddInvestigation} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-4">
                <span className="text-xs font-bold text-slate-800 block">Attach Diagnostic Document</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Document Title *</label>
                    <input
                      type="text"
                      value={investigationTitle}
                      onChange={(e) => setInvestigationTitle(e.target.value)}
                      placeholder="e.g. Lumbar Spine MRI Scan"
                      required
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">Investigation Type *</label>
                    <select
                      value={investigationType}
                      onChange={(e) => setInvestigationType(e.target.value as any)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    >
                      <option value="X-Ray">X-Ray Report / Film</option>
                      <option value="MRI">MRI Scan</option>
                      <option value="CT Scan">CT Scan</option>
                      <option value="Lab Report">Lab / Blood Report</option>
                      <option value="Other">Other Document</option>
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600">Date of Investigation</label>
                      {investigationDate && (
                        <span className="text-[10px] font-mono font-bold text-[#0C4A60] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                          {formatIndianDate(investigationDate)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={investigationDate}
                      onChange={(e) => setInvestigationDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Choose File (Image or PDF) *</label>
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    onChange={handleFileUpload}
                    className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-sky-50 file:text-[#0C4A60] hover:file:bg-sky-100 cursor-pointer"
                  />
                  {fileName && <span className="text-[11px] text-emerald-700 font-medium block mt-1">Selected: {fileName}</span>}
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">Clinical Findings &amp; Radiologist Impression</label>
                  <input
                    type="text"
                    value={investigationNotes}
                    onChange={(e) => setInvestigationNotes(e.target.value)}
                    placeholder="e.g. L4-L5 disc protrusion causing mild thecal sac indentation."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddInvestigation(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0C4A60] text-xs font-semibold text-white hover:bg-[#083344]"
                  >
                    Save &amp; Attach File
                  </button>
                </div>
              </form>
            )}

            {/* Gallery of Investigations */}
            {investigationsList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <FileUp className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No diagnostic reports uploaded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Upload Investigation" to attach patient X-rays, MRI scans or lab reports.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {investigationsList.map((doc) => (
                  <div
                    key={doc.id}
                    onClick={() => setPreviewAttachment(doc)}
                    className="p-4 rounded-xl border border-slate-200 hover:border-[#0C4A60] hover:shadow-sm transition-all bg-white cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-sky-50 text-[#0C4A60] border border-sky-100">
                        {doc.type}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{formatIndianDate(doc.date)}</span>
                    </div>

                    <h4 className="text-xs font-bold text-slate-900 group-hover:text-[#0C4A60] transition-colors truncate">
                      {doc.title}
                    </h4>

                    <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                      {doc.notes || doc.file_name}
                    </p>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-[#0C4A60] font-medium">
                      <span>View details &amp; file</span>
                      <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. 3-MONTH THERAPY PLAN & PRECAUTIONS (Requirement 5) */}
      {activeTab === 'plan' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Therapist Prescribed Clinical Notes & Protocol Focus */}
          {patient.notes && (
            <div className="bg-sky-50/80 rounded-2xl p-5 sm:p-6 border border-sky-200 shadow-xs">
              <div className="flex items-center gap-2.5 pb-2.5 mb-2.5 border-b border-sky-200/60">
                <div className="w-8 h-8 rounded-lg bg-[#0C4A60] text-amber-300 flex items-center justify-center">
                  <Stethoscope className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Therapist Clinical Prescription &amp; Directives</h3>
                  <span className="text-xs text-slate-500">Documented by assigned therapist for {patient.full_name}</span>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-slate-800 font-semibold leading-relaxed bg-white/70 p-3.5 rounded-xl border border-sky-100">
                "{patient.notes}"
              </p>
            </div>
          )}

          {/* Precautions & Contraindications Section (Read-Only) */}
          <div className="bg-amber-50/60 rounded-2xl p-6 border border-amber-200 shadow-xs">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-amber-200/60">
              <h3 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-700" />
                <span>Therapy Precautions &amp; Clinical Contraindications</span>
              </h3>
            </div>
            <div className="w-full text-xs sm:text-sm p-4 rounded-xl border border-amber-200 bg-white text-slate-800 font-medium leading-relaxed whitespace-pre-line">
              {patient.therapy_precautions || precautionsText ? (
                patient.therapy_precautions || precautionsText
              ) : (
                <span className="text-slate-400 italic">No specific therapy precautions recorded yet. Use the "Edit Patient" button above to document contraindications.</span>
              )}
            </div>
            <p className="text-[11px] text-amber-800/80 mt-2">
              Contraindicated movements and clinical precautions based on patient's neurological and physical assessment.
            </p>
          </div>

          {/* Three-Month Practice Plan Week-by-Week (Weeks 1 to 12 - Read-Only) */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-5 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#0C4A60]" />
                  <span>Three-Month Yogic Therapy Plan (12 Weeks)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Week-wise practices, asanas, pranayama, props, and clinical progressions.
                </p>
              </div>

              {/* Month Selector Tabs */}
              {therapySchedule.length > 0 && (
                <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(1)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedMonth === 1
                        ? 'bg-white text-[#0C4A60] shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Month 1 (W1 - W4)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(2)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedMonth === 2
                        ? 'bg-white text-[#0C4A60] shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Month 2 (W5 - W8)
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMonth(3)}
                    className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                      selectedMonth === 3
                        ? 'bg-white text-[#0C4A60] shadow-xs font-bold'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Month 3 (W9 - W12)
                  </button>
                </div>
              )}
            </div>

            {/* Weeks List or Empty State */}
            {therapySchedule.length === 0 ? (
              <div className="text-center py-10 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <Activity className="w-10 h-10 text-slate-400 mx-auto mb-3" />
                <h4 className="text-sm font-bold text-slate-800">No 12-Week Therapy Plan Configured</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                  Therapy schedules are not pre-configured. Use the "Edit Patient" button to record customized week-by-week practices, pranayama, and therapeutic props for this patient.
                </p>
                <button
                  type="button"
                  onClick={() => onEditClick?.('section5')}
                  className="mt-4 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-[#0C4A60] hover:bg-[#083344] transition-colors cursor-pointer shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5 text-amber-300" />
                  <span>Configure 12-Week Plan</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {therapySchedule
                  .filter((w) => w.month === selectedMonth)
                  .map((week, idx) => {
                    const currentWeekNum = week.weekNumber || week.week || (idx + 1);
                    return (
                      <div
                        key={currentWeekNum}
                        className={`p-4 rounded-xl border transition-all ${
                          week.completed
                            ? 'border-emerald-200 bg-emerald-50/30'
                            : 'border-slate-200 bg-slate-50/50'
                        }`}
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 mb-2 border-b border-slate-200/60 gap-2">
                          <div className="flex items-center gap-2.5">
                            <span className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                              W{currentWeekNum}
                            </span>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block">
                                Week {currentWeekNum}: {week.theme || week.title || `Week ${currentWeekNum} Protocol`}
                              </span>
                              <span className="text-[11px] text-slate-500">{week.duration || week.frequencyDuration || '45 mins / session'}</span>
                            </div>
                          </div>

                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                              week.completed
                                ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                                : 'bg-slate-100 text-slate-600 border border-slate-200'
                            }`}
                          >
                            {week.completed ? <Check className="w-3 h-3 text-emerald-700" /> : null}
                            <span>{week.completed ? 'Completed' : 'Planned'}</span>
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs mt-2">
                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                              Asanas &amp; Physical Practices
                            </span>
                            <p className="text-slate-800 font-medium">{week.practices || 'Not specified'}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                              Pranayama &amp; Breathwork
                            </span>
                            <p className="text-slate-800 font-medium">{week.pranayama || 'Not specified'}</p>
                          </div>

                          <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                            <span className="text-[10px] font-bold text-slate-400 uppercase block mb-1">
                              Therapeutic Props &amp; Notes
                            </span>
                            <p className="text-slate-800 font-medium">
                              {week.props || 'Standard'} {week.notes ? `• ${week.notes}` : ''}
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 6. FOLLOW-UP & PATIENT FEEDBACK TAB (Requirement 5 & 6) */}
      {activeTab === 'followup' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#0C4A60]" />
                  <span>Follow-up Sessions &amp; Patient Feedback Log</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Track recurring progress, subjective feedback, pain scores, and treatment adjustments.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowAddFollowup(!showAddFollowup)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-[#0C4A60] hover:bg-[#083344] transition-colors cursor-pointer self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>{showAddFollowup ? 'Cancel' : 'Add Follow-up & Feedback'}</span>
              </button>
            </div>

            {/* Follow-up & Feedback input modal/inline form */}
            {showAddFollowup && (
              <form onSubmit={handleAddFollowup} className="p-4 rounded-xl bg-slate-50 border border-slate-200 mb-6 space-y-4">
                <span className="text-xs font-bold text-slate-800 block">Record Follow-up Session</span>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600">Follow-up Date *</label>
                      {newFollowupDate && (
                        <span className="text-[10px] font-mono font-bold text-[#0C4A60] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                          {formatIndianDate(newFollowupDate)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={newFollowupDate}
                      onChange={(e) => setNewFollowupDate(e.target.value)}
                      required
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-medium text-slate-600 block mb-1">
                      Pain Score (VAS 0 to 10) *
                    </label>
                    <select
                      value={newPainScore}
                      onChange={(e) => setNewPainScore(Number(e.target.value))}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white font-mono font-bold"
                    >
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} - {num === 0 ? 'No Pain' : num < 4 ? 'Mild Pain' : num < 7 ? 'Moderate' : 'Severe'}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[11px] font-medium text-slate-600">Next Follow-up Date</label>
                      {nextFollowupDate && (
                        <span className="text-[10px] font-mono font-bold text-[#0C4A60] bg-sky-50 px-1.5 py-0.2 rounded border border-sky-200">
                          {formatIndianDate(nextFollowupDate)}
                        </span>
                      )}
                    </div>
                    <input
                      type="date"
                      value={nextFollowupDate}
                      onChange={(e) => setNextFollowupDate(e.target.value)}
                      className="w-full text-xs rounded-lg border border-slate-300 p-2 bg-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Patient Subjective Feedback *
                  </label>
                  <textarea
                    rows={2}
                    value={newFeedback}
                    onChange={(e) => setNewFeedback(e.target.value)}
                    required
                    placeholder="Patient describes how they feel: e.g. Morning stiffness has reduced by 50%, walking is easier."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-medium text-slate-600 block mb-1">
                    Therapist Observations &amp; Plan Adjustments
                  </label>
                  <textarea
                    rows={2}
                    value={newClinicalNotes}
                    onChange={(e) => setNewClinicalNotes(e.target.value)}
                    placeholder="Therapist notes: SLR improved to 75 deg. Advised to continue Phase 2 asanas with bolster."
                    className="w-full text-xs rounded-lg border border-slate-300 p-2.5 bg-white"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAddFollowup(false)}
                    className="px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-medium text-slate-600 hover:bg-white"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-[#0C4A60] text-xs font-semibold text-white hover:bg-[#083344]"
                  >
                    Save Follow-up Entry
                  </button>
                </div>
              </form>
            )}

            {/* List of Follow-up Records */}
            {followupList.length === 0 ? (
              <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <MessageSquare className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-medium text-slate-600">No follow-up entries recorded yet.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click "Add Follow-up &amp; Feedback" to document the patient's recovery trajectory.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {followupList.map((rec, i) => (
                  <div key={rec.id || i} className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-slate-900">{formatIndianDate(rec.followup_date)}</span>
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          VAS Pain: {rec.pain_score} / 10
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        Recorded by: {rec.therapist_name || 'Therapist'}
                      </span>
                    </div>

                    <div className="text-xs text-slate-800">
                      <span className="font-bold text-slate-900 block mb-0.5">Patient Feedback:</span>
                      <p className="italic bg-white p-2.5 rounded-lg border border-slate-200 text-slate-700">
                        "{rec.feedback}"
                      </p>
                    </div>

                    {rec.clinical_notes && (
                      <div className="text-xs text-slate-700">
                        <span className="font-bold text-slate-900 block mb-0.5">Clinical Progress &amp; Adjustments:</span>
                        <p>{rec.clinical_notes}</p>
                      </div>
                    )}

                    {rec.next_followup_date && (
                      <div className="pt-1 text-[11px] text-[#0C4A60] font-semibold flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Next scheduled follow-up: {formatIndianDate(rec.next_followup_date)}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 7. ACTIVITY LOGS TAB */}
      {activeTab === 'activity' && (
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs animate-in fade-in duration-150">
          <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
            <Clock className="w-4 h-4 text-slate-500" />
            <span>Patient Record Activity Logs</span>
          </h3>

          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 block">Registration Completed</span>
                <span className="text-slate-500 text-[11px]">Recorded at {formatIndianDate(patient.created_at, true) || 'Registration intake'}</span>
              </div>
            </div>

            <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
              <Activity className="w-4 h-4 text-sky-600 shrink-0" />
              <div>
                <span className="font-semibold text-slate-900 block">Current Status: {patient.status}</span>
                <span className="text-slate-500 text-[11px]">Last verified on {formatIndianDate(patient.updated_at || patient.created_at, true)}</span>
              </div>
            </div>

            {paymentsList.length > 0 && (
              <div className="flex items-center gap-3 p-3 rounded-xl border border-slate-200 bg-slate-50/60">
                <CreditCard className="w-4 h-4 text-[#0C4A60] shrink-0" />
                <div>
                  <span className="font-semibold text-slate-900 block">Payment Activity</span>
                  <span className="text-slate-500 text-[11px]">{paymentsList.length} receipt(s) on file totalling ₹{totalPaid.toLocaleString('en-IN')}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      </div>



      {/* Interactive Clinical Case Sheet Document Preview Modal */}
      {showPrintSheet && (
        <ClinicalCaseSheetDocument
          patient={patient}
          isModalPreview={true}
          onClose={() => setShowPrintSheet(false)}
        />
      )}

      {/* Background Multi-page Print Document Fallback (active on direct Ctrl+P) */}
      {!showPrintSheet && (
        <div className="hidden print:block">
          <ClinicalCaseSheetDocument
            patient={patient}
            isModalPreview={false}
          />
        </div>
      )}
    </div>
  );
};
