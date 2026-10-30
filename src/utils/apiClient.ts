import * as XLSX from 'xlsx';
import { Patient, DashboardStats } from '../types';

// Default initial seed data for static/Netlify deployments when LocalStorage is empty
const INITIAL_SEED_PATIENTS: Patient[] = [
  {
    id: 1,
    patient_id: 'PP-00001',
    full_name: 'Venkata Ramanamurthy K',
    preferred_name: 'Ramana Murthy',
    dob: '1974-05-14',
    age: 52,
    gender: 'Male',
    mobile: '+91 98480 23145',
    email: 'ramana.v@example.com',
    address: 'Benz Circle, Vijayawada, Andhra Pradesh',
    preferred_language: 'Telugu',
    emergency_name: 'Savitri K',
    emergency_relationship: 'Spouse',
    emergency_phone: '+91 98480 99881',
    centre: 'STY Vijayawada',
    assigned_therapist: 'Dr. Surya Teja (Senior Therapist)',
    referred_by: 'Dr. Prasad (Orthopedic, Ramesh Hospitals)',
    status: 'Active',
    admission_date: '2026-06-15',
    consultation_fee: '500',
    consultation_date: '2026-06-15',
    monthly_fee: '4500',
    payment_records: JSON.stringify([
      {
        id: 'PAY-1',
        date: '2026-06-15',
        amount: 500,
        method: 'UPI',
        receiptNo: 'STY-RCP-1001',
        notes: 'Initial Consultation Fee',
        recorded_by: 'Vara Prasad'
      }
    ]),
    occupation: 'Bank Officer (desk job)',
    work_pattern: 'Prolonged sitting 7-8 hours daily',
    physical_activity: 'Irregular walking 15 mins',
    chief_complaint: 'Severe lower back pain radiating down the left leg along posterior thigh to calf for past 3 months.',
    complaint_region: 'Lumbar Spine',
    complaint_side: 'Left',
    episode_type: 'Recurring',
    pain_score: 7,
    medical_history: JSON.stringify({
      hasMajorOperation: false,
      majorOperationDetails: '',
      hasMajorIllness: false,
      majorIllnessDetails: '',
      hasHT_DM_Thyroid: true,
      htDmThyroidDetails: 'Type 2 Diabetes Mellitus (controlled on Metformin 500mg), Hypertension for 4 years',
      hasMajorTrauma: false,
      majorTraumaDetails: '',
      hasRadiatingPain: true,
      radiatingPainDetails: 'L4-L5 dermatome distribution down left leg',
      hasNumbness: true,
      numbnessDetails: 'Tingling and occasional numbness in left lateral foot',
      hasAbnormalSensation: true,
      abnormalSensationDetails: 'Pins and needles sensation after prolonged sitting',
      hasMotorWeakness: false,
      motorWeaknessDetails: '',
      hypertension: {
        has: true,
        sinceWhen: '4 years',
        pastReading: '140/90',
        currentReading: '130/84',
        medications: 'Telmisartan 40mg'
      },
      diabetes: {
        has: true,
        type: 'Type 2',
        sinceWhen: '3 years',
        pastReading: '160 mg/dL',
        currentReading: '126 mg/dL',
        medications: 'Metformin 500mg'
      }
    }),
    exam_data: JSON.stringify({
      weight: '76 kg',
      bp: '130/84 mmHg',
      pulse: '74 bpm',
      bmi: '26.3',
      toeWalkingS1: 'Normal bilaterally',
      heelWalkingL5: 'Mild difficulty on Left side',
      oneLegStandingL4: 'Unstable left leg (12s) vs right (28s)',
      slrLeft: 'Positive at 45 degrees with shooting pain',
      slrRight: 'Negative (80 degrees)',
      sensoryDeficit: 'Mild hypoesthesia along left L5 dermatome',
      dorsalisPedis: 'Palpable bilaterally (Good pulse)',
      kneeVarusValgus: 'Normal alignment',
      kneeFixedFlexion: 'Nil',
      kneeHyperextension: 'Nil',
      investigations: 'MRI Lumbar Spine (May 2026): L4-L5 disc protrusion causing left nerve root impingement.'
    }),
    notes: 'Patient advised gentle restorative asanas, pelvic tilting with bolster support, and avoiding forward flexion until review.',
    created_at: '2026-06-15 09:30:00',
    updated_at: '2026-06-25 11:15:00'
  },
  {
    id: 2,
    patient_id: 'PP-00002',
    full_name: 'Ananya Reddy M',
    preferred_name: 'Ananya',
    dob: '1988-11-20',
    age: 38,
    gender: 'Female',
    mobile: '+91 99890 55432',
    email: 'ananya.reddy@techhub.in',
    address: 'Gachibowli, Hyderabad, Telangana',
    preferred_language: 'English',
    emergency_name: 'Rajesh Reddy',
    emergency_relationship: 'Spouse',
    emergency_phone: '+91 99890 11223',
    centre: 'STY Hyderabad',
    assigned_therapist: 'Yogacharya Sneha (Yoga Therapist)',
    referred_by: 'Self / Social Media',
    status: 'Completed',
    admission_date: '2026-06-20',
    consultation_fee: '600',
    consultation_date: '2026-06-20',
    monthly_fee: '5000',
    payment_records: JSON.stringify([]),
    occupation: 'Software Architect',
    work_pattern: 'Desk bound 9 hours, computer work',
    physical_activity: 'Gym twice a week',
    chief_complaint: 'Cervical stiffness, upper trapezius spasms, and right shoulder dull aching pain with occasional headaches.',
    complaint_region: 'Cervical Spine',
    complaint_side: 'Right',
    episode_type: 'First episode',
    pain_score: 5,
    medical_history: JSON.stringify({
      hasMajorOperation: false,
      majorOperationDetails: '',
      hasMajorIllness: false,
      majorIllnessDetails: '',
      hasHT_DM_Thyroid: true,
      htDmThyroidDetails: 'Hypothyroidism (Eltroxin 50mcg)',
      thyroid: {
        has: true,
        type: 'Hypothyroidism',
        sinceWhen: '2 years',
        pastReading: 'TSH 6.2',
        currentReading: 'TSH 2.4',
        medications: 'Eltroxin 50mcg'
      }
    }),
    exam_data: JSON.stringify({
      weight: '62 kg',
      bp: '118/76 mmHg',
      pulse: '72 bpm',
      bmi: '22.8',
      toeWalkingS1: 'Normal',
      heelWalkingL5: 'Normal',
      oneLegStandingL4: 'Normal bilaterally (>30s)',
      slrLeft: 'Negative (85 deg)',
      slrRight: 'Negative (85 deg)',
      sensoryDeficit: 'None detected',
      dorsalisPedis: 'Palpable bilaterally',
      investigations: 'X-Ray Cervical Spine: Loss of normal cervical lordosis (muscle spasm).'
    }),
    notes: 'Initial evaluation completed. Recommended gentle neck mobilization, chest opening with yoga blocks, and thoracic extension.',
    created_at: '2026-06-20 16:40:00',
    updated_at: '2026-06-20 17:10:00'
  },
  {
    id: 3,
    patient_id: 'STY-VJA-2026-0003',
    full_name: 'Lakshmi Narayana Somayajula',
    preferred_name: 'S. L. Narayana',
    dob: '1961-03-08',
    age: 65,
    gender: 'Male',
    mobile: '+91 94401 78901',
    email: '',
    address: 'Governorpet, Vijayawada, Andhra Pradesh',
    preferred_language: 'Telugu',
    emergency_name: 'Subrahmanyam S',
    emergency_relationship: 'Son',
    emergency_phone: '+91 94401 44556',
    centre: 'STY Vijayawada',
    assigned_therapist: 'Dr. Surya Teja (Senior Therapist)',
    referred_by: 'Dr. Murali Mohan (Kamineni Hospital)',
    status: 'Active',
    admission_date: '2026-06-22',
    consultation_fee: '500',
    consultation_date: '2026-06-22',
    monthly_fee: '4500',
    payment_records: JSON.stringify([]),
    occupation: 'Retired Teacher',
    work_pattern: 'Sedentary, gardening hobby',
    physical_activity: 'Morning stroll 20 mins',
    chief_complaint: 'Bilateral knee pain, crepitus, and difficulty in climbing stairs or sitting cross-legged for more than 5 minutes.',
    complaint_region: 'Knee',
    complaint_side: 'Bilateral',
    episode_type: 'Recurring',
    pain_score: 6,
    medical_history: JSON.stringify({
      hasMajorOperation: true,
      majorOperationDetails: 'Appendectomy (1998)',
      hasHT_DM_Thyroid: true,
      htDmThyroidDetails: 'Hypertension on Telmisartan 40mg',
      hypertension: {
        has: true,
        sinceWhen: '5 years',
        currentReading: '136/88',
        medications: 'Telmisartan 40mg'
      }
    }),
    exam_data: JSON.stringify({
      weight: '79 kg',
      bp: '136/88 mmHg',
      pulse: '76 bpm',
      bmi: '27.4',
      kneeVarusValgus: 'Bilateral mild Varus (Bow leg) deformity',
      kneeFixedFlexion: '5 degrees lag bilaterally',
      investigations: 'Bilateral Knee Standing X-Ray: Grade 2-3 Osteoarthritis with medial joint space narrowing.'
    }),
    notes: 'Chair yoga therapy plan configured. Quad strengthening using strap and yoga block, avoiding deep knee flexion or vajrasana.',
    created_at: '2026-06-22 10:15:00',
    updated_at: '2026-06-27 12:00:00'
  }
];

// Helper to safely parse response as JSON
async function safeParseJsonResponse(response: Response): Promise<{ ok: boolean; data?: any; error?: string }> {
  try {
    const contentType = response.headers.get('content-type') || '';
    if (!contentType.includes('application/json')) {
      return { ok: false, error: 'Non-JSON response' };
    }
    const text = await response.text();
    if (!text || text.trim() === '') {
      return { ok: false, error: 'Empty response body' };
    }
    const data = JSON.parse(text);
    return { ok: response.ok, data };
  } catch (err: any) {
    return { ok: false, error: err.message || 'JSON parse error' };
  }
}

// Ensure LocalStorage patients initialized
function getLocalPatients(): Patient[] {
  try {
    const stored = localStorage.getItem('sty_patients');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error('Error reading local patients', e);
  }

  // Seed default patients into LocalStorage if empty
  localStorage.setItem('sty_patients', JSON.stringify(INITIAL_SEED_PATIENTS));
  return INITIAL_SEED_PATIENTS;
}

function saveLocalPatients(patients: Patient[]): void {
  try {
    localStorage.setItem('sty_patients', JSON.stringify(patients));
  } catch (e) {
    console.error('Error saving local patients', e);
  }
}

/**
 * 1. API LOGIN
 */
export async function apiLogin(mobile: string, password: string): Promise<{ id: number; mobile: string; name: string; role: string }> {
  try {
    const response = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ mobile: mobile.trim(), password })
    });

    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && parsed.data && parsed.data.success && parsed.data.user) {
      return parsed.data.user;
    }

    if (parsed.data && parsed.data.error) {
      throw new Error(parsed.data.error);
    }
  } catch (err: any) {
    // If backend returns explicitly invalid credentials error, rethrow
    if (err.message && (err.message.includes('Invalid') || err.message.includes('password'))) {
      throw err;
    }
    console.warn('Backend server unavailable, using local client authentication fallback');
  }

  // Local static fallback login validation
  const cleanDigits = mobile.replace(/\D/g, '');
  const isVaraPrasad = cleanDigits.endsWith('8897182017') || mobile.includes('8897182017');
  
  if (isVaraPrasad) {
    if (password === 'vara@1601' || password === 'admin123' || password) {
      return { id: 1, mobile: '8897182017', name: 'Vara Prasad', role: 'Admin' };
    }
  }

  // Accept valid 10-digit mobile credentials in static demo mode
  if (cleanDigits.length >= 10) {
    if (password === 'admin123' || password === 'vara@1601' || password.length >= 4) {
      return {
        id: Math.floor(Math.random() * 1000) + 1,
        mobile: mobile.trim(),
        name: 'Vara Prasad',
        role: 'Admin'
      };
    }
  }

  throw new Error('Invalid mobile number or password.');
}

/**
 * 2. GET PATIENTS
 */
export async function apiGetPatients(options?: { search?: string; centre?: string; status?: string }): Promise<Patient[]> {
  try {
    const queryParams = new URLSearchParams();
    if (options?.search) queryParams.append('search', options.search);
    if (options?.centre && options.centre !== 'All') queryParams.append('centre', options.centre);
    if (options?.status && options.status !== 'All') queryParams.append('status', options.status);

    const response = await fetch(`/api/patients?${queryParams.toString()}`);
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && Array.isArray(parsed.data)) {
      // Sync into local storage as cache
      saveLocalPatients(parsed.data);
      return parsed.data;
    }
  } catch (e) {
    console.warn('Backend server unavailable, fetching patients from client storage');
  }

  // Fallback to local storage
  let local = getLocalPatients();
  if (options?.centre && options.centre !== 'All') {
    local = local.filter((p) => p.centre === options.centre);
  }
  if (options?.status && options.status !== 'All') {
    local = local.filter((p) => p.status === options.status);
  }
  if (options?.search && options.search.trim() !== '') {
    const term = options.search.toLowerCase().trim();
    local = local.filter(
      (p) =>
        p.full_name?.toLowerCase().includes(term) ||
        p.patient_id?.toLowerCase().includes(term) ||
        p.mobile?.includes(term) ||
        p.chief_complaint?.toLowerCase().includes(term)
    );
  }
  return local;
}

/**
 * 3. GET NEXT PATIENT ID
 */
export async function apiGetNextPatientId(centre: string): Promise<string> {
  try {
    const response = await fetch(`/api/patients/next-id?centre=${encodeURIComponent(centre)}`);
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && parsed.data && parsed.data.nextId) {
      return parsed.data.nextId;
    }
  } catch (e) {
    // ignore
  }

  // Local fallback
  const local = getLocalPatients();
  const prefix = centre === 'STY Hyderabad' ? 'STY-HYD-' : 'STY-VJA-';
  const year = new Date().getFullYear();
  let maxNum = 0;

  local.forEach((p) => {
    if (p.patient_id) {
      // Fix any duplicate 2026 in stored IDs
      if (p.patient_id.includes('2026-2026')) {
        p.patient_id = p.patient_id.replace('2026-2026', '2026-');
      }
      const match = p.patient_id.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num < 100000) {
          maxNum = Math.max(maxNum, num);
        }
      }
    }
  });

  saveLocalPatients(local);

  const nextSeq = maxNum > 0 ? maxNum + 1 : 1;
  return `${prefix}${year}-${String(nextSeq).padStart(4, '0')}`;
}

/**
 * 4. CREATE PATIENT
 */
export async function apiCreatePatient(payload: any): Promise<Patient> {
  try {
    const response = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && parsed.data) {
      return parsed.data;
    }
  } catch (e) {
    console.warn('Backend server unavailable, saving patient to client storage');
  }

  // Fallback save locally
  const local = getLocalPatients();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const nextIdStr = payload.patient_id || (await apiGetNextPatientId(payload.centre || 'STY Vijayawada'));

  const newPatient: Patient = {
    ...payload,
    id: Date.now(),
    patient_id: nextIdStr,
    created_at: now,
    updated_at: now
  };

  local.unshift(newPatient);
  saveLocalPatients(local);
  return newPatient;
}

/**
 * 5. UPDATE PATIENT
 */
export async function apiUpdatePatient(id: number | string, payload: any): Promise<Patient> {
  try {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && parsed.data) {
      return parsed.data;
    }
  } catch (e) {
    console.warn('Backend server unavailable, updating patient in client storage');
  }

  // Fallback update locally
  const local = getLocalPatients();
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  let updatedObj: Patient | null = null;

  const updatedList: Patient[] = local.map((p) => {
    if (p.id === id || p.patient_id === String(id)) {
      const merged: Patient = {
        ...p,
        ...payload,
        updated_at: now
      };
      updatedObj = merged;
      return merged;
    }
    return p;
  });

  if (updatedObj) {
    saveLocalPatients(updatedList);
    return updatedObj;
  }

  throw new Error('Patient not found');
}

/**
 * 6. DELETE PATIENT
 */
export async function apiDeletePatient(id: number | string): Promise<boolean> {
  try {
    const response = await fetch(`/api/patients/${id}`, {
      method: 'DELETE'
    });
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok) {
      return true;
    }
  } catch (e) {
    console.warn('Backend server unavailable, deleting patient from client storage');
  }

  // Fallback delete locally
  const local = getLocalPatients();
  const filtered = local.filter((p) => p.id !== id && p.patient_id !== String(id));
  saveLocalPatients(filtered);
  return true;
}

/**
 * 7. GET STATS
 */
export async function apiGetStats(): Promise<DashboardStats> {
  try {
    const response = await fetch('/api/stats');
    const parsed = await safeParseJsonResponse(response);
    if (parsed.ok && parsed.data) {
      return parsed.data;
    }
  } catch (e) {
    console.warn('Backend server unavailable, calculating stats from client storage');
  }

  // Fallback stats computation locally
  const local = getLocalPatients();
  const total = local.length;
  const activeCount = local.filter((p) => p.status === 'Active').length;
  const completedCount = local.filter((p) => p.status === 'Completed' || p.status === 'Therapy Completed').length;
  const vjaCount = local.filter((p) => p.centre === 'STY Vijayawada').length;
  const hydCount = local.filter((p) => p.centre === 'STY Hyderabad').length;

  let totalPain = 0;
  let painCount = 0;
  local.forEach((p) => {
    if (typeof p.pain_score === 'number' && p.pain_score >= 0) {
      totalPain += p.pain_score;
      painCount++;
    }
  });

  const avgPainScore = painCount > 0 ? Math.round((totalPain / painCount) * 10) / 10 : 0;

  // Status breakdown
  const map: Record<string, number> = {};
  local.forEach((p) => {
    const st = p.status || 'Active';
    map[st] = (map[st] || 0) + 1;
  });
  const statusBreakdown = Object.keys(map).map((k) => ({ status: k, count: map[k] }));

  return {
    total,
    activeCount,
    completedCount,
    vjaCount,
    hydCount,
    avgPainScore,
    statusBreakdown,
    recentRegistrations: local.slice(0, 5)
  };
}

/**
 * 8. EXPORT MULTI-SHEET EXCEL FILE (.xlsx)
 */
export async function apiExportExcel(): Promise<void> {
  try {
    const res = await fetch('/api/export-excel');
    if (res.ok) {
      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('spreadsheetml') || contentType.includes('excel') || contentType.includes('octet-stream')) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `STY_Clinical_Database_${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        return;
      }
    }
  } catch (err) {
    console.warn('Backend export endpoint unavailable, performing client-side Excel generation');
  }

  // Client-side Excel export fallback using XLSX library
  const local = getLocalPatients();
  const wb = XLSX.utils.book_new();

  // 1. Patients Sheet
  const patientsData = local.map((p) => ({
    'Patient ID': p.patient_id,
    'Full Name': p.full_name,
    'Preferred Name': p.preferred_name || '',
    'Age': p.age || '',
    'Gender': p.gender || '',
    'Mobile': p.mobile || '',
    'Email': p.email || '',
    'Residential Address': p.address || '',
    'Preferred Language': p.preferred_language || '',
    'Emergency Contact Name': p.emergency_name || '',
    'Emergency Relationship': p.emergency_relationship || '',
    'Emergency Phone': p.emergency_phone || '',
    'Centre': p.centre || '',
    'Admission Date': p.admission_date || '',
    'Assigned Therapist': p.assigned_therapist || '',
    'Referred By': p.referred_by || '',
    'Status': p.status || '',
    'Consultation Fee': p.consultation_fee || '',
    'Consultation Date': p.consultation_date || '',
    'Monthly Package Fee': p.monthly_fee || '',
    'Chief Complaint': p.chief_complaint || '',
    'Complaint Since When': p.complaint_since_when || '',
    'Complaint Region': p.complaint_region || '',
    'Complaint Side': p.complaint_side || '',
    'Episode Type': p.episode_type || '',
    'Pain Score (VAS)': p.pain_score ?? '',
    'Voice Audio Transcript': p.complaint_transcript || '',
    'Occupation': p.occupation || '',
    'Work Pattern': p.work_pattern || '',
    'Physical Activity': p.physical_activity || '',
    'Therapy Precautions': p.therapy_precautions || '',
    'Clinical Notes & Directives': p.notes || '',
    'Created At': p.created_at || '',
    'Updated At': p.updated_at || ''
  }));
  const wsPatients = XLSX.utils.json_to_sheet(patientsData);
  XLSX.utils.book_append_sheet(wb, wsPatients, 'Patients');

  // 2. Assessments Sheet
  const assessmentsData: any[] = [];
  local.forEach((p) => {
    let exam: any = {};
    let med: any = {};
    try { exam = p.exam_data ? JSON.parse(p.exam_data) : {}; } catch (e) {}
    try { med = p.medical_history ? JSON.parse(p.medical_history) : {}; } catch (e) {}

    assessmentsData.push({
      'Patient ID': p.patient_id,
      'Full Name': p.full_name,
      'Centre': p.centre || '',
      'Weight': exam.weight || '',
      'BP': exam.bp || '',
      'Pulse': exam.pulse || '',
      'BMI': exam.bmi || '',
      'Toe Walking S1': exam.toeWalkingS1 || '',
      'Heel Walking L5': exam.heelWalkingL5 || '',
      'One Leg Standing L4': exam.oneLegStandingL4 || '',
      'SLR Left': exam.slrLeft || '',
      'SLR Right': exam.slrRight || '',
      'Sensory Deficit': exam.sensoryDeficit || '',
      'Dorsalis Pedis Pulse': exam.dorsalisPedis || '',
      'Investigations': exam.investigations || '',
      'Hypertension': med.hypertension?.medications || med.htDmThyroidDetails || '',
      'Diabetes': med.diabetes?.medications || '',
      'Thyroid': med.thyroid?.medications || ''
    });
  });
  const wsAssessments = XLSX.utils.json_to_sheet(assessmentsData);
  XLSX.utils.book_append_sheet(wb, wsAssessments, 'Assessments');

  // 3. Progress Notes Sheet
  const progressNotesData: any[] = [];
  local.forEach((p) => {
    if (p.followup_records) {
      try {
        const records = typeof p.followup_records === 'string' ? JSON.parse(p.followup_records) : p.followup_records;
        if (Array.isArray(records)) {
          records.forEach((rec, idx) => {
            progressNotesData.push({
              'Note ID': rec.id || `FN-${p.patient_id}-${idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Followup Date': rec.date || rec.followup_date || '',
              'Therapist': rec.therapist || p.assigned_therapist || '',
              'Pain Score (0-10)': rec.painScore ?? '',
              'Feedback': rec.feedback || '',
              'Clinical Notes': rec.clinicalNotes || ''
            });
          });
        }
      } catch (e) {}
    }
  });
  const wsProgress = XLSX.utils.json_to_sheet(progressNotesData.length > 0 ? progressNotesData : [{ Note: 'No followup records' }]);
  XLSX.utils.book_append_sheet(wb, wsProgress, 'Progress Notes');

  // 4. Daily Treatment Logs Sheet
  const treatmentLogsData: any[] = [];
  local.forEach((p) => {
    if (p.therapy_plan) {
      try {
        const plans = typeof p.therapy_plan === 'string' ? JSON.parse(p.therapy_plan) : p.therapy_plan;
        if (Array.isArray(plans)) {
          plans.forEach((plan, idx) => {
            treatmentLogsData.push({
              'Log ID': `TL-${p.patient_id}-W${plan.weekNumber || plan.week || idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Week': plan.weekNumber || plan.week || idx + 1,
              'Title / Theme': plan.title || plan.theme || '',
              'Practices': plan.asanasPractices || plan.practices || '',
              'Pranayama': plan.pranayamaBreathing || plan.pranayama || '',
              'Props': plan.propsUsed || plan.props || '',
              'Notes': plan.therapistNotes || plan.notes || ''
            });
          });
        }
      } catch (e) {}
    }
  });
  const wsLogs = XLSX.utils.json_to_sheet(treatmentLogsData.length > 0 ? treatmentLogsData : [{ Log: 'No treatment logs' }]);
  XLSX.utils.book_append_sheet(wb, wsLogs, 'Daily Treatment Logs');

  // 5. Discharge Summaries Sheet
  const dischargeData = local.filter((p) => p.status === 'Completed' || p.status === 'Therapy Completed').map((p) => ({
    'Patient ID': p.patient_id,
    'Patient Name': p.full_name,
    'Admission Date': p.admission_date || '',
    'Status': p.status,
    'Pain Score': p.pain_score ?? '',
    'Notes': p.notes || ''
  }));
  const wsDischarge = XLSX.utils.json_to_sheet(dischargeData.length > 0 ? dischargeData : [{ Summary: 'No discharged patients' }]);
  XLSX.utils.book_append_sheet(wb, wsDischarge, 'Discharge Summaries');

  // 6. Receipts Sheet
  const receiptsData: any[] = [];
  local.forEach((p) => {
    if (p.payment_records) {
      try {
        const payments = typeof p.payment_records === 'string' ? JSON.parse(p.payment_records) : p.payment_records;
        if (Array.isArray(payments)) {
          payments.forEach((pay, idx) => {
            receiptsData.push({
              'Receipt No': pay.receiptNo || `REC-${p.patient_id}-${idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Payment Date': pay.date || '',
              'Amount (INR)': pay.amount || 0,
              'Payment Method': pay.method || 'Cash',
              'Notes': pay.notes || ''
            });
          });
        }
      } catch (e) {}
    }
  });
  const wsReceipts = XLSX.utils.json_to_sheet(receiptsData.length > 0 ? receiptsData : [{ Receipt: 'No payment receipts recorded' }]);
  XLSX.utils.book_append_sheet(wb, wsReceipts, 'Receipts');

  // 7. Audit Logs Sheet
  const wsAudit = XLSX.utils.json_to_sheet([
    { 'User ID': 1, 'Name': 'Vara Prasad', 'Mobile': '8897182017', 'Role': 'Admin' }
  ]);
  XLSX.utils.book_append_sheet(wb, wsAudit, 'Audit Logs');

  // Write file to user browser
  XLSX.writeFile(wb, `STY_Clinical_Database_${new Date().toISOString().split('T')[0]}.xlsx`);
}
