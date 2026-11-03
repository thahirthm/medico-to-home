"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function Footer() {
  const v = useSite();
  return (
    <>
      <footer className="mth-footer" style={{ borderTop: "1px solid #E6E8EF", padding: "clamp(48px,6vw,80px) clamp(18px,4vw,48px) 32px", background: "#fff" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "48px" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "40px", justifyContent: "space-between" }}>
            <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "16px", maxWidth: "340px" }}>
              <img src="/brand/logo.svg" alt="Medico To Home" style={{ height: "38px", width: "auto", alignSelf: "flex-start" }} />
              <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6B7085" }}>Verified healthcare professionals, at your doorstep.</p>
              <div style={{ display: "flex", gap: "8px" }}>
                <a href="#" aria-label="Instagram" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E6E8EF", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4zM12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8zM17.5 6.5h.01" />
                  </svg>
                </a>
                {" "}
                <a href="#" aria-label="Facebook" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E6E8EF", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M15 3h-2a4 4 0 0 0-4 4v3H6v4h3v7h4v-7h3l1-4h-4V7a1 1 0 0 1 1-1h2z" />
                  </svg>
                </a>
                {" "}
                <a href="#" aria-label="LinkedIn" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E6E8EF", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M4 9h4v12H4zM6 3a2 2 0 1 0 0 4 2 2 0 0 0 0-4zM10 9h4v2c.6-1 2-2 4-2 3 0 4 2 4 5v7h-4v-6c0-1.5-.5-2.5-2-2.5S14 13.5 14 15v6h-4z" />
                  </svg>
                </a>
                {" "}
                <a href="#" aria-label="WhatsApp" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E6E8EF", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12z" />
                  </svg>
                </a>
              </div>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(32px,5vw,72px)" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500", marginBottom: "4px" }}>Services</span>
                {" "}
                <button onClick={v.fDoctor} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">Doctor To Home</button>
                {" "}
                <button onClick={v.fNurse} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">Nurse To Home</button>
                {" "}
                <button onClick={v.fPhysio} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">Physio To Home</button>
                {" "}
                <button onClick={v.fLab} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">Lab To Home</button>
                {" "}
                <button onClick={v.fCare} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">Care To Home</button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500", marginBottom: "4px" }}>Company</span>
                {" "}
                <button onClick={v.goAbout} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">About</button>
                {" "}
                <button onClick={v.goHow} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">How it works</button>
                {" "}
                <button onClick={v.goJoin} style={{ background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }} className="mth-hover-5">For professionals</button>
                {" "}
                <a href="/legal/privacy" style={{ color: "#02084D" }}>Privacy</a>
                {" "}
                <a href="/legal/terms" style={{ color: "#02084D" }}>Terms</a>
                {" "}
                <a href="/legal/refunds" style={{ color: "#02084D" }}>Refund & cancellation</a>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500", marginBottom: "4px" }}>Cities served</span>
                {" "}
                <span className="mth-footer-item">Kozhikode</span>
                <span className="mth-footer-item">Malappuram</span>
                <span className="mth-footer-item" style={{ color: "#6B7085" }}>Kannur — early 2027</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500", marginBottom: "4px" }}>Contact</span>
                {" "}
                <a href="tel:+914952700700">+91 495 270 0700</a>
                <a href="mailto:care@medicotohome.in">care@medicotohome.in</a>
                <span style={{ color: "#6B7085", maxWidth: "200px", lineHeight: "1.5" }}>Mavoor Road, Kozhikode 673014</span>
              </div>
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "12px", paddingTop: "24px", borderTop: "1px solid #EEF0F5", fontSize: "13px", color: "#6B7085" }}>
            <span>© 2026 Medico To Home</span>
            <span>In an emergency, always call 112.</span>
          </div>
        </div>
      </footer>
    </>
  );
}
