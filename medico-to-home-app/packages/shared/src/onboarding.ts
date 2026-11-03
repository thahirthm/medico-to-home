// What each kind of professional is asked when applying to join. The web form and the API both read this,
// so a required field is required in both places.

export type FieldType = "text" | "number" | "date" | "select" | "multi" | "textarea";

export interface Field {
  key: string;
  label: string;
  type: FieldType;
  options?: string[];
  required?: boolean;
  hint?: string;
  placeholder?: string;
}

export interface DocumentSpec {
  key: string;
  label: string;
  required?: boolean;
  hint?: string;
}

export interface Profession {
  label: string;
  category: string;
  group: "Doctors & specialists" | "Nursing" | "Therapy" | "Diagnostics & pharmacy" | "Care at home" | "Emergency";
  blurb: string;
  fields: Field[];
  documents: DocumentSpec[];
}

export const LANGUAGES = ["Malayalam", "English", "Hindi", "Tamil", "Arabic", "Kannada"];
export const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
export const TIME_SLOTS = ["Morning (7–12)", "Afternoon (12–4)", "Evening (4–8)", "Night (8–7)"];

const reg = (label: string, council: string[]): Field[] => [
  { key: "council", label: "Registered with", type: "select", options: council, required: true },
  { key: "registration_no", label, type: "text", required: true, placeholder: "As printed on your certificate" },
  { key: "registration_year", label: "Year of registration", type: "number", required: true, placeholder: "E.g. 2019" },
];

const qualification = (options: string[]): Field => ({ key: "qualification", label: "Highest qualification", type: "select", options, required: true });
const institution: Field = { key: "institution", label: "College / institute", type: "text", required: true };
const passingYear: Field = { key: "passing_year", label: "Year of passing", type: "number", required: true, placeholder: "E.g. 2018" };

const photo: DocumentSpec = { key: "photo", label: "Recent passport-size photo", required: true, hint: "Plain background, face clearly visible. Patients see this." };
const govtId: DocumentSpec = { key: "govt_id", label: "Government ID", required: true, hint: "Aadhaar, voter ID, passport or driving licence." };
const degree: DocumentSpec = { key: "degree", label: "Degree / diploma certificate", required: true };
const regCert: DocumentSpec = { key: "registration", label: "Council registration certificate", required: true };
const experience: DocumentSpec = { key: "experience", label: "Experience letter", hint: "From your current or last employer, if you have one." };
const police: DocumentSpec = { key: "police", label: "Police clearance certificate", hint: "Optional now. We help you get one during verification." };

const clinical = [photo, govtId, degree, regCert, experience, police];

export const PROFESSIONS: Profession[] = [
  {
    label: "Doctor", category: "doctor", group: "Doctors & specialists", blurb: "MBBS, MD and AYUSH doctors for home consultations.",
    fields: [
      qualification(["MBBS", "MD / MS", "DNB", "BAMS (Ayurveda)", "BHMS (Homoeopathy)", "BUMS (Unani)"]),
      { key: "specialisation", label: "Specialisation", type: "select", required: true, options: ["General practice", "Internal medicine", "Paediatrics", "Geriatrics", "Family medicine", "Palliative care", "Orthopaedics", "Dermatology", "Other"] },
      institution, passingYear,
      ...reg("Medical council registration number", ["Travancore-Cochin Medical Council (TCMC)", "National Medical Commission (NMC)", "Another state medical council", "Kerala Ayurveda / Homoeo / Unani council"]),
      { key: "visit_types", label: "Visits you can do", type: "multi", required: true, options: ["Home consultation", "Elderly check-up", "Post-discharge follow-up", "Palliative visit", "Death certification"] },
    ],
    documents: clinical,
  },
  {
    label: "Nurse", category: "nurse", group: "Nursing", blurb: "GNM, BSc and ANM nurses for care, injections and procedures.",
    fields: [
      qualification(["GNM", "BSc Nursing", "Post Basic BSc Nursing", "MSc Nursing", "ANM"]),
      institution, passingYear,
      ...reg("Nursing council registration number", ["Kerala Nurses and Midwives Council", "Indian Nursing Council", "Another state nursing council"]),
      { key: "skills", label: "Skills", type: "multi", required: true, options: ["Injections & IV", "Wound dressing", "Catheter care", "Ryles tube / NG feeding", "Tracheostomy care", "Post-operative care", "ICU / critical care", "Elderly care", "Mother & newborn care", "Palliative care"] },
      { key: "shift_types", label: "Work you want", type: "multi", required: true, options: ["Single visits", "12-hour shifts", "24-hour live-in"] },
    ],
    documents: clinical,
  },
  {
    label: "Physiotherapist", category: "physio", group: "Therapy", blurb: "BPT and MPT physiotherapists for rehab at home.",
    fields: [
      qualification(["BPT", "MPT"]),
      { key: "specialisation", label: "Specialisation", type: "select", required: true, options: ["Orthopaedic", "Neurological", "Cardio-respiratory", "Sports", "Paediatric", "Geriatric", "Women's health", "General"] },
      institution, passingYear,
      ...reg("Registration / membership number", ["Kerala State Allied and Healthcare Council", "Indian Association of Physiotherapists (IAP)", "Other"]),
      { key: "conditions", label: "Conditions you treat", type: "multi", required: true, options: ["Back & neck pain", "Knee & joint pain", "Stroke rehab", "Post-surgery rehab", "Sports injury", "Parkinson's", "Breathing exercises", "Fall prevention"] },
    ],
    documents: clinical,
  },
  {
    label: "Occupational Therapist", category: "ot", group: "Therapy", blurb: "Daily-living skills, hand therapy and developmental care.",
    fields: [
      qualification(["BOT", "MOT"]), institution, passingYear,
      ...reg("Registration number", ["Kerala State Allied and Healthcare Council", "All India Occupational Therapists' Association (AIOTA)", "Other"]),
      { key: "focus", label: "Main focus", type: "multi", required: true, options: ["Paediatric / developmental", "Stroke & neuro rehab", "Hand therapy", "Elderly & dementia", "Sensory integration"] },
    ],
    documents: clinical,
  },
  {
    label: "Speech Therapist", category: "speech", group: "Therapy", blurb: "Speech, language and swallowing therapy.",
    fields: [
      qualification(["BASLP", "MASLP", "Diploma (DHLS)"]), institution, passingYear,
      ...reg("RCI registration number", ["Rehabilitation Council of India (RCI)"]),
      { key: "focus", label: "Main focus", type: "multi", required: true, options: ["Children's speech delay", "Stammering", "Adult speech after stroke", "Swallowing (dysphagia)", "Autism support", "Hearing assessment"] },
    ],
    documents: clinical,
  },
  {
    label: "Psychologist", category: "psych", group: "Doctors & specialists", blurb: "Counselling and clinical psychology at home.",
    fields: [
      qualification(["MA / MSc Psychology", "M.Phil Clinical Psychology", "PsyD / PhD"]), institution, passingYear,
      ...reg("RCI registration number (clinical psychologists)", ["Rehabilitation Council of India (RCI)", "Not registered (counselling psychologist)"]),
      { key: "focus", label: "Main focus", type: "multi", required: true, options: ["Anxiety & depression", "Elderly & dementia", "Child & adolescent", "Family counselling", "Addiction", "Grief & palliative"] },
    ],
    documents: clinical,
  },
  {
    label: "Dietitian", category: "diet", group: "Doctors & specialists", blurb: "Diet plans for diabetes, kidney care, weight and recovery.",
    fields: [
      qualification(["BSc Nutrition & Dietetics", "MSc Nutrition & Dietetics", "PG Diploma in Dietetics"]), institution, passingYear,
      { key: "certification", label: "Registered Dietitian (IDA) number", type: "text", hint: "Leave empty if you are not an RD yet." },
      { key: "focus", label: "Main focus", type: "multi", required: true, options: ["Diabetes", "Kidney disease", "Heart health", "Weight management", "Pregnancy & child", "Tube feeding plans"] },
    ],
    documents: [photo, govtId, degree, experience, police],
  },
  {
    label: "Lab Technician", category: "lab", group: "Diagnostics & pharmacy", blurb: "Home sample collection for blood and other tests.",
    fields: [
      qualification(["DMLT", "BSc MLT", "MSc MLT"]), institution, passingYear,
      ...reg("Paramedical council registration number", ["Kerala State Paramedical Council", "Kerala State Allied and Healthcare Council", "Other"]),
      { key: "samples", label: "Samples you collect", type: "multi", required: true, options: ["Venous blood", "Paediatric blood", "Urine & stool", "Swabs", "ECG at home"] },
      { key: "partner_lab", label: "Lab you are attached to", type: "text", hint: "Optional. The lab that processes your samples." },
    ],
    documents: clinical,
  },
  {
    label: "Pharmacist", category: "pharma", group: "Diagnostics & pharmacy", blurb: "Medicine reviews and home delivery support.",
    fields: [
      qualification(["D.Pharm", "B.Pharm", "Pharm.D", "M.Pharm"]), institution, passingYear,
      ...reg("Pharmacy council registration number", ["Kerala State Pharmacy Council", "Another state pharmacy council"]),
    ],
    documents: clinical,
  },
  {
    label: "Caregiver", category: "caregiver", group: "Care at home", blurb: "Day-to-day help for elderly and bedridden patients.",
    fields: [
      { key: "training", label: "Training", type: "select", required: true, options: ["Certified caregiver course", "Hospital / home nursing assistant experience", "No formal training"] },
      { key: "skills", label: "Skills", type: "multi", required: true, options: ["Bathing & hygiene", "Feeding", "Lifting & moving", "Bedsore prevention", "Dementia care", "Medicine reminders", "Walking support", "Cooking simple meals"] },
      { key: "shift_types", label: "Work you want", type: "multi", required: true, options: ["Day shift", "Night shift", "24-hour live-in"] },
      { key: "gender_pref", label: "Patients you are comfortable caring for", type: "select", required: true, options: ["Any", "Women only", "Men only"] },
    ],
    documents: [photo, govtId, { key: "training", label: "Training certificate", hint: "If you have one." }, experience, police],
  },
  {
    label: "Home Health Aide", category: "aide", group: "Care at home", blurb: "Trained aides for personal care and basic monitoring.",
    fields: [
      { key: "training", label: "Training", type: "select", required: true, options: ["GDA / Home Health Aide course", "Nursing assistant course", "On-the-job training"] },
      { key: "skills", label: "Skills", type: "multi", required: true, options: ["Vitals (BP, sugar, SpO2)", "Bathing & hygiene", "Feeding", "Lifting & moving", "Catheter & diaper care", "Medicine reminders"] },
      { key: "shift_types", label: "Work you want", type: "multi", required: true, options: ["Day shift", "Night shift", "24-hour live-in"] },
    ],
    documents: [photo, govtId, { key: "training", label: "Training certificate", required: true }, experience, police],
  },
  {
    label: "Baby Care Attendant", category: "baby", group: "Care at home", blurb: "Newborn and mother care after delivery.",
    fields: [
      { key: "training", label: "Training", type: "select", required: true, options: ["Certified newborn care course", "Hospital maternity ward experience", "Experienced, no formal training"] },
      { key: "skills", label: "Skills", type: "multi", required: true, options: ["Newborn bathing & massage", "Breastfeeding support", "Mother's post-delivery care", "Sleep routines", "Twins", "Premature babies"] },
      { key: "shift_types", label: "Work you want", type: "multi", required: true, options: ["Day shift", "Night shift", "24-hour live-in"] },
    ],
    documents: [photo, govtId, { key: "training", label: "Training certificate", hint: "If you have one." }, experience, police],
  },
  {
    label: "Ambulance Driver", category: "ambulance", group: "Emergency", blurb: "Drivers with their own or a partner ambulance.",
    fields: [
      { key: "licence_no", label: "Driving licence number", type: "text", required: true },
      { key: "licence_valid_till", label: "Licence valid till", type: "date", required: true },
      { key: "badge", label: "Holds a transport / heavy vehicle badge", type: "select", required: true, options: ["Yes", "No"] },
      { key: "vehicle", label: "Ambulance", type: "select", required: true, options: ["I own one", "Partner / employer ambulance", "I need one assigned"] },
      { key: "vehicle_type", label: "Ambulance type", type: "select", options: ["Patient transport (no oxygen)", "Basic life support (BLS)", "Advanced life support (ALS)", "Mortuary van"] },
      { key: "vehicle_no", label: "Vehicle registration number", type: "text", placeholder: "E.g. KL 11 AB 1234" },
      { key: "first_aid", label: "First aid / BLS trained", type: "select", required: true, options: ["Yes", "No"] },
    ],
    documents: [photo, govtId, { key: "licence", label: "Driving licence", required: true }, { key: "vehicle_rc", label: "Vehicle RC and fitness certificate", hint: "Only if you own the ambulance." }, police],
  },
  {
    label: "Paramedic", category: "paramedic", group: "Emergency", blurb: "EMTs for ambulances and emergency response.",
    fields: [
      qualification(["EMT-Basic", "EMT-Advanced", "BSc Emergency Medical Technology", "Diploma in Emergency Care"]), institution, passingYear,
      { key: "life_support", label: "Life support certifications", type: "multi", required: true, options: ["BLS", "ACLS", "PALS", "PHTLS / trauma"] },
      ...reg("Registration number", ["Kerala State Allied and Healthcare Council", "Kerala State Paramedical Council", "Other"]),
    ],
    documents: [photo, govtId, degree, { key: "life_support", label: "BLS / ACLS certificate", required: true }, experience, police],
  },
];

// Asked of everyone, before and after the profession-specific part.
export const PERSONAL_FIELDS: Field[] = [
  { key: "dob", label: "Date of birth", type: "date", required: true },
  { key: "locality", label: "Your area", type: "select", required: true, hint: "The area you live in or start visits from." },
  { key: "address", label: "Full address", type: "textarea", required: true },
  { key: "languages", label: "Languages you speak", type: "multi", options: LANGUAGES, required: true },
  { key: "emergency_contact", label: "Emergency contact (name and number)", type: "text", required: true },
];

export const WORK_FIELDS: Field[] = [
  { key: "experience_years", label: "Years of experience", type: "number", required: true },
  { key: "workplace", label: "Current or last workplace", type: "text", hint: "Hospital, clinic or agency. Optional." },
  { key: "days", label: "Days you can work", type: "multi", options: DAYS, required: true },
  { key: "slots", label: "Times you can work", type: "multi", options: TIME_SLOTS, required: true },
  { key: "radius_km", label: "How far you will travel", type: "select", options: ["5 km", "8 km", "12 km", "20 km"], required: true },
  { key: "expected_fee", label: "Your fee per visit (₹)", type: "number", required: true, hint: "We take 12% from this. You can change it later." },
  { key: "vehicle", label: "How you travel", type: "select", options: ["Two-wheeler", "Car", "Public transport"], required: true },
  { key: "bio", label: "About you", type: "textarea", hint: "2–3 lines patients will read on your profile. Optional." },
];

export const GENDERS = ["Female", "Male", "Other"];

export const professionByLabel = (label: string) => PROFESSIONS.find((p) => p.label === label);

export type Details = Record<string, string | string[]>;
export interface ApplicationDocument { kind: string; fileName: string; path: string; size: number }

const empty = (v: string | string[] | undefined) => (Array.isArray(v) ? v.length === 0 : !v || !String(v).trim());

/** Labels of what is still missing. Empty means the application is complete. */
export function missingForApplication(professionLabel: string, details: Details, documents: ApplicationDocument[]): string[] {
  const profession = professionByLabel(professionLabel);
  if (!profession) return ["Profession"];
  const missing = [...PERSONAL_FIELDS, ...profession.fields, ...WORK_FIELDS].filter((f) => f.required && empty(details[f.key])).map((f) => f.label);
  const have = new Set(documents.map((d) => d.kind));
  return [...missing, ...profession.documents.filter((d) => d.required && !have.has(d.key)).map((d) => d.label)];
}
