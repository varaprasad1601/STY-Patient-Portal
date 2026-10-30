import React, { useState, useRef, useEffect } from 'react';
import {
  X,
  Check,
  Loader2,
  Mic,
  Square,
  Volume2,
  Sparkles,
  RotateCcw,
  Upload,
  Trash2,
  Calendar,
  AlertTriangle,
  Stethoscope,
  Activity,
  HeartPulse,
  User,
  CreditCard,
  Building2,
  Phone,
  FileText,
  Copy,
  ChevronRight,
  ArrowLeft,
  Plus
} from 'lucide-react';
import {
  Patient,
  MedicalHistory,
  ExamData,
  WeeklyPractice,
  InvestigationAttachment,
  PaymentRecord
} from '../types.ts';
import { formatIndianDate } from '../utils/dateFormatter';

interface Props {
  patient: Patient;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: Patient) => Promise<void>;
  initialSection?: 'section1' | 'section2' | 'section3' | 'section4' | 'section5';
}

export const PatientEditModal: React.FC<Props> = ({
  patient,
  isOpen,
  onClose,
  onSave,
  initialSection = 'section1'
}) => {
  const [activeSection, setActiveSection] = useState<'section1' | 'section2' | 'section3' | 'section4' | 'section5'>(initialSection);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (initialSection && isOpen) {
      setActiveSection(initialSection);
    }
  }, [initialSection, isOpen]);

  // Scroll to top of form when section tab changes
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [activeSection]);

  // ==========================================
  // SECTION 1: Personal Profile & Admission
  // ==========================================
  const [fullName, setFullName] = useState(patient.full_name || '');
  const [preferredName, setPreferredName] = useState(patient.preferred_name || '');
  const [dob, setDob] = useState(patient.dob || '');
  const [age, setAge] = useState<string>(patient.age ? String(patient.age) : '');
  const [gender, setGender] = useState(patient.gender || '');
  const [mobile, setMobile] = useState(patient.mobile || '');
  const [email, setEmail] = useState(patient.email || '');
  const [address, setAddress] = useState(patient.address || '');
  const [preferredLanguage, setPreferredLanguage] = useState(patient.preferred_language || 'Telugu');
  const [occupation, setOccupation] = useState(patient.occupation || '');
  const [workPattern, setWorkPattern] = useState(patient.work_pattern || '');
  const [physicalActivity, setPhysicalActivity] = useState(patient.physical_activity || '');

  const getTodayStr = () => {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  const [centre, setCentre] = useState(patient.centre || 'STY Vijayawada');
  const [admissionDate, setAdmissionDate] = useState(
    patient.admission_date ||
    (patient.created_at ? patient.created_at.split('T')[0].split(' ')[0] : getTodayStr())
  );
  const [assignedTherapist, setAssignedTherapist] = useState(patient.assigned_therapist || '');
  const [referredBy, setReferredBy] = useState(patient.referred_by || '');
  const [status, setStatus] = useState(patient.status || 'Active');

  const [emergencyName, setEmergencyName] = useState(patient.emergency_name || '');
  const [emergencyRelationship, setEmergencyRelationship] = useState(patient.emergency_relationship || '');
  const [emergencyPhone, setEmergencyPhone] = useState(patient.emergency_phone || '');

  const [consultationFee, setConsultationFee] = useState(patient.consultation_fee || '');
  const [consultationDate, setConsultationDate] = useState(patient.consultation_date || '');
  const [monthlyFee, setMonthlyFee] = useState(patient.monthly_fee || '');

  // ==========================================
  // SECTION 2: Chief Complaint & Voice
  // ==========================================
  const [chiefComplaint, setChiefComplaint] = useState(patient.chief_complaint || '');
  const [complaintSinceWhen, setComplaintSinceWhen] = useState(patient.complaint_since_when || '');
  const [complaintRegion, setComplaintRegion] = useState(patient.complaint_region || 'Lumbar Spine');
  const [complaintSide, setComplaintSide] = useState(patient.complaint_side || 'Not specified');
  const [episodeType, setEpisodeType] = useState(patient.episode_type || 'First episode');
  const [painScore, setPainScore] = useState<number>(typeof patient.pain_score === 'number' ? patient.pain_score : 5);

  // Audio recording & Speech recognition state (Telugu, Hindi, English)
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string | null>(patient.complaint_audio || null);
  const [audioBase64, setAudioBase64] = useState<string | null>(patient.complaint_audio || null);
  const [transcriptText, setTranscriptText] = useState(patient.complaint_transcript || '');
  const [selectedLanguage, setSelectedLanguage] = useState<'te' | 'hi' | 'en' | 'multi'>('te');
  const [isAiTranscribing, setIsAiTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<any>(null);
  const recognitionRef = useRef<any>(null);

  // ==========================================
  // Helper Parsers for Patient Data
  // ==========================================
  const parseMedHistoryFrom = (p: Patient): MedicalHistory => {
    let med: MedicalHistory = {
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
      familyHistory: '',
      hypertension: { has: false, sinceWhen: '', pastReading: '', currentReading: '', medications: '' },
      diabetes: { has: false, type: '', sinceWhen: '', pastReading: '', currentReading: '', medications: '' },
      thyroid: { has: false, type: '', sinceWhen: '', pastReading: '', currentReading: '', medications: '' }
    };
    try {
      if (typeof p.medical_history === 'string' && p.medical_history.trim().startsWith('{')) {
        med = { ...med, ...JSON.parse(p.medical_history) };
      } else if (typeof p.medical_history === 'object' && p.medical_history !== null) {
        med = { ...med, ...(p.medical_history as Record<string, any>) };
      }
    } catch (e) {
      console.error('Error parsing medical_history', e);
    }
    return med;
  };

  const parseExamFrom = (p: Patient): ExamData => {
    let ex: ExamData = {
      height: '',
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
      if (typeof p.exam_data === 'string' && p.exam_data.trim().startsWith('{')) {
        ex = { ...ex, ...JSON.parse(p.exam_data) };
      } else if (typeof p.exam_data === 'object' && p.exam_data !== null) {
        ex = { ...ex, ...(p.exam_data as Record<string, any>) };
      }
    } catch (e) {
      console.error('Error parsing exam_data', e);
    }
    return ex;
  };

  const parseAttachmentsFrom = (p: Patient): InvestigationAttachment[] => {
    try {
      if (typeof p.investigation_attachments === 'string' && p.investigation_attachments.trim().startsWith('[')) {
        return JSON.parse(p.investigation_attachments);
      } else if (Array.isArray(p.investigation_attachments)) {
        return p.investigation_attachments;
      }
    } catch (e) {
      console.error('Error parsing attachments', e);
    }
    return [];
  };

  const init12WeeksFrom = (p: Patient): WeeklyPractice[] => {
    let existingWeeks: WeeklyPractice[] = [];
    try {
      if (typeof p.therapy_plan === 'string' && p.therapy_plan.trim().startsWith('[')) {
        const parsed = JSON.parse(p.therapy_plan);
        if (Array.isArray(parsed) && parsed.length > 0) existingWeeks = parsed;
      } else if (Array.isArray(p.therapy_plan) && p.therapy_plan.length > 0) {
        existingWeeks = p.therapy_plan;
      }
    } catch (e) {
      console.error('Error parsing therapy_plan', e);
    }

    const weeks: WeeklyPractice[] = [];
    for (let i = 1; i <= 12; i++) {
      const existing = existingWeeks.find((w) => (w.weekNumber || w.week) === i);
      const month = Math.ceil(i / 4);
      if (existing) {
        weeks.push({
          ...existing,
          week: i,
          weekNumber: i,
          month: existing.month || month,
          theme: existing.theme || '',
          practices: existing.practices || '',
          pranayama: existing.pranayama || '',
          props: existing.props || '',
          duration: existing.duration || '',
          notes: existing.notes || '',
          completed: Boolean(existing.completed)
        });
      } else {
        weeks.push({
          week: i,
          weekNumber: i,
          month,
          theme: '',
          practices: '',
          pranayama: '',
          props: '',
          duration: '',
          notes: '',
          completed: false
        });
      }
    }
    return weeks;
  };

  const initialMed = parseMedHistoryFrom(patient);
  const [medHistory, setMedHistory] = useState<MedicalHistory>(initialMed);

  // Hypertension
  const [hasHTN, setHasHTN] = useState<boolean>(
    Boolean(
      initialMed.hypertension?.has === true ||
      initialMed.hypertension?.present === true ||
      (initialMed.hypertension?.sinceWhen && initialMed.hypertension.sinceWhen !== '0') ||
      (initialMed.hypertension?.currentReading && initialMed.hypertension.currentReading !== '0') ||
      (initialMed.hasHT_DM_Thyroid && (initialMed.htDmThyroidDetails || '').toLowerCase().includes('hypertension'))
    )
  );
  const [htnSinceWhen, setHtnSinceWhen] = useState(initialMed.hypertension?.sinceWhen || '');
  const [htnPastReading, setHtnPastReading] = useState(initialMed.hypertension?.pastReading || '');
  const [htnCurrentReading, setHtnCurrentReading] = useState(initialMed.hypertension?.currentReading || '');
  const [htnMedications, setHtnMedications] = useState(initialMed.hypertension?.medications || initialMed.hypertension?.medication || '');

  // Diabetes
  const [hasDM, setHasDM] = useState<boolean>(
    Boolean(
      initialMed.diabetes?.has === true ||
      initialMed.diabetes?.present === true ||
      (initialMed.diabetes?.sinceWhen && initialMed.diabetes.sinceWhen !== '0') ||
      (initialMed.diabetes?.currentReading && initialMed.diabetes.currentReading !== '0') ||
      (initialMed.hasHT_DM_Thyroid && (initialMed.htDmThyroidDetails || '').toLowerCase().includes('diabetes'))
    )
  );
  const [dmType, setDmType] = useState(initialMed.diabetes?.type || '');
  const [dmSinceWhen, setDmSinceWhen] = useState(initialMed.diabetes?.sinceWhen || '');
  const [dmPastReading, setDmPastReading] = useState(initialMed.diabetes?.pastReading || '');
  const [dmCurrentReading, setDmCurrentReading] = useState(initialMed.diabetes?.currentReading || '');
  const [dmMedications, setDmMedications] = useState(initialMed.diabetes?.medications || initialMed.diabetes?.medication || '');

  // Thyroid
  const [hasThyroid, setHasThyroid] = useState<boolean>(
    Boolean(
      initialMed.thyroid?.has === true ||
      initialMed.thyroid?.present === true ||
      (initialMed.thyroid?.sinceWhen && initialMed.thyroid.sinceWhen !== '0') ||
      (initialMed.thyroid?.currentReading && initialMed.thyroid.currentReading !== '0') ||
      (initialMed.hasHT_DM_Thyroid && (initialMed.htDmThyroidDetails || '').toLowerCase().includes('thyroid'))
    )
  );
  const [thyroidType, setThyroidType] = useState(initialMed.thyroid?.type || '');
  const [thyroidSinceWhen, setThyroidSinceWhen] = useState(initialMed.thyroid?.sinceWhen || '');
  const [thyroidPastReading, setThyroidPastReading] = useState(initialMed.thyroid?.pastReading || '');
  const [thyroidCurrentReading, setThyroidCurrentReading] = useState(initialMed.thyroid?.currentReading || '');
  const [thyroidMedications, setThyroidMedications] = useState(initialMed.thyroid?.medications || initialMed.thyroid?.medication || '');

  // Occupation, work pattern and physical activity removed per user request
  const [hasGiddiness, setHasGiddiness] = useState(initialMed.hasGiddiness || false);
  const [giddinessDetails, setGiddinessDetails] = useState(initialMed.giddinessDetails || '');
  const [hasHeadache, setHasHeadache] = useState(initialMed.hasHeadache || false);
  const [headacheDetails, setHeadacheDetails] = useState(initialMed.headacheDetails || '');

  // ==========================================
  // SECTION 4: Objective Physical Exam & Vitals
  // ==========================================
  const initialExam = parseExamFrom(patient);
  const [exam, setExam] = useState<ExamData>(initialExam);

  // Investigation documents
  const [attachments, setAttachments] = useState<InvestigationAttachment[]>(parseAttachmentsFrom(patient));
  const [docTitle, setDocTitle] = useState('');
  const [docType, setDocType] = useState('X-Ray');
  const [docDate, setDocDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [docNotes, setDocNotes] = useState('');

  // ==========================================
  // SECTION 5: Therapist Directives, Precautions & 12 Weeks Plan
  // ==========================================
  const [notes, setNotes] = useState(patient.notes || '');
  const [therapyPrecautions, setTherapyPrecautions] = useState(patient.therapy_precautions || '');
  const [therapyPlan, setTherapyPlan] = useState<WeeklyPractice[]>(init12WeeksFrom(patient));
  const [selectedPlanMonth, setSelectedPlanMonth] = useState<number>(1);

  // CRITICAL: Synchronize existing patient data whenever modal opens or patient changes
  useEffect(() => {
    if (!isOpen || !patient) return;

    // Section 1
    setFullName(patient.full_name || '');
    setPreferredName(patient.preferred_name || '');
    setDob(patient.dob || '');
    setAge(patient.age != null && patient.age !== undefined ? String(patient.age) : '');
    setGender(patient.gender || '');
    setMobile(patient.mobile || '');
    setEmail(patient.email || '');
    setAddress(patient.address || '');
    setPreferredLanguage(patient.preferred_language || '');
    setOccupation(patient.occupation || '');
    setWorkPattern(patient.work_pattern || '');
    setPhysicalActivity(patient.physical_activity || '');
    setCentre(patient.centre || '');
    setAdmissionDate(
      patient.admission_date ||
      (patient.created_at ? patient.created_at.split('T')[0].split(' ')[0] : getTodayStr())
    );
    setAssignedTherapist(patient.assigned_therapist || '');
    setReferredBy(patient.referred_by || '');
    setStatus(patient.status || 'Active');
    setEmergencyName(patient.emergency_name || '');
    setEmergencyRelationship(patient.emergency_relationship || '');
    setEmergencyPhone(patient.emergency_phone || '');
    setConsultationFee(patient.consultation_fee != null && patient.consultation_fee !== '' ? String(patient.consultation_fee) : '0');
    setConsultationDate(patient.consultation_date || '');
    setMonthlyFee(patient.monthly_fee != null && patient.monthly_fee !== '' ? String(patient.monthly_fee) : '0');

    // Section 2
    setChiefComplaint(patient.chief_complaint || '');
    setComplaintSinceWhen(patient.complaint_since_when || '');
    setComplaintRegion(patient.complaint_region || '');
    setComplaintSide(patient.complaint_side || '');
    setEpisodeType(patient.episode_type || '');
    setPainScore(typeof patient.pain_score === 'number' ? patient.pain_score : 5);
    setAudioUrl(patient.complaint_audio || null);
    setAudioBase64(patient.complaint_audio || null);
    setTranscriptText(patient.complaint_transcript || '');

    // Section 3
    const parsedMed = parseMedHistoryFrom(patient);
    setMedHistory(parsedMed);
    const hasHtnDiag = Boolean(
      parsedMed.hypertension?.has === true ||
      parsedMed.hypertension?.present === true ||
      (parsedMed.hypertension?.sinceWhen && parsedMed.hypertension.sinceWhen !== '' && parsedMed.hypertension.sinceWhen !== '0') ||
      (parsedMed.hypertension?.currentReading && parsedMed.hypertension.currentReading !== '' && parsedMed.hypertension.currentReading !== '0')
    );
    setHasHTN(hasHtnDiag);
    setHtnSinceWhen(parsedMed.hypertension?.sinceWhen || '');
    setHtnPastReading(parsedMed.hypertension?.pastReading || '');
    setHtnCurrentReading(parsedMed.hypertension?.currentReading || '');
    setHtnMedications(parsedMed.hypertension?.medications || parsedMed.hypertension?.medication || '');

    const hasDmDiag = Boolean(
      parsedMed.diabetes?.has === true ||
      parsedMed.diabetes?.present === true ||
      (parsedMed.diabetes?.sinceWhen && parsedMed.diabetes.sinceWhen !== '' && parsedMed.diabetes.sinceWhen !== '0') ||
      (parsedMed.diabetes?.currentReading && parsedMed.diabetes.currentReading !== '' && parsedMed.diabetes.currentReading !== '0')
    );
    setHasDM(hasDmDiag);
    setDmType(parsedMed.diabetes?.type || '');
    setDmSinceWhen(parsedMed.diabetes?.sinceWhen || '');
    setDmPastReading(parsedMed.diabetes?.pastReading || '');
    setDmCurrentReading(parsedMed.diabetes?.currentReading || '');
    setDmMedications(parsedMed.diabetes?.medications || parsedMed.diabetes?.medication || '');

    const hasThyDiag = Boolean(
      parsedMed.thyroid?.has === true ||
      parsedMed.thyroid?.present === true ||
      (parsedMed.thyroid?.sinceWhen && parsedMed.thyroid.sinceWhen !== '' && parsedMed.thyroid.sinceWhen !== '0') ||
      (parsedMed.thyroid?.currentReading && parsedMed.thyroid.currentReading !== '' && parsedMed.thyroid.currentReading !== '0')
    );
    setHasThyroid(hasThyDiag);
    setThyroidType(parsedMed.thyroid?.type || '');
    setThyroidSinceWhen(parsedMed.thyroid?.sinceWhen || '');
    setThyroidPastReading(parsedMed.thyroid?.pastReading || '');
    setThyroidCurrentReading(parsedMed.thyroid?.currentReading || '');
    setThyroidMedications(parsedMed.thyroid?.medications || parsedMed.thyroid?.medication || '');
    setHasGiddiness(parsedMed.hasGiddiness || false);
    setGiddinessDetails(parsedMed.giddinessDetails || '');
    setHasHeadache(parsedMed.hasHeadache || false);
    setHeadacheDetails(parsedMed.headacheDetails || '');

    // Occupation fields removed

    // Section 4
    setExam(parseExamFrom(patient));
    setAttachments(parseAttachmentsFrom(patient));

    // Section 5
    setNotes(patient.notes || '');
    setTherapyPrecautions(patient.therapy_precautions || '');
    setTherapyPlan(init12WeeksFrom(patient));
  }, [patient, isOpen]);

  // Sync Speech-to-Text language with Preferred Language
  useEffect(() => {
    if (!preferredLanguage) return;
    const lang = preferredLanguage.toLowerCase();
    if (lang.includes('telugu')) {
      setSelectedLanguage('te');
    } else if (lang.includes('hindi')) {
      setSelectedLanguage('hi');
    } else if (lang.includes('english')) {
      setSelectedLanguage('en');
    }
  }, [preferredLanguage]);

  // Audio recording cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  if (!isOpen) return null;

  // ==========================================
  // Audio Recording & Telugu/Hindi/English Speech Recognition
  // ==========================================
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
        const localUrl = URL.createObjectURL(audioBlob);
        setAudioUrl(localUrl);

        // Convert to base64 for persistent storage & transcription
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          const b64 = reader.result as string;
          setAudioBase64(b64);
        };

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);

      // Web Speech API for real-time transcription in chosen language
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;

          // Set recognition language based on user selection:
          // 'te-IN' for Telugu, 'hi-IN' for Hindi, 'en-IN' for English
          if (selectedLanguage === 'te') {
            recognition.lang = 'te-IN';
          } else if (selectedLanguage === 'hi') {
            recognition.lang = 'hi-IN';
          } else {
            recognition.lang = 'en-IN';
          }

          recognition.onresult = (event: any) => {
            let fullText = '';
            for (let i = 0; i < event.results.length; ++i) {
              fullText += event.results[i][0].transcript + ' ';
            }
            if (fullText.trim()) {
              setTranscriptText((prev) => {
                const clean = fullText.trim();
                return clean;
              });
            }
          };

          recognition.onerror = (e: any) => {
            console.warn('Speech recognition status:', e?.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (e) {
          console.warn('Speech recognition init error:', e);
        }
      }
    } catch (err: any) {
      console.warn('Microphone error:', err);
      setErrorMsg('Microphone access could not be acquired. You can type the narrative directly in the transcript box.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {
        // ignore
      }
    }
    if (timerIntervalRef.current) {
      clearInterval(timerIntervalRef.current);
    }
    setIsRecording(false);
  };

  // AI Transcribe via server endpoint
  const handleAiTranscribe = async () => {
    if (!audioBase64) return;
    setIsAiTranscribing(true);
    try {
      const res = await fetch('/api/transcribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          audioBase64,
          language: selectedLanguage
        })
      });
      const contentType = res.headers.get('content-type') || '';
      if (res.ok && contentType.includes('application/json')) {
        const data = await res.json();
        if (data.transcript) {
          setTranscriptText(data.transcript);
        }
      }
    } catch (err) {
      console.error('Failed to transcribe via AI:', err);
    } finally {
      setIsAiTranscribing(false);
    }
  };

  // File upload for investigations
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const newDoc: InvestigationAttachment = {
        id: 'DOC-' + Date.now(),
        title: docTitle.trim() || file.name,
        type: docType,
        date: docDate,
        dataUrl,
        notes: docNotes.trim(),
        file_name: file.name
      };
      setAttachments((prev) => [...prev, newDoc]);
      setDocTitle('');
      setDocNotes('');
    };
    reader.readAsDataURL(file);
  };

  // Weekly therapy plan updates
  const handleUpdateWeek = (weekNum: number, field: keyof WeeklyPractice, value: any) => {
    setTherapyPlan((prev) =>
      prev.map((w) => {
        const currentNum = w.weekNumber || w.week;
        if (currentNum === weekNum) {
          return { ...w, [field]: value };
        }
        return w;
      })
    );
  };

  const handleCopyFromPreviousWeek = (currentWeekNum: number) => {
    if (currentWeekNum <= 1) return;
    const prevWeek = therapyPlan.find((w) => (w.weekNumber || w.week) === currentWeekNum - 1);
    if (!prevWeek) return;

    setTherapyPlan((prev) =>
      prev.map((w) => {
        const num = w.weekNumber || w.week;
        if (num === currentWeekNum) {
          return {
            ...w,
            theme: prevWeek.theme || '',
            practices: prevWeek.practices || '',
            pranayama: prevWeek.pranayama || '',
            props: prevWeek.props || '',
            duration: prevWeek.duration || '',
            notes: prevWeek.notes || ''
          };
        }
        return w;
      })
    );
  };

  const handleClearWeek = (weekNum: number) => {
    setTherapyPlan((prev) =>
      prev.map((w) => {
        const num = w.weekNumber || w.week;
        if (num === weekNum) {
          return {
            ...w,
            theme: '',
            practices: '',
            pranayama: '',
            props: '',
            duration: '',
            notes: '',
            completed: false
          };
        }
        return w;
      })
    );
  };

  // Save all changes across Sections 1 to 5
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg(null);

    // Consolidate Medical History
    const updatedMedHistory: MedicalHistory = {
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
      },
      hasGiddiness,
      giddinessDetails,
      hasHeadache,
      headacheDetails
    };

    const updatedPatientPayload: Patient = {
      ...patient,
      full_name: fullName.trim(),
      preferred_name: preferredName.trim(),
      dob,
      age: age ? parseInt(age, 10) : undefined,
      gender,
      mobile: mobile.trim(),
      email: email.trim(),
      address: address.trim(),
      preferred_language: preferredLanguage,

      centre,
      admission_date: admissionDate,
      assigned_therapist: assignedTherapist.trim(),
      referred_by: referredBy.trim(),
      status,

      emergency_name: emergencyName.trim(),
      emergency_relationship: emergencyRelationship.trim(),
      emergency_phone: emergencyPhone.trim(),

      consultation_fee: (consultationFee && consultationFee.trim() !== '') ? consultationFee.trim() : '0',
      consultation_date: consultationDate,
      monthly_fee: (monthlyFee && monthlyFee.trim() !== '') ? monthlyFee.trim() : '0',

      // Section 2: Chief Complaint
      chief_complaint: chiefComplaint.trim(),
      complaint_since_when: complaintSinceWhen.trim(),
      complaint_region: complaintRegion,
      complaint_side: complaintSide,
      episode_type: episodeType,
      pain_score: painScore,
      complaint_audio: audioBase64 || '',
      complaint_transcript: transcriptText.trim(),

      occupation: occupation.trim(),
      work_pattern: workPattern.trim(),
      physical_activity: physicalActivity.trim(),
      // Section 3 & 4
      medical_history: JSON.stringify(updatedMedHistory),

      exam_data: JSON.stringify(exam),
      investigation_attachments: JSON.stringify(attachments),

      // Section 5
      notes: notes.trim(),
      therapy_precautions: therapyPrecautions.trim(),
      therapy_plan: JSON.stringify(therapyPlan)
    };

    try {
      await onSave(updatedPatientPayload);

      if (activeSection !== 'section5') {
        const sections: ('section1' | 'section2' | 'section3' | 'section4' | 'section5')[] = ['section1', 'section2', 'section3', 'section4', 'section5'];
        const currentIndex = sections.indexOf(activeSection);
        if (currentIndex < sections.length - 1) {
          setActiveSection(sections[currentIndex + 1]);
        }
        setSaving(false);
      } else {
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update patient record.');
      setSaving(false);
    }
  };

  return (
    <div className="w-full pb-12 print:hidden">
      {/* Edit Screen Header (Non-sticky, scrolls with page) */}
      <div className="w-full bg-white border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 py-4 sm:py-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <button
              type="button"
              onClick={onClose}
              className="p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer shrink-0"
              title="Back to Patient Profile"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  Edit Patient Case Sheet
                </h1>
                <span className="font-mono text-xs font-extrabold px-2.5 py-0.5 rounded-md bg-sky-50 text-[#0C4A60] border border-sky-200">
                  {patient.patient_id}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Updating clinical information for <strong className="text-slate-800">{fullName || patient.full_name}</strong> across Sections 1 to 5
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Sticky Section Navigation Tabs ONLY - Fixed directly below Main Screen Navbar */}
      <div className="sticky top-[72px] z-20 w-full bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex items-center gap-4 sm:gap-6 overflow-x-auto text-xs font-semibold no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveSection('section1')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'section1'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <User className="w-4 h-4" />
            <span>1. Demographics &amp; Admission</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('section2')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'section2'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Mic className="w-4 h-4" />
            <span>2. Chief Complaint &amp; Audio</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('section3')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'section3'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <HeartPulse className="w-4 h-4" />
            <span>3. Medical History</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('section4')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'section4'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>4. Physical Exam &amp; Vitals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('section5')}
            className={`py-3.5 flex items-center gap-2 border-b-2 transition-all whitespace-nowrap cursor-pointer ${
              activeSection === 'section5'
                ? 'border-[#0C4A60] text-[#0C4A60] font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Activity className="w-4 h-4 text-emerald-600" />
            <span>5. 12-Week Therapy Plan</span>
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 pt-6">
        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs">
            {errorMsg}
          </div>
        )}

        <form ref={formRef} onSubmit={handleSubmit} className="space-y-6">

          {activeSection === 'section1' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
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
                      onChange={(e) => setCentre(e.target.value)}
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

                {/* Clinical Status */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Clinical Status
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="">Select Clinical Status</option>
                    <option value="New">New Intake</option>
                    <option value="Active">Active Patient</option>
                    <option value="Assessment Pending">Assessment Pending</option>
                    <option value="Completed">Completed</option>
                    <option value="On Hold">On Hold</option>
                    <option value="Inactive">Inactive</option>
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
                    onChange={(e) => {
                      setDob(e.target.value);
                      if (e.target.value) {
                        const birthDate = new Date(e.target.value);
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
                    }}
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
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Gender
                  </label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                {/* Mobile Number */}
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

                {/* Email Address */}
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
                    Preferred Language
                  </label>
                  <select
                    value={preferredLanguage}
                    onChange={(e) => setPreferredLanguage(e.target.value)}
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

                {/* Occupation */}
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

                {/* Work Pattern */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Work Pattern
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Work Pattern"
                    value={workPattern}
                    onChange={(e) => setWorkPattern(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>

                {/* Physical Activity Level */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Physical Activity Level
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Physical Activity Level"
                    value={physicalActivity}
                    onChange={(e) => setPhysicalActivity(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
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

              {/* Emergency Contact */}
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Emergency Contact Person
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Contact Name
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Emergency Contact Name"
                      value={emergencyName}
                      onChange={(e) => setEmergencyName(e.target.value)}
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
                      Emergency Phone
                    </label>
                    <input
                      type="tel"
                      placeholder="Enter Emergency Phone"
                      value={emergencyPhone}
                      onChange={(e) => setEmergencyPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>

              {/* Care Allocation */}
              <div className="pt-5 border-t border-slate-100">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-3">
                  Therapist Allocation &amp; Referral
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Assigned Therapist
                    </label>
                    <input
                      type="text"
                      placeholder="Enter Assigned Therapist"
                      value={assignedTherapist}
                      onChange={(e) => setAssignedTherapist(e.target.value)}
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
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>

              {/* Fee Schedule */}
              <div className="pt-5 border-t border-slate-100 bg-slate-50/70 p-4 rounded-xl border border-slate-200">
                <div className="flex items-center gap-2 mb-3">
                  <CreditCard className="w-4 h-4 text-[#0C4A60]" />
                  <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    Fee Structure Schedule
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
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
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm font-mono font-bold text-[#0C4A60] focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 2: Chief Complaint & Voice Narrative */}
          {activeSection === 'section2' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                    2
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Chief Complaint (C/O) &amp; Voice Recording
                    </h2>
                    <p className="text-xs text-slate-500">
                      Record patient explanation, live speech-to-text transcription, duration, and episode classification
                    </p>
                  </div>
                </div>
              </div>

              {/* Patient Voice Explanation & Speech-to-Text Widget */}
              <div className="p-4 sm:p-5 rounded-2xl bg-sky-50/40 border border-sky-100 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Mic className={`w-4 h-4 ${isRecording ? 'text-rose-600 animate-pulse' : 'text-[#0C4A60]'}`} />
                    <span className="text-xs font-bold text-slate-900">
                      Patient Voice Explanation &amp; Speech-to-Text
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {/* Language Selection Bar */}
                    <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200 text-xs font-semibold">
                      <span className="text-[10px] text-slate-400 px-1 uppercase">Lang:</span>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguage('te')}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          selectedLanguage === 'te'
                            ? 'bg-[#0C4A60] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Telugu
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguage('hi')}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          selectedLanguage === 'hi'
                            ? 'bg-[#0C4A60] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        Hindi
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedLanguage('en')}
                        className={`px-2 py-0.5 rounded text-[11px] transition-colors cursor-pointer ${
                          selectedLanguage === 'en'
                            ? 'bg-[#0C4A60] text-white'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        English
                      </button>
                    </div>

                    {!isRecording ? (
                      <button
                        type="button"
                        onClick={startRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#0C4A60] hover:bg-[#083344] text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5 text-amber-300" />
                        <span>Record Patient Explanation</span>
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={stopRecording}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer animate-pulse"
                      >
                        <Square className="w-3.5 h-3.5 fill-white" />
                        <span>Stop Recording ({recordingSeconds}s)</span>
                      </button>
                    )}
                  </div>
                </div>

                {audioUrl && (
                  <div className="bg-white p-2.5 rounded-xl border border-sky-100 flex items-center gap-3">
                    <Volume2 className="w-4 h-4 text-[#0C4A60] shrink-0" />
                    <audio src={audioUrl} controls className="w-full h-8" />
                    {!isRecording && (
                      <button
                        type="button"
                        onClick={handleAiTranscribe}
                        disabled={isAiTranscribing}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-400 hover:bg-amber-500 text-slate-900 text-xs font-bold shrink-0 transition-colors cursor-pointer"
                      >
                        {isAiTranscribing ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Sparkles className="w-3.5 h-3.5" />
                        )}
                        <span>AI Transcribe</span>
                      </button>
                    )}
                  </div>
                )}

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                      <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                      <span>Auto-Generated / Reviewed Audio Transcript:</span>
                    </div>
                    <span className="text-xs text-slate-400">Editable prior to saving</span>
                  </div>
                  <textarea
                    rows={3}
                    placeholder="Enter Transcript Description"
                    value={transcriptText}
                    onChange={(e) => setTranscriptText(e.target.value)}
                    className="w-full border border-slate-200 rounded-xl p-3 text-sm bg-white text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
              </div>

              {/* Chief Complaint Description */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Chief Complaint Description <span className="text-rose-500">*</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Enter Chief Complaint Description"
                  value={chiefComplaint}
                  onChange={(e) => setChiefComplaint(e.target.value)}
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              {/* Row Grid: 4 columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Since When? <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    placeholder="Enter Since When"
                    value={complaintSinceWhen}
                    onChange={(e) => setComplaintSinceWhen(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Primary Body Region</label>
                  <select
                    value={complaintRegion}
                    onChange={(e) => setComplaintRegion(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="">Select Primary Body Region</option>
                    <option value="Lumbar Spine">Lumbar Spine (Lower Back)</option>
                    <option value="Cervical Spine">Cervical Spine (Neck)</option>
                    <option value="Knee">Knee Joint</option>
                    <option value="Shoulder">Shoulder Joint</option>
                    <option value="Thoracic Spine">Thoracic Spine (Mid-Back)</option>
                    <option value="Hip">Hip Joint</option>
                    <option value="Ankle & Foot">Ankle &amp; Foot</option>
                    <option value="Multiple Joints">Multiple Joints</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Side Affected</label>
                  <select
                    value={complaintSide}
                    onChange={(e) => setComplaintSide(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="">Select Side Affected</option>
                    <option value="Right">Right Side</option>
                    <option value="Left">Left Side</option>
                    <option value="Bilateral">Bilateral (Both Sides)</option>
                    <option value="Central">Central / Midline</option>
                    <option value="Not specified">Not specified</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Episode Type</label>
                  <select
                    value={episodeType}
                    onChange={(e) => setEpisodeType(e.target.value)}
                    className="w-full border border-slate-300 rounded-xl px-3 py-2 text-sm bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="">Select Episode Type</option>
                    <option value="First episode">First episode</option>
                    <option value="Recurring">Recurring / Episodic</option>
                    <option value="Continuous / Chronic">Continuous / Chronic</option>
                    <option value="Post-trauma / Injury">Post-trauma / Injury</option>
                  </select>
                </div>
              </div>

              {/* Baseline Pain Score Box */}
              <div className="bg-slate-50/80 border border-slate-200 rounded-2xl p-5 mt-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    BASELINE PAIN SCORE (VISUAL ANALOG SCALE: 0 - 10)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="hidden sm:inline-block text-xs font-semibold text-slate-500">
                      {painScore === 0
                        ? 'No Pain'
                        : painScore <= 3
                        ? 'Mild'
                        : painScore <= 6
                        ? 'Moderate'
                        : painScore <= 8
                        ? 'Severe'
                        : 'Worst'}
                    </span>
                    <span className="bg-[#0C4A60] text-amber-300 font-mono text-xs font-extrabold px-3 py-1 rounded-md tracking-wider shadow-xs">
                      {painScore} / 10
                    </span>
                  </div>
                </div>

                <div className="relative pt-1 pb-6 select-none">
                  {/* Track container with margins so thumb (w-5, 20px) centers exactly at 0% and 100% */}
                  <div className="relative mx-2.5">
                    {/* Background Track with Fill */}
                    <div className="relative h-2.5 bg-slate-200 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-150"
                        style={{
                          width: `${(painScore / 10) * 100}%`,
                          background:
                            painScore === 0
                              ? '#94a3b8'
                              : painScore <= 3
                              ? 'linear-gradient(90deg, #10b981 0%, #14b8a6 100%)'
                              : painScore <= 6
                              ? 'linear-gradient(90deg, #10b981 0%, #f59e0b 100%)'
                              : painScore <= 8
                              ? 'linear-gradient(90deg, #10b981 0%, #f59e0b 50%, #ea580c 100%)'
                              : 'linear-gradient(90deg, #10b981 0%, #f59e0b 35%, #ea580c 70%, #be123c 100%)',
                        }}
                      />
                    </div>

                    {/* Point Indicators (Ticks and Connector Lines) */}
                    <div className="relative w-full h-0 pointer-events-none">
                      {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                        const pct = (num / 10) * 100;
                        const isKey = num === 0 || num === 3 || num === 5 || num === 8 || num === 10;
                        const isCurrent = num === painScore;
                        const isFilled = num <= painScore;
                        return (
                          <div
                            key={num}
                            className="absolute -top-3.5 flex flex-col items-center -translate-x-1/2"
                            style={{ left: `${pct}%` }}
                          >
                            {/* Tick dot on the track */}
                            <div
                              className={`w-1.5 h-1.5 rounded-full ${
                                isCurrent
                                  ? 'opacity-0'
                                  : isFilled
                                  ? 'bg-white shadow-xs'
                                  : 'bg-slate-400/80'
                              }`}
                            />
                            {/* Vertical connector line connecting track to milestone labels below */}
                            {isKey && (
                              <div
                                className={`w-0.5 mt-2.5 transition-all duration-150 ${
                                  isCurrent
                                    ? 'h-3.5 bg-[#0C4A60] w-1 rounded-full'
                                    : isFilled
                                    ? 'h-2 bg-slate-400'
                                    : 'h-2 bg-slate-300'
                                }`}
                              />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Milestone Labels directly aligned and connected with points */}
                    <div className="relative w-full mt-3.5 h-5">
                      {[
                        { val: 0, text: '0 · No Pain', align: 'left' },
                        { val: 3, text: '3 · Mild', align: 'center' },
                        { val: 5, text: '5 · Moderate', align: 'center' },
                        { val: 8, text: '8 · Severe', align: 'center' },
                        { val: 10, text: '10 · Worst', align: 'right' },
                      ].map((item) => {
                        const isCurrent = painScore === item.val;
                        const pct = (item.val / 10) * 100;
                        return (
                          <button
                            key={item.val}
                            type="button"
                            onClick={() => setPainScore(item.val)}
                            className={`absolute top-0 text-[11px] transition-all duration-150 cursor-pointer whitespace-nowrap ${
                              item.align === 'left'
                                ? 'left-0 -translate-x-1 sm:translate-x-0 text-left'
                                : item.align === 'right'
                                ? 'right-0 translate-x-1 sm:translate-x-0 text-right'
                                : '-translate-x-1/2 text-center'
                            } ${
                              isCurrent
                                ? 'font-bold text-[#0C4A60] scale-105'
                                : 'font-medium text-slate-500 hover:text-slate-800'
                            }`}
                            style={
                              item.align === 'center'
                                ? { left: `${pct}%` }
                                : undefined
                            }
                          >
                            {item.text}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Native input placed precisely over the track area with full drag interaction */}
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="1"
                    value={painScore}
                    onChange={(e) => setPainScore(parseInt(e.target.value, 10))}
                    className="absolute top-0.5 left-0 w-full h-4 opacity-0 cursor-pointer z-30"
                    aria-label="Baseline Pain Score (0 - 10)"
                  />

                  {/* Visual Thumb Point that follows the percentage and aligns exactly with connectors */}
                  <div
                    className="absolute top-0 w-5 h-5 -ml-2.5 rounded-full bg-[#0C4A60] border-2 border-white shadow-md pointer-events-none transition-all duration-75 flex items-center justify-center z-20"
                    style={{ left: `calc(10px + ${(painScore / 10)} * (100% - 20px))` }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-300" />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 3: Medical History & Chronic Diseases */}
          {activeSection === 'section3' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
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
              </div>

              {/* Chronic Disease Cards */}
              <div className="space-y-4">
                {/* 1. Hypertension (HTN) */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${hasHTN ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasHTN}
                        onChange={(e) => {
                          setHasHTN(e.target.checked);
                          if (!e.target.checked) {
                            setHtnSinceWhen('');
                            setHtnPastReading('');
                            setHtnCurrentReading('');
                            setHtnMedications('');
                          }
                        }}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-sm text-slate-900">Hypertension (HTN)</span>
                      <span className="text-xs text-slate-400 font-normal hidden sm:inline">Duration, readings, medications</span>
                    </label>

                    {hasHTN && (
                      <span className="bg-rose-50 text-rose-600 font-semibold text-xs border border-rose-200/80 px-3 py-1 rounded-full shrink-0">
                        Active Condition
                      </span>
                    )}
                  </div>

                  {hasHTN && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3.5 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Duration / Since When <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Duration / Since When"
                          value={htnSinceWhen}
                          onChange={(e) => setHtnSinceWhen(e.target.value)}
                          required={hasHTN}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Past BP Reading</label>
                        <input
                          type="text"
                          placeholder="Enter Past BP Reading"
                          value={htnPastReading}
                          onChange={(e) => setHtnPastReading(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current BP Reading <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current BP Reading"
                          value={htnCurrentReading}
                          onChange={(e) => setHtnCurrentReading(e.target.value)}
                          required={hasHTN}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current Medications <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current Medications"
                          value={htnMedications}
                          onChange={(e) => setHtnMedications(e.target.value)}
                          required={hasHTN}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 2. Diabetes Mellitus (DM) */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${hasDM ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasDM}
                        onChange={(e) => {
                          setHasDM(e.target.checked);
                          if (!e.target.checked) {
                            setDmType('');
                            setDmSinceWhen('');
                            setDmPastReading('');
                            setDmCurrentReading('');
                            setDmMedications('');
                          }
                        }}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-sm text-slate-900">Diabetes Mellitus (DM)</span>
                      <span className="text-xs text-slate-400 font-normal hidden sm:inline">Type, sugar/HbA1c readings, medications</span>
                    </label>

                    {hasDM && (
                      <span className="bg-amber-50 text-amber-700 font-semibold text-xs border border-amber-200 px-3 py-1 rounded-full shrink-0">
                        Active Condition
                      </span>
                    )}
                  </div>

                  {hasDM && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Diabetes Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={dmType}
                          onChange={(e) => setDmType(e.target.value)}
                          required={hasDM}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        >
                          <option value="">Select Diabetes Type</option>
                          <option value="Type 2">Type 2 DM</option>
                          <option value="Type 1">Type 1 DM</option>
                          <option value="Pre-diabetic">Pre-diabetic</option>
                          <option value="Gestational">Gestational DM</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Duration / Since When <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Duration / Since When"
                          value={dmSinceWhen}
                          onChange={(e) => setDmSinceWhen(e.target.value)}
                          required={hasDM}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Past Sugar / HbA1c</label>
                        <input
                          type="text"
                          placeholder="Enter Past Sugar / HbA1c"
                          value={dmPastReading}
                          onChange={(e) => setDmPastReading(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current Sugar / HbA1c <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current Sugar / HbA1c"
                          value={dmCurrentReading}
                          onChange={(e) => setDmCurrentReading(e.target.value)}
                          required={hasDM}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current Medications <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current Medications"
                          value={dmMedications}
                          onChange={(e) => setDmMedications(e.target.value)}
                          required={hasDM}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. Thyroid Dysfunction */}
                <div className={`p-4 sm:p-5 rounded-2xl border transition-all ${hasThyroid ? 'bg-white border-slate-200 shadow-2xs' : 'bg-slate-50/50 border-slate-200'}`}>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasThyroid}
                        onChange={(e) => {
                          const checked = e.target.checked;
                          setHasThyroid(checked);
                          if (!checked) setThyroidType('');
                        }}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-sm text-slate-900">Thyroid Dysfunction</span>
                      <span className="text-xs text-slate-400 font-normal hidden sm:inline">Type, TSH readings, medications</span>
                    </label>

                    {hasThyroid && (
                      <span className="bg-indigo-50 text-indigo-700 font-semibold text-xs border border-indigo-200 px-3 py-1 rounded-full shrink-0">
                        Active Condition
                      </span>
                    )}
                  </div>

                  {hasThyroid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3.5 mt-4 pt-3 border-t border-slate-100">
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Thyroid Type <span className="text-rose-500">*</span>
                        </label>
                        <select
                          value={thyroidType}
                          onChange={(e) => setThyroidType(e.target.value)}
                          required={hasThyroid}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        >
                          <option value="">Select Thyroid Type</option>
                          <option value="Hypothyroidism">Hypothyroidism</option>
                          <option value="Hyperthyroidism">Hyperthyroidism</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Duration / Since When <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Duration / Since When"
                          value={thyroidSinceWhen}
                          onChange={(e) => setThyroidSinceWhen(e.target.value)}
                          required={hasThyroid}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">Past TSH Reading</label>
                        <input
                          type="text"
                          placeholder="Enter Past TSH Reading"
                          value={thyroidPastReading}
                          onChange={(e) => setThyroidPastReading(e.target.value)}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current TSH Reading <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current TSH Reading"
                          value={thyroidCurrentReading}
                          onChange={(e) => setThyroidCurrentReading(e.target.value)}
                          required={hasThyroid}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                          Current Medications <span className="text-rose-500">*</span>
                        </label>
                        <input
                          type="text"
                          placeholder="Enter Current Medications"
                          value={thyroidMedications}
                          onChange={(e) => setThyroidMedications(e.target.value)}
                          required={hasThyroid}
                          className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SURGICAL, TRAUMA & NEUROLOGICAL SCREEN */}
              <div className="pt-2">
                <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  SURGICAL, TRAUMA &amp; NEUROLOGICAL SCREEN
                </h3>

                <div className="space-y-3">
                  {/* H/o Major Operation */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasMajorOperation ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasMajorOperation}
                        onChange={(e) => setMedHistory({ ...medHistory, hasMajorOperation: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Major Operation</span>
                    </label>
                    {medHistory.hasMajorOperation && (
                      <input
                        type="text"
                        placeholder="Enter Major Operation Details"
                        value={medHistory.majorOperationDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, majorOperationDetails: e.target.value })}
                        required={medHistory.hasMajorOperation}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Major Illness / Hospitalization */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasMajorIllness ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasMajorIllness}
                        onChange={(e) => setMedHistory({ ...medHistory, hasMajorIllness: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Major Illness / Hospitalization</span>
                    </label>
                    {medHistory.hasMajorIllness && (
                      <input
                        type="text"
                        placeholder="Enter Major Illness Details"
                        value={medHistory.majorIllnessDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, majorIllnessDetails: e.target.value })}
                        required={medHistory.hasMajorIllness}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Major Trauma */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasMajorTrauma ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasMajorTrauma}
                        onChange={(e) => setMedHistory({ ...medHistory, hasMajorTrauma: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Major Trauma</span>
                    </label>
                    {medHistory.hasMajorTrauma && (
                      <input
                        type="text"
                        placeholder="Enter Major Trauma Details"
                        value={medHistory.majorTraumaDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, majorTraumaDetails: e.target.value })}
                        required={medHistory.hasMajorTrauma}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Radiating pain */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasRadiatingPain ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasRadiatingPain}
                        onChange={(e) => setMedHistory({ ...medHistory, hasRadiatingPain: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Radiating pain (Radiculopathy into upper/lower limb)</span>
                    </label>
                    {medHistory.hasRadiatingPain && (
                      <input
                        type="text"
                        placeholder="Enter Radiating Pain Details"
                        value={medHistory.radiatingPainDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, radiatingPainDetails: e.target.value })}
                        required={medHistory.hasRadiatingPain}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasNumbness ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasNumbness}
                        onChange={(e) => setMedHistory({ ...medHistory, hasNumbness: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Numbness in Upper / Lower Limb</span>
                    </label>
                    {medHistory.hasNumbness && (
                      <input
                        type="text"
                        placeholder="Enter Numbness Details"
                        value={medHistory.numbnessDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, numbnessDetails: e.target.value })}
                        required={medHistory.hasNumbness}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Previous Similar Episodes */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.previousEpisodes ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="block text-xs font-bold text-slate-900 mb-2">H/o Previous Similar Episodes</label>
                    <textarea
                      placeholder="Enter details of previous similar episodes"
                      value={medHistory.previousEpisodes}
                      onChange={(e) => setMedHistory({ ...medHistory, previousEpisodes: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      rows={2}
                    />
                  </div>

                  {/* Family Medical History */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.familyHistory ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="block text-xs font-bold text-slate-900 mb-2">Family Medical History</label>
                    <textarea
                      placeholder="Enter family medical history (e.g. parents, siblings)"
                      value={medHistory.familyHistory}
                      onChange={(e) => setMedHistory({ ...medHistory, familyHistory: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      rows={2}
                    />
                  </div>

                  {/* H/o Abnormal Sensation */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasAbnormalSensation ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasAbnormalSensation}
                        onChange={(e) => setMedHistory({ ...medHistory, hasAbnormalSensation: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Abnormal Sensation (Tingling / Burning / Pins & Needles)</span>
                    </label>
                    {medHistory.hasAbnormalSensation && (
                      <input
                        type="text"
                        placeholder="Enter Abnormal Sensation Details"
                        value={medHistory.abnormalSensationDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, abnormalSensationDetails: e.target.value })}
                        required={medHistory.hasAbnormalSensation}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Motor Weakness */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasMotorWeakness ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasMotorWeakness}
                        onChange={(e) => setMedHistory({ ...medHistory, hasMotorWeakness: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Motor Weakness (Loss of strength in grip / gait)</span>
                    </label>
                    {medHistory.hasMotorWeakness && (
                      <input
                        type="text"
                        placeholder="Enter Motor Weakness Details"
                        value={medHistory.motorWeaknessDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, motorWeaknessDetails: e.target.value })}
                        required={medHistory.hasMotorWeakness}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Bowel / Bladder involvement */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasBowelBladderInvolvement ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasBowelBladderInvolvement}
                        onChange={(e) => setMedHistory({ ...medHistory, hasBowelBladderInvolvement: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Bowel / Bladder involvement</span>
                    </label>
                    {medHistory.hasBowelBladderInvolvement && (
                      <input
                        type="text"
                        placeholder="Enter Bowel / Bladder Details"
                        value={medHistory.bowelBladderDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, bowelBladderDetails: e.target.value })}
                        required={medHistory.hasBowelBladderInvolvement}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Unexplained Weight Loss / Fever */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasWeightLossFever ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={medHistory.hasWeightLossFever}
                        onChange={(e) => setMedHistory({ ...medHistory, hasWeightLossFever: e.target.checked })}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Unexplained Weight Loss / Fever</span>
                    </label>
                    {medHistory.hasWeightLossFever && (
                      <input
                        type="text"
                        placeholder="Enter Weight Loss / Fever Details"
                        value={medHistory.weightLossFeverDetails}
                        onChange={(e) => setMedHistory({ ...medHistory, weightLossFeverDetails: e.target.value })}
                        required={medHistory.hasWeightLossFever}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Giddiness / Dizziness */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasGiddiness ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasGiddiness}
                        onChange={(e) => setHasGiddiness(e.target.checked)}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Giddiness / Dizziness</span>
                    </label>
                    {hasGiddiness && (
                      <input
                        type="text"
                        placeholder="Enter Giddiness / Dizziness Details"
                        value={giddinessDetails}
                        onChange={(e) => setGiddinessDetails(e.target.value)}
                        required={hasGiddiness}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* H/o Headache */}
                  <div className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${medHistory.hasHeadache ? 'bg-white border-slate-200' : 'bg-slate-50/50 border-slate-200'}`}>
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={hasHeadache}
                        onChange={(e) => setHasHeadache(e.target.checked)}
                        className="w-4 h-4 accent-[#0C4A60] rounded"
                      />
                      <span className="font-bold text-xs text-slate-900">H/o Headache</span>
                    </label>
                    {hasHeadache && (
                      <input
                        type="text"
                        placeholder="Enter Headache Details"
                        value={headacheDetails}
                        onChange={(e) => setHeadacheDetails(e.target.value)}
                        required={hasHeadache}
                        className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-slate-50/50 focus:bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60] mt-2.5"
                      />
                    )}
                  </div>

                  {/* Menstrual & Obstetric History */}
                  <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200 bg-slate-50/50">
                    <label className="block text-xs font-bold text-slate-900 mb-2">
                      Menstrual &amp; Obstetric History (For Females)
                    </label>
                    <textarea
                      rows={2}
                      placeholder="Enter Menstrual & Obstetric History Details"
                      value={medHistory.menstrualHistory}
                      onChange={(e) => setMedHistory({ ...medHistory, menstrualHistory: e.target.value })}
                      className="w-full border border-slate-200 rounded-xl px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* SECTION 4: Objective Physical Exam & Vitals */}
          {activeSection === 'section4' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                    4
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Section 4: Objective Physical Examination &amp; Diagnostics
                    </h2>
                    <p className="text-xs text-slate-500">
                      Clinical vitals, gait &amp; nerve root tests, SLR, knee examination, and report attachments
                    </p>
                  </div>
                </div>
              </div>

              {/* Vitals */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 text-xs">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Height (cm)</label>
                  <input
                    type="text"
                    placeholder="Enter Height"
                    value={exam.height || ''}
                    onChange={(e) => setExam({ ...exam, height: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Weight (kg)</label>
                  <input
                    type="text"
                    placeholder="Enter Weight"
                    value={exam.weight || ''}
                    onChange={(e) => setExam({ ...exam, weight: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Blood Pressure</label>
                  <input
                    type="text"
                    placeholder="Enter Blood Pressure"
                    value={exam.bp || ''}
                    onChange={(e) => setExam({ ...exam, bp: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">Pulse (bpm)</label>
                  <input
                    type="text"
                    placeholder="Enter Pulse"
                    value={exam.pulse || ''}
                    onChange={(e) => setExam({ ...exam, pulse: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">BMI</label>
                  <input
                    type="text"
                    placeholder="Enter BMI"
                    value={exam.bmi || ''}
                    onChange={(e) => setExam({ ...exam, bmi: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                </div>
              </div>

              {/* Functional Tests */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Functional Spine &amp; Nerve Root Tests
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Toe Walking (S1 Root)</label>
                    <input
                      type="text"
                      placeholder="Enter Toe Walking Result"
                      value={exam.toeWalkingS1 || ''}
                      onChange={(e) => setExam({ ...exam, toeWalkingS1: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Heel Walking (L5 Root)</label>
                    <input
                      type="text"
                      placeholder="Enter Heel Walking Result"
                      value={exam.heelWalkingL5 || ''}
                      onChange={(e) => setExam({ ...exam, heelWalkingL5: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">One Leg Standing (L4 Root)</label>
                    <input
                      type="text"
                      placeholder="Enter One Leg Standing Result"
                      value={exam.oneLegStandingL4 || ''}
                      onChange={(e) => setExam({ ...exam, oneLegStandingL4: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>

              {/* SLR & Sensation */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Straight Leg Raise (SLR) Test
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Left Leg SLR</label>
                      <input
                        type="text"
                        placeholder="Enter Left Leg SLR"
                        value={exam.slrLeft || ''}
                        onChange={(e) => setExam({ ...exam, slrLeft: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Right Leg SLR</label>
                      <input
                        type="text"
                        placeholder="Enter Right Leg SLR"
                        value={exam.slrRight || ''}
                        onChange={(e) => setExam({ ...exam, slrRight: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      />
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Circulation &amp; Sensory Findings
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Sensory Deficit</label>
                      <input
                        type="text"
                        placeholder="Enter Sensory Deficit"
                        value={exam.sensoryDeficit || ''}
                        onChange={(e) => setExam({ ...exam, sensoryDeficit: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1.5">Dorsalis Pedis Pulse</label>
                      <input
                        type="text"
                        placeholder="Enter Dorsalis Pedis Pulse"
                        value={exam.dorsalisPedis || ''}
                        onChange={(e) => setExam({ ...exam, dorsalisPedis: e.target.value })}
                        className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Knee Joint Assessment */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Knee &amp; Extremity Joint Assessment
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Varus / Valgus Alignment</label>
                    <input
                      type="text"
                      placeholder="Enter Varus / Valgus Alignment"
                      value={exam.kneeVarusValgus || ''}
                      onChange={(e) => setExam({ ...exam, kneeVarusValgus: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Fixed Flexion Deformity</label>
                    <input
                      type="text"
                      placeholder="Enter Fixed Flexion Deformity"
                      value={exam.kneeFixedFlexion || ''}
                      onChange={(e) => setExam({ ...exam, kneeFixedFlexion: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Hyperextension</label>
                    <input
                      type="text"
                      placeholder="Enter Hyperextension"
                      value={exam.kneeHyperextension || ''}
                      onChange={(e) => setExam({ ...exam, kneeHyperextension: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Range of Motion (ROM)</label>
                    <input
                      type="text"
                      placeholder="Enter Knee ROM"
                      value={exam.kneeRangeOfMotion || ''}
                      onChange={(e) => setExam({ ...exam, kneeRangeOfMotion: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joint Tenderness</label>
                    <input
                      type="text"
                      placeholder="Enter Joint Tenderness"
                      value={exam.kneeTenderness || ''}
                      onChange={(e) => setExam({ ...exam, kneeTenderness: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joint Effusion / Swelling</label>
                    <input
                      type="text"
                      placeholder="Enter Joint Effusion"
                      value={exam.kneeEffusion || ''}
                      onChange={(e) => setExam({ ...exam, kneeEffusion: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Joint Stability / Special Tests</label>
                    <input
                      type="text"
                      placeholder="Enter Stability / Special Tests"
                      value={exam.kneeStabilityTests || ''}
                      onChange={(e) => setExam({ ...exam, kneeStabilityTests: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                  <div className="sm:col-span-1">
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Extremity Joint Assessment</label>
                    <input
                      type="text"
                      placeholder="Enter Extremity Joint Assessment"
                      value={exam.extremityJointAssessment || ''}
                      onChange={(e) => setExam({ ...exam, extremityJointAssessment: e.target.value })}
                      className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                    />
                  </div>
                </div>
              </div>

              {/* Diagnostic Imaging Findings */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Radiology &amp; Laboratory Diagnostic Summary
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter Diagnostic Findings"
                  value={exam.investigations || ''}
                  onChange={(e) => setExam({ ...exam, investigations: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              {/* Attachments */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Diagnostic Reports &amp; Imaging Attachments ({attachments.length})
                </h4>

                {/* Upload New Document Box */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-white p-3 rounded-lg border border-slate-200">
                  <input
                    type="text"
                    placeholder="Enter Document Title"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                  <select
                    value={docType}
                    onChange={(e) => setDocType(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-xs bg-white focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  >
                    <option value="X-Ray">X-Ray Report</option>
                    <option value="MRI">MRI Scan</option>
                    <option value="Blood Test">Blood Investigation</option>
                    <option value="Prescription">Doctor Prescription</option>
                    <option value="Discharge Summary">Discharge Summary</option>
                  </select>
                  <input
                    type="date"
                    value={docDate}
                    onChange={(e) => setDocDate(e.target.value)}
                    className="border border-slate-300 rounded-lg px-3 py-2 text-xs focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                  />
                  <label className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#0C4A60] text-white rounded-lg text-xs font-semibold cursor-pointer hover:bg-[#083344] transition-colors shadow-xs">
                    <Upload className="w-3.5 h-3.5" />
                    <span>Upload File</span>
                    <input
                      type="file"
                      accept="image/*,.pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="space-y-2 mt-2">
                    {attachments.map((doc, idx) => (
                      <div key={doc.id || idx} className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 text-xs">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#0C4A60]" />
                          <span className="font-bold text-slate-900">{doc.title}</span>
                          <span className="px-2 py-0.5 rounded bg-sky-50 text-[#0C4A60] text-[10px] font-semibold">{doc.type}</span>
                          <span className="text-slate-400 font-mono text-[11px]">{doc.date}</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setAttachments((prev) => prev.filter((_, i) => i !== idx))}
                          className="text-rose-600 hover:text-rose-800 p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SECTION 5: Therapist Directives & 12 Weeks Therapy Plan (NOT Pre-Configured) */}
          {activeSection === 'section5' && (
            <div className="bg-white rounded-2xl p-6 sm:p-7 shadow-xs border border-slate-200/90 space-y-6 animate-in fade-in duration-150">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-[#0C4A60] text-white flex items-center justify-center font-bold text-xs">
                    5
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900">
                      Section 5: Attending Directives &amp; 12-Week Therapy Plan
                    </h2>
                    <p className="text-xs text-slate-500">
                      Customized weekly therapeutic protocols, asanas, breathwork, props &amp; contraindications
                    </p>
                  </div>
                </div>
              </div>

              {/* Therapist Directive Notes */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Attending Therapist Clinical Directive / Overview
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter Clinical Directive"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg p-3 text-xs sm:text-sm focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              {/* Precautions Box */}
              <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-300 space-y-2">
                <label className="block font-bold text-amber-900 text-xs flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-amber-700" />
                  Clinical Precautions &amp; Movement Contraindications
                </label>
                <textarea
                  rows={2}
                  placeholder="Enter Clinical Precautions &amp; Contraindications"
                  value={therapyPrecautions}
                  onChange={(e) => setTherapyPrecautions(e.target.value)}
                  className="w-full bg-white border border-amber-300 rounded-lg p-3 text-xs sm:text-sm text-slate-800 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                />
              </div>

              {/* 12-Week Therapy Plan (Interactive input fields for each week) */}
              <div className="space-y-4 pt-2">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#0C4A60]" />
                    <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                      12 Weeks Therapy &amp; Practice Plan Inputs
                    </h4>
                  </div>

                  {/* Month Switcher Tabs */}
                  <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg text-xs font-semibold">
                    <button
                      type="button"
                      onClick={() => setSelectedPlanMonth(1)}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedPlanMonth === 1
                          ? 'bg-[#0C4A60] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Month 1 (W1 - W4)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanMonth(2)}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedPlanMonth === 2
                          ? 'bg-[#0C4A60] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Month 2 (W5 - W8)
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedPlanMonth(3)}
                      className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                        selectedPlanMonth === 3
                          ? 'bg-[#0C4A60] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Month 3 (W9 - W12)
                    </button>
                  </div>
                </div>

                {/* Weeks in selected month */}
                <div className="space-y-4">
                  {therapyPlan
                    .filter((w) => w.month === selectedPlanMonth)
                    .map((week) => {
                      const weekNum = week.weekNumber || week.week || 1;
                      return (
                        <div
                          key={weekNum}
                          className="p-4 rounded-xl border border-slate-200 bg-slate-50/60 space-y-3"
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 border-b border-slate-200 gap-2">
                            <div className="flex items-center gap-2">
                              <span className="w-6 h-6 rounded-md bg-[#0C4A60] text-amber-300 flex items-center justify-center font-bold text-xs">
                                W{weekNum}
                              </span>
                              <span className="text-xs font-bold text-slate-900">
                                Week {weekNum} Protocol Plan
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              {weekNum > 1 && (
                                <button
                                  type="button"
                                  onClick={() => handleCopyFromPreviousWeek(weekNum)}
                                  className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-600 hover:text-[#0C4A60] px-2 py-1 bg-white border border-slate-200 rounded-md cursor-pointer"
                                  title="Copy practices and props from the previous week"
                                >
                                  <Copy className="w-3 h-3" />
                                  <span>Copy W{weekNum - 1}</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleClearWeek(weekNum)}
                                className="text-[11px] font-medium text-slate-500 hover:text-rose-600 px-2 py-1 bg-white border border-slate-200 rounded-md cursor-pointer"
                              >
                                Clear
                              </button>

                              <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 cursor-pointer ml-1 select-none">
                                <input
                                  type="checkbox"
                                  checked={!!week.completed}
                                  onChange={(e) => handleUpdateWeek(weekNum, 'completed', e.target.checked)}
                                  className="w-3.5 h-3.5 accent-emerald-600 rounded"
                                />
                                <span>Completed</span>
                              </label>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                            <div className="sm:col-span-2">
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                                Week Theme / Target Objective
                              </label>
                              <input
                                type="text"
                                placeholder="Enter Week Theme"
                                value={week.theme || ''}
                                onChange={(e) => handleUpdateWeek(weekNum, 'theme', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 font-medium focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                                Asanas &amp; Physical Practices
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Enter Asanas &amp; Physical Practices"
                                value={week.practices || ''}
                                onChange={(e) => handleUpdateWeek(weekNum, 'practices', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                                Pranayama &amp; Breathwork
                              </label>
                              <textarea
                                rows={2}
                                placeholder="Enter Pranayama &amp; Breathwork"
                                value={week.pranayama || ''}
                                onChange={(e) => handleUpdateWeek(weekNum, 'pranayama', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg p-2.5 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                                Therapeutic Props &amp; Specific Notes
                              </label>
                              <input
                                type="text"
                                placeholder="Enter Therapeutic Props &amp; Notes"
                                value={week.props || ''}
                                onChange={(e) => handleUpdateWeek(weekNum, 'props', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                              />
                            </div>

                            <div>
                              <label className="block text-[11px] font-semibold text-slate-700 mb-1.5">
                                Frequency &amp; Duration
                              </label>
                              <input
                                type="text"
                                placeholder="Enter Frequency &amp; Duration"
                                value={week.duration || ''}
                                onChange={(e) => handleUpdateWeek(weekNum, 'duration', e.target.value)}
                                className="w-full bg-white border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-[#0C4A60]/20 focus:border-[#0C4A60]"
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Form Actions Footer */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-between gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <span>Section:</span>
              <span className="font-bold text-slate-800 capitalize">
                {activeSection.replace('section', 'Section ')}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-slate-300 rounded-xl text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 bg-[#0C4A60] hover:bg-[#083344] text-white rounded-xl text-xs font-bold shadow-xs transition-colors flex items-center gap-1.5 disabled:opacity-50 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving All Changes...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>{activeSection !== 'section5' ? 'Save and Next' : 'Save All Changes'}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
