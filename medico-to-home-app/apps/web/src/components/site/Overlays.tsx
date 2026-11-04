"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";
import { SignInFlow } from "@/components/auth/SignInFlow";

export function Overlays() {
  const v = useSite();
  return (
    <>
      {v.filtersOpen && (
        <>
          <div onClick={v.closeFilters} style={{ position: "fixed", inset: "0", background: "rgba(2,8,77,.18)", zIndex: "80", animation: "mthIn .2s ease" }}></div>
          <aside className="mth-menu" style={{ position: "fixed", top: "0", right: "0", bottom: "0", width: "min(420px,100vw)", background: "#fff", zIndex: "81", display: "flex", flexDirection: "column", boxShadow: "-20px 0 60px -30px rgba(2,8,77,.3)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "22px 24px", borderBottom: "1px solid #EEF0F5" }}>
              <span style={{ fontSize: "22px", fontWeight: "300", letterSpacing: "-.02em" }}>
                <span style={{ fontWeight: "600" }}>Filters</span>
              </span>
              <button onClick={v.closeFilters} aria-label="Close" style={{ width: "38px", height: "38px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.8">
                  <path d="M6 6l12 12M18 6 6 18" />
                </svg>
              </button>
            </div>
            <div style={{ flex: "1", overflow: "auto", padding: "24px", display: "flex", flexDirection: "column", gap: "28px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px" }}>
                  <span style={{ fontWeight: "500" }}>Price per visit</span>
                  <span style={{ color: "#6B7085" }}>{v.fPriceText}</span>
                </div>
                <input type="range" min={200} max={1600} step={50} value={v.fPrice} onChange={v.onPrice} style={{ accentColor: "#02084D", width: "100%" }} />
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#9A9EB3" }}>
                  <span>₹200</span>
                  <span>₹1,600+</span>
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Distance</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {v.fDist.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.label}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Gender</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {v.fGender.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.label}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Languages spoken</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {v.fLangs.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.label}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Experience</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {v.fExp.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.label}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "14px", fontWeight: "500" }}>Rating</span>
                <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                  {v.fRating.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.label}</button>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: "flex", gap: "10px", padding: "18px 24px", borderTop: "1px solid #EEF0F5" }}>
              <button onClick={v.resetFilters} style={{ flex: "none", background: "none", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "14px 20px", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer" }}>Reset</button>
              {" "}
              <button onClick={v.closeFilters} style={{ flex: "1", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "14px 20px", font: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer" }} className="mth-hover-7">{v.showN}</button>
            </div>
          </aside>
        </>
      )}
      {v.sos && (
        <>
          <div onClick={v.closeSos} className="mth-modal" style={{ position: "fixed", inset: "0", background: "rgba(2,8,77,.28)", zIndex: "90", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "mthIn .2s ease" }}>
            <div onClick={v.stop} style={{ width: "min(420px,100%)", background: "#fff", borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ background: "#FDECEC", color: "#D93A3A", borderRadius: "999px", padding: "5px 12px", fontSize: "12px", fontWeight: "600", letterSpacing: ".06em" }}>SOS · DEMO</span>
                <button onClick={v.closeSos} aria-label="Close" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <div style={{ fontSize: "28px", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1.1" }}>
                Emergency help{" "}
                <span style={{ fontWeight: "600" }}>would be alerted</span>
                .
              </div>
              <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#6B7085" }}>In the live app, your location ({v.loc}) and emergency contacts would be shared with the nearest ambulance and our 24×7 care desk.</p>
              <a href="tel:112" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#D93A3A", color: "#fff", borderRadius: "999px", padding: "16px", fontSize: "16px", fontWeight: "600" }} className="mth-hover-15">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.6">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
                Call 112
              </a>
              {" "}
              <button onClick={v.sosAmb} style={{ background: "#fff", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "14px", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer" }} className="mth-hover-1">Book an ambulance instead</button>
            </div>
          </div>
        </>
      )}
      {v.login && (
        <>
          <div onClick={v.closeLogin} className="mth-modal" style={{ position: "fixed", inset: "0", background: "rgba(2,8,77,.22)", zIndex: "90", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px", animation: "mthIn .2s ease" }}>
            <div onClick={v.stop} style={{ width: "min(420px,100%)", background: "#fff", borderRadius: "24px", padding: "28px", display: "flex", flexDirection: "column", gap: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <img src="/brand/icon.svg" alt="" style={{ height: "26px" }} />
                <button onClick={v.closeLogin} aria-label="Close" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.8">
                    <path d="M6 6l12 12M18 6 6 18" />
                  </svg>
                </button>
              </div>
              <SignInFlow title="Patient login" onSignedIn={v.signedIn} beforeLeave={v.savePending} />
              <p style={{ margin: "0", textAlign: "center", fontSize: "14px", color: "#4A4F6A" }}>
                Doctor, nurse or caregiver? <a href="/medico" style={{ color: "#02084D", fontWeight: "500", textDecoration: "underline" }}>Medico login</a>
              </p>
            </div>
          </div>
        </>
      )}
      {v.hasToast && (
        <>
          <div className="mth-toast" style={{ position: "fixed", left: "50%", bottom: "28px", transform: "translateX(-50%)", zIndex: "95", background: "#02084D", color: "#fff", borderRadius: "999px", padding: "12px 20px", fontSize: "14px", display: "flex", alignItems: "center", gap: "8px", animation: "mthIn .25s ease", whiteSpace: "nowrap" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            {v.toast}
          </div>
        </>
      )}
    </>
  );
}
