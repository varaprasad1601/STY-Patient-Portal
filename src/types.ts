export interface DiseaseReading {
  has?: boolean;
  present?: boolean;
  sinceWhen?: string;
  pastReading?: string;
  currentReading?: string;
  medications?: string;
  medication?: string;
  type?: string; // e.g., Hypothyroidism / Hyperthyroidism / Type 1 / Type 2
}

export interface MedicalHistory {
  // Separate chronic diseases with past and current readings
  hypertension?: DiseaseReading;
  diabetes?: DiseaseReading;
  thyroid?: DiseaseReading;

  // Backward compatibility
  hasHT_DM_Thyroid?: boolean;
  htDmThyroidDetails?: string;

  // Other medical conditions
  hasMajorOperation: boolean;
  majorOperationDetails: string;
  hasMajorIllness: boolean;
  majorIllnessDetails: string;
  hasMajorTrauma: boolean;
  majorTraumaDetails: string;
  hasRadiatingPain: boolean;
  radiatingPainDetails: string;
  hasNumbness: boolean;
  numbnessDetails: string;
  hasAbnormalSensation: boolean;
  abnormalSensationDetails: string;
  hasMotorWeakness: boolean;
  motorWeaknessDetails: string;
  hasBowelBladderInvolvement: boolean;
  bowelBladderDetails: string;
  hasWeightLossFever: boolean;
  weightLossFeverDetails: string;
  hasGiddiness?: boolean;
  giddinessDetails?: string;
  hasHeadache?: boolean;
  headacheDetails?: string;
  menstrualHistory: string;
  previousEpisodes: string;
  familyHistory: string;
}

export interface ExamData {
  height?: string; // Objective height parameter
  weight: string;
  bp: string;
  pulse: string;
  bmi: string;
  toeWalkingS1: string;
  heelWalkingL5: string;
  oneLegStandingL4: string;
  slrLeft: string;
  slrRight: string;
  sensoryDeficit: string;
  dorsalisPedis: string;
  kneeVarusValgus: string;
  kneeFixedFlexion: string;
  kneeHyperextension: string;
  kneeRangeOfMotion: string;
  kneeTenderness: string;
  kneeEffusion: string;
  kneeStabilityTests: string;
  extremityJointAssessment: string;
  investigations: string;
}

export interface PaymentRecord {
  id: string;
  date?: string;
  payment_date?: string;
  amount: number | string;
  method?: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | string;
  payment_method?: 'Cash' | 'UPI' | 'Card' | 'Bank Transfer' | string;
  receiptNo?: string;
  notes?: string;
  received_by?: string;
  recorded_by?: string;
  status?: string;
}

export interface InvestigationAttachment {
  id: string;
  name?: string;
  title?: string;
  type: string;
  dataUrl?: string;
  file_url?: string;
  file_name?: string;
  uploadedAt?: string;
  date?: string;
  notes?: string;
  size?: string;
}

export interface WeeklyPractice {
  week?: number;
  weekNumber?: number; // 1 to 12
  month: number; // 1, 2, or 3
  title?: string;
  theme?: string;
  asanasPractices?: string;
  practices?: string;
  pranayamaBreathing?: string;
  pranayama?: string;
  propsUsed?: string;
  props?: string;
  frequencyDuration?: string;
  duration?: string;
  status?: 'Planned' | 'In Progress' | 'Completed' | string;
  completed?: boolean;
  therapistNotes?: string;
  notes?: string;
}

export interface FollowupFeedbackRecord {
  id: string;
  date?: string;
  followup_date?: string;
  therapist?: string;
  therapist_name?: string;
  painScore?: number;
  pain_score?: number;
  vitals?: string;
  feedback: string; // Patient feedback
  clinicalNotes?: string; // Therapist observations
  clinical_notes?: string;
  practiceAdherence?: 'Regular' | 'Occasional' | 'Irregular';
  nextFollowupDate?: string;
  next_followup_date?: string;
}

export interface Patient {
  id: number;
  patient_id: string;
  full_name: string;
  preferred_name?: string;
  dob?: string;
  age?: number;
  gender?: string;
  mobile: string;
  email?: string;
  address?: string;
  preferred_language?: string;

  // 1. Admission & Payment Details
  admission_date?: string;
  emergency_name?: string;
  emergency_relationship?: string;
  emergency_phone?: string;
  consultation_fee?: string;
  consultation_date?: string;
  monthly_fee?: string;
  payment_records?: string; // JSON string of PaymentRecord[]

  centre: 'STY Vijayawada' | 'STY Hyderabad' | string;
  assigned_therapist?: string;
  referred_by?: string;
  status: 'New' | 'Assessment Pending' | 'Active' | 'Inactive' | 'On Hold' | 'Suspended' | 'Referred' | 'Completed' | 'Closed' | string;
  occupation?: string;
  work_pattern?: string;
  physical_activity?: string;

  // 2. Chief Complaint (Audio & Transcript, Since When, Episode Type with Other)
  chief_complaint?: string;
  complaint_region?: string;
  complaint_side?: string;
  episode_type?: string;
  complaint_since_when?: string;
  complaint_audio?: string;
  complaint_transcript?: string;
  pain_score?: number;

  // 3 & 4. Medical History & Objective Exam Data
  medical_history: string; // JSON string of MedicalHistory
  exam_data: string; // JSON string of ExamData
  investigation_attachments?: string; // JSON string of InvestigationAttachment[]

  // 5. 3-Month Week-wise Therapy Plan & Precautions
  therapy_plan?: string; // JSON string of WeeklyPractice[]
  therapy_precautions?: string;

  // 6. Follow-up & Feedback Records
  followup_records?: string; // JSON string of FollowupFeedbackRecord[]

  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  total: number;
  activeCount: number;
  completedCount: number;
  vjaCount: number;
  hydCount: number;
  statusBreakdown: { status: string; count: number }[];
  recentRegistrations: Patient[];
}
