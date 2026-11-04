// The councils and bodies a Medico can be registered or certified with, by profession.
// National bodies first, then each State and Union Territory that has its own council.
// A profession's list ends with "Other / not listed", so nobody is stuck if their body is missing.

export const STATES = [
  "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana", "Himachal Pradesh",
  "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", "Nagaland", "Odisha",
  "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
] as const;

export const UNION_TERRITORIES = [
  "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu", "Delhi", "Jammu and Kashmir",
  "Ladakh", "Lakshadweep", "Puducherry",
] as const;

export const OTHER_COUNCIL = "Other / not listed";

const MEDICAL = [
  "Andhra Pradesh Medical Council", "Arunachal Pradesh Medical Council", "Assam Medical Council", "Bihar Council of Medical Registration",
  "Chhattisgarh Medical Council", "Goa Medical Council", "Gujarat Medical Council", "Haryana Medical Council", "Himachal Pradesh Medical Council",
  "Jharkhand Medical Council", "Karnataka Medical Council", "Travancore-Cochin Medical Council (TCMC)", "Madhya Pradesh Medical Council",
  "Maharashtra Medical Council", "Manipur Medical Council", "Meghalaya Medical Council", "Mizoram Medical Council", "Nagaland Medical Council",
  "Odisha Council of Medical Registration", "Punjab Medical Council", "Rajasthan Medical Council", "Sikkim Medical Council",
  "Tamil Nadu Medical Council", "Telangana State Medical Council", "Tripura Medical Council", "Uttar Pradesh Medical Council",
  "Uttarakhand Medical Council", "West Bengal Medical Council",
  "Delhi Medical Council", "Jammu and Kashmir Medical Council", "Puducherry Medical Council",
];

const NURSING = [
  "Andhra Pradesh Nurses and Midwives Council", "Arunachal Pradesh Nursing Council", "Assam Nurses' Midwives' and Health Visitors' Council",
  "Bihar Nurses Registration Council", "Chhattisgarh Nurses Registration Council", "Goa Nursing Council", "Gujarat Nursing Council",
  "Haryana Nurses and Nurse-Midwives Council", "Himachal Pradesh Nurses Registration Council", "Jharkhand Nurses Registration Council",
  "Karnataka State Nursing Council", "Kerala Nurses and Midwives Council (KNMC)", "Madhya Pradesh Nurses Registration Council",
  "Maharashtra Nursing Council", "Manipur Nursing Council", "Meghalaya Nursing Council", "Mizoram Nursing Council", "Nagaland Nursing Council",
  "Odisha Nurses and Midwives Examination Board", "Punjab Nurses Registration Council", "Rajasthan Nursing Council", "Sikkim Nursing Council",
  "Tamil Nadu Nurses and Midwives Council", "Telangana Nurses and Midwives Council", "Tripura Nursing Council",
  "Uttar Pradesh Nurses and Midwives Council", "Uttarakhand Nurses and Midwives Council", "West Bengal Nursing Council",
  "Delhi Nursing Council", "Jammu and Kashmir Nursing Council", "Puducherry Nursing Council",
];

// Most states name theirs "<State> State Dental Council"; these do not.
const DENTAL_NAMES: Record<string, string> = { "Tamil Nadu": "Tamil Nadu Dental Council" };
const DENTAL = [
  ...STATES.map((s) => DENTAL_NAMES[s] ?? `${s} State Dental Council`),
  "Delhi Dental Council", "Jammu and Kashmir Dental Council", "Puducherry Dental Council", "Chandigarh Dental Council",
];

// Most states name theirs "<State> State Pharmacy Council"; these do not.
const PHARMACY_NAMES: Record<string, string> = { "Tamil Nadu": "Tamil Nadu Pharmacy Council" };
const PHARMACY = [
  ...STATES.map((s) => PHARMACY_NAMES[s] ?? `${s} State Pharmacy Council`),
  "Delhi Pharmacy Council", "Jammu and Kashmir Pharmacy Council", "Puducherry Pharmacy Council",
];

// The NCAHP Act asks every State and UT to set up its own Allied and Healthcare Council.
const ALLIED = [
  ...STATES.map((s) => `${s} State Allied and Healthcare Council`),
  ...UNION_TERRITORIES.map((u) => `${u} Allied and Healthcare Council`),
];

const NMC = "National Medical Commission (NMC)";
const INC = "Indian Nursing Council (INC)";
const DCI = "Dental Council of India (DCI)";
const PCI = "Pharmacy Council of India (PCI)";
const RCI = "Rehabilitation Council of India (RCI)";
const NCAHP = "National Commission for Allied and Healthcare Professions (NCAHP)";
const HSSC = "Healthcare Sector Skill Council (HSSC)";
const KERALA_PARAMEDICAL = "Kerala State Paramedical Council";
const CARE_BODIES = [HSSC, "National Skill Development Corporation (NSDC)", "Indian Red Cross Society", "Hospital or institute training certificate", "No formal certificate yet"];

export interface CouncilGroup {
  label: string;
  options: string[];
}

export interface RegistrationSpec {
  /** "Council", or "Certified by" for roles that are certified rather than registered. */
  bodyLabel: string;
  numberLabel: string;
  placeholder: string;
  /** Who our team checks the number with, for the note under the fields. */
  checkedWith: string;
  groups: CouncilGroup[];
}

const council = (national: string[], states: string[], placeholder: string, more: Partial<RegistrationSpec> = {}): RegistrationSpec => ({
  bodyLabel: "Council", numberLabel: "Registration number", placeholder, checkedWith: "the council",
  groups: [{ label: "National", options: national }, ...(states.length ? [{ label: "State and Union Territory", options: states }] : []), { label: "Other", options: [OTHER_COUNCIL] }],
  ...more,
});

const certified = (bodies: string[], numberLabel: string, placeholder: string): RegistrationSpec => ({
  bodyLabel: "Certified by", numberLabel, placeholder, checkedWith: "the issuing body",
  groups: [{ label: "Recognised bodies", options: bodies }, { label: "Other", options: [OTHER_COUNCIL] }],
});

/** Keyed by the role chosen in step 1 of the Medico registration. */
export const REGISTRATION_BY_ROLE: Record<string, RegistrationSpec> = {
  Doctor: council(
    [NMC, "National Commission for Indian System of Medicine (NCISM)", "National Commission for Homoeopathy (NCH)"],
    MEDICAL, "E.g. TCMC 54321",
  ),
  Dentist: council([DCI], DENTAL, "E.g. KSDC A-12345"),
  Nurse: council([INC], NURSING, "E.g. KNMC 123456"),
  Pharmacist: council([PCI], PHARMACY, "E.g. KSPC 45678"),
  Physiotherapist: council([NCAHP, "Indian Association of Physiotherapists (IAP)"], ALLIED, "E.g. NCAHP or IAP number"),
  "Occupational Therapist": council([NCAHP, "All India Occupational Therapists' Association (AIOTA)"], ALLIED, "E.g. NCAHP or AIOTA number"),
  "Speech & Language Therapist": council([RCI, NCAHP], [], "E.g. RCI CRR number A12345"),
  "Clinical Psychologist": council([RCI], [], "E.g. RCI CRR number A12345"),
  "Lab Technician": council([NCAHP], [KERALA_PARAMEDICAL, ...ALLIED], "E.g. KSPMC 12345"),
  Paramedic: council([NCAHP, HSSC], [KERALA_PARAMEDICAL, ...ALLIED], "E.g. NCAHP or EMT certificate number"),
  Psychologist: certified([RCI, NCAHP, "Not registered (counselling psychologist)"], "Registration or certificate number", "Leave empty if not registered"),
  Dietitian: certified(["Indian Dietetic Association (IDA)", NCAHP, "Not a Registered Dietitian yet"], "RD or registration number", "E.g. IDA RD number"),
  Caregiver: certified(CARE_BODIES, "Certificate number", "As printed on your certificate"),
  "Home Health Aide": certified(CARE_BODIES, "Certificate number", "As printed on your certificate"),
  "Baby Care Attendant": certified(CARE_BODIES, "Certificate number", "As printed on your certificate"),
  "Ambulance Driver": certified(["Regional Transport Office (RTO)", HSSC], "Driving licence number", "E.g. KL11 20190012345"),
};

/** Before a role is chosen: just the national councils, so the field never looks empty. */
const ANY_ROLE = council([NMC, DCI, INC, PCI, RCI, NCAHP], [], "As printed on your certificate");

export const registrationFor = (role: string): RegistrationSpec => REGISTRATION_BY_ROLE[role] ?? ANY_ROLE;

export const councilsFor = (role: string) => registrationFor(role).groups.flatMap((g) => g.options);

// Values saved before councils depended on the role.
const LEGACY_COUNCILS = ["NMC / Other"];

export const COUNCILS = [...new Set([...Object.values(REGISTRATION_BY_ROLE), ANY_ROLE].flatMap((s) => s.groups.flatMap((g) => g.options)).concat(LEGACY_COUNCILS))];
