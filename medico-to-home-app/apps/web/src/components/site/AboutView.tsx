"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function AboutView() {
  const v = useSite();
  return (
    <>
      <div style={{ animation: "mthIn .35s ease" }}>
        <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(48px,7vw,104px) clamp(18px,4vw,48px) clamp(40px,5vw,72px)", display: "flex", flexDirection: "column", gap: "28px" }}>
          <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>About us</span>
          <h1 style={{ margin: "0", fontSize: "clamp(42px,7vw,96px)", fontWeight: "300", letterSpacing: "-.045em", lineHeight: "1", maxWidth: "1100px", textWrap: "balance" }}>
            Healthcare the way it used to be —{" "}
            <span style={{ fontWeight: "600" }}>at home</span>
            .
          </h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "clamp(20px,4vw,64px)", marginTop: "16px" }}>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "#3A3F5C" }}>Medico To Home started in Kozhikode in 2025, after our founders spent months taking an ageing parent to hospital for daily physiotherapy — two hours of travel for forty minutes of care.</p>
            <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", color: "#3A3F5C" }}>Today we connect families across Kozhikode and Malappuram with verified doctors, nurses, therapists and caregivers who come to them — with fair, upfront prices and every visit tracked.</p>
          </div>
        </section>
        <section style={{ borderTop: "1px solid #E6E8EF", borderBottom: "1px solid #E6E8EF" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 clamp(18px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))" }}>
            <div data-reveal="1" style={{ padding: "clamp(28px,4vw,48px) 24px clamp(28px,4vw,48px) 0", display: "flex", flexDirection: "column", gap: "8px" }}>
              <span style={{ fontSize: "clamp(48px,6vw,84px)", fontWeight: "200", letterSpacing: "-.05em", lineHeight: "1" }}>
                1,200
                <span style={{ fontSize: ".5em" }}>+</span>
              </span>
              <span style={{ fontSize: "14px", color: "#6B7085" }}>Verified professionals</span>
            </div>
            <div data-reveal="1" style={{ padding: "clamp(28px,4vw,48px) 24px", display: "flex", flexDirection: "column", gap: "8px", borderLeft: "1px solid #EEF0F5" }}>
              <span style={{ fontSize: "clamp(48px,6vw,84px)", fontWeight: "200", letterSpacing: "-.05em", lineHeight: "1" }}>23</span>
              <span style={{ fontSize: "14px", color: "#6B7085" }}>Localities served</span>
            </div>
            <div data-reveal="1" style={{ padding: "clamp(28px,4vw,48px) 24px", display: "flex", flexDirection: "column", gap: "8px", borderLeft: "1px solid #EEF0F5" }}>
              <span style={{ fontSize: "clamp(48px,6vw,84px)", fontWeight: "200", letterSpacing: "-.05em", lineHeight: "1" }}>4.8</span>
              <span style={{ fontSize: "14px", color: "#6B7085" }}>Average rating</span>
            </div>
            <div data-reveal="1" style={{ padding: "clamp(28px,4vw,48px) 24px", display: "flex", flexDirection: "column", gap: "8px", borderLeft: "1px solid #EEF0F5" }}>
              <span style={{ fontSize: "clamp(48px,6vw,84px)", fontWeight: "200", letterSpacing: "-.05em", lineHeight: "1" }}>
                38
                <span style={{ fontSize: ".4em", fontWeight: "300" }}>{" "}min</span>
              </span>
              <span style={{ fontSize: "14px", color: "#6B7085" }}>Average arrival time</span>
            </div>
          </div>
        </section>
        <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(18px,4vw,48px)", display: "flex", flexWrap: "wrap", gap: "clamp(28px,5vw,80px)" }}>
          <h2 data-reveal="1" style={{ flex: "1 1 300px", margin: "0", fontSize: "clamp(32px,4vw,52px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1.05" }}>
            How we{" "}
            <span style={{ fontWeight: "600" }}>verify</span>
            {" "}every professional.
          </h2>
          <div style={{ flex: "1.4 1 420px", display: "flex", flexDirection: "column" }}>
            <div data-reveal="1" style={{ display: "flex", gap: "24px", padding: "22px 0", borderTop: "1px solid #E6E8EF" }}>
              <span style={{ fontSize: "14px", color: "#6B7085", width: "28px" }}>01</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: "500" }}>Council registration check</span>
                <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.5" }}>TCMC, KNMC, KSPC, RCI and allied health registrations confirmed directly.</span>
              </div>
            </div>
            <div data-reveal="1" style={{ display: "flex", gap: "24px", padding: "22px 0", borderTop: "1px solid #E6E8EF" }}>
              <span style={{ fontSize: "14px", color: "#6B7085", width: "28px" }}>02</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: "500" }}>ID and police verification</span>
                <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.5" }}>Aadhaar-based identity and local police clearance for everyone who enters your home.</span>
              </div>
            </div>
            <div data-reveal="1" style={{ display: "flex", gap: "24px", padding: "22px 0", borderTop: "1px solid #E6E8EF" }}>
              <span style={{ fontSize: "14px", color: "#6B7085", width: "28px" }}>03</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: "500" }}>In-person interview</span>
                <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.5" }}>A clinical skills review and a conversation about bedside manner.</span>
              </div>
            </div>
            <div data-reveal="1" style={{ display: "flex", gap: "24px", padding: "22px 0", borderTop: "1px solid #E6E8EF", borderBottom: "1px solid #E6E8EF" }}>
              <span style={{ fontSize: "14px", color: "#6B7085", width: "28px" }}>04</span>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "18px", fontWeight: "500" }}>Ongoing ratings</span>
                <span style={{ fontSize: "15px", color: "#6B7085", lineHeight: "1.5" }}>Every visit is rated. Anyone below 4.3 is reviewed by our care team.</span>
              </div>
            </div>
          </div>
        </section>
        <section style={{ background: "#F6F7FA", padding: "clamp(56px,7vw,104px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexWrap: "wrap", gap: "clamp(28px,5vw,80px)" }}>
            <h2 data-reveal="1" style={{ flex: "1 1 300px", margin: "0", fontSize: "clamp(32px,4vw,52px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1.05" }}>
              Questions,{" "}
              <span style={{ fontWeight: "600" }}>answered</span>
              .
            </h2>
            <div style={{ flex: "1.4 1 420px", display: "flex", flexDirection: "column" }}>
              {v.faqs.map((fq: any, i0: number) => (
                <Fragment key={i0}>
                  <div style={{ borderTop: "1px solid #E1E3EB" }}>
                    <button onClick={fq.tog} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "16px", background: "none", border: "none", padding: "20px 0", font: "inherit", fontSize: "17px", fontWeight: "400", color: "#02084D", cursor: "pointer", textAlign: "left" }}>
                      {fq.q}
                      <span style={{ width: "28px", height: "28px", borderRadius: "50%", border: "1px solid #D9DCE6", display: "flex", alignItems: "center", justifyContent: "center", flex: "none", transform: `rotate(${fq.rot})`, transition: "transform .3s" }}>
                        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6">
                          <path d="M12 5v14M5 12h14" />
                        </svg>
                      </span>
                    </button>
                    {fq.open && (
                      <>
                        <p style={{ margin: "0 0 22px", fontSize: "15px", lineHeight: "1.6", color: "#4A4F6A", maxWidth: "620px", animation: "mthIn .25s ease" }}>{fq.a}</p>
                      </>
                    )}
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
        <section style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(56px,7vw,104px) clamp(18px,4vw,48px)", display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Call us</span>
            <a href="tel:+914952700700" style={{ fontSize: "24px", fontWeight: "300", letterSpacing: "-.02em" }}>+91 495 270 0700</a>
            <span style={{ fontSize: "14px", color: "#6B7085" }}>7 AM – 10 PM, every day</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Write to us</span>
            <a href="mailto:care@medicotohome.in" style={{ fontSize: "24px", fontWeight: "300", letterSpacing: "-.02em" }}>care@medicotohome.in</a>
            <span style={{ fontSize: "14px", color: "#6B7085" }}>Replies within 2 hours</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            <span style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Visit us</span>
            <span style={{ fontSize: "24px", fontWeight: "300", letterSpacing: "-.02em", lineHeight: "1.25" }}>3rd floor, Hilite Business Park, Mavoor Road, Kozhikode 673014</span>
          </div>
        </section>
      </div>
    </>
  );
}
