// Medico registration: the 8-step profile a professional fills in after signing in.
// Every field is optional. Shared by the registration screens and the API.

import { councilsFor } from "./councils";

export const MEDICO_ROLES = [
  "Doctor", "Nurse", "Pharmacist", "Physiotherapist", "Occupational Therapist", "Speech & Language Therapist", "Clinical Psychologist",
  "Psychologist", "Dietitian", "Lab Technician", "Caregiver", "Home Health Aide", "Baby Care Attendant", "Ambulance Driver", "Paramedic",
] as const;
export type MedicoRole = (typeof MEDICO_ROLES)[number];

// Roles saved before the list grew, and what they are called now.
const LEGACY_ROLES: Record<string, string> = { Caretaker: "Caregiver", "Lab technician": "Lab Technician", "Other therapist": "Occupational Therapist" };

/** The catalogue category each role is listed under once approved. */
export const MEDICO_CATEGORY: Record<string, string> = {
  Doctor: "doctor", Nurse: "nurse", Pharmacist: "pharma", Physiotherapist: "physio", "Occupational Therapist": "ot",
  "Speech & Language Therapist": "speech", "Clinical Psychologist": "psych", Psychologist: "psych", Dietitian: "diet",
  "Lab Technician": "lab", Caregiver: "caregiver", "Home Health Aide": "aide", "Baby Care Attendant": "baby",
  "Ambulance Driver": "ambulance", Paramedic: "paramedic",
  Caretaker: "caregiver", "Lab technician": "lab", "Other therapist": "ot",
};

/** A role as the current form names it, so profiles saved with an older role still load. */
export const medicoRole = (role: string) => LEGACY_ROLES[role] ?? role;

/** Renames an old role and drops a council that does not belong to the role. */
export function normaliseMedico<T extends Pick<MedicoProfile, "role" | "council">>(p: T): T {
  const role = medicoRole(p.role);
  return { ...p, role, council: p.council && councilsFor(role).includes(p.council) ? p.council : "" };
}

/**
 * Suggestions for the specialisation and highest-qualification fields, per role.
 * They are suggestions only: a Medico can type anything that is not on the list.
 */
export const MEDICO_SUGGESTIONS: Record<MedicoRole, { specialisations: string[]; qualifications: string[] }> = {
  Doctor: {
    specialisations: [
      "General medicine", "Family medicine", "Internal medicine", "Geriatrics", "Paediatrics", "Palliative care", "Cardiology",
      "Pulmonology", "Neurology", "Nephrology", "Diabetes & endocrinology", "Orthopaedics", "Dermatology", "Psychiatry",
      "Obstetrics & gynaecology", "General surgery", "ENT", "Ophthalmology", "Physical medicine & rehabilitation",
      "Emergency medicine", "Anaesthesiology", "Ayurveda", "Homoeopathy", "Unani", "Siddha",
    ],
    qualifications: [
      "MBBS", "MBBS, MD", "MBBS, MS", "MBBS, DNB", "MBBS, MD, DM", "MBBS, MS, MCh", "MBBS, Diploma (DCH / DGO / DA / DPM)",
      "MBBS, MRCP / MRCGP / FRCS", "BAMS (Ayurveda)", "MD (Ayurveda)", "BHMS (Homoeopathy)", "MD (Homoeopathy)", "BUMS (Unani)", "BSMS (Siddha)",
    ],
  },
  Nurse: {
    specialisations: [
      "General nursing", "Home care nursing", "Critical care / ICU", "Emergency & trauma", "Post-operative care", "Wound & ostomy care",
      "Geriatric nursing", "Palliative & hospice care", "Paediatric nursing", "Neonatal (NICU)", "Obstetrics & midwifery", "Oncology nursing",
      "Cardiac nursing", "Dialysis & renal care", "Psychiatric nursing", "Diabetes care", "Infection control",
    ],
    qualifications: ["ANM", "GNM", "BSc Nursing", "Post Basic BSc Nursing", "MSc Nursing", "Nurse Practitioner in Critical Care (NPCC)", "PhD Nursing"],
  },
  Pharmacist: {
    specialisations: [
      "Community & retail pharmacy", "Hospital pharmacy", "Clinical pharmacy", "Medicine review & counselling", "Elderly medicine management",
      "Diabetes care", "Cancer (oncology) pharmacy", "Ayurveda pharmacy",
    ],
    qualifications: ["D.Pharm", "B.Pharm", "Pharm.D", "Pharm.D (Post Baccalaureate)", "M.Pharm", "D.Pharm (Ayurveda)"],
  },
  Physiotherapist: {
    specialisations: [
      "Orthopaedic", "Neurological", "Stroke rehabilitation", "Spine & back pain", "Cardio-respiratory", "ICU physiotherapy", "Sports",
      "Paediatric", "Geriatric", "Women's health", "Post-surgical rehabilitation", "Manual therapy", "Palliative",
    ],
    qualifications: [
      "BPT", "MPT (Orthopaedics)", "MPT (Neurology)", "MPT (Cardio-respiratory)", "MPT (Sports)", "MPT (Paediatrics)",
      "MPT (Community)", "Diploma in Physiotherapy", "PhD Physiotherapy",
    ],
  },
  "Occupational Therapist": {
    specialisations: [
      "Paediatric & developmental", "Sensory integration", "Autism support", "Stroke & neuro rehabilitation", "Hand therapy",
      "Elderly & dementia", "Mental health", "Daily-living skills", "Home modification", "Splinting", "Learning difficulties",
    ],
    qualifications: ["BOT", "MOT (Paediatrics)", "MOT (Neurology)", "MOT (Hand rehabilitation)", "MOT (Mental health)", "Diploma in Occupational Therapy", "PhD Occupational Therapy"],
  },
  "Speech & Language Therapist": {
    specialisations: [
      "Children's speech delay", "Language disorders", "Stammering & fluency", "Voice disorders", "Speech after stroke (aphasia)",
      "Swallowing (dysphagia)", "Autism communication", "Hearing assessment & aids", "Cochlear implant rehabilitation", "Alternative communication (AAC)",
    ],
    qualifications: ["BASLP", "MASLP", "MSc Speech-Language Pathology", "MSc Audiology", "Diploma in Hearing, Language & Speech (DHLS)", "PhD Speech & Hearing"],
  },
  "Clinical Psychologist": {
    specialisations: [
      "Adult mental health", "Child & adolescent", "Anxiety & depression", "Neuropsychology", "Psychological assessment",
      "Learning disability assessment", "Addiction & de-addiction", "Trauma & PTSD", "Elderly & dementia", "Rehabilitation psychology",
    ],
    qualifications: ["M.Phil Clinical Psychology (RCI)", "Professional Diploma in Clinical Psychology (RCI)", "PsyD Clinical Psychology", "PhD Clinical Psychology"],
  },
  Psychologist: {
    specialisations: [
      "Counselling", "Anxiety & stress", "Family & couples", "Child & adolescent", "Elderly & caregiver support", "Grief & palliative",
      "Addiction & de-addiction", "Career & student counselling", "Workplace wellbeing",
    ],
    qualifications: [
      "BA / BSc Psychology", "MA / MSc Psychology", "MA / MSc Counselling Psychology", "MA / MSc Applied Psychology",
      "PG Diploma in Counselling", "PG Diploma in Rehabilitation Psychology", "PhD Psychology",
    ],
  },
  Dietitian: {
    specialisations: [
      "Diabetes", "Kidney (renal) nutrition", "Heart health", "Weight management", "Clinical nutrition", "Pregnancy & lactation",
      "Child nutrition", "Elderly nutrition", "Tube & enteral feeding", "Cancer nutrition", "Liver & digestive health", "Sports nutrition",
    ],
    qualifications: [
      "BSc Nutrition & Dietetics", "BSc Home Science (Food & Nutrition)", "MSc Nutrition & Dietetics", "MSc Clinical Nutrition",
      "MSc Food Science & Nutrition", "PG Diploma in Dietetics", "Registered Dietitian (RD)", "Certified Diabetes Educator (CDE)",
    ],
  },
  "Lab Technician": {
    specialisations: [
      "Home sample collection", "Phlebotomy", "Paediatric sample collection", "Clinical biochemistry", "Haematology", "Microbiology",
      "Pathology", "Serology & immunology", "ECG at home", "Blood bank", "Histopathology",
    ],
    qualifications: ["DMLT", "BSc MLT", "MSc MLT", "BVoc Medical Lab Technology", "Certificate in Phlebotomy", "Diploma in ECG Technology"],
  },
  Caregiver: {
    specialisations: [
      "Elderly care", "Bedridden patient care", "Dementia & Alzheimer's care", "Stroke & paralysis care", "Post-surgery recovery",
      "Palliative support", "Disability care", "Mobility & walking support", "Feeding support", "Companionship",
    ],
    qualifications: [
      "Certified caregiver course", "Geriatric care assistant course", "General Duty Assistant (GDA)", "Home nursing assistant course",
      "First aid certificate", "Plus Two", "SSLC", "Experienced, no formal training",
    ],
  },
  "Home Health Aide": {
    specialisations: [
      "Personal care & hygiene", "Vitals monitoring", "Elderly care", "Post-hospital care", "Catheter & diaper care",
      "Bedsore prevention", "Mobility & transfers", "Medicine reminders", "Palliative support",
    ],
    qualifications: [
      "Home Health Aide certificate", "General Duty Assistant (GDA)", "Nursing assistant course", "Patient care assistant course",
      "Geriatric care course", "First aid / BLS certificate", "On-the-job training",
    ],
  },
  "Baby Care Attendant": {
    specialisations: [
      "Newborn care", "Premature baby care", "Twins", "Mother's post-delivery care", "Breastfeeding support", "Baby massage & bathing",
      "Sleep routines", "Traditional postnatal care",
    ],
    qualifications: [
      "Certified newborn care course", "Postnatal care course", "Nanny / childcare certificate", "ANM", "Hospital maternity ward experience",
      "First aid certificate", "Experienced, no formal training",
    ],
  },
  "Ambulance Driver": {
    specialisations: [
      "Patient transport", "Basic life support (BLS) ambulance", "Advanced life support (ALS) ambulance", "Emergency response",
      "Hospital-to-hospital transfer", "Long-distance transfer", "Neonatal ambulance", "Mortuary van",
    ],
    qualifications: [
      "Driving licence with transport badge", "Heavy vehicle driving licence", "Ambulance driver training", "BLS certificate",
      "First aid certificate", "Emergency driving course",
    ],
  },
  Paramedic: {
    specialisations: [
      "Emergency medical services", "Basic life support", "Advanced life support", "Trauma care", "Cardiac emergencies",
      "Critical care transport", "Neonatal & paediatric transport", "Disaster response", "Event medical cover",
    ],
    qualifications: [
      "EMT-Basic", "EMT-Advanced", "BSc Emergency Medical Technology", "Diploma in Emergency Care Technology",
      "BSc Critical Care Technology", "Diploma in Paramedical Sciences", "BLS / ACLS certified",
    ],
  },
};

export const KERALA_DISTRICTS = [
  "Thiruvananthapuram", "Kollam", "Pathanamthitta", "Alappuzha", "Kottayam", "Idukki", "Ernakulam",
  "Thrissur", "Palakkad", "Malappuram", "Kozhikode", "Wayanad", "Kannur", "Kasaragod",
] as const;

export const MEDICO_SLOTS = ["Early mornings", "Evenings", "Days off", "Weekends"] as const;
export const MEDICO_LANGUAGES = ["Malayalam", "English", "Hindi", "Tamil", "Arabic"] as const;
export const MEDICO_GENDERS = ["Female", "Male", "Other"] as const;
export const RADIUS_KM = { min: 2, max: 30, default: 8 } as const;
export const YEARS_MAX = 40;

export interface Workplace {
  place: string;
  role: string;
  from: string;
  /** A year, or "Present". */
  to: string;
}

export interface Award {
  title: string;
  by: string;
  year: string;
}

export interface MedicoProfile {
  name: string;
  role: string;
  specialisation: string;
  qualification: string;
  gender: string;
  photoUrl: string;
  council: string;
  registrationNo: string;
  phone: string;
  email: string;
  district: string;
  experienceMode: "years" | "workplaces";
  years: number;
  workplaces: Workplace[];
  awards: Award[];
  slots: string[];
  languages: string[];
  radiusKm: number;
  bio: string;
}

export const emptyMedicoProfile = (): MedicoProfile => ({
  name: "", role: "", specialisation: "", qualification: "", gender: "", photoUrl: "",
  council: "", registrationNo: "", phone: "", email: "", district: "",
  experienceMode: "years", years: 0, workplaces: [], awards: [],
  slots: [], languages: [], radiusKm: RADIUS_KM.default, bio: "",
});

const CURRENT_YEAR = () => new Date().getFullYear();

/** Total years: the stepper value, or the sum of each workplace's span. */
export function totalYears(p: Pick<MedicoProfile, "experienceMode" | "years" | "workplaces">): number {
  if (p.experienceMode === "years") return Math.max(0, Math.min(YEARS_MAX, Math.round(p.years || 0)));
  const sum = p.workplaces.reduce((n, w) => {
    const from = Number(w.from);
    const to = w.to === "Present" ? CURRENT_YEAR() : Number(w.to);
    return from && to && to >= from ? n + (to - from) : n;
  }, 0);
  return Math.min(YEARS_MAX, sum);
}

/** "Dr." in front of a doctor's name, nothing for anyone else. */
export const displayName = (p: Pick<MedicoProfile, "name" | "role">) =>
  p.role === "Doctor" && p.name && !/^dr\.?\s/i.test(p.name) ? `Dr. ${p.name}` : p.name;

/**
 * The facts a bio may use. Contact details (phone, email) are deliberately left out,
 * so neither the AI nor the template can ever put them in a public bio.
 */
export function bioFacts(p: MedicoProfile) {
  return {
    name: displayName(p),
    role: p.role,
    specialisation: p.specialisation,
    qualification: p.qualification,
    council: p.council,
    years: totalYears(p),
    workplaces: p.workplaces.filter((w) => w.place).map((w) => ({ place: w.place, role: w.role })),
    awards: p.awards.filter((a) => a.title).map((a) => ({ title: a.title, by: a.by, year: a.year })),
    languages: p.languages,
    district: p.district,
  };
}

const list = (items: string[]) => (items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items.at(-1)}`);

/** The bio written without AI: 2–3 sentences from the entered facts only. */
export function templateBio(p: MedicoProfile): string {
  const f = bioFacts(p);
  const words = f.name.split(" ").filter(Boolean);
  // "Dr. Reshma" or "Soumya" when a name is given, otherwise a neutral subject.
  const short = !words.length ? "They" : words[0] === "Dr." ? words.slice(0, 2).join(" ") : words[0];
  const role = [f.specialisation, (f.role || "healthcare professional").toLowerCase()].filter(Boolean).join(" ");

  let first = `${f.name || "This Medico"} is ${/^[aeiou]/i.test(role) ? "an" : "a"} ${role}`;
  if (f.qualification) first += ` holding ${f.qualification}`;
  if (f.years) first += `${f.qualification ? ", with" : " with"} ${f.years} year${f.years === 1 ? "" : "s"} of experience`;
  const sentences = [`${first}.`];

  const place = f.workplaces[0];
  if (place) sentences.push(`${short} has worked at ${place.place}${f.workplaces.length > 1 ? " among other places" : ""}${f.district ? ` and now visits patients at home in ${f.district}` : ""}.`);
  else if (f.district) sentences.push(`${short} visits patients at home in ${f.district}.`);

  const extras: string[] = [];
  if (f.awards[0]) extras.push(`has been recognised with the ${f.awards[0].title}`);
  if (f.languages.length) extras.push(`speaks ${list(f.languages)}`);
  if (extras.length) sentences.push(`${short} ${list(extras)}.`);
  return sentences.slice(0, 3).join(" ");
}

/** The checks staff tick at each verification step before passing it. Shared so the admin board and the API agree. */
export interface VerificationStep {
  stage: "documents" | "council" | "police" | "interview";
  label: string;
  intro: string;
  checks: { key: string; label: string }[];
}

export const VERIFICATION_STEPS: VerificationStep[] = [
  {
    stage: "documents", label: "Documents", intro: "Check the photo, name and qualification against the documents.",
    checks: [
      { key: "photo", label: "Photo is clear, recent and shows only the applicant" },
      { key: "name", label: "Name matches the qualification certificate" },
      { key: "qualification", label: "Qualification certificate seen and genuine" },
      { key: "profile", label: "Profile details and bio are complete and appropriate" },
    ],
  },
  {
    stage: "council", label: "Council check", intro: "Look up the registration number on the council's register.",
    checks: [
      { key: "found", label: "Registration number found in the council register" },
      { key: "name", label: "Name on the register matches the applicant" },
      { key: "active", label: "Registration is active, not suspended or expired" },
      { key: "qualification", label: "Qualification on the register matches the profile" },
    ],
  },
  {
    stage: "police", label: "ID and police", intro: "Confirm who they are and that they are safe to visit homes.",
    checks: [
      { key: "id", label: "Government photo ID seen (Aadhaar, passport, voter ID or driving licence)" },
      { key: "face", label: "ID photo matches the profile photo" },
      { key: "clearance", label: "Police clearance certificate received and clear" },
      { key: "mobile", label: "Mobile number confirmed by calling it" },
    ],
  },
  {
    stage: "interview", label: "Interview", intro: "A short call about their experience and how they work in homes.",
    checks: [
      { key: "done", label: "Interview completed with the applicant" },
      { key: "communication", label: "Communicates clearly in the languages listed" },
      { key: "experience", label: "Experience and workplaces confirmed" },
      { key: "conduct", label: "Understands home-visit conduct, hygiene and safety rules" },
      { key: "terms", label: "Agreed to the professional terms and commission" },
    ],
  },
];

/** What staff recorded when they passed a step. */
export interface VerificationRecord {
  checks: string[];
  note: string;
  by: string;
  at: string;
}
