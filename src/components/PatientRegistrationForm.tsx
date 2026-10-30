import React, { useState, useEffect, useRef } from 'react';
import {
  User,
  HeartPulse,
  AlertCircle,
  CheckCircle,
  FileCheck2,
  Stethoscope,
  Info,
  ShieldAlert,
  Loader2,
  Check,
  ChevronRight,
  Mic,
  Square,
  Play,
  RotateCcw,
  Upload,
  FileText,
  Trash2,
  CreditCard,
  Calendar,
  AlertTriangle,
  Clock,
  Sparkles,
  Volume2
} from 'lucide-react';
import {
  MedicalHistory,
  ExamData,
  WeeklyPractice,
  InvestigationAttachment,
  PaymentRecord
} from '../types.ts';
import { formatIndianDate } from '../utils/dateFormatter';


interface Props {
  onSuccess: (newPatient: any) => void;
  onCancel: () => void;
}

export const PatientRegistrationForm: React.FC<Props> = ({ onSuccess, onCancel }) => {
  // Centres & Identification
  const [centre, setCentre] = useState<'STY Vijayawada' | 'STY Hyderabad' | ''>('');
  const [patientId, setPatientId] = useState('');
  const [loadingId, setLoadingId] = useState(false);
  const [status, setStatus] = useState('New');

  // 1. Patient Admission & Payment Details
  const [admissionDate, setAdmissionDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [dob, setDob] = useState('');
  const [age, setAge] = useState<string>('');
  const [gender, setGender] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [preferredLanguage, setPreferredLanguage] = useState('');

  // Emergency contact details
  const [emergencyName, setEmergencyName] = useState('');
  const [emergencyRelationship, setEmergencyRelationship] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');

  // Care allocation
  const [assignedTherapist, setAssignedTherapist] = useState('');
  const [referredBy, setReferredBy] = useState('');

  // Fee & Payment details (Requirement 1)
  const [consultationFee, setConsultationFee] = useState('');
  const [consultationDate, setConsultationDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [monthlyFee, setMonthlyFee] = useState('');
  const [recordInitialPayment, setRecordInitialPayment] = useState(true);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | ''>('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Lifestyle
  const [occupation, setOccupation] = useState('');
  const [workPattern, setWorkPattern] = useState('');
  const [physicalActivity, setPhysicalActivity] = useState('');

  // 2. Chief Complaint – Audio & Transcript (Requirement 2)
  const [chiefComplaint, setChiefComplaint] = useState('');
  const [complaintSinceWhen, setComplaintSinceWhen] = useState('');
  const [complaintRegion, setComplaintRegion] = useState('');
  const [complaintSide, setComplaintSide] = useState('');
  const [episodeType, setEpisodeType] = useState('');
  const [customEpisodeType, setCustomEpisodeType] = useState('');
  const [painScore, setPainScore] = useState<number>(5);

  // Audio Recording & Live Transcript State
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioBase64, setAudioBase64] = useState<string | null>(null);
  const [transcriptText, setTranscriptText] = useState('');
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // 3. Medical History – Separated Thyroid, HTN, DM (Requirement 3)
  // Hypertension (HTN)
  const [hasHTN, setHasHTN] = useState(false);
  const [htnSinceWhen, setHtnSinceWhen] = useState('');
  const [htnPastReading, setHtnPastReading] = useState('');
  const [htnCurrentReading, setHtnCurrentReading] = useState('');
  const [htnMedications, setHtnMedications] = useState('');

  // Diabetes Mellitus (DM)
  const [hasDM, setHasDM] = useState(false);
  const [dmType, setDmType] = useState('');
  const [dmSinceWhen, setDmSinceWhen] = useState('');
  const [dmPastReading, setDmPastReading] = useState('');
  const [dmCurrentReading, setDmCurrentReading] = useState('');
  const [dmMedications, setDmMedications] = useState('');

  // Thyroid
  const [hasThyroid, setHasThyroid] = useState(false);
  const [thyroidType, setThyroidType] = useState('');
  const [thyroidSinceWhen, setThyroidSinceWhen] = useState('');
  const [thyroidPastReading, setThyroidPastReading] = useState('');
  const [thyroidCurrentReading, setThyroidCurrentReading] = useState('');
  const [thyroidMedications, setThyroidMedications] = useState('');

  // Other conditions checklist
  const [medHistory, setMedHistory] = useState<MedicalHistory>({
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
    menstrualHistory: ''
  });

  // 4. Objective Examination (O/E) & Diagnostic Investigations (Requirement 4)
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bp, setBp] = useState('');
  const [pulse, setPulse] = useState('');
  const [bmi, setBmi] = useState('');

  const [exam, setExam] = useState<Omit<ExamData, 'height' | 'weight' | 'bp' | 'pulse' | 'bmi'>>({
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
    investigations: ''
  });

  // Diagnostic Investigation Attachments (Requirement 4)
  const [attachments, setAttachments] = useState<InvestigationAttachment[]>([]);
  const [uploadingFile, setUploadingFile] = useState(false);

  // 5. Therapy Notes, 3-Month Plan & Precautions (Requirement 5)
  const [therapyPrecautions, setTherapyPrecautions] = useState('');
  const [notes, setNotes] = useState('');

  // UI State
  const [duplicateWarning, setDuplicateWarning] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Fetch next suggested patient ID on centre change
  useEffect(() => {
    let isMounted = true;
    setLoadingId(true);
    fetch(`/api/patients/next-id?centre=${encodeURIComponent(centre)}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.nextId) {
          setPatientId(data.nextId);
        }
      })
      .catch((err) => console.error('Failed to get next ID:', err))
      .finally(() => {
        if (isMounted) setLoadingId(false);
      });

    return () => {
      isMounted = false;
    };
  }, [centre]);

  // Auto calculate age from DOB
  useEffect(() => {
    if (dob) {
      const birthDate = new Date(dob);
      const today = new Date();
      let calculatedAge = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        calculatedAge--;
      }
      if (calculatedAge >= 0 && calculatedAge < 120) {
        setAge(calculatedAge.toString());
      }
    }
  }, [dob]);

  // Auto calculate BMI from Height and Weight
  useEffect(() => {
    const h = parseFloat(height.replace(/[^0-9.]/g, ''));
    const w = parseFloat(weight.replace(/[^0-9.]/g, ''));
    if (h > 50 && w > 10) {
      const heightInMeters = h / 100;
      const computedBmi = (w / (heightInMeters * heightInMeters)).toFixed(1);
      setBmi(computedBmi);
    }
  }, [height, weight]);

  // Duplicate check on mobile or name blur
  const handleDuplicateCheck = async () => {
    if (!mobile && !fullName) return;
    try {
      const res = await fetch(
        `/api/patients/check-duplicate?mobile=${encodeURIComponent(mobile)}&name=${encodeURIComponent(fullName)}`
      );
      const data = await res.json();
      if (data.duplicate && data.existingPatient) {
        setDuplicateWarning(
          `Notice: An existing patient "${data.existingPatient.full_name}" is already registered with mobile ${data.existingPatient.mobile} under ID ${data.existingPatient.patient_id} at ${data.existingPatient.centre}.`
        );
      } else {
        setDuplicateWarning(null);
      }
    } catch (e) {
      // Ignore check errors
    }
  };

  // Audio Recording & Speech Recognition logic
  const startRecording = async () => {
    try {
      setErrorMsg(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        // Convert to base64 for database persistence
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          setAudioBase64(reader.result as string);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech API for live transcription
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN'; // Indian English / accent support

          recognition.onresult = (event: any) => {
            let currentTranscript = '';
            for (let i = 0; i < event.results.length; i++) {
              currentTranscript += event.results[i][0].transcript + ' ';
            }
            if (currentTranscript.trim()) {
              setTranscriptText(currentTranscript.trim());
              if (!chiefComplaint.trim()) {
                setChiefComplaint(currentTranscript.trim());
              }
            }
          };

          recognition.onerror = () => {
            // Speech recognition non-fatal error
          };

          recognition.start();
          recognitionRef.current = recognition;
          setIsTranscribing(true);
        } catch (e) {
          console.warn('Speech recognition start failed:', e);
        }
      }
    } catch (err: any) {
      console.warn('Audio recorder could not access microphone:', err);
      // Graceful fallback for browser/iframe security restrictions
      setErrorMsg('Microphone access is restricted in this browser session. You can type and review the transcript directly.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    setIsRecording(false);
    setIsTranscribing(false);
  };

  const resetRecording = () => {
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
    }
    setAudioUrl(null);
    setAudioBase64(null);
    setRecordingSeconds(0);
  };

  // Handle Diagnostic Investigation Files Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingFile(true);
    const newAttachments: InvestigationAttachment[] = [];

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        newAttachments.push({
          id: 'inv-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
          name: file.name,
          type: file.type || 'application/octet-stream',
          size: `${(file.size / 1024).toFixed(1)} KB`,
          uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
          dataUrl: uploadEvent.target?.result as string,
          notes: ''
        });

        if (newAttachments.length === files.length) {
          setAttachments((prev) => [...prev, ...newAttachments]);
          setUploadingFile(false);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) {
      setErrorMsg('Full Name is required.');
      return;
    }
    if (!mobile.trim()) {
      setErrorMsg('Contact Mobile number is required.');
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
        method: paymentMethod,
        receiptNo: `STY-RCP-${Math.floor(1000 + Math.random() * 9000)}`,
        notes: paymentNotes || 'Initial consultation & registration fee',
        recorded_by: 'Staff Admin'
      });
    }

    // Consolidated Medical History
    const completeMedicalHistory: MedicalHistory = {
      ...medHistory,
      hypertension: {
        has: hasHTN,
        sinceWhen: htnSinceWhen,
        pastReading: htnPastReading,
        currentReading: htnCurrentReading,
        medications: htnMedications
      },
      diabetes: {
        has: hasDM,
        type: dmType,
        sinceWhen: dmSinceWhen,
        pastReading: dmPastReading,
        currentReading: dmCurrentReading,
        medications: dmMedications
      },
      thyroid: {
        has: hasThyroid,
        type: thyroidType,
        sinceWhen: thyroidSinceWhen,
        pastReading: thyroidPastReading,
        currentReading: thyroidCurrentReading,
        medications: thyroidMedications
      }
    };

    // Consolidated Exam Data
    const completeExamData: ExamData = {
      height: height.trim(),
      weight: weight.trim(),
      bp: bp.trim(),
      pulse: pulse.trim(),
      bmi: bmi.trim(),
      ...exam
    };

    // Effective episode type
    const effectiveEpisodeType =
      episodeType === 'Other' && customEpisodeType.trim()
        ? customEpisodeType.trim()
        : episodeType;

    const payload = {
      patient_id: patientId,
      full_name: fullName.trim(),
      preferred_name: preferredName.trim(),
      dob,
      age: age ? parseInt(age, 10) : null,
      gender,
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      preferred_language: preferredLanguage,

      // 1. Admission & Payment
      admission_date: admissionDate,
      emergency_name: emergencyName.trim(),
      emergency_relationship: emergencyRelationship.trim(),
      emergency_phone: emergencyPhone.trim(),
      consultation_fee: consultationFee.trim(),
      consultation_date: consultationDate,
      monthly_fee: monthlyFee.trim(),
      payment_records: initialPayments,

      centre,
      assigned_therapist: assignedTherapist,
      referred_by: referredBy.trim(),
      status,
      occupation: occupation.trim(),
      work_pattern: workPattern.trim(),
      physical_activity: physicalActivity.trim(),

      // 2. Chief Complaint
      chief_complaint: chiefComplaint.trim(),
      complaint_since_when: complaintSinceWhen.trim(),
      complaint_audio: audioBase64 || '',
      complaint_transcript: transcriptText.trim(),
      complaint_region: complaintRegion,
      complaint_side: complaintSide,
      episode_type: effectiveEpisodeType,
      pain_score: painScore,

      // 3. Medical History & 4. Objective Exam
      medical_history: completeMedicalHistory,
      exam_data: completeExamData,
      investigation_attachments: attachments,

      // 5. Therapy Plan & Precautions
      therapy_precautions: therapyPrecautions.trim(),
      notes: notes.trim()
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
      setErrorMsg(err.message || 'An error occurred while saving.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto pb-16 space-y-6">
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center text-xs text-slate-500 gap-1.5">
        <span onClick={onCancel} className="hover:text-slate-900 cursor-pointer">Home</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span onClick={onCancel} className="hover:text-slate-900 cursor-pointer">Patients</span>
        <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
        <span className="text-[#0C4A60] font-semibold">Register Patient</span>
      </nav>

      {/* Heading with Auto Generated ID on top of the input form */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Patient Registration &amp; Clinical Case Sheet
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprehensive patient intake: demographics, admission &amp; fee structure, audio chief complaint, detailed chronic disease records, and objective vitals.
          </p>
        </div>

        {/* Auto Generated ID Display at Top of Input Form */}
        <div className="bg-white border-2 border-sky-100 rounded-2xl px-5 py-3 shadow-xs flex items-center gap-3 shrink-0">
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-[#0C4A60] flex items-center justify-center font-bold">
            <Sparkles className="w-5 h-5 text-[#0C4A60]" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
              Auto-Generated ID
            </span>
            <span className="text-xl font-mono font-bold text-[#0C4A60]">
              {loadingId ? 'Generating...' : (patientId || 'Generating...')}
            </span>
          </div>
        </div>
      </div>

      {duplicateWarning && (
        <div className="p-4 rounded-xl bg-amber-50/80 border border-amber-200 text-amber-900 text-sm flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="font-semibold text-xs sm:text-sm">Possible Duplicate Match Detected</p>
            <p className="text-xs text-amber-800 mt-0.5">{duplicateWarning}</p>
          </div>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
          <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* SECTION 1: Patient Admission & Payment Details */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-6 border-b border-slate-100 gap-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                1
              </div>
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Patient Admission &amp; Payment Details
                </h2>
                <p className="text-xs text-slate-500">
                  Admission date, personal demographics, emergency contact number, and authorized fee structure
                </p>
              </div>
            </div>

            {/* Auto-Generated ID Tag on Top of Section 1 */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-50 border border-sky-200/70 self-start sm:self-auto">
              <span className="text-[11px] font-semibold text-slate-500">Patient ID:</span>
              <span className="font-mono text-sm font-bold text-[#0C4A60]">
                {loadingId ? '...' : (patientId || 'Generating...')}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {/* Centre */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Registered Centre <span className="text-rose-500">*</span>
              </label>
              <select
                value={centre}
                onChange={(e) => setCentre(e.target.value as any)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] text-slate-800"
              >
                <option value="">Select Registered Centre</option>
                <option value="STY Vijayawada">STY Vijayawada (Main Centre)</option>
                <option value="STY Hyderabad">STY Hyderabad (Telangana Centre)</option>
              </select>
            </div>

            {/* Date of Joining / Admission (placed in place of Patient ID) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Date of Joining / Admission <span className="text-rose-500">*</span>
              </label>
              <input
                type="date"
                value={admissionDate}
                onChange={(e) => setAdmissionDate(e.target.value)}
                required
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] text-slate-800 font-medium"
              />
            </div>

            {/* Initial Status */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] text-slate-800"
              >
                <option value="">Select Initial Status</option>
                <option value="New">New</option>
                <option value="Active">Active</option>
              </select>
            </div>

            {/* Full Name */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Patient Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Enter Patient Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                onBlur={handleDuplicateCheck}
                required
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] text-slate-900 placeholder:text-slate-400"
              />
            </div>

            {/* Preferred Name */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Preferred Name / Alias
              </label>
              <input
                type="text"
                placeholder="Enter Preferred Name / Alias"
                value={preferredName}
                onChange={(e) => setPreferredName(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Date of Birth */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Date of Birth</label>
              <input
                type="date"
                value={dob}
                onChange={(e) => setDob(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Age (Years)</label>
              <input
                type="number"
                placeholder="Enter Age"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Mobile Number */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Mobile Number <span className="text-rose-500">*</span>
              </label>
              <input
                type="tel"
                placeholder="Enter Mobile Number"
                value={mobile}
                onChange={(e) => setMobile(e.target.value)}
                onBlur={handleDuplicateCheck}
                required
                className="w-full font-mono border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Email Address</label>
              <input
                type="email"
                placeholder="Enter Email Address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Preferred Language */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Preferred Language</label>
              <select
                value={preferredLanguage}
                onChange={(e) => setPreferredLanguage(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              >
                <option value="">Select Preferred Language</option>
                <option value="Telugu">Telugu</option>
                <option value="English">English</option>
                <option value="Hindi">Hindi</option>
                <option value="Tamil">Tamil</option>
              </select>
            </div>

            {/* Residential Address */}
            <div className="md:col-span-3">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Residential Address / Locality</label>
              <input
                type="text"
                placeholder="Enter Residential Address / Locality"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Occupation */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Occupation</label>
              <input
                type="text"
                placeholder="Enter Occupation"
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Work / Hobby */}
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Work / Hobby</label>
              <input
                type="text"
                placeholder="Enter Work / Hobby"
                value={workPattern}
                onChange={(e) => setWorkPattern(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>
          </div>

          {/* Emergency Contact Number & Details (Requirement 1) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-3 flex items-center gap-1.5">
              <HeartPulse className="w-3.5 h-3.5 text-rose-500" />
              <span>Emergency Contact Details</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Emergency Contact Name</label>
                <input
                  type="text"
                  placeholder="Enter Emergency Contact Name"
                  value={emergencyName}
                  onChange={(e) => setEmergencyName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Relationship</label>
                <input
                  type="text"
                  placeholder="Enter Relationship"
                  value={emergencyRelationship}
                  onChange={(e) => setEmergencyRelationship(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Emergency Contact Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="Enter Emergency Contact Number"
                  value={emergencyPhone}
                  onChange={(e) => setEmergencyPhone(e.target.value)}
                  className="w-full font-mono border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>
          </div>

          {/* Care Team Allocation */}
          <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Assigned Yoga Therapist</label>
              <input
                type="text"
                placeholder="Enter Assigned Yoga Therapist"
                value={assignedTherapist}
                onChange={(e) => setAssignedTherapist(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Referred By (Doctor / Hospital)</label>
              <input
                type="text"
                placeholder="Enter Referred By"
                value={referredBy}
                onChange={(e) => setReferredBy(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>
          </div>

          {/* Fee & Payment Details (Requirement 1: Consultation fee, date, monthly fee, staff manual entry) */}
          <div className="mt-6 pt-5 border-t border-slate-100 bg-slate-50/80 p-4 sm:p-5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-[#0C4A60]" />
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                  Fee Structure &amp; Payment Details
                </h3>
              </div>
              <span className="text-[11px] text-slate-500 font-medium">Entered manually by authorized staff</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Consultation Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter Consultation Fee"
                  value={consultationFee}
                  onChange={(e) => setConsultationFee(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] font-semibold text-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Consultation Date
                </label>
                <input
                  type="date"
                  value={consultationDate}
                  onChange={(e) => setConsultationDate(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Monthly Therapy Fee (₹)
                </label>
                <input
                  type="number"
                  placeholder="Enter Monthly Therapy Fee"
                  value={monthlyFee}
                  onChange={(e) => setMonthlyFee(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] font-semibold text-slate-900"
                />
              </div>
            </div>

            {/* Manual Payment Entry Toggle */}
            <div className="pt-3 border-t border-slate-200/80">
              <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-slate-800 mb-3 select-none">
                <input
                  type="checkbox"
                  checked={recordInitialPayment}
                  onChange={(e) => setRecordInitialPayment(e.target.checked)}
                  className="w-4 h-4 text-[#0C4A60] rounded accent-[#0C4A60]"
                />
                <span>Record initial payment receipt upon admission</span>
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
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Payment Method</label>
                    <select
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value as any)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    >
                      <option value="">Select Payment Method</option>
                      <option value="UPI">UPI (Google Pay / PhonePe / Paytm)</option>
                      <option value="Cash">Cash at Clinic Desk</option>
                      <option value="Card">Credit / Debit Card</option>
                      <option value="Bank Transfer">NEFT / Net Banking</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">Receipt Notes / Reference</label>
                    <input
                      type="text"
                      placeholder="Enter Receipt Notes / Reference"
                      value={paymentNotes}
                      onChange={(e) => setPaymentNotes(e.target.value)}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 2: Chief Complaint – Audio & Transcript (Requirement 2) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
              2
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Chief Complaint (C/o) &amp; Voice Recording
              </h2>
              <p className="text-xs text-slate-500">
                Record patient explanation, live speech-to-text transcription, duration, and episode classification
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Audio Recording & Transcript Widget (Requirement 2) */}
            <div className="p-4 rounded-xl border border-sky-200 bg-sky-50/60 space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-[#0C4A60]'}`} />
                  <span className="text-xs font-bold text-slate-900">
                    Patient Voice Explanation &amp; Speech-to-Text
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  {!isRecording ? (
                    <button
                      type="button"
                      onClick={startRecording}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0C4A60] text-white text-xs font-semibold hover:bg-[#083344] transition-colors cursor-pointer shadow-xs"
                    >
                      <Mic className="w-3.5 h-3.5" />
                      <span>Record Patient Explanation</span>
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={stopRecording}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-semibold hover:bg-rose-700 transition-colors cursor-pointer shadow-xs animate-pulse"
                    >
                      <Square className="w-3.5 h-3.5 fill-white" />
                      <span>Stop Recording ({recordingSeconds}s)</span>
                    </button>
                  )}
                  {audioUrl && !isRecording && (
                    <button
                      type="button"
                      onClick={resetRecording}
                      className="p-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs cursor-pointer"
                      title="Clear Recording"
                    >
                      <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  )}
                </div>
              </div>

              {/* Audio Playback player if recorded */}
              {audioUrl && (
                <div className="bg-white p-3 rounded-lg border border-sky-100 flex items-center gap-3">
                  <Volume2 className="w-4 h-4 text-[#0C4A60] shrink-0" />
                  <audio src={audioUrl} controls className="w-full h-8" />
                </div>
              )}

              {/* Editable Transcript Field */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-[11px] font-semibold text-slate-700 flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-amber-500" />
                    <span>Auto-Generated / Reviewed Audio Transcript:</span>
                  </label>
                  <span className="text-[10px] text-slate-500">Editable prior to saving</span>
                </div>
                <textarea
                  rows={2}
                  placeholder="Enter Transcript Description"
                  value={transcriptText}
                  onChange={(e) => setTranscriptText(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded-lg p-2.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>

            {/* Patient's Chief Complaint */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Chief Complaint Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={3}
                placeholder="Enter Chief Complaint Description"
                value={chiefComplaint}
                onChange={(e) => setChiefComplaint(e.target.value)}
                required
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Since when? (Requirement 2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Since When? <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Enter Since When"
                  value={complaintSinceWhen}
                  onChange={(e) => setComplaintSinceWhen(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] font-medium"
                />
              </div>

              {/* Primary Body Region */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Body Region</label>
                <select
                  value={complaintRegion}
                  onChange={(e) => setComplaintRegion(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                >
                  <option value="">Select Primary Body Region</option>
                  <option value="Lumbar Spine">Lumbar Spine (Lower Back)</option>
                  <option value="Cervical Spine">Cervical Spine (Neck)</option>
                  <option value="Thoracic Spine">Thoracic Spine (Upper Back)</option>
                  <option value="Knee">Knee Joint</option>
                  <option value="Shoulder">Shoulder Joint</option>
                  <option value="Pelvis/Hip">Pelvis / Hip</option>
                  <option value="Ankle/Foot">Ankle / Foot</option>
                  <option value="Whole Body / Systemic">General Wellness / Multi-joint</option>
                </select>
              </div>

              {/* Side Affected */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Side Affected</label>
                <select
                  value={complaintSide}
                  onChange={(e) => setComplaintSide(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                >
                  <option value="">Select Side Affected</option>
                  <option value="Bilateral">Bilateral</option>
                  <option value="Right">Right</option>
                  <option value="Left">Left</option>
                  <option value="Central">Central / Midline</option>
                </select>
              </div>

              {/* Episode Type with Other Option (Requirement 2) */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">Episode Type</label>
                <select
                  value={episodeType}
                  onChange={(e) => setEpisodeType(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                >
                  <option value="">Select Episode Type</option>
                  <option value="First episode">First episode</option>
                  <option value="Recurring">Recurring episode</option>
                  <option value="Chronic (>6 months)">Chronic (&gt;6 months)</option>
                  <option value="Acute flare-up">Acute flare-up</option>
                  <option value="Other">Other (Specify)</option>
                </select>
              </div>
            </div>

            {/* Custom Episode Type Input when "Other" is chosen */}
            {episodeType === 'Other' && (
              <div className="bg-amber-50/70 p-3 rounded-lg border border-amber-200">
                <label className="block text-xs font-semibold text-amber-900 mb-1">
                  Specify Custom Episode Type
                </label>
                <input
                  type="text"
                  placeholder="Enter Custom Episode Type"
                  value={customEpisodeType}
                  onChange={(e) => setCustomEpisodeType(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg px-3 py-1.5 text-xs text-slate-900"
                />
              </div>
            )}

            {/* Pain Scale Slider (0-10) */}
            <div className="bg-slate-50/80 p-5 rounded-xl border border-slate-200 mt-2">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Baseline Pain Score (Visual Analog Scale: 0 - 10)
                </span>
                <span className="font-mono text-sm font-extrabold px-3 py-0.5 bg-slate-900 text-white rounded-md">
                  {painScore} / 10
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                value={painScore}
                onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                className="w-full accent-[#0C4A60] cursor-pointer h-2 bg-slate-200 rounded-lg block"
              />
              <div className="relative w-full text-[11px] text-slate-500 font-medium mt-2 h-5">
                <span className="absolute left-[0%] top-0 -translate-x-0 text-left">0 · No Pain</span>
                <span className="absolute left-[30%] top-0 -translate-x-1/2 text-center">3 · Mild</span>
                <span className="absolute left-[50%] top-0 -translate-x-1/2 text-center">5 · Moderate</span>
                <span className="absolute left-[80%] top-0 -translate-x-1/2 text-center">8 · Severe</span>
                <span className="absolute left-[100%] top-0 -translate-x-full text-right">10 · Worst</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: Medical History – Separated Chronic Conditions (Requirement 3) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
              3
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Medical History &amp; Chronic Diseases
              </h2>
              <p className="text-xs text-slate-500">
                Record Thyroid, Hypertension, and Diabetes separately with past &amp; present readings and duration
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Condition 1: Hypertension (HTN) Recorded Separately */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
              <label className="flex items-center justify-between cursor-pointer select-none text-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={hasHTN}
                    onChange={(e) => setHasHTN(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-bold text-slate-900 text-sm">Hypertension (HTN)</span>
                  <span className="text-xs text-slate-500 font-normal">Duration, readings, medications</span>
                </div>
                {hasHTN && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200">
                    Active Condition
                  </span>
                )}
              </label>

              {hasHTN && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-50/80 p-3 rounded-xl text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration / Since When</label>
                    <input
                      type="text"
                      placeholder="Enter Duration / Since When"
                      value={htnSinceWhen}
                      onChange={(e) => setHtnSinceWhen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Past BP Reading</label>
                    <input
                      type="text"
                      placeholder="Enter Past BP Reading"
                      value={htnPastReading}
                      onChange={(e) => setHtnPastReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current BP Reading</label>
                    <input
                      type="text"
                      placeholder="Enter Current BP Reading"
                      value={htnCurrentReading}
                      onChange={(e) => setHtnCurrentReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                    <input
                      type="text"
                      placeholder="Enter Current Medications"
                      value={htnMedications}
                      onChange={(e) => setHtnMedications(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Condition 2: Diabetes Mellitus (DM) Recorded Separately */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
              <label className="flex items-center justify-between cursor-pointer select-none text-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={hasDM}
                    onChange={(e) => setHasDM(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-bold text-slate-900 text-sm">Diabetes Mellitus (DM)</span>
                  <span className="text-xs text-slate-500 font-normal">Type, sugar/HbA1c readings, medications</span>
                </div>
                {hasDM && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                    Active Condition
                  </span>
                )}
              </label>

              {hasDM && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50/80 p-3 rounded-xl text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Diabetes Type</label>
                    <select
                      value={dmType}
                      onChange={(e) => setDmType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    >
                      <option value="">Select Diabetes Type</option>
                      <option value="Type 2">Type 2 Diabetes</option>
                      <option value="Type 1">Type 1 Diabetes</option>
                      <option value="Prediabetes">Prediabetes</option>
                      <option value="Gestational">Gestational</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration / Since When</label>
                    <input
                      type="text"
                      placeholder="Enter Duration / Since When"
                      value={dmSinceWhen}
                      onChange={(e) => setDmSinceWhen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Past Sugar / HbA1c</label>
                    <input
                      type="text"
                      placeholder="Enter Past Sugar / HbA1c"
                      value={dmPastReading}
                      onChange={(e) => setDmPastReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Sugar / HbA1c</label>
                    <input
                      type="text"
                      placeholder="Enter Current Sugar / HbA1c"
                      value={dmCurrentReading}
                      onChange={(e) => setDmCurrentReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                    <input
                      type="text"
                      placeholder="Enter Current Medications"
                      value={dmMedications}
                      onChange={(e) => setDmMedications(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Condition 3: Thyroid Dysfunction Recorded Separately */}
            <div className="p-4 sm:p-5 rounded-xl border border-slate-200 hover:border-slate-300 transition-colors bg-white">
              <label className="flex items-center justify-between cursor-pointer select-none text-sm">
                <div className="flex items-center gap-2.5">
                  <input
                    type="checkbox"
                    checked={hasThyroid}
                    onChange={(e) => setHasThyroid(e.target.checked)}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-bold text-slate-900 text-sm">Thyroid Dysfunction</span>
                  <span className="text-xs text-slate-500 font-normal">Type, TSH readings, medications</span>
                </div>
                {hasThyroid && (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-200">
                    Active Condition
                  </span>
                )}
              </label>

              {hasThyroid && (
                <div className="mt-3 pt-3 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-5 gap-3 bg-slate-50/80 p-3 rounded-xl text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Thyroid Type</label>
                    <select
                      value={thyroidType}
                      onChange={(e) => setThyroidType(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    >
                      <option value="">Select Thyroid Type</option>
                      <option value="Hypothyroidism">Hypothyroidism</option>
                      <option value="Hyperthyroidism">Hyperthyroidism</option>
                      <option value="Goitre / Nodules">Goitre / Nodules</option>
                      <option value="Thyroiditis">Thyroiditis</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Duration / Since When</label>
                    <input
                      type="text"
                      placeholder="Enter Duration / Since When"
                      value={thyroidSinceWhen}
                      onChange={(e) => setThyroidSinceWhen(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Past TSH Reading</label>
                    <input
                      type="text"
                      placeholder="Enter Past TSH Reading"
                      value={thyroidPastReading}
                      onChange={(e) => setThyroidPastReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current TSH Reading</label>
                    <input
                      type="text"
                      placeholder="Enter Current TSH Reading"
                      value={thyroidCurrentReading}
                      onChange={(e) => setThyroidCurrentReading(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Current Medications</label>
                    <input
                      type="text"
                      placeholder="Enter Current Medications"
                      value={thyroidMedications}
                      onChange={(e) => setThyroidMedications(e.target.value)}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Other Surgical & Neurological Conditions */}
            <div className="pt-2 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                Surgical, Trauma &amp; Neurological Screen
              </h3>

              {/* Major Operation */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasMajorOperation}
                    onChange={(e) => setMedHistory({ ...medHistory, hasMajorOperation: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Major Operation</span>
                </label>
                {medHistory.hasMajorOperation && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Specify procedure, year, and implants..."
                      value={medHistory.majorOperationDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, majorOperationDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Major Illness / Hospitalization */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasMajorIllness}
                    onChange={(e) => setMedHistory({ ...medHistory, hasMajorIllness: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Major Illness / Hospitalization</span>
                </label>
                {medHistory.hasMajorIllness && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Specify illness, past admission history, or systemic condition..."
                      value={medHistory.majorIllnessDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, majorIllnessDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Major Trauma */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasMajorTrauma}
                    onChange={(e) => setMedHistory({ ...medHistory, hasMajorTrauma: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Major Trauma</span>
                </label>
                {medHistory.hasMajorTrauma && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Specify accident, fall, fracture or injury mechanism..."
                      value={medHistory.majorTraumaDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, majorTraumaDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Radiating Pain */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasRadiatingPain}
                    onChange={(e) => setMedHistory({ ...medHistory, hasRadiatingPain: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Radiating pain (Radiculopathy into upper/lower limb)</span>
                </label>
                {medHistory.hasRadiatingPain && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Path: e.g. Lumbar radiating down left posterior thigh to calf..."
                      value={medHistory.radiatingPainDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, radiatingPainDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Numbness */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasNumbness}
                    onChange={(e) => setMedHistory({ ...medHistory, hasNumbness: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Numbness in Upper / Lower Limb</span>
                </label>
                {medHistory.hasNumbness && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Specific dermatome and side affected..."
                      value={medHistory.numbnessDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, numbnessDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Motor Weakness */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="flex items-center gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={medHistory.hasMotorWeakness}
                    onChange={(e) => setMedHistory({ ...medHistory, hasMotorWeakness: e.target.checked })}
                    className="w-4 h-4 rounded text-[#0C4A60] accent-[#0C4A60]"
                  />
                  <span className="font-semibold text-slate-800 text-xs sm:text-sm">H/o Motor Weakness</span>
                </label>
                {medHistory.hasMotorWeakness && (
                  <div className="mt-2.5 pl-7">
                    <input
                      type="text"
                      placeholder="Specify limb weakness, muscle power loss or foot drop..."
                      value={medHistory.motorWeaknessDetails}
                      onChange={(e) => setMedHistory({ ...medHistory, motorWeaknessDetails: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800"
                    />
                  </div>
                )}
              </div>

              {/* Menstrual & Obstetric History */}
              <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
                <label className="block text-xs font-semibold text-slate-800 mb-1.5">
                  Menstrual &amp; Obstetric History
                </label>
                <input
                  type="text"
                  placeholder="Enter Menstrual & Obstetric History"
                  value={medHistory.menstrualHistory}
                  onChange={(e) => setMedHistory({ ...medHistory, menstrualHistory: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-1.5 text-xs text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: Objective Physical Examination & Diagnostic Investigations (Requirement 4) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
              4
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Objective Examination (O/E) &amp; Diagnostic Investigations
              </h2>
              <p className="text-xs text-slate-500">
                Height, baseline vitals, myotomal screening, and document upload for X-rays and MRI reports
              </p>
            </div>
          </div>

          {/* Vitals row with Height (Requirement 4) */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-6">
            {/* Height */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Height (cm)
              </label>
              <input
                type="text"
                placeholder="Enter Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] font-medium"
              />
            </div>

            {/* Weight */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
              <input
                type="text"
                placeholder="Enter Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] font-medium"
              />
            </div>

            {/* BP */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Pressure (BP)</label>
              <input
                type="text"
                placeholder="Enter Blood Pressure"
                value={bp}
                onChange={(e) => setBp(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Pulse */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pulse Rate</label>
              <input
                type="text"
                placeholder="Enter Pulse Rate"
                value={pulse}
                onChange={(e) => setPulse(e.target.value)}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* BMI (Auto Calculated) */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                BMI (Auto)
              </label>
              <input
                type="text"
                placeholder="Enter BMI"
                value={bmi}
                onChange={(e) => setBmi(e.target.value)}
                className="w-full bg-slate-50 border border-slate-300 rounded-lg px-3 py-2 text-sm font-bold text-[#0C4A60]"
              />
            </div>
          </div>

          {/* Neuro Myotomal & Gait Screening */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Toe Walking &bull; S1 Nerve Root</label>
              <select
                value={exam.toeWalkingS1}
                onChange={(e) => setExam({ ...exam, toeWalkingS1: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select Toe Walking (S1)</option>
                <option value="Normal">Normal</option>
                <option value="Impaired Right">Impaired Right (S1 weakness)</option>
                <option value="Impaired Left">Impaired Left (S1 weakness)</option>
                <option value="Impaired Bilateral">Impaired Bilateral</option>
                <option value="Unable due to pain">Unable due to pain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">Heel Walking &bull; L5 Nerve Root</label>
              <select
                value={exam.heelWalkingL5}
                onChange={(e) => setExam({ ...exam, heelWalkingL5: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select Heel Walking (L5)</option>
                <option value="Normal">Normal</option>
                <option value="Impaired Right">Impaired Right (L5 weakness)</option>
                <option value="Impaired Left">Impaired Left (L5 weakness)</option>
                <option value="Impaired Bilateral">Impaired Bilateral</option>
                <option value="Unable due to pain">Unable due to pain</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">One Leg Standing &bull; L4 Nerve Root</label>
              <select
                value={exam.oneLegStandingL4}
                onChange={(e) => setExam({ ...exam, oneLegStandingL4: e.target.value })}
                className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
              >
                <option value="">Select One Leg Standing (L4)</option>
                <option value="Normal">Normal bilaterally (&gt;25s)</option>
                <option value="Unstable Right">Unstable Right (L4 / Trendelenburg)</option>
                <option value="Unstable Left">Unstable Left (L4 / Trendelenburg)</option>
                <option value="Poor Balance">Poor Balance Bilaterally</option>
              </select>
            </div>
          </div>

          {/* Straight Leg Raise (SLR) Test (L4-S1 Tension) */}
          <div className="mb-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Straight Leg Raise (SLR) Test (L4-S1 Tension)
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Straight Leg Raise (SLR) - Left Leg
                </label>
                <input
                  type="text"
                  placeholder="Enter SLR Left"
                  value={exam.slrLeft}
                  onChange={(e) => setExam({ ...exam, slrLeft: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Straight Leg Raise (SLR) - Right Leg
                </label>
                <input
                  type="text"
                  placeholder="Enter SLR Right"
                  value={exam.slrRight}
                  onChange={(e) => setExam({ ...exam, slrRight: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Sensory & Peripheral Arterial Pulse */}
          <div className="mb-4 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
              Sensory &amp; Peripheral Arterial Pulse
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Sensory Deficit (Myotome / Dermatome)
                </label>
                <input
                  type="text"
                  placeholder="Enter Sensory Deficit"
                  value={exam.sensoryDeficit}
                  onChange={(e) => setExam({ ...exam, sensoryDeficit: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Dorsalis Pedis Arterial Pulse
                </label>
                <input
                  type="text"
                  placeholder="Enter Dorsalis Pedis Pulse Status"
                  value={exam.dorsalisPedis}
                  onChange={(e) => setExam({ ...exam, dorsalisPedis: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
                />
              </div>
            </div>
          </div>

          {/* Knee Biomechanics & Alignment */}
          <div className="mb-6 bg-slate-50/80 p-4 rounded-xl border border-slate-200">
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Knee Biomechanics &amp; Alignment
            </label>
            <input
              type="text"
              placeholder="Enter Knee Biomechanics & Alignment"
              value={exam.kneeVarusValgus}
              onChange={(e) => setExam({ ...exam, kneeVarusValgus: e.target.value })}
              className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white"
            />
          </div>

          {/* Diagnostic Investigations & File Attachment Upload (Requirement 4) */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Diagnostic Investigations Findings (X-Ray, MRI, CT, Blood Lab Reports)
              </label>
              <textarea
                rows={2}
                placeholder="Enter Diagnostic Investigations Findings"
                value={exam.investigations}
                onChange={(e) => setExam({ ...exam, investigations: e.target.value })}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* File Upload Section for X-Rays / Investigation Reports (Requirement 4) */}
            <div className="p-4 rounded-xl border border-dashed border-slate-300 bg-slate-50/70">
              <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#0C4A60]" />
                  <span className="text-xs font-bold text-slate-800">
                    Upload Diagnostic Documents &amp; X-Ray Images
                  </span>
                </div>
                <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs">
                  <Upload className="w-3.5 h-3.5 text-slate-500" />
                  <span>Choose Files</span>
                  <input
                    type="file"
                    multiple
                    accept="image/*,.pdf"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {uploadingFile && (
                <div className="flex items-center gap-2 text-xs text-[#0C4A60] py-2">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing attachments...</span>
                </div>
              )}

              {attachments.length === 0 ? (
                <p className="text-[11px] text-slate-400 italic">
                  No files uploaded yet. Supported: X-Ray photos, MRI scans, lab report PDFs, pathology documents.
                </p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
                  {attachments.map((file) => (
                    <div
                      key={file.id}
                      className="p-2.5 rounded-xl bg-white border border-slate-200 flex items-center justify-between gap-2 shadow-2xs"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {file.type.startsWith('image/') ? (
                          <img
                            src={file.dataUrl}
                            alt={file.name}
                            className="w-10 h-10 object-cover rounded-lg border border-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                            <FileText className="w-5 h-5" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-800 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <p className="text-[10px] text-slate-400">{file.size}</p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeAttachment(file.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                        title="Remove file"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SECTION 5: Therapy Notes, 3-Month Plan & Precautions (Requirement 5) */}
        <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90">
          <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-slate-100">
            <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
              5
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Therapy Notes, 3-Month Protocol &amp; Clinical Precautions
              </h2>
              <p className="text-xs text-slate-500">
                Three-month structured week-wise practices, safety precautions, and therapist intake observations
              </p>
            </div>
          </div>

          <div className="space-y-5">
            {/* Separate Precautions Section (Requirement 5) */}
            <div className="p-4 rounded-xl border border-amber-200 bg-amber-50/60">
              <div className="flex items-center gap-2 mb-2 text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Clinical Precautions &amp; Contraindications (Separate Section)
                </h3>
              </div>
              <p className="text-[11px] text-amber-800 mb-2">
                Mandatory movements, asanas, and daily activities to strictly avoid for patient safety.
              </p>
              <textarea
                rows={2}
                value={therapyPrecautions}
                onChange={(e) => setTherapyPrecautions(e.target.value)}
                placeholder="Specify postures to avoid (e.g. no forward bending, avoid high load squats, no deep twisting)..."
                className="w-full bg-white border border-amber-300 rounded-lg p-2.5 text-xs text-slate-900 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
            </div>

            {/* Three-Month Therapy Plan Info Banner (Requirement 5) */}
            <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/80">
              <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[#0C4A60]" />
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                    3-Month Week-Wise Therapy &amp; Practice Plan
                  </h3>
                </div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  12 Weeks Pre-Configured
                </span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                A clinically structured 12-week rehabilitation trajectory (Month 1: Weeks 1–4 acute mobilization, Month 2: Weeks 5–8 functional strength, Month 3: Weeks 9–12 stability &amp; discharge sadhana) will be automatically initialized for this case. Practices can be dynamically reviewed, recorded, and customized week-by-week on the patient's profile.
              </p>
            </div>

            {/* Additional Therapist Intake Notes */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Additional Therapist Intake Notes
              </label>
              <textarea
                rows={3}
                placeholder="Initial impressions, specific yoga props setup (bolster, straps, chair height), home sadhana guidelines..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
              />
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
                <span>Saving Patient Record...</span>
              </>
            ) : (
              <>
                <Check className="w-4 h-4" />
                <span>Register &amp; Save Case Sheet</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
