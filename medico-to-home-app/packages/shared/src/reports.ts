/**
 * Post-consultation reports. Every profession shares the consultation details and follow-up sections, and adds
 * only the sections that belong to its work. The same template drives the Medico's form, the server's checks
 * (nothing outside the template is saved) and what the patient sees.
 */

export type ReportFieldType = "text" | "textarea" | "number" | "select" | "chips" | "date" | "time" | "check" | "rows";

export interface ReportColumn {
  key: string;
  label: string;
  /** "medicine" and "test" columns search the built-in lists, and still accept anything typed. */
  kind?: "text" | "select" | "medicine" | "test";
  options?: string[];
  width?: "s" | "m" | "l";
}

export interface ReportField {
  key: string;
  label: string;
  type: ReportFieldType;
  required?: boolean;
  options?: string[];
  columns?: ReportColumn[];
  placeholder?: string;
  unit?: string;
  hint?: string;
}

export interface ReportSection {
  key: string;
  title: string;
  fields: ReportField[];
  /** Shown to the patient under its own heading (prescriptions, tests, plans…). */
  patientHeading?: string;
  /** Only for professionals who may prescribe (a registered doctor or dentist). */
  prescriber?: boolean;
  /** Kept from the patient's report and PDF: for the professional's own records. */
  private?: boolean;
  /** Collapsed until opened. */
  optional?: boolean;
}

export interface ReportTemplate {
  category: string;
  title: string;
  sections: ReportSection[];
}

export type RowValue = Record<string, string>;
export type ReportValue = string | boolean | RowValue[];
export type ReportData = Record<string, ReportValue>;

/** Who may issue diagnoses, prescriptions and clinical orders, by category. */
export const PRESCRIBERS = ["doctor", "dentist"];

const FREQUENCY = ["Once a day (OD)", "Twice a day (BD)", "Three times a day (TDS)", "Four times a day (QID)", "At bedtime (HS)", "When needed (SOS)", "Every other day", "Once a week", "Stat (once now)"];
const ROUTE = ["Oral", "IV", "IM", "Subcutaneous", "Topical", "Inhalation", "Eye drops", "Ear drops", "Nasal", "Sublingual", "Rectal"];
const WHEN = ["After food", "Before food", "With food", "Empty stomach", "At bedtime", "As directed"];
const LEVEL = ["Independent", "Needs some help", "Needs a lot of help", "Dependent"];
const CONDITION = ["Stable", "Improving", "Same as before", "Worse", "Critical"];

const t = (key: string, label: string, extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "text", ...extra });
const area = (key: string, label: string, extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "textarea", ...extra });
const num = (key: string, label: string, unit = "", extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "number", unit, ...extra });
const pick = (key: string, label: string, options: string[], extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "select", options, ...extra });
const chips = (key: string, label: string, options: string[], extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "chips", options, ...extra });
const rows = (key: string, label: string, columns: ReportColumn[], extra: Partial<ReportField> = {}): ReportField => ({ key, label, type: "rows", columns, ...extra });

const vitals = (key = "vitals", title = "Vitals"): ReportSection => ({
  key, title, optional: true,
  fields: [num("bp", "Blood pressure", "mmHg", { type: "text", placeholder: "120/80" }), num("pulse", "Pulse", "/min"), num("temp", "Temperature", "°F"), num("spo2", "SpO₂", "%"), num("rr", "Respiratory rate", "/min"), num("sugar", "Blood sugar", "mg/dL"), num("weight", "Weight", "kg")],
});

const prescriptions: ReportSection = {
  key: "rx", title: "Prescription", patientHeading: "Prescription", prescriber: true,
  fields: [rows("medicines", "Medicines", [
    { key: "name", label: "Medicine", kind: "medicine", width: "l" }, { key: "dose", label: "Dosage", width: "s" },
    { key: "frequency", label: "Frequency", kind: "select", options: FREQUENCY }, { key: "duration", label: "Duration", width: "s" },
    { key: "route", label: "Route", kind: "select", options: ROUTE, width: "s" }, { key: "instructions", label: "Instructions", kind: "select", options: WHEN },
  ])],
};

const investigations = (prescriber: boolean, title = "Investigations"): ReportSection => ({
  key: "tests", title, patientHeading: "Recommended tests", prescriber, optional: true,
  fields: [rows("tests", "Tests", [
    { key: "name", label: "Test", kind: "test", width: "l" }, { key: "type", label: "Type", kind: "select", options: ["Lab test", "Imaging", "Other"], width: "s" },
    { key: "urgency", label: "When", kind: "select", options: ["Routine", "Within a week", "Urgent"], width: "s" }, { key: "notes", label: "Notes" },
  ])],
});

const referrals: ReportSection = {
  key: "referrals", title: "Referrals", patientHeading: "Referrals", optional: true,
  fields: [rows("referrals", "Referrals", [{ key: "to", label: "Refer to", width: "l" }, { key: "reason", label: "Reason", width: "l" }, { key: "urgency", label: "Urgency", kind: "select", options: ["Routine", "Soon", "Urgent"], width: "s" }])],
};

const exercises = (key: string, title: string): ReportSection => ({
  key, title, patientHeading: "Exercise plan",
  fields: [rows("exercises", "Exercises", [{ key: "name", label: "Exercise", width: "l" }, { key: "sets", label: "Sets", width: "s" }, { key: "reps", label: "Reps", width: "s" }, { key: "often", label: "How often" }, { key: "notes", label: "Notes" }])],
});

/** Shared by every profession: what the consultation was about. */
const consultation = (complaint = "Chief complaint", history = true): ReportSection => ({
  key: "consult", title: "Consultation",
  fields: [
    { key: "date", label: "Date", type: "date", required: true },
    { key: "time", label: "Start time", type: "time" },
    num("duration", "Duration", "min", { required: true }),
    area("complaint", complaint, { required: true }),
    ...(history ? [area("symptoms", "Symptoms"), area("history", "Relevant history", { hint: "Past illnesses, surgeries, allergies, family history" })] : []),
  ],
});

/** Shared by every profession: what happens next. */
const followUp = (heading = "Follow-up"): ReportSection => ({
  key: "followup", title: heading, patientHeading: "Follow-up",
  fields: [area("instructions", "Instructions for the patient and family"), { key: "next", label: "Next appointment", type: "date" }, t("nextNote", "About the next appointment"), area("remarks", "Professional remarks")],
});

const T: Record<string, ReportTemplate> = {
  doctor: {
    category: "doctor", title: "Medical consultation report",
    sections: [
      consultation(), vitals(),
      { key: "exam", title: "Examination & assessment", fields: [area("observations", "Clinical observations / examination findings"), area("assessment", "Clinical assessment"), t("diagnosis", "Diagnosis", { required: true, placeholder: "Provisional or final diagnosis" })] },
      prescriptions, investigations(true, "Lab tests & imaging"), referrals,
      { key: "plan", title: "Treatment & precautions", patientHeading: "Treatment plan", fields: [area("treatment", "Treatment given today"), area("precautions", "Precautions"), area("plan", "Follow-up plan")] },
      followUp(),
    ],
  },
  dentist: {
    category: "dentist", title: "Dental consultation report",
    sections: [
      consultation("Dental complaint"),
      { key: "oral", title: "Oral examination", fields: [t("teeth", "Tooth / area", { placeholder: "E.g. 36, upper left molars", hint: "FDI tooth numbers or the area" }), area("exam", "Oral examination findings"), t("diagnosis", "Dental diagnosis", { required: true })] },
      { key: "procedures", title: "Procedures performed", patientHeading: "Treatment given", fields: [rows("done", "Procedures", [{ key: "name", label: "Procedure", width: "l" }, { key: "tooth", label: "Tooth / area", width: "s" }, { key: "notes", label: "Notes", width: "l" }])] },
      prescriptions, investigations(true, "Dental investigations (X-ray, OPG…)"),
      { key: "hygiene", title: "Oral hygiene", patientHeading: "Care instructions", fields: [area("hygiene", "Oral hygiene instructions")] },
      followUp(),
    ],
  },
  nurse: {
    category: "nurse", title: "Nursing care report",
    sections: [
      consultation("Reason for the visit"), vitals(),
      { key: "assess", title: "Nursing assessment", fields: [area("assessment", "Nursing assessment", { required: true }), pick("condition", "Patient condition", CONDITION)] },
      { key: "procedures", title: "Procedures", fields: [area("wound", "Wound care"), area("injections", "Injections given"), area("iv", "IV procedures"), area("catheter", "Catheter / Ryles tube care")] },
      { key: "meds", title: "Medication administered", fields: [rows("given", "Medicines given", [{ key: "name", label: "Medicine", kind: "medicine", width: "l" }, { key: "dose", label: "Dose", width: "s" }, { key: "route", label: "Route", kind: "select", options: ROUTE, width: "s" }, { key: "time", label: "Time", width: "s" }])] },
      { key: "care", title: "Interventions & care", patientHeading: "Care instructions", fields: [area("interventions", "Nursing interventions"), area("careInstructions", "Care instructions for the family")] },
      followUp(),
    ],
  },
  physio: {
    category: "physio", title: "Physiotherapy session report",
    sections: [
      consultation("Presenting problem"),
      { key: "pain", title: "Pain assessment", fields: [num("pain", "Pain score", "/10"), chips("parts", "Affected body parts", ["Neck", "Shoulder", "Elbow", "Wrist / hand", "Upper back", "Lower back", "Hip", "Knee", "Ankle / foot"]), area("painNotes", "Pain notes")] },
      { key: "assess", title: "Physical assessment", fields: [area("rom", "Mobility & range of motion"), area("strength", "Muscle strength"), area("function", "Functional assessment"), area("assessment", "Physiotherapy assessment", { required: true })] },
      { key: "therapy", title: "Therapy given", fields: [chips("techniques", "Techniques", ["Exercise therapy", "Manual therapy", "TENS", "IFT", "Ultrasound", "Hot pack", "Cold pack", "Taping", "Gait training", "Balance training", "Breathing exercises"]), area("session", "Session details")] },
      exercises("hep", "Home exercise plan"),
      { key: "progress", title: "Progress", fields: [pick("progress", "Progress since last session", ["First session", "Improving", "No change", "Worse"]), area("progressNotes", "Progress notes")] },
      followUp(),
    ],
  },
  ot: {
    category: "ot", title: "Occupational therapy report",
    sections: [
      consultation("Presenting difficulty"),
      { key: "function", title: "Functional assessment", fields: [pick("independence", "Functional independence", LEVEL), area("adl", "Activities of daily living (ADL)"), area("motor", "Motor coordination"), area("sensory", "Sensory assessment"), area("cognitive", "Cognitive & daily-living abilities"), area("assessment", "OT assessment", { required: true })] },
      { key: "therapy", title: "Therapy", patientHeading: "Therapy plan", fields: [area("activities", "Therapy activities"), area("devices", "Assistive devices"), area("goals", "Rehabilitation goals")] },
      { key: "progress", title: "Progress", fields: [area("progressNotes", "Progress notes")] },
      followUp(),
    ],
  },
  speech: {
    category: "speech", title: "Speech & language therapy report",
    sections: [
      consultation("Presenting concern"),
      { key: "assess", title: "Assessment", fields: [area("language", "Speech & language assessment", { required: true }), area("communication", "Communication abilities"), area("swallowing", "Swallowing assessment"), area("voice", "Voice evaluation"), area("cognitive", "Cognitive communication")] },
      { key: "therapy", title: "Therapy", patientHeading: "Home practice", fields: [area("exercises", "Therapy exercises"), area("outcome", "Session outcome"), area("homePractice", "Home practice recommendations")] },
      followUp(),
    ],
  },
  psych: {
    category: "psych", title: "Psychological session summary",
    sections: [
      consultation("Presenting concerns"),
      { key: "assess", title: "Assessment", fields: [area("assessment", "Psychological assessment", { required: true }), area("observations", "Emotional & behavioural observations")] },
      { key: "session", title: "Session", fields: [pick("approach", "Therapy approach", ["CBT", "Supportive counselling", "Mindfulness-based", "Family therapy", "Psychoeducation", "Solution-focused", "Other"]), area("summary", "Session summary")] },
      { key: "wellness", title: "Coping & wellness", patientHeading: "Wellness plan", fields: [area("coping", "Coping strategies"), area("recommendations", "Mental wellness recommendations"), area("goals", "Treatment goals"), area("nextSession", "Next-session plan")] },
      { key: "private", title: "Private notes (not shared with the patient)", private: true, optional: true, fields: [area("privateNotes", "Confidential clinician notes", { hint: "Kept in your records only. Never shown to the patient or on the PDF." })] },
      followUp("Follow-up"),
    ],
  },
  diet: {
    category: "diet", title: "Nutrition consultation report",
    sections: [
      consultation("Reason for consultation"),
      { key: "measure", title: "Measurements", fields: [num("height", "Height", "cm"), num("weight", "Weight", "kg"), num("bmi", "BMI", "", { hint: "Worked out from height and weight" }), num("waist", "Waist", "cm")] },
      { key: "assess", title: "Nutritional assessment", fields: [area("history", "Dietary history"), area("assessment", "Nutritional assessment", { required: true }), t("ndx", "Nutritional diagnosis")] },
      { key: "plan", title: "Diet plan", patientHeading: "Diet plan", fields: [num("calories", "Calorie target", "kcal/day"), t("nutrients", "Nutrient targets", { placeholder: "E.g. protein 60 g, carbs 45%" }), area("meals", "Meal plan"), area("avoid", "Foods to avoid / restrictions"), t("water", "Hydration", { placeholder: "E.g. 2.5 L a day" }), area("supplements", "Supplements (where appropriate)")] },
      followUp("Nutrition follow-up"),
    ],
  },
  lab: {
    category: "lab", title: "Laboratory collection report",
    sections: [
      consultation("Tests requested", false),
      { key: "collection", title: "Sample collection", fields: [chips("sample", "Sample type", ["Blood", "Urine", "Stool", "Sputum", "Swab", "Other"]), { key: "collected", label: "Collection time", type: "time" }, pick("condition", "Sample condition", ["Good", "Haemolysed", "Insufficient", "Clotted", "Other"]), pick("status", "Processing status", ["Collected", "Sent to lab", "Processing", "Results ready"], { required: true })] },
      { key: "results", title: "Results", patientHeading: "Test results", fields: [rows("results", "Results", [{ key: "name", label: "Test", kind: "test", width: "l" }, { key: "value", label: "Result", width: "s" }, { key: "unit", label: "Unit", width: "s" }, { key: "range", label: "Reference range" }, { key: "flag", label: "Flag", kind: "select", options: ["Normal", "High", "Low", "Abnormal"], width: "s" }]), area("abnormal", "Abnormal findings to note", { hint: "Report values only. Interpretation is left to the doctor." })] },
      followUp(),
    ],
  },
  pharma: {
    category: "pharma", title: "Medication review report",
    sections: [
      consultation("Reason for review", false),
      { key: "current", title: "Current medicines", fields: [rows("current", "Medicines the patient takes", [{ key: "name", label: "Medicine", kind: "medicine", width: "l" }, { key: "dose", label: "Dose", width: "s" }, { key: "frequency", label: "Frequency", kind: "select", options: FREQUENCY }, { key: "issue", label: "Issue found" }])] },
      { key: "review", title: "Review", fields: [area("verification", "Dosage verification"), area("interactions", "Possible interactions"), pick("adherence", "Adherence", ["Good", "Missing some doses", "Poor", "Not taking"]), area("review", "Medication review summary", { required: true })] },
      { key: "counsel", title: "Counselling & dispensing", patientHeading: "Medicine advice", fields: [area("counselling", "Medication counselling"), rows("dispensed", "Dispensed", [{ key: "name", label: "Medicine", kind: "medicine", width: "l" }, { key: "qty", label: "Quantity", width: "s" }, { key: "batch", label: "Batch / expiry" }]), area("pharmacistRemarks", "Pharmacist remarks", { hint: "Refer changes in treatment to the prescribing doctor." })] },
      followUp(),
    ],
  },
  caregiver: {
    category: "caregiver", title: "Daily care report",
    sections: [
      consultation("Care provided for", false),
      { key: "care", title: "Care given", fields: [chips("done", "Care given", ["Bathing", "Grooming", "Toileting", "Dressing", "Feeding", "Mobility help", "Medicine reminders", "Exercise / walking", "Position change"], { required: true }), area("personal", "Personal care & hygiene notes")] },
      { key: "observe", title: "Observations", fields: [pick("food", "Food intake", ["Ate well", "Ate some", "Ate little", "Refused"]), pick("sleep", "Sleep", ["Slept well", "Disturbed", "Poor"]), pick("mood", "Behaviour & mood", ["Calm", "Cheerful", "Anxious", "Agitated", "Confused", "Low"]), area("observations", "Daily care observations")] },
      followUp("Notes for the family"),
    ],
  },
  aide: {
    category: "aide", title: "Home health aide report",
    sections: [
      consultation("Care provided for", false), vitals("vitals", "Vitals (if trained and authorised)"),
      { key: "care", title: "Daily living assistance", fields: [chips("done", "Help given", ["Bathing", "Feeding", "Hygiene", "Mobility", "Toileting", "Dressing", "Position change"], { required: true }), area("comfort", "Patient comfort"), area("safety", "Safety observations")] },
      followUp("Care update for the family"),
    ],
  },
  baby: {
    category: "baby", title: "Baby care report",
    sections: [
      consultation("Care period", false),
      { key: "feeding", title: "Feeding", fields: [rows("feeds", "Feeds", [{ key: "time", label: "Time", width: "s" }, { key: "type", label: "Type", kind: "select", options: ["Breast milk", "Formula", "Expressed milk", "Solids"] }, { key: "qty", label: "Quantity", width: "s" }])] },
      { key: "day", title: "Sleep, hygiene & health", fields: [area("sleep", "Sleep pattern"), num("diapers", "Diaper changes", ""), area("hygiene", "Bath & hygiene"), num("temp", "Temperature", "°F"), area("activities", "Activities"), area("development", "Developmental observations")] },
      followUp("Notes for parents"),
    ],
  },
  ambulance: {
    category: "ambulance", title: "Patient transport report",
    sections: [
      consultation("Reason for transport", false),
      { key: "trip", title: "Transport", fields: [t("pickup", "Pickup location", { required: true }), { key: "pickupAt", label: "Pickup time", type: "time" }, t("drop", "Destination", { required: true }), { key: "dropAt", label: "Arrival time", type: "time" }, t("handover", "Handed over to")] },
      { key: "notes", title: "Observations", fields: [area("emergency", "Emergency observations"), area("transportRemarks", "Transport remarks")] },
      followUp("Remarks"),
    ],
  },
  paramedic: {
    category: "paramedic", title: "Emergency care report",
    sections: [
      consultation("Emergency / chief complaint"), vitals(),
      { key: "assess", title: "Emergency assessment", fields: [pick("avpu", "Consciousness (AVPU)", ["Alert", "Responds to voice", "Responds to pain", "Unresponsive"], { required: true }), num("gcs", "GCS", "/15"), area("assessment", "Emergency assessment", { required: true })] },
      { key: "care", title: "Care given", fields: [area("firstAid", "First aid"), area("interventions", "Interventions performed"), t("oxygen", "Oxygen given", { placeholder: "E.g. 4 L/min by mask" }), rows("given", "Medicines given (within scope)", [{ key: "name", label: "Medicine", kind: "medicine", width: "l" }, { key: "dose", label: "Dose", width: "s" }, { key: "route", label: "Route", kind: "select", options: ROUTE, width: "s" }, { key: "time", label: "Time", width: "s" }]), area("response", "Response to treatment")] },
      { key: "handover", title: "Transport & handover", fields: [pick("transportCondition", "Condition during transport", CONDITION), t("hospital", "Hospital"), t("handover", "Handed over to")] },
      followUp(),
    ],
  },
};

/** The report form for a category, with prescriber-only sections removed when the professional cannot prescribe. */
export function reportTemplate(category: string, canPrescribe = PRESCRIBERS.includes(category)): ReportTemplate {
  const tpl = T[category] ?? T.caregiver!;
  return { ...tpl, sections: tpl.sections.filter((s) => !s.prescriber || canPrescribe) };
}

const filled = (v: ReportValue | undefined) => (Array.isArray(v) ? v.some((r) => Object.values(r).some((x) => String(x ?? "").trim())) : typeof v === "boolean" ? v : !!String(v ?? "").trim());

/** Required fields still empty, by label. */
export function missingFields(tpl: ReportTemplate, data: ReportData): string[] {
  return tpl.sections.flatMap((s) => s.fields.filter((f) => f.required && !filled(data[f.key])).map((f) => f.label));
}

/** Only the template's fields, trimmed, with empty rows dropped: whatever else is sent is ignored. */
export function cleanReport(tpl: ReportTemplate, data: ReportData): ReportData {
  const out: ReportData = {};
  for (const f of tpl.sections.flatMap((s) => s.fields)) {
    const v = data[f.key];
    if (f.type === "rows") {
      if (!Array.isArray(v)) continue;
      const cols = f.columns!.map((c) => c.key);
      const kept = v.map((r) => Object.fromEntries(cols.map((c) => [c, String(r?.[c] ?? "").trim().slice(0, 300)]))).filter((r) => Object.values(r).some(Boolean)).slice(0, 40);
      if (kept.length) out[f.key] = kept;
    } else if (f.type === "check") {
      if (v === true) out[f.key] = true;
    } else if (f.type === "chips") {
      const list = String(v ?? "").split("|").map((x) => x.trim()).filter(Boolean);
      if (list.length) out[f.key] = list.join("|");
    } else {
      const s = String(v ?? "").trim().slice(0, f.type === "textarea" ? 4000 : 300);
      if (s) out[f.key] = s;
    }
  }
  return out;
}

const show = (f: ReportField, v: ReportValue) => {
  if (Array.isArray(v)) return v.map((r) => f.columns!.map((c) => r[c.key]).filter(Boolean).join(" · ")).join("\n");
  if (typeof v === "boolean") return v ? "Yes" : "No";
  if (f.type === "chips") return v.split("|").join(", ");
  return f.unit ? `${v} ${f.unit}` : v;
};

/** The entered facts, labelled and grouped, without private sections: what AI and the patient may see. */
export function reportFacts(tpl: ReportTemplate, data: ReportData) {
  return tpl.sections.filter((s) => !s.private).map((s) => ({
    section: s.title,
    items: s.fields.filter((f) => filled(data[f.key])).map((f) => ({ label: f.label, value: show(f, data[f.key]!) })),
  })).filter((s) => s.items.length);
}

/** A plain report written from the entered facts only: used when AI is unavailable, and as AI's source. */
export function plainReport(tpl: ReportTemplate, data: ReportData) {
  return reportFacts(tpl, data).map((s) => `${s.section.toUpperCase()}\n${s.items.map((i) => (i.value.includes("\n") ? `${i.label}:\n${i.value}` : `${i.label}: ${i.value}`)).join("\n")}`).join("\n\n");
}
