"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function Header() {
  const v = useSite();
  return (
    <>
      <header style={{ position: "sticky", top: "0", zIndex: "60", background: v.hdrBg, borderBottom: `1px solid ${v.hdrBd}`, transition: "background .3s ease, border-color .3s ease" }}>
        <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 clamp(18px,4vw,48px)", height: "72px", display: "flex", alignItems: "center", gap: "20px" }}>
          <button onClick={v.goHome} aria-label="Medico To Home" style={{ background: "none", border: "none", padding: "0", cursor: "pointer", display: "flex", alignItems: "center", flex: "none" }}>
            <img src="/brand/logo.svg" alt="Medico To Home" style={{ height: "32px", width: "auto", display: "block" }} />
          </button>
          {v.hdrDesk && (
            <>
              <nav style={{ flex: "1", display: "flex", justifyContent: "center", gap: "clamp(16px,2.4vw,36px)", fontSize: "14px", fontWeight: "400" }}>
                <button onClick={v.goServices} style={{ background: "none", border: "none", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap", font: "inherit", color: "#4A4F6A", transition: "color .2s" }} className="mth-hover-0">Services</button>
                {" "}
                <button onClick={v.goHow} style={{ background: "none", border: "none", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap", font: "inherit", color: "#4A4F6A", transition: "color .2s" }} className="mth-hover-0">How it works</button>
                {" "}
                <button onClick={v.goJoin} style={{ background: "none", border: "none", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap", font: "inherit", color: v.joinFg, transition: "color .2s" }} className="mth-hover-0">For Professionals</button>
                {" "}
                <button onClick={v.goAbout} style={{ background: "none", border: "none", padding: "6px 0", cursor: "pointer", whiteSpace: "nowrap", font: "inherit", color: v.aboutFg, transition: "color .2s" }} className="mth-hover-0">About</button>
              </nav>
              <div style={{ display: "flex", alignItems: "center", gap: "14px", flex: "none" }}>
                <button onClick={v.pillLoc} style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "8px 12px 8px 10px", font: "inherit", fontSize: "13px", color: "#02084D", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
                  </svg>
                  {" "}
                  <span style={{ fontWeight: "400" }}>{v.locDistrict}</span>
                  {" "}
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5">
                    <path d="M6 9l6 6 6-6" />
                  </svg>
                </button>
                {" "}
                {v.loggedOut && (
                  <>
                    <button onClick={v.openLogin} style={{ border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "8px 18px", font: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer", transition: "background .2s, color .2s", whiteSpace: "nowrap" }} className="mth-hover-2">Patient login</button>
                    <button onClick={v.proLogin} style={{ background: "#02084D", color: "#fff", border: "1px solid #02084D", borderRadius: "999px", padding: "8px 18px", font: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer", whiteSpace: "nowrap" }} className="mth-hover-7">Medico login</button>
                  </>
                )}
                {v.isProfessional && (
                  <button onClick={v.toProMode} title="Switch to professional mode" style={{ display: "flex", alignItems: "center", gap: "6px", font: "inherit", fontSize: "13px", color: "#02084D", background: "#F6F7FA", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "8px 14px", cursor: "pointer" }} className="mth-hover-1">
                    <span aria-hidden>⇄</span> Professional mode
                  </button>
                )}
                {v.loggedIn && (
                  <>
                    <button onClick={v.goAcct} style={{ display: "flex", alignItems: "center", gap: "8px", font: "inherit", fontSize: "13px", fontWeight: "400", color: "#02084D", background: "#fff", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "4px 14px 4px 4px", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
                      <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#EEF0F6", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "500" }}>{v.userInitial}</span>
                      My profile
                    </button>
                  </>
                )}
                <button onClick={v.openSos} style={{ background: "#D93A3A", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", cursor: "pointer", transition: "background .2s, transform .15s" }} className="mth-hover-3 mth-active-4">SOS</button>
              </div>
            </>
          )}
          {v.hdrMob && (
            <>
              <div style={{ flex: "1" }}></div>
              <button onClick={v.openSos} style={{ background: "#D93A3A", color: "#fff", border: "none", borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "12px", fontWeight: "600", letterSpacing: ".06em", cursor: "pointer" }}>SOS</button>
              {v.loggedIn && (
                <>
                  <button onClick={v.goAcct} aria-label="My profile" style={{ width: "44px", height: "44px", border: "1px solid #E6E8EF", background: "#EEF0F6", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", font: "inherit", fontSize: "14px", fontWeight: "500", color: "#02084D" }}>{v.userInitial}</button>
                </>
              )}
              <button onClick={v.toggleMenu} aria-label="Menu" style={{ width: "44px", height: "44px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5" strokeLinecap="round">
                  <path d="M4 8h16M4 16h16" />
                </svg>
              </button>
            </>
          )}
        </div>
        {v.menu && (
          <>
            <div style={{ position: "fixed", left: "0", right: "0", top: "72px", bottom: "0", background: "#fff", zIndex: "59", padding: "24px 24px 40px", display: "flex", flexDirection: "column", gap: "4px", animation: "mthIn .25s ease", overflow: "auto" }}>
              <button onClick={v.goServices} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>Services</button>
              {" "}
              <button onClick={v.goHow} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>How it works</button>
              {" "}
              <button onClick={v.goJoin} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>For Professionals</button>
              {" "}
              <button onClick={v.goAbout} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>About</button>
              {v.isProfessional && (
                <button onClick={v.toProMode} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>⇄ Professional mode</button>
              )}
              {" "}
              <button onClick={v.acctOrLogin} style={{ textAlign: "left", background: "none", border: "none", borderBottom: "1px solid #EEF0F5", padding: "18px 0", font: "inherit", fontSize: "26px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D", cursor: "pointer" }}>My profile & records</button>
              <div style={{ display: "flex", gap: "10px", marginTop: "24px", flexWrap: "wrap" }}>
                <button onClick={v.pillLoc} style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "12px 16px", font: "inherit", fontSize: "14px", color: "#02084D" }}>{v.loc}, {v.locDistrict}</button>
                {" "}
                <button onClick={v.acctOrLogin} style={{ border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "12px 22px", font: "inherit", fontSize: "14px", fontWeight: "500" }}>{v.acctLabel}</button>
                {v.loggedOut && <button onClick={v.proLogin} style={{ border: "1px solid #02084D", background: "#02084D", color: "#fff", borderRadius: "999px", padding: "12px 22px", font: "inherit", fontSize: "14px", fontWeight: "500" }}>Medico login</button>}
              </div>
            </div>
          </>
        )}
      </header>
    </>
  );
}
