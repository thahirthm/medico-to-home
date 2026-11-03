"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function BookedView() {
  const v = useSite();
  if (!v.b || !v.liveTotal) return <div style={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", color: "#6B7085" }}>Loading your booking…</div>;
  return (
    <>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "clamp(32px,5vw,64px) clamp(18px,4vw,48px) 100px", animation: "mthIn .4s ease", display: "flex", flexDirection: "column", gap: "clamp(36px,4vw,56px)" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px", alignItems: "flex-start" }}>
          <span style={{ width: "56px", height: "56px", borderRadius: "50%", background: "#E8F5EF", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="2">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          <h1 style={{ margin: "0", fontSize: "clamp(40px,6vw,80px)", fontWeight: "300", letterSpacing: "-.045em", lineHeight: "1" }}>
            You’re{" "}
            <span style={{ fontWeight: "600" }}>booked</span>
            .
          </h1>
          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", fontSize: "15px", color: "#4A4F6A" }}>
            <span>Booking ID</span>
            <span style={{ fontWeight: "600", color: "#02084D", background: "#F6F7FA", borderRadius: "999px", padding: "5px 12px", letterSpacing: ".02em" }}>{v.bookingId}</span>
            <span>· {v.liveStatus} · {v.liveTotal}</span>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "6px" }}>
            <button onClick={v.shareFam} style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "11px 18px", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                <path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
              </svg>
              Share with family
            </button>
            {" "}
            <button onClick={v.chatPro} style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "11px 18px", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12z" />
              </svg>
              Chat with professional
            </button>
          </div>
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "20px", alignItems: "stretch" }}>
          <div style={{ flex: "1.4 1 480px", border: "1px solid #E6E8EF", borderRadius: "20px", overflow: "hidden", display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "20px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", gap: "12px", borderBottom: "1px solid #F0F1F5", flexWrap: "wrap" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Track visit</span>
                <span style={{ fontSize: "15px" }}>Next visit · {v.liveSummary}</span>
              </div>
              {v.canAdvance && (
                <>
                  <button onClick={v.advance} style={{ border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "12px", color: "#4A4F6A", cursor: "pointer" }} className="mth-hover-1">Demo: next status →</button>
                </>
              )}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", flex: "1" }}>
              <div style={{ flex: "1 1 280px", minHeight: "260px", backgroundColor: "#EEF0F6", backgroundImage: "repeating-linear-gradient(0deg,transparent 0 39px,#E3E6EF 39px 40px),repeating-linear-gradient(90deg,transparent 0 39px,#E3E6EF 39px 40px)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: "18%", top: "72%", right: "22%", height: "2px", background: "#C9CCD8" }}></div>
                <div style={{ position: "absolute", left: "18%", top: "72%", width: v.trackPct, maxWidth: "60%", height: "2px", background: "#02084D", transition: "width 1s ease" }}></div>
                <div style={{ position: "absolute", left: "calc(18% - 7px)", top: "calc(72% - 7px)", width: "16px", height: "16px", borderRadius: "50%", background: "#fff", border: "2px solid #02084D" }}></div>
                <div style={{ position: "absolute", right: "calc(22% - 10px)", top: "calc(72% - 28px)" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="#1F9D6B" stroke="#fff" strokeWidth="1">
                    <path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
                  </svg>
                </div>
                <div style={{ position: "absolute", left: "16px", top: "16px", background: "#fff", borderRadius: "14px", padding: "12px 16px", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "12px", color: "#6B7085" }}>ETA</span>
                  <span style={{ fontSize: "30px", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1" }}>{v.etaText}</span>
                </div>
              </div>
              <div style={{ flex: "1 1 220px", padding: "22px", display: "flex", flexDirection: "column" }}>
                {v.tracks.map((tk: any, i0: number) => (
                  <Fragment key={i0}>
                    <div style={{ display: "flex", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                        <span style={{ width: "14px", height: "14px", borderRadius: "50%", background: tk.dotBg, border: `1px solid ${tk.dotBd}`, transition: "all .4s", flex: "none", marginTop: "3px" }}></span>
                        {tk.notLast && (
                          <>
                            <span style={{ width: "1px", flex: "1", minHeight: "26px", background: tk.bar, transition: "background .4s" }}></span>
                          </>
                        )}
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "2px", paddingBottom: "14px" }}>
                        <span style={{ fontSize: "15px", color: tk.fg, fontWeight: tk.w }}>{tk.t}</span>
                        <span style={{ fontSize: "12px", color: "#6B7085" }}>{tk.sub}</span>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
          <div style={{ flex: "1 1 320px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ border: "1px solid #E6E8EF", borderRadius: "20px", padding: "20px", display: "flex", gap: "14px", alignItems: "center" }}>
              <div style={{ width: "64px", height: "80px", borderRadius: "12px", overflow: "hidden", background: "#EEF0F6", flex: "none", display: "flex", alignItems: "center", justifyContent: "center" }}>
                {v.bkPro.hasImg && (
                  <>
                    <div style={{ width: "100%", height: "100%", backgroundImage: `url(${v.bkPro.img})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                  </>
                )}
                {v.bkPro.noImg && (
                  <>
                    <span style={{ fontSize: "20px", fontWeight: "300" }}>{v.bkPro.initials}</span>
                  </>
                )}
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>{v.bkPro.name}</span>
                <span style={{ fontSize: "13px", color: "#6B7085" }}>{v.bkRole} · ★ {v.bkPro.rating}</span>
                <span style={{ fontSize: "12px", color: "#6B7085" }}>{v.liveSvc}</span>
              </div>
              <button onClick={v.chatPro} aria-label="Call" style={{ width: "42px", height: "42px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }} className="mth-hover-1">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                  <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z" />
                </svg>
              </button>
            </div>
            <div style={{ border: "1px solid #E6E8EF", borderRadius: "20px", padding: "20px", display: "flex", flexDirection: "column", gap: "10px" }}>
              <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Schedule · {v.liveCount} date(s)</span>
              {v.liveSched.map((sd: any, i0: number) => (
                <Fragment key={i0}>
                  <div style={{ display: "flex", gap: "14px", fontSize: "14px", padding: "6px 0", borderTop: "1px solid #F4F5F8" }}>
                    <span style={{ color: "#9A9EB3", width: "22px" }}>{sd.n}</span>
                    <span style={{ flex: "1" }}>{sd.d}</span>
                    <span style={{ color: "#4A4F6A" }}>{sd.t}</span>
                  </div>
                </Fragment>
              ))}
              {v.hasMoreSched && (
                <>
                  <button onClick={v.togSched} style={{ alignSelf: "flex-start", background: "none", border: "none", font: "inherit", fontSize: "13px", fontWeight: "500", color: "#02084D", cursor: "pointer", padding: "4px 0" }}>{v.schedToggle}</button>
                </>
              )}
            </div>
            <button onClick={v.goHome} style={{ alignSelf: "flex-start", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "14px 24px", font: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer" }} className="mth-hover-7">Back to home</button>
          </div>
        </div>
      </div>
    </>
  );
}
