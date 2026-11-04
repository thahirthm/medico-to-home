import { describe, expect, it } from "vitest";
import { displayName, emptyMedicoProfile, templateBio, totalYears } from "./medico";

const profile = (over = {}) => ({ ...emptyMedicoProfile(), ...over });

describe("medico profile", () => {
  it("adds Dr. only for doctors", () => {
    expect(displayName(profile({ name: "Reshma Unnikrishnan", role: "Doctor" }))).toBe("Dr. Reshma Unnikrishnan");
    expect(displayName(profile({ name: "Dr. Reshma", role: "Doctor" }))).toBe("Dr. Reshma");
    expect(displayName(profile({ name: "Anjali Menon", role: "Dentist" }))).toBe("Dr. Anjali Menon");
    expect(displayName(profile({ name: "Soumya Joseph", role: "Nurse" }))).toBe("Soumya Joseph");
  });

  it("sums workplace years, counting Present as this year", () => {
    const now = new Date().getFullYear();
    expect(totalYears(profile({ experienceMode: "workplaces", workplaces: [{ place: "A", role: "", from: "2010", to: "2015" }, { place: "B", role: "", from: String(now - 3), to: "Present" }] }))).toBe(8);
    expect(totalYears(profile({ experienceMode: "years", years: 55 }))).toBe(40);
  });

  it("writes a short bio without contact details", () => {
    const bio = templateBio(profile({
      name: "Soumya Joseph", role: "Nurse", qualification: "a BSc in Nursing", years: 9, phone: "9876543210", email: "s@example.com",
      district: "Kozhikode", languages: ["Malayalam", "English"], workplaces: [], awards: [{ title: "Best Nurse Award", by: "MIMS", year: "2022" }],
    }));
    expect(bio).toBe("Soumya Joseph is a nurse holding a BSc in Nursing, with 9 years of experience. Soumya visits patients at home in Kozhikode. Soumya has been recognised with the Best Nurse Award and speaks Malayalam and English.");
    expect(bio).not.toMatch(/9876543210|example\.com/);
    expect(bio.split(" ").length).toBeLessThanOrEqual(65);
  });

  it("still reads well when nothing is filled in", () => {
    expect(templateBio(profile())).toBe("This Medico is a healthcare professional.");
  });
});
