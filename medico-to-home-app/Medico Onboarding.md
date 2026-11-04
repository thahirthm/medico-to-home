# Medico To Home — Medico Onboarding Flow

Onboarding for healthcare professionals (**Medicos**) on Medico To Home, a Kerala home-healthcare platform. Patients and Medicos sign in separately.

## Naming
- **Medico** — any professional: doctor, nurse, physiotherapist, caretaker, lab technician, therapist.
- **Patient** — anyone booking care.

## Entry points (home page)
- Header shows two buttons: **Patient login** (outline) and **Medico login** (filled navy).
- The mobile menu has both buttons too.
- The Patient login modal offers **Continue with Google** or phone + OTP, plus a "Medico login" link.
- "For Medicos" page CTAs and the apply form lead to onboarding.

## 1. Medico login screen
Split layout. Benefits slider on the **left** (navy), sign-in on the **right** (white). On mobile, the sign-in comes first and the slider sits below it.

**Right: sign-in**
- Medico To Home logo
- Patient / Medico toggle
- "Medico login": signing in creates the account
- **Continue with Google** → Google account chooser → goes **straight to registration** (name and email prefilled)
- Or: +91 mobile → Continue with phone
- Terms note

**Left: benefits slider** (moves on every 5s, pauses on hover, swipeable, dots + arrows)
Each slide has an eyebrow, a headline, a short body, and a quote from a Medico with a small photo.

1. **Earn alongside your job** — "Your shift pays the bills. Your evenings can pay for dreams." Stat: ₹15,600 extra a month (6 evening visits a week). Quote: Soumya Joseph, Staff Nurse.
2. **What is Medico To Home** — "The hospital, at the patient's door." Families book verified Medicos; the platform handles booking, directions, payment and support. Quote: Dr. Reshma Unnikrishnan, Geriatrician.
3. **Your hours, your area** — "Switch on when you're free. Say no anytime." No minimum hours. Quote: Midhun Sasi, Physiotherapist.
4. **Be proud** — "You're not just a provider. You're family to them." Insured visits, verified patients, SOS. Quote: Sindhu Rajan, Elderly Caregiver.

## 2. Registration (8 steps)
- **No field is mandatory.** Every step can be skipped.
- Sticky top progress bar (green) shows % done and time left.
- Desktop has a left step list with ticks for completed steps. Click any step to jump to it.
- Bottom bar: Back · Skip (shown when the step is empty) · Continue.
- Each step opens with a short line that makes the Medico feel valued.

| # | Step | Fields |
|---|------|--------|
| 1 | About you | Full name, role chips (Doctor, Nurse, Physiotherapist, Caretaker, Lab technician, Other therapist), specialisation, highest qualification, gender |
| 2 | Photo | Circular upload with preview and remove; photo tips; "3× more bookings" nudge |
| 3 | Registration | Council (TCMC, KNMC, Kerala State Paramedical Council, Kerala State Pharmacy Council, NMC/Other); registration number (auto-uppercase); verification note (24–48 h, Verified Medico badge) |
| 4 | Contact | +91 mobile, email (from Google), home district (all 14 Kerala districts); privacy note: never shown on profile |
| 5 | Experience | Pick one of two ways: **Just total years** (stepper + slider, 0–40) or **Add each workplace** (hospital/clinic, role, from year, to year or "Present"; add/remove; total years summed automatically) |
| 6 | Awards | Add/remove cards (award title, awarded by, year); empty-state prompt (hospital awards, COVID/flood-duty certificates, research) |
| 7 | Availability | Time slots (Early mornings, Evenings, Days off, Weekends), languages (Malayalam, English, Hindi, Tamil, Arabic), travel radius 2–30 km |
| 8 | Your bio | Profile summary with Edit links to each step; **AI bio**: "Write my bio with AI", then "Rewrite with AI"; editable textarea |

### AI bio rules
- Built only from entered facts: name, role, specialisation, qualification, council, years, workplaces, awards, languages, district.
- **Never includes phone, email or other contact details.**
- 2–3 sentences, ≤65 words, third person, warm and professional, no invented facts.
- If AI is unavailable, a local template writes the bio instead.

## 3. Welcome screen
- Check mark, then "Welcome, Dr. {Name}." ("Dr." added for doctors only)
- "Kerala has one more life-saver on call."
- Profile preview card: photo/initial, role line, "Verification in progress" badge, bio, stats (years, awards, service radius)
- What happens next: 1) council verification, 2) bank details for Monday payouts, 3) switch on availability
- Actions: Back to Medico To Home · Edit profile

## Visual system
- Font: Inter (300 / 400 / 500 / 600)
- Navy `#02084D` (primary), `#1A2170` (hover), muted text `#6B7085` / `#4A4F6A`, borders `#E6E8EF`, soft fill `#F5F6FA`
- Success green `#2E7D5B` / `#E8F5EF` (progress, verified), gold `#B07A12` / `#FBF6EA` (awards)
- Pill buttons, 14px-radius inputs, 18–24px-radius cards, gentle fade-up transitions

## Files
- `Medico Onboarding.dc.html`: onboarding flow
- `Medico To Home.dc.html`: home page (two login buttons, Google patient login)
- `assets/medico-logo.svg`: logo
