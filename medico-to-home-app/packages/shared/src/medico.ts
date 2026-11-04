// Medico registration: the 8-step profile a professional fills in after signing in.
// Every field is optional. Shared by the registration screens and the API.

export const MEDICO_ROLES = ["Doctor", "Nurse", "Physiotherapist", "Caretaker", "Lab technician", "Other therapist"] as const;

/** The catalogue category each role is listed under once approved. */
export const MEDICO_CATEGORY: Record<string, string> = {
  Doctor: "doctor", Nurse: "nurse", Physiotherapist: "physio", Caretaker: "caregiver", "Lab technician": "lab", "Other therapist": "ot",
};

export const COUNCILS = [
  "Travancore-Cochin Medical Council (TCMC)",
  "Kerala Nurses and Midwives Council (KNMC)",
  "Kerala State Paramedical Council",
  "Kerala State Pharmacy Council",
  "NMC / Other",
] as const;

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
