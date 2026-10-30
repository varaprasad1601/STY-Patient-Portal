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

db.prepare("UPDATE patients SET assigned_therapist = REPLACE(assigned_therapist, 'Dr. ', '') WHERE assigned_therapist LIKE 'Dr.%'").run();
db.prepare("UPDATE patients SET referred_by = REPLACE(referred_by, 'Dr. ', '') WHERE referred_by LIKE 'Dr.%'").run();

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

// Migration: Seed customized 12-Week Therapy Plan and Precautions for Lakshmi Narayana Somayajula if null
try {
  const lakshmiPlan = JSON.stringify([
    {
      week: 1,
      month: 1,
      theme: "Phase 1: Gentle Mobilization & Joint Decompression",
      practices: "Chair-seated Sukshma Vyayama, gentle ankle pumps (Gulpha Naman), seated knee extension with heel slide on smooth surface.",
      pranayama: "Diaphragmatic Breathing, Anulom Vilom (slow rhythmic breathing for HTN regulation, 5-7 mins)",
      props: "Comfortable sturdy chair with armrest, yoga mat under feet, soft towel roll",
      duration: "30-40 mins / 5 days a week",
      notes: "Ensure zero joint pain during knee extension. Do not force full extension if 5 deg lag causes discomfort.",
      completed: true
    },
    {
      week: 2,
      month: 1,
      theme: "Phase 1: Isometric Quadriceps Activation",
      practices: "Isometric quad sets with towel roll under knee in supine, seated leg lifts with 3-second hold, supported Dandasana with wall support.",
      pranayama: "Anulom Vilom, Sheetali Pranayama for cooling and reducing systemic inflammatory sensation",
      props: "Yoga bolster, rolled towel, non-slip mat, wall support",
      duration: "35-40 mins / 5 days a week",
      notes: "Focus on vastus medialis obliquus (VMO) isometric firing. Maintain regular breathing during muscle holds.",
      completed: true
    },
    {
      week: 3,
      month: 1,
      theme: "Phase 1: Hamstring & Calf Flexibility without Knee Strain",
      practices: "Supported Supta Padangusthasana with strap (gentle hamstring release with opposite knee bent), gentle seated forward reach from chair.",
      pranayama: "Bhramari Pranayama (calming nervous system and pain tolerance), Deep abdominal breathing",
      props: "Cotton yoga strap, chair, bolster",
      duration: "40 mins / 5 days a week",
      notes: "Keep spine neutral. Never lock knee into hyperextension.",
      completed: false
    },
    {
      week: 4,
      month: 1,
      theme: "Phase 1: Pelvic Stability & Adductor Engagement",
      practices: "Seated block squeeze between knees (gentle adductor strengthening), supine pelvic tilts, gentle ankle rotations.",
      pranayama: "Anulom Vilom, Ujjayi (soft, relaxing)",
      props: "Foam yoga block, yoga mat, head pillow",
      duration: "40 mins / 5 days a week",
      notes: "Evaluation check-in at end of Month 1: assess knee crepitus and stair-climbing comfort.",
      completed: false
    },
    {
      week: 5,
      month: 2,
      theme: "Phase 2: Closed Kinetic Chain & Balance Progression",
      practices: "Chair-supported semi-squats (shallow 30-degree knee bend only), standing weight-shifts holding wall bar, heel-to-toe balance drill.",
      pranayama: "Nadi Shodhana with gentle breath awareness, Sectional Breathing (Vibhagiya Pranayama)",
      props: "Wall bar or sturdy table, 2 foam blocks",
      duration: "40-45 mins / 5 days a week",
      notes: "Knees must not travel forward past toes during shallow knee bends.",
      completed: false
    },
    {
      week: 6,
      month: 2,
      theme: "Phase 2: Hip Abductor Strengthening & Patellar Tracking",
      practices: "Side-lying leg lifts (mild abduction with bolster support), seated resistance band knee extensions, supported Tadasana alignment.",
      pranayama: "Anulom Vilom (10 mins), Om chanting for mental relaxation and stress reduction",
      props: "Light resistance loop band, bolster, chair",
      duration: "45 mins / 5 days a week",
      notes: "Ensure alignment of second toe, patella, and anterior superior iliac spine (ASIS).",
      completed: false
    },
    {
      week: 7,
      month: 2,
      theme: "Phase 2: Gluteal Activation & Spinal Alignment",
      practices: "Supported Setu Bandhasana (bridge pose with yoga block between knees and bolster under sacrum), gentle seated twisting (Bharadvajasana on chair).",
      pranayama: "Deep Diaphragmatic breathing with mindful exhalation",
      props: "Yoga bolster, yoga block, chair",
      duration: "45 mins / 5 days a week",
      notes: "Avoid excessive lumbar hyperextension; focus on gluteal engagement.",
      completed: false
    },
    {
      week: 8,
      month: 2,
      theme: "Phase 2: Functional Sit-to-Stand Retraining",
      practices: "Supported sit-to-stand from elevated chair with arms crossed, standing calf raises with hand support, gentle balance posture (Supported Vrikshasana at ankle).",
      pranayama: "Anulom Vilom and Ujjayi breath",
      props: "Sturdy chair, wall support",
      duration: "45 mins / 5 days a week",
      notes: "Month 2 Clinical Review: reassess VAS pain scale (target reduction from 6/10 to 3/10).",
      completed: false
    },
    {
      week: 9,
      month: 3,
      theme: "Phase 3: Functional Strength & Proprioceptive Drills",
      practices: "Low-step step-up and step-down drills (2-inch platform) holding railing, tandem standing balance, active seated leg extensions with 5-second hold.",
      pranayama: "Anulom Vilom, Bhramari Pranayama (10 rounds)",
      props: "Low wooden stepper (2-3 inches), handrail, yoga mat",
      duration: "45 mins / 5 days a week",
      notes: "Step drills must be completely pain-free with slow eccentric control.",
      completed: false
    },
    {
      week: 10,
      month: 3,
      theme: "Phase 3: End-Range Stability & Gentle Hip Openers",
      practices: "Chair-supported Warrior I (Virabhadrasana I with hands on chair back, high lunge), supported Supta Baddha Konasana with bolsters under both thighs.",
      pranayama: "Nadi Shodhana Pranayama (10 mins)",
      props: "2 bolsters, chair, eye pillow",
      duration: "45 mins / 5 days a week",
      notes: "No direct floor sitting. Thighs must be fully supported by bolsters.",
      completed: false
    },
    {
      week: 11,
      month: 3,
      theme: "Phase 3: Independent Daily Living Integration",
      practices: "Dynamic walking coordination with breath synchronization, standing postural alignment checks, self-administered isometric maintenance protocol.",
      pranayama: "Diaphragmatic breathing and cooling Sheetali Pranayama",
      props: "Yoga mat, resistance band",
      duration: "40-45 mins / 5 days a week",
      notes: "Patient reports confidence in stair climbing and 30-minute independent walking.",
      completed: false
    },
    {
      week: 12,
      month: 3,
      theme: "Phase 3: Discharge Maintenance & Home Practice Protocol",
      practices: "Consolidated 25-minute Daily Home Yoga Therapy routine: Chair quad sets, hamstring strap stretch, supported bridge, and deep relaxation in supported Savasana.",
      pranayama: "Anulom Vilom (10 mins) and Om meditation",
      props: "Yoga mat, strap, bolster for knee support during relaxation",
      duration: "30 mins daily maintenance",
      notes: "Final outcome evaluation: WOMAC score improvement, painless knee extension, maintenance schedule handed over.",
      completed: false
    }
  ]);

  const lakshmiPrecautions = `• Strictly avoid sitting on the floor or folding knees deeply (Contraindicated: Vajrasana, Padmasana, deep squats).\n• Do not perform high-impact jogging, jumping, or fast unassisted stair descent.\n• All transitions from sitting to standing must use armrest or chair support.\n• Use bolster or towel roll under knees during supine postures to prevent knee hyperextension.\n• Maintain continuous rhythmic breathing; avoid breath holding (Kumbhaka) to prevent blood pressure spikes (Hypertension).\n• Apply warm fomentation or therapeutic herbal compress if mild stiffness occurs after morning practice.`;

  db.prepare(`
    UPDATE patients
    SET therapy_plan = @plan,
        therapy_precautions = @precautions,
        admission_date = COALESCE(admission_date, '2026-06-22'),
        consultation_fee = COALESCE(consultation_fee, '500'),
        consultation_date = COALESCE(consultation_date, '2026-06-22'),
        monthly_fee = COALESCE(monthly_fee, '3500')
    WHERE (full_name LIKE '%Lakshmi Narayana%' OR patient_id = 'P0003' OR patient_id = 'STY-VJA-2026-0003')
      AND (therapy_plan IS NULL OR therapy_plan = '' OR therapy_precautions IS NULL)
  `).run({ plan: lakshmiPlan, precautions: lakshmiPrecautions });
} catch (err: any) {
  console.error('Error migrating Lakshmi Narayana therapy plan:', err);
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

// Migrate patient IDs to P0001 format
const allPatients = db.prepare("SELECT id FROM patients ORDER BY id ASC").all() as { id: number }[];
allPatients.forEach((p, idx) => {
  const newId = `P${String(idx + 1).padStart(4, '0')}`;
  db.prepare("UPDATE patients SET patient_id = ? WHERE id = ?").run(newId, p.id);
});

// Migrate Assessment Pending or Therapy Completed to Completed
db.prepare("UPDATE patients SET status = 'Completed' WHERE status = 'Assessment Pending' OR status = 'Therapy Completed'").run();

export function getNextPatientId(centre: string): string {
  const lastPatient = db.prepare(`
    SELECT patient_id FROM patients 
    ORDER BY id DESC LIMIT 1
  `).get() as { patient_id: string } | undefined;

  let nextSeq = 1;
  if (lastPatient && lastPatient.patient_id) {
    const cleaned = lastPatient.patient_id.replace(/\D/g, '');
    const lastSeq = parseInt(cleaned, 10);
    if (!isNaN(lastSeq)) {
      nextSeq = lastSeq + 1;
    }
  }

  return `P${String(nextSeq).padStart(4, '0')}`;
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
    therapy_plan: typeof data.therapy_plan === 'string' ? data.therapy_plan : JSON.stringify(data.therapy_plan || getDefaultTherapyPlan()),
    therapy_precautions: data.therapy_precautions || 'Avoid heavy forward bending, abrupt twisting, lifting loads > 5 kg, and prolonged unsupported sitting.',
    followup_records: typeof data.followup_records === 'string' ? data.followup_records : JSON.stringify(data.followup_records || []),
    notes: data.notes || '',
    created_at: now,
    updated_at: now
  });

  return getPatientById(Number(info.lastInsertRowid));
}

export function updatePatient(id: number | string, data: any) {
  const now = new Date().toISOString().replace('T', ' ').substring(0, 19);

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
    full_name: data.full_name,
    preferred_name: data.preferred_name || '',
    dob: data.dob || '',
    age: data.age ? parseInt(String(data.age), 10) : null,
    gender: data.gender || 'Not specified',
    mobile: data.mobile || '',
    email: data.email || '',
    address: data.address || '',
    preferred_language: data.preferred_language || 'Telugu',
    admission_date: data.admission_date || '',
    emergency_name: data.emergency_name || '',
    emergency_relationship: data.emergency_relationship || '',
    emergency_phone: data.emergency_phone || '',
    consultation_fee: data.consultation_fee || '',
    consultation_date: data.consultation_date || '',
    monthly_fee: data.monthly_fee || '',
    payment_records: typeof data.payment_records === 'string' ? data.payment_records : JSON.stringify(data.payment_records || []),
    centre: data.centre,
    assigned_therapist: data.assigned_therapist,
    referred_by: data.referred_by || '',
    status: data.status,
    occupation: data.occupation || '',
    work_pattern: data.work_pattern || '',
    physical_activity: data.physical_activity || '',
    chief_complaint: data.chief_complaint || '',
    complaint_since_when: data.complaint_since_when || '',
    complaint_audio: data.complaint_audio || '',
    complaint_transcript: data.complaint_transcript || '',
    complaint_region: data.complaint_region || '',
    complaint_side: data.complaint_side || '',
    episode_type: data.episode_type || '',
    pain_score: typeof data.pain_score === 'number' ? data.pain_score : (parseInt(data.pain_score, 10) || 0),
    medical_history: typeof data.medical_history === 'string' ? data.medical_history : JSON.stringify(data.medical_history || {}),
    exam_data: typeof data.exam_data === 'string' ? data.exam_data : JSON.stringify(data.exam_data || {}),
    investigation_attachments: typeof data.investigation_attachments === 'string' ? data.investigation_attachments : JSON.stringify(data.investigation_attachments || []),
    therapy_plan: typeof data.therapy_plan === 'string' ? data.therapy_plan : JSON.stringify(data.therapy_plan || []),
    therapy_precautions: data.therapy_precautions || '',
    followup_records: typeof data.followup_records === 'string' ? data.followup_records : JSON.stringify(data.followup_records || []),
    notes: data.notes || '',
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

  const statusBreakdown = db.prepare('SELECT status, count(*) as count FROM patients GROUP BY status').all();
  const recentRegistrations = db.prepare('SELECT * FROM patients ORDER BY id DESC LIMIT 5').all();

  return {
    total,
    activeCount,
    completedCount,
    vjaCount,
    hydCount,
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

export default db;
