"use client";

// Converted from the prototype. Reads demo values from the site store.
import { useSite } from "./SiteProvider";

export function JoinView() {
  const v = useSite();
  return (
    <>
      <div style={{ animation: "mthIn .35s ease" }}>
        <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(48px,7vw,104px) clamp(18px,4vw,48px) clamp(40px,5vw,64px)", display: "flex", flexDirection: "column", gap: "24px" }}>
          <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>For professionals</span>
          <h1 style={{ margin: "0", fontSize: "clamp(42px,7vw,96px)", fontWeight: "300", letterSpacing: "-.045em", lineHeight: "1", maxWidth: "1000px" }}>
            Earn on your own time.{" "}
            <span style={{ fontWeight: "600" }}>Care closer to home.</span>
          </h1>
          <p style={{ margin: "0", maxWidth: "560px", fontSize: "18px", lineHeight: "1.55", color: "#6B7085" }}>Doctors, nurses, therapists, lab technicians and caregivers across Kozhikode and Malappuram are building flexible practices with us.</p>
          <button onClick={v.goApply} style={{ alignSelf: "flex-start", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "16px 30px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s" }} className="mth-hover-7">Apply now</button>
        </section>
        <section style={{ padding: "0 clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", background: "#F6F7FA", borderRadius: "24px", padding: "clamp(28px,4vw,56px)", display: "flex", flexWrap: "wrap", gap: "clamp(28px,4vw,64px)", alignItems: "center" }}>
            <div style={{ flex: "1 1 360px", display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Earnings estimator</div>
              <label style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                  <span>Visits per week</span>
                  <span style={{ fontWeight: "600" }}>{v.earnS}</span>
                </span>
                <input type="range" min={5} max={40} value={v.earnS} onChange={v.onEarnS} style={{ accentColor: "#02084D", width: "100%" }} />
              </label>
              {" "}
              <label style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ display: "flex", justifyContent: "space-between", fontSize: "15px" }}>
                  <span>Your fee per visit</span>
                  <span style={{ fontWeight: "600" }}>{v.earnPText}</span>
                </span>
                <input type="range" min={300} max={1500} step={50} value={v.earnP} onChange={v.onEarnP} style={{ accentColor: "#02084D", width: "100%" }} />
              </label>
            </div>
            <div style={{ flex: "1 1 300px", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "14px", color: "#6B7085" }}>You could earn about</span>
              {" "}
              <span style={{ fontSize: "clamp(56px,8vw,108px)", fontWeight: "200", letterSpacing: "-.05em", lineHeight: "1" }}>{v.earnMonth}</span>
              {" "}
              <span style={{ fontSize: "14px", color: "#6B7085" }}>per month, after our 12% platform commission</span>
            </div>
          </div>
        </section>
        <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(18px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(24px,3vw,40px)" }}>
          <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #02084D", paddingTop: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: "500" }}>Set your own hours</span>
            <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.55" }}>Open or close slots any time from the app.</span>
          </div>
          <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #02084D", paddingTop: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: "500" }}>Choose your area</span>
            <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.55" }}>Only get requests within the radius you set.</span>
          </div>
          <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #02084D", paddingTop: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: "500" }}>Weekly payouts</span>
            <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.55" }}>Straight to your bank account every Monday.</span>
          </div>
          <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "10px", borderTop: "1px solid #02084D", paddingTop: "20px" }}>
            <span style={{ fontSize: "20px", fontWeight: "500" }}>Insured visits</span>
            <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.55" }}>Professional indemnity and accident cover included.</span>
          </div>
        </section>
        <section id="mth-apply" style={{ padding: "0 clamp(18px,4vw,48px) clamp(64px,8vw,120px)" }}>
          <div style={{ maxWidth: "880px", margin: "0 auto", border: "1px solid #E6E8EF", borderRadius: "24px", padding: "clamp(24px,4vw,48px)", display: "flex", flexDirection: "column", gap: "24px" }}>
            {v.joinApproved ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", alignItems: "flex-start" }}>
                <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,42px)", fontWeight: "300", letterSpacing: "-.035em" }}>
                  You are <span style={{ fontWeight: "600" }}>approved</span>.
                </h2>
                <p style={{ margin: "0", fontSize: "16px", color: "#6B7085", lineHeight: "1.55" }}>Open the professional app to see your visits, schedule and earnings.</p>
                <button onClick={v.toProMode} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "16px 30px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer" }} className="mth-hover-7">Open professional app</button>
              </div>
            ) : v.joinInReview ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,42px)", fontWeight: "300", letterSpacing: "-.035em" }}>
                  Application <span style={{ fontWeight: "600" }}>in review</span>
                </h2>
                <p style={{ margin: "0", fontSize: "16px", color: "#6B7085", lineHeight: "1.55" }}>{v.joinProfession} · Current step: {v.joinStage}. We will contact you on your mobile number.</p>
              </div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px", alignItems: "flex-start" }}>
                {v.joinNote && (
                  <div role="status" style={{ background: "#FDF1EC", color: "#8A3B1F", borderRadius: "14px", padding: "14px 16px", fontSize: "15px", lineHeight: "1.5", alignSelf: "stretch" }}>
                    <strong style={{ fontWeight: "600" }}>{v.joinNoteTitle}.</strong> {v.joinNote}
                  </div>
                )}
                <h2 style={{ margin: "0", fontSize: "clamp(28px,3.4vw,42px)", fontWeight: "300", letterSpacing: "-.035em" }}>
                  Apply to <span style={{ fontWeight: "600" }}>join</span>.
                </h2>
                <p style={{ margin: "0", fontSize: "16px", color: "#6B7085", lineHeight: "1.55", maxWidth: "600px" }}>About 10 minutes. Keep these ready as photos or PDFs: your degree or training certificate, council registration, a government ID and a passport-size photo. Your progress is saved on this device.</p>
                <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(150px,1fr))", gap: "10px", alignSelf: "stretch" }}>
                  {["Choose your profession", "Your details", "Qualifications", "Work preferences", "Upload documents"].map((t, i) => (
                    <li key={t} style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px", color: "#4A4F6A" }}>
                      <span style={{ width: "24px", height: "24px", flex: "none", borderRadius: "50%", border: "1px solid #02084D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", color: "#02084D" }}>{i + 1}</span>
                      {t}
                    </li>
                  ))}
                </ol>
                <button onClick={v.goApply} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "16px 30px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s" }} className="mth-hover-7">{v.joinButton}</button>
              </div>
            )}
          </div>
        </section>
      </div>
    </>
  );
}
