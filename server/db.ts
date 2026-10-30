import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'patients.db');
const db = new Database(dbPath);

// Enable WAL mode for better concurrency
db.pragma('journal_mode = WAL');

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS patients (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    patient_id TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    preferred_name TEXT,
    dob TEXT,
    age INTEGER,
    gender TEXT,
    mobile TEXT NOT NULL,
    email TEXT,
    address TEXT,
    preferred_language TEXT DEFAULT 'Telugu',
    emergency_name TEXT,
    emergency_relationship TEXT,
    emergency_phone TEXT,
    centre TEXT NOT NULL,
    assigned_therapist TEXT,
    referred_by TEXT,
    status TEXT NOT NULL DEFAULT 'New',
    occupation TEXT,
    work_pattern TEXT,
    physical_activity TEXT,
    chief_complaint TEXT,
    complaint_region TEXT,
    complaint_side TEXT,
    episode_type TEXT,
    pain_score INTEGER DEFAULT 0,
    medical_history TEXT,
    exam_data TEXT,
    notes TEXT,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_patients_centre ON patients(centre);
  CREATE INDEX IF NOT EXISTS idx_patients_mobile ON patients(mobile);
  CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);

  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mobile TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    name TEXT NOT NULL,
    role TEXT DEFAULT 'Admin',
    created_at TEXT NOT NULL
  );
`);

// Ensure default login user credentials always exist in users table
db.prepare(`
  INSERT INTO users (id, mobile, password, name, role, created_at)
  VALUES (1, '8897182017', 'vara@1601', 'Vara Prasad', 'Admin', DATETIME('now'))
  ON CONFLICT(mobile) DO UPDATE SET password = 'vara@1601', name = 'Vara Prasad', role = 'Admin'
`).run();



// Migration: Ensure new enhancement columns exist in patients table
const enhancementColumns = [
  'admission_date TEXT',
  'consultation_fee TEXT',
  'consultation_date TEXT',
  'monthly_fee TEXT',
  'payment_records TEXT',
  'complaint_since_when TEXT',
  'complaint_audio TEXT',
  'complaint_transcript TEXT',
  'therapy_plan TEXT',
  'therapy_precautions TEXT',
  'followup_records TEXT',
  'investigation_attachments TEXT'
];

for (const colDef of enhancementColumns) {
  try {
    db.exec(`ALTER TABLE patients ADD COLUMN ${colDef}`);
  } catch (err: any) {
    // Ignore error if column already exists
  }
}

// Auto-populate admission_date for existing patients where admission_date is empty
try {
  db.exec(`UPDATE patients SET admission_date = substr(created_at, 1, 10) WHERE admission_date IS NULL OR admission_date = ''`);
} catch (err: any) {
  // Ignore
}




// Pre-seed initial synthetic data if database is empty
const count = (db.prepare('SELECT count(*) as count FROM patients').get() as { count: number }).count;
if (count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO patients (
      patient_id, full_name, preferred_name, dob, age, gender, mobile, email, address,
      preferred_language, emergency_name, emergency_relationship, emergency_phone,
      centre, assigned_therapist, referred_by, status, occupation, work_pattern,
      physical_activity, chief_complaint, complaint_region, complaint_side,
      episode_type, pain_score, medical_history, exam_data, notes, created_at, updated_at
    ) VALUES (
      @patient_id, @full_name, @preferred_name, @dob, @age, @gender, @mobile, @email, @address,
      @preferred_language, @emergency_name, @emergency_relationship, @emergency_phone,
      @centre, @assigned_therapist, @referred_by, @status, @occupation, @work_pattern,
      @physical_activity, @chief_complaint, @complaint_region, @complaint_side,
      @episode_type, @pain_score, @medical_history, @exam_data, @notes, @created_at, @updated_at
    )
  `);

  const initialSeed = [
    {
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
        menstrualHistory: ''
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
        menstrualHistory: 'FTND x 1 (2020), Regular cycles'
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
        kneeVarusValgus: 'Normal',
        kneeFixedFlexion: 'Nil',
        kneeHyperextension: 'Nil',
        investigations: 'X-Ray Cervical Spine: Loss of normal cervical lordosis (muscle spasm).'
      }),
      notes: 'Initial evaluation completed. Recommended gentle neck mobilization, chest opening with yoga blocks, and thoracic extension.',
      created_at: '2026-06-20 16:40:00',
      updated_at: '2026-06-20 17:10:00'
    },
    {
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
        hasMajorIllness: false,
        majorIllnessDetails: '',
        hasHT_DM_Thyroid: true,
        htDmThyroidDetails: 'Hypertension on Telmisartan 40mg',
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
      }),
      exam_data: JSON.stringify({
        weight: '79 kg',
        bp: '136/88 mmHg',
        pulse: '76 bpm',
        bmi: '27.4',
        toeWalkingS1: 'Normal',
        heelWalkingL5: 'Normal',
        oneLegStandingL4: 'Guarded on both knees due to joint line tenderness',
        slrLeft: 'Negative (80 deg)',
        slrRight: 'Negative (80 deg)',
        sensoryDeficit: 'None',
        dorsalisPedis: 'Palpable normal pulses',
        kneeVarusValgus: 'Bilateral mild Varus (Bow leg) deformity',
        kneeFixedFlexion: '5 degrees lag bilaterally',
        kneeHyperextension: 'Nil',
        investigations: 'Bilateral Knee Standing X-Ray: Grade 2-3 Osteoarthritis with medial joint space narrowing.'
      }),
      notes: 'Chair yoga therapy plan configured. Quad strengthening using strap and yoga block, avoiding deep knee flexion or vajrasana.',
      created_at: '2026-06-22 10:15:00',
      updated_at: '2026-06-27 12:00:00'
    }
  ];

  for (const item of initialSeed) {
    insertStmt.run(item);
  }
}

export function getAllPatients(options: { search?: string; centre?: string; status?: string } = {}) {
  let query = 'SELECT * FROM patients WHERE 1=1';
  const params: any = {};

  if (options.centre && options.centre !== 'All') {
    query += ' AND centre = @centre';
    params.centre = options.centre;
  }

  if (options.status && options.status !== 'All') {
    query += ' AND status = @status';
    params.status = options.status;
  }

  if (options.search && options.search.trim() !== '') {
    query += ' AND (full_name LIKE @search OR patient_id LIKE @search OR mobile LIKE @search OR chief_complaint LIKE @search)';
    params.search = `%${options.search.trim()}%`;
  }

  query += ' ORDER BY id DESC';

  return db.prepare(query).all(params);
}

export function getPatientById(id: number | string) {
  return db.prepare('SELECT * FROM patients WHERE id = ? OR patient_id = ?').get(id, id);
}

export function checkDuplicate(mobile: string, fullName: string) {
  return db.prepare(`
    SELECT patient_id, full_name, mobile, centre 
    FROM patients 
    WHERE mobile = ? OR (LOWER(TRIM(full_name)) = LOWER(TRIM(?)))
  `).get(mobile, fullName);
}



export function getNextPatientId(centre: string): string {
  const prefix = centre === 'STY Hyderabad' ? 'STY-HYD-' : 'STY-VJA-';
  const year = new Date().getFullYear();

  // Clean up any legacy double 2026 in patient_id
  try {
    db.exec(`UPDATE patients SET patient_id = REPLACE(patient_id, '2026-2026', '2026-') WHERE patient_id LIKE '%2026-2026%'`);
  } catch {
    // ignore
  }

  const patients = db.prepare(`SELECT patient_id FROM patients WHERE centre = ?`).all(centre) as { patient_id: string }[];

  let maxNum = 0;
  for (const p of patients) {
    if (p.patient_id) {
      const match = p.patient_id.match(/(\d+)$/);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num < 100000) {
          maxNum = Math.max(maxNum, num);
        }
      }
    }
  }

  const nextSeq = maxNum > 0 ? maxNum + 1 : 1;
  return `${prefix}${year}-${String(nextSeq).padStart(4, '0')}`;
}

export function getDefaultTherapyPlan() {
  return [
    {
      weekNumber: 1,
      month: 1,
      title: 'Week 1: Acute Pain Relief & Gentle Joint Mobilization',
      asanasPractices: 'Sukshma Vyayama (Toe bending, Ankle rotation, Knee contraction), Supta Tadasana, Gentle Pavanamuktasana (single leg).',
      pranayamaBreathing: 'Deep Diaphragmatic Breathing (5-7 mins), Anulom Vilom (5 mins).',
      propsUsed: 'Yoga mat, wall support, soft cotton strap.',
      frequencyDuration: '30-40 mins / daily morning',
      status: 'In Progress',
      therapistNotes: 'Focus on zero strain. Avoid spinal flexion or jerky movements.'
    },
    {
      weekNumber: 2,
      month: 1,
      title: 'Week 2: Lumbar Decompression & Pelvic Alignment',
      asanasPractices: 'Setu Bandhasana (supported with block/bolster), Supported Matsyasana, Marjariasana-Bitilasana (gentle cat-cow).',
      pranayamaBreathing: 'Nadi Shodhana Pranayama (7 mins), Bhramari (5 rounds).',
      propsUsed: 'Yoga blocks (foam), bolster under sacrum.',
      frequencyDuration: '40 mins / daily',
      status: 'Planned',
      therapistNotes: 'Keep knees hip-width apart. Maintain neutral pelvis.'
    },
    {
      weekNumber: 3,
      month: 1,
      title: 'Week 3: Core Stabilizers & Hamstring Flexibility',
      asanasPractices: 'Supta Padangusthasana with strap (70 deg limit), Ardha Shalabhasana (alternate leg lift), Supported Viparita Karani.',
      pranayamaBreathing: 'Sheetali / Sheetkari (cooling breaths), Anulom Vilom (10 mins).',
      propsUsed: 'Strap with loop, wall support, head pillow.',
      frequencyDuration: '45 mins / daily',
      status: 'Planned',
      therapistNotes: 'Check for radiating nerve tension before progressing hamstring stretch.'
    },
    {
      weekNumber: 4,
      month: 1,
      title: 'Week 4: Month 1 Review & Spinal Extension Conditioning',
      asanasPractices: 'Bhujangasana (Sphinx pose on forearms), Supported Balasana with wide knees and bolster, Shavasana with knee bolster.',
      pranayamaBreathing: 'Ujjayi breathing awareness, Guided Yoga Nidra (15 mins).',
      propsUsed: 'Long bolster, chair for restorative relaxation.',
      frequencyDuration: '45 mins / 5 days a week',
      status: 'Planned',
      therapistNotes: 'First monthly assessment due. Measure VAS pain score reduction.'
    },
    {
      weekNumber: 5,
      month: 2,
      title: 'Week 5: Quadriceps Strengthening & Hip Opening',
      asanasPractices: 'Chair Utkatasana (supported squat), Virabhadrasana 1 (hands on hips with wall support), Baddha Konasana (supported).',
      pranayamaBreathing: 'Anulom Vilom (10 mins), sectional breathing (Adham, Madhyam, Uttam).',
      propsUsed: 'Stable armless chair, 2 foam blocks.',
      frequencyDuration: '45 mins / 5-6 days a week',
      status: 'Planned',
      therapistNotes: 'Ensure knee does not overshoot toes in standing postures.'
    },
    {
      weekNumber: 6,
      month: 2,
      title: 'Week 6: Gluteal Activation & Paraspinal Strengthening',
      asanasPractices: 'Setu Bandhasana dynamic lifts (5-8 reps), Ardha Shalabhasana with arm reach, Tadasana alignment awareness.',
      pranayamaBreathing: 'Nadi Shodhana with Kumbhaka (1:1 ratio, gentle), Bhramari (7 rounds).',
      propsUsed: 'Yoga strap between thighs to activate abductors.',
      frequencyDuration: '45 mins / daily',
      status: 'Planned',
      therapistNotes: 'Engage pelvic floor and transversus abdominis gently.'
    },
    {
      weekNumber: 7,
      month: 2,
      title: 'Week 7: Thoracic Mobility & Shoulder Alignment',
      asanasPractices: 'Supported Gomukhasana arms with strap, Ardha Matsyendrasana (gentle seated twist on chair), Supported Dandasana.',
      pranayamaBreathing: 'Kapalabhati (slow 30 strokes only if BP normal), Anulom Vilom (10 mins).',
      propsUsed: 'Yoga strap, folded blanket under sitting bones.',
      frequencyDuration: '50 mins / 5 days a week',
      status: 'Planned',
      therapistNotes: 'Avoid twisting from lumbar spine; initiate twist from mid-thoracic.'
    },
    {
      weekNumber: 8,
      month: 2,
      title: 'Week 8: Month 2 Functional Re-Assessment',
      asanasPractices: 'Combined restorative vinyasa with props, Vrikshasana with wall support for proprioception, Extended Savasana.',
      pranayamaBreathing: 'Full Yogic Breath, Bhramari with Shanmukhi Mudra.',
      propsUsed: 'Wall, bolster, eye pillow.',
      frequencyDuration: '50 mins / 5 days a week',
      status: 'Planned',
      therapistNotes: 'Evaluate SLR angle, joint tenderness, and walking tolerance.'
    },
    {
      weekNumber: 9,
      month: 3,
      title: 'Week 9: Dynamic Stability & Balance Training',
      asanasPractices: 'Trikonasana (supported on high block or chair seat), Parsvottanasana (supported hands on chair), Virabhadrasana 2.',
      pranayamaBreathing: 'Anulom Vilom (12 mins), Chandranadi Pranayama.',
      propsUsed: 'Chair, wooden/foam blocks.',
      frequencyDuration: '50 mins / daily',
      status: 'Planned',
      therapistNotes: 'Maintain micro-bends in joints; no locking of knees.'
    },
    {
      weekNumber: 10,
      month: 3,
      title: 'Week 10: Endurance & Postural Correction',
      asanasPractices: 'Plank modification (forearms on wall or chair), Salabhasana full variation (low lift), Supported Supta Virasana.',
      pranayamaBreathing: 'Nadi Shodhana (15 mins), Om Chanting (21 rounds).',
      propsUsed: 'Slanted plank, bolsters, belts.',
      frequencyDuration: '50 mins / daily',
      status: 'Planned',
      therapistNotes: 'Focus on diaphragmatic breathing while maintaining isometric core activation.'
    },
    {
      weekNumber: 11,
      month: 3,
      title: 'Week 11: Daily Life Ergonomics & Self-Regulation',
      asanasPractices: 'Desk yoga sequences, correct sitting/standing posture drill, restorative forward bend on chair with bolsters.',
      pranayamaBreathing: 'Relaxing Bhramari, Sheetali, Yoga Nidra.',
      propsUsed: 'Office chair, bolster, foot rest.',
      frequencyDuration: '45 mins practice + ergonomics drills',
      status: 'Planned',
      therapistNotes: 'Coach patient on home and workplace lifting ergonomics.'
    },
    {
      weekNumber: 12,
      month: 3,
      title: 'Week 12: Discharge & Long-Term Maintenance Sadhana',
      asanasPractices: 'Self-guided 35-minute maintenance sequence: Tadasana, Supported Bhujangasana, Setu Bandhasana, Savasana.',
      pranayamaBreathing: 'Daily 15-minute Pranayama routine (Anulom Vilom + Bhramari).',
      propsUsed: 'Standard yoga mat, 1 strap, 1 block.',
      frequencyDuration: '35-45 mins daily independent maintenance',
      status: 'Planned',
      therapistNotes: 'Comprehensive final discharge assessment and home practice booklet handover.'
    }
  ];
}

export function createPatient(data: any) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const patientId = data.patient_id || getNextPatientId(data.centre || 'STY Vijayawada');

  const stmt = db.prepare(`
    INSERT INTO patients (
      patient_id, full_name, preferred_name, dob, age, gender, mobile, email, address,
      preferred_language, admission_date, emergency_name, emergency_relationship, emergency_phone,
      consultation_fee, consultation_date, monthly_fee, payment_records,
      centre, assigned_therapist, referred_by, status, occupation, work_pattern,
      physical_activity, chief_complaint, complaint_since_when, complaint_audio, complaint_transcript,
      complaint_region, complaint_side, episode_type, pain_score,
      medical_history, exam_data, investigation_attachments, therapy_plan, therapy_precautions, followup_records, notes, created_at, updated_at
    ) VALUES (
      @patient_id, @full_name, @preferred_name, @dob, @age, @gender, @mobile, @email, @address,
      @preferred_language, @admission_date, @emergency_name, @emergency_relationship, @emergency_phone,
      @consultation_fee, @consultation_date, @monthly_fee, @payment_records,
      @centre, @assigned_therapist, @referred_by, @status, @occupation, @work_pattern,
      @physical_activity, @chief_complaint, @complaint_since_when, @complaint_audio, @complaint_transcript,
      @complaint_region, @complaint_side, @episode_type, @pain_score,
      @medical_history, @exam_data, @investigation_attachments, @therapy_plan, @therapy_precautions, @followup_records, @notes, @created_at, @updated_at
    )
  `);

  const info = stmt.run({
    patient_id: patientId,
    full_name: data.full_name || '',
    preferred_name: data.preferred_name || '',
    dob: data.dob || '',
    age: data.age ? parseInt(String(data.age), 10) : null,
    gender: data.gender || 'Not specified',
    mobile: data.mobile || '',
    email: data.email || '',
    address: data.address || '',
    preferred_language: data.preferred_language || 'Telugu',
    admission_date: data.admission_date || now.split(' ')[0],
    emergency_name: data.emergency_name || '',
    emergency_relationship: data.emergency_relationship || '',
    emergency_phone: data.emergency_phone || '',
    consultation_fee: data.consultation_fee || '',
    consultation_date: data.consultation_date || '',
    monthly_fee: data.monthly_fee || '',
    payment_records: typeof data.payment_records === 'string' ? data.payment_records : JSON.stringify(data.payment_records || []),
    centre: data.centre || 'STY Vijayawada',
    assigned_therapist: data.assigned_therapist || 'Assigned on Assessment',
    referred_by: data.referred_by || '',
    status: data.status || 'New',
    occupation: data.occupation || '',
    work_pattern: data.work_pattern || '',
    physical_activity: data.physical_activity || '',
    chief_complaint: data.chief_complaint || '',
    complaint_since_when: data.complaint_since_when || '',
    complaint_audio: data.complaint_audio || '',
    complaint_transcript: data.complaint_transcript || '',
    complaint_region: data.complaint_region || 'General / Spine',
    complaint_side: data.complaint_side || 'Not specified',
    episode_type: data.episode_type || 'First episode',
    pain_score: typeof data.pain_score === 'number' ? data.pain_score : (parseInt(data.pain_score, 10) || 0),
    medical_history: typeof data.medical_history === 'string' ? data.medical_history : JSON.stringify(data.medical_history || {}),
    exam_data: typeof data.exam_data === 'string' ? data.exam_data : JSON.stringify(data.exam_data || {}),
    investigation_attachments: typeof data.investigation_attachments === 'string' ? data.investigation_attachments : JSON.stringify(data.investigation_attachments || []),
    therapy_plan: typeof data.therapy_plan === 'string' ? data.therapy_plan : JSON.stringify(data.therapy_plan || []),
    therapy_precautions: data.therapy_precautions || '',
    followup_records: typeof data.followup_records === 'string' ? data.followup_records : JSON.stringify(data.followup_records || []),
    notes: data.notes || '',
    created_at: now,
    updated_at: now
  });

  return getPatientById(Number(info.lastInsertRowid));
}

export function updatePatient(id: number | string, data: any) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);
  const existing = (getPatientById(id) || {}) as any;

  const stmt = db.prepare(`
    UPDATE patients SET
      full_name = @full_name,
      preferred_name = @preferred_name,
      dob = @dob,
      age = @age,
      gender = @gender,
      mobile = @mobile,
      email = @email,
      address = @address,
      preferred_language = @preferred_language,
      admission_date = @admission_date,
      emergency_name = @emergency_name,
      emergency_relationship = @emergency_relationship,
      emergency_phone = @emergency_phone,
      consultation_fee = @consultation_fee,
      consultation_date = @consultation_date,
      monthly_fee = @monthly_fee,
      payment_records = @payment_records,
      centre = @centre,
      assigned_therapist = @assigned_therapist,
      referred_by = @referred_by,
      status = @status,
      occupation = @occupation,
      work_pattern = @work_pattern,
      physical_activity = @physical_activity,
      chief_complaint = @chief_complaint,
      complaint_since_when = @complaint_since_when,
      complaint_audio = @complaint_audio,
      complaint_transcript = @complaint_transcript,
      complaint_region = @complaint_region,
      complaint_side = @complaint_side,
      episode_type = @episode_type,
      pain_score = @pain_score,
      medical_history = @medical_history,
      exam_data = @exam_data,
      investigation_attachments = @investigation_attachments,
      therapy_plan = @therapy_plan,
      therapy_precautions = @therapy_precautions,
      followup_records = @followup_records,
      notes = @notes,
      updated_at = @updated_at
    WHERE id = @id OR patient_id = @id
  `);

  stmt.run({
    id,
    full_name: data.full_name !== undefined ? data.full_name : (existing.full_name || ''),
    preferred_name: data.preferred_name !== undefined ? data.preferred_name : (existing.preferred_name || ''),
    dob: data.dob !== undefined ? data.dob : (existing.dob || ''),
    age: data.age !== undefined ? (data.age ? parseInt(String(data.age), 10) : null) : (existing.age ?? null),
    gender: data.gender !== undefined ? data.gender : (existing.gender || 'Not specified'),
    mobile: data.mobile !== undefined ? data.mobile : (existing.mobile || ''),
    email: data.email !== undefined ? data.email : (existing.email || ''),
    address: data.address !== undefined ? data.address : (existing.address || ''),
    preferred_language: data.preferred_language !== undefined ? data.preferred_language : (existing.preferred_language || 'Telugu'),
    admission_date: (data.admission_date && String(data.admission_date).trim() !== '')
      ? data.admission_date
      : (existing.admission_date || (existing.created_at ? existing.created_at.split(' ')[0] : now.split(' ')[0])),
    emergency_name: data.emergency_name !== undefined ? data.emergency_name : (existing.emergency_name || ''),
    emergency_relationship: data.emergency_relationship !== undefined ? data.emergency_relationship : (existing.emergency_relationship || ''),
    emergency_phone: data.emergency_phone !== undefined ? data.emergency_phone : (existing.emergency_phone || ''),
    consultation_fee: data.consultation_fee !== undefined ? data.consultation_fee : (existing.consultation_fee || ''),
    consultation_date: data.consultation_date !== undefined ? data.consultation_date : (existing.consultation_date || ''),
    monthly_fee: data.monthly_fee !== undefined ? data.monthly_fee : (existing.monthly_fee || ''),
    payment_records: data.payment_records !== undefined
      ? (typeof data.payment_records === 'string' ? data.payment_records : JSON.stringify(data.payment_records || []))
      : (typeof existing.payment_records === 'string' ? existing.payment_records : JSON.stringify(existing.payment_records || [])),
    centre: data.centre !== undefined ? data.centre : (existing.centre || 'STY Vijayawada'),
    assigned_therapist: data.assigned_therapist !== undefined ? data.assigned_therapist : (existing.assigned_therapist || 'Assigned on Assessment'),
    referred_by: data.referred_by !== undefined ? data.referred_by : (existing.referred_by || ''),
    status: (data.status !== undefined && data.status) ? data.status : (existing.status || 'Active'),
    occupation: data.occupation !== undefined ? data.occupation : (existing.occupation || ''),
    work_pattern: data.work_pattern !== undefined ? data.work_pattern : (existing.work_pattern || ''),
    physical_activity: data.physical_activity !== undefined ? data.physical_activity : (existing.physical_activity || ''),
    chief_complaint: data.chief_complaint !== undefined ? data.chief_complaint : (existing.chief_complaint || ''),
    complaint_since_when: data.complaint_since_when !== undefined ? data.complaint_since_when : (existing.complaint_since_when || ''),
    complaint_audio: data.complaint_audio !== undefined ? data.complaint_audio : (existing.complaint_audio || ''),
    complaint_transcript: data.complaint_transcript !== undefined ? data.complaint_transcript : (existing.complaint_transcript || ''),
    complaint_region: data.complaint_region !== undefined ? data.complaint_region : (existing.complaint_region || 'General / Spine'),
    complaint_side: data.complaint_side !== undefined ? data.complaint_side : (existing.complaint_side || 'Not specified'),
    episode_type: data.episode_type !== undefined ? data.episode_type : (existing.episode_type || 'First episode'),
    pain_score: data.pain_score !== undefined
      ? (typeof data.pain_score === 'number' ? data.pain_score : (parseInt(data.pain_score, 10) || 0))
      : (existing.pain_score ?? 0),
    medical_history: data.medical_history !== undefined
      ? (typeof data.medical_history === 'string' ? data.medical_history : JSON.stringify(data.medical_history || {}))
      : (typeof existing.medical_history === 'string' ? existing.medical_history : JSON.stringify(existing.medical_history || {})),
    exam_data: data.exam_data !== undefined
      ? (typeof data.exam_data === 'string' ? data.exam_data : JSON.stringify(data.exam_data || {}))
      : (typeof existing.exam_data === 'string' ? existing.exam_data : JSON.stringify(existing.exam_data || {})),
    investigation_attachments: data.investigation_attachments !== undefined
      ? (typeof data.investigation_attachments === 'string' ? data.investigation_attachments : JSON.stringify(data.investigation_attachments || []))
      : (typeof existing.investigation_attachments === 'string' ? existing.investigation_attachments : JSON.stringify(existing.investigation_attachments || [])),
    therapy_plan: data.therapy_plan !== undefined
      ? (typeof data.therapy_plan === 'string' ? data.therapy_plan : JSON.stringify(data.therapy_plan || []))
      : (typeof existing.therapy_plan === 'string' ? existing.therapy_plan : JSON.stringify(existing.therapy_plan || [])),
    therapy_precautions: data.therapy_precautions !== undefined ? data.therapy_precautions : (existing.therapy_precautions || ''),
    followup_records: data.followup_records !== undefined
      ? (typeof data.followup_records === 'string' ? data.followup_records : JSON.stringify(data.followup_records || []))
      : (typeof existing.followup_records === 'string' ? existing.followup_records : JSON.stringify(existing.followup_records || [])),
    notes: data.notes !== undefined ? data.notes : (existing.notes || ''),
    updated_at: now
  });

  return getPatientById(id);
}

export function deletePatient(id: number | string) {
  const result = db.prepare('DELETE FROM patients WHERE id = ? OR patient_id = ?').run(id, id);
  return result.changes > 0;
}

export function getStats() {
  const total = (db.prepare('SELECT count(*) as count FROM patients').get() as any).count;
  const activeCount = (db.prepare("SELECT count(*) as count FROM patients WHERE status = 'Active'").get() as any).count;
  const completedCount = (db.prepare("SELECT count(*) as count FROM patients WHERE status = 'Completed' OR status = 'Therapy Completed'").get() as any).count;
  const vjaCount = (db.prepare("SELECT count(*) as count FROM patients WHERE centre = 'STY Vijayawada'").get() as any).count;
  const hydCount = (db.prepare("SELECT count(*) as count FROM patients WHERE centre = 'STY Hyderabad'").get() as any).count;

  const painRow = db.prepare(`
    SELECT 
      AVG(pain_score) as avgScore,
      COUNT(pain_score) as countWithScore
    FROM patients 
    WHERE pain_score IS NOT NULL AND pain_score >= 0
  `).get() as any;

  const avgPainScore = painRow && painRow.avgScore != null
    ? Math.round(Number(painRow.avgScore) * 10) / 10
    : 0;

  const statusBreakdown = db.prepare('SELECT status, count(*) as count FROM patients GROUP BY status').all();
  const recentRegistrations = db.prepare('SELECT * FROM patients ORDER BY id DESC LIMIT 5').all();

  return {
    total,
    activeCount,
    completedCount,
    vjaCount,
    hydCount,
    avgPainScore,
    statusBreakdown,
    recentRegistrations
  };
}

export function verifyUserLogin(mobile: string, password: string) {
  if (!mobile || !password) return null;
  const rawMobile = mobile.trim();
  let digits = rawMobile.replace(/\D/g, '');
  if (digits.startsWith('91') && digits.length === 12) {
    digits = digits.substring(2);
  }

  // Retrieve all users to perform clean digit comparison
  const allUsers = db.prepare('SELECT id, mobile, password, name, role FROM users').all() as any[];
  const matchedUser = allUsers.find((u) => {
    let uDigits = u.mobile.replace(/\D/g, '');
    if (uDigits.startsWith('91') && uDigits.length === 12) {
      uDigits = uDigits.substring(2);
    }
    return uDigits === digits || u.mobile.trim() === rawMobile;
  });

  if (!matchedUser) return null;

  if (matchedUser.password.trim() === password.trim()) {
    const { password: _, ...userWithoutPassword } = matchedUser;
    return userWithoutPassword;
  }

  return null;
}

export function getAllExportData() {
  const allPatients = db.prepare('SELECT * FROM patients ORDER BY id ASC').all() as any[];
  const allUsers = db.prepare('SELECT id, name, mobile, role, created_at FROM users').all() as any[];

  // 1. Patients Sheet
  const patientsSheet = allPatients.map((p) => ({
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

  // 2. Assessments Sheet
  const assessmentsSheet: any[] = [];
  allPatients.forEach((p) => {
    let exam: any = {};
    let med: any = {};
    try { exam = p.exam_data ? JSON.parse(p.exam_data) : {}; } catch (e) {}
    try { med = p.medical_history ? JSON.parse(p.medical_history) : {}; } catch (e) {}

    assessmentsSheet.push({
      'Patient ID': p.patient_id,
      'Full Name': p.full_name,
      'Centre': p.centre || '',
      'Weight': exam.weight || '',
      'Height': exam.height || '',
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
      'Knee Varus/Valgus': exam.kneeVarusValgus || '',
      'Knee Fixed Flexion': exam.kneeFixedFlexion || '',
      'Knee Hyperextension': exam.kneeHyperextension || '',
      'Knee Range of Motion': exam.kneeRangeOfMotion || '',
      'Knee Tenderness': exam.kneeTenderness || '',
      'Investigations / Imaging': exam.investigations || '',
      'Hypertension Details': med.hypertension?.medications || med.htDmThyroidDetails || '',
      'Diabetes Details': med.diabetes?.medications || '',
      'Thyroid Details': med.thyroid?.medications || '',
      'Major Operations': med.hasMajorOperation ? med.majorOperationDetails : 'None',
      'Major Illness': med.hasMajorIllness ? med.majorIllnessDetails : 'None',
      'Radiating Pain': med.hasRadiatingPain ? med.radiatingPainDetails : 'None',
      'Numbness / Tingling': med.hasNumbness ? med.numbnessDetails : 'None'
    });
  });

  // 3. Progress Notes Sheet (Followups)
  const progressNotesSheet: any[] = [];
  allPatients.forEach((p) => {
    if (p.followup_records) {
      try {
        const records = JSON.parse(p.followup_records);
        if (Array.isArray(records)) {
          records.forEach((rec, idx) => {
            progressNotesSheet.push({
              'Note ID': rec.id || `FN-${p.patient_id}-${idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Followup Date': rec.date || rec.followup_date || '',
              'Therapist': rec.therapist || rec.therapist_name || p.assigned_therapist || '',
              'Pain Score (0-10)': rec.painScore ?? rec.pain_score ?? '',
              'Vitals': rec.vitals || '',
              'Patient Feedback': rec.feedback || '',
              'Clinical Notes': rec.clinicalNotes || rec.clinical_notes || '',
              'Practice Adherence': rec.practiceAdherence || '',
              'Next Followup Date': rec.nextFollowupDate || rec.next_followup_date || ''
            });
          });
        }
      } catch (e) {}
    }
  });

  // 4. Daily Treatment Logs Sheet (Therapy Plans)
  const treatmentLogsSheet: any[] = [];
  allPatients.forEach((p) => {
    if (p.therapy_plan) {
      try {
        const plans = JSON.parse(p.therapy_plan);
        if (Array.isArray(plans)) {
          plans.forEach((plan, idx) => {
            treatmentLogsSheet.push({
              'Log ID': `TL-${p.patient_id}-W${plan.weekNumber || plan.week || idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Week Number': plan.weekNumber || plan.week || idx + 1,
              'Month': plan.month || Math.ceil((plan.weekNumber || idx + 1) / 4),
              'Title / Theme': plan.title || plan.theme || '',
              'Asanas / Practices': plan.asanasPractices || plan.practices || '',
              'Pranayama / Breathing': plan.pranayamaBreathing || plan.pranayama || '',
              'Props Used': plan.propsUsed || plan.props || '',
              'Frequency / Duration': plan.frequencyDuration || plan.duration || '',
              'Status': plan.status || (plan.completed ? 'Completed' : 'Planned'),
              'Therapist Notes': plan.therapistNotes || plan.notes || '',
              'Precautions': p.therapy_precautions || ''
            });
          });
        }
      } catch (e) {}
    }
  });

  // 5. Discharge Summaries Sheet
  const dischargeSummariesSheet: any[] = [];
  allPatients.filter(p => p.status === 'Completed' || p.status === 'Closed' || p.status === 'Therapy Completed').forEach((p) => {
    dischargeSummariesSheet.push({
      'Patient ID': p.patient_id,
      'Patient Name': p.full_name,
      'Admission Date': p.admission_date || '',
      'Status': p.status,
      'Final Pain Score': p.pain_score ?? '',
      'Therapy Precautions': p.therapy_precautions || '',
      'Clinical Notes / Summary': p.notes || '',
      'Last Updated': p.updated_at || ''
    });
  });

  // 6. Receipts Sheet (Payment Records)
  const receiptsSheet: any[] = [];
  allPatients.forEach((p) => {
    if (p.payment_records) {
      try {
        const payments = JSON.parse(p.payment_records);
        if (Array.isArray(payments)) {
          payments.forEach((pay, idx) => {
            receiptsSheet.push({
              'Receipt No': pay.receiptNo || `REC-${p.patient_id}-${idx + 1}`,
              'Patient ID': p.patient_id,
              'Patient Name': p.full_name,
              'Payment Date': pay.date || pay.payment_date || '',
              'Amount (INR)': pay.amount || 0,
              'Payment Method': pay.method || pay.payment_method || 'Cash',
              'Notes': pay.notes || '',
              'Recorded By': pay.recorded_by || pay.received_by || '',
              'Status': pay.status || 'Paid'
            });
          });
        }
      } catch (e) {}
    }
  });

  // 7. Audit Logs / System Users Sheet
  const auditLogsSheet = allUsers.map((u) => ({
    'User ID': u.id,
    'Name': u.name,
    'Mobile': u.mobile,
    'Role': u.role,
    'Created At': u.created_at
  }));

  return {
    Patients: patientsSheet,
    Assessments: assessmentsSheet,
    'Progress Notes': progressNotesSheet,
    'Daily Treatment Logs': treatmentLogsSheet,
    'Discharge Summaries': dischargeSummariesSheet,
    Receipts: receiptsSheet,
    'Audit Logs': auditLogsSheet
  };
}

export default db;
