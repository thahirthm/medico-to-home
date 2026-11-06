import { describe, expect, it } from "vitest";
import { cleanReport, missingFields, plainReport, reportFacts, reportTemplate } from "./reports";

describe("consultation reports", () => {
  it("give each profession its own sections on top of the shared ones", () => {
    const keys = (c: string) => reportTemplate(c).sections.map((s) => s.key);
    expect(keys("doctor")).toEqual(expect.arrayContaining(["consult", "rx", "tests", "followup"]));
    expect(keys("physio")).toEqual(expect.arrayContaining(["consult", "pain", "hep", "followup"]));
    expect(keys("nurse")).not.toContain("rx");
    expect(keys("lab")).not.toContain("rx");
  });

  it("drop prescriptions for a doctor who cannot prescribe, and anything outside the template", () => {
    const tpl = reportTemplate("doctor", false);
    expect(tpl.sections.some((s) => s.key === "rx")).toBe(false);
    const clean = cleanReport(tpl, { diagnosis: " Viral fever ", medicines: [{ name: "Paracetamol 500 mg" }], hacked: "x" });
    expect(clean).toEqual({ diagnosis: "Viral fever" });
  });

  it("keep filled prescription rows and drop empty ones", () => {
    const clean = cleanReport(reportTemplate("doctor"), { medicines: [{ name: "Paracetamol 650 mg", dose: "1 tab", extra: "no" }, { name: " " }] });
    expect(clean.medicines).toEqual([{ name: "Paracetamol 650 mg", dose: "1 tab", frequency: "", duration: "", route: "", instructions: "" }]);
  });

  it("list required fields that are still empty", () => {
    expect(missingFields(reportTemplate("doctor"), { date: "2026-11-06", duration: "20" })).toEqual(["Chief complaint", "Diagnosis"]);
  });

  it("never show a psychologist's private notes to the patient", () => {
    const tpl = reportTemplate("psych");
    const data = { complaint: "Low mood", assessment: "Mild depressive symptoms", privateNotes: "Confidential" };
    expect(JSON.stringify(reportFacts(tpl, data))).not.toContain("Confidential");
    expect(plainReport(tpl, data)).not.toContain("Confidential");
  });
});
