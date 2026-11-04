"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";
import { ProCard } from "./ProCard";

export function ProfessionalView() {
  const v = useSite();
  return (
    <>
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "24px clamp(18px,4vw,48px) 120px", animation: "mthIn .35s ease" }}>
        <button onClick={v.ppBack} style={{ background: "none", border: "none", font: "inherit", fontSize: "14px", color: "#4A4F6A", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 0", marginBottom: "20px", transition: "color .2s" }} className="mth-hover-0">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M11 6l-6 6 6 6" />
          </svg>
          Back to results
        </button>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,64px)", alignItems: "flex-start" }}>
          <div style={{ flex: "0 1 420px", minWidth: "260px", position: v.ppSticky, top: "96px" }}>
            <div style={{ aspectRatio: "4/5", borderRadius: "20px", overflow: "hidden", background: "#EEF0F6", position: "relative" }}>
              {v.pp.hasImg && (
                <>
                  <div role="img" aria-label={v.pp.name} style={{ width: "100%", height: "100%", backgroundImage: `url(${v.pp.img})`, backgroundSize: "cover", backgroundPosition: "center 30%" }}></div>
                </>
              )}
              {v.pp.noImg && (
                <>
                  <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <div style={{ width: "140px", height: "140px", borderRadius: "50%", background: "#DFE2EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "44px", fontWeight: "300" }}>{v.pp.initials}</div>
                  </div>
                </>
              )}
              <div style={{ position: "absolute", left: "14px", top: "14px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(255,255,255,.95)", borderRadius: "999px", padding: "6px 12px 6px 9px", fontSize: "13px", fontWeight: "500" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                Verified
              </div>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
              <button onClick={v.ppSave} style={{ flex: "1", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "11px", font: "inherit", fontSize: "13px", color: "#02084D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "border-color .2s" }} className="mth-hover-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                  <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />
                </svg>
                Save
              </button>
              {" "}
              <button onClick={v.ppShare} style={{ flex: "1", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "11px", font: "inherit", fontSize: "13px", color: "#02084D", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px", transition: "border-color .2s" }} className="mth-hover-1">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                  <path d="M18 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM6 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM18 22a3 3 0 1 0 0-6 3 3 0 0 0 0 6zM8.6 13.5l6.8 4M15.4 6.5l-6.8 4" />
                </svg>
                Share
              </button>
            </div>
          </div>
          <div style={{ flex: "1 1 480px", minWidth: "0", display: "flex", flexDirection: "column", gap: "44px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div style={{ fontSize: "15px", letterSpacing: "-.01em" }}>
                <span style={{ fontWeight: "600" }}>{v.pp.brand}</span>
                <span style={{ fontWeight: "300" }}>{" "}To Home.</span>
              </div>
              <h1 style={{ margin: "0", fontSize: "clamp(36px,4.6vw,60px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1" }}>{v.pp.name}</h1>
              <div style={{ fontSize: "16px", color: "#4A4F6A", lineHeight: "1.5" }}>{v.pp.roleQual}</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6B7085" }}>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="1.6">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                {v.pp.reg} · ID & background verified
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", borderTop: "1px solid #E6E8EF", borderBottom: "1px solid #E6E8EF", marginTop: "8px" }}>
                <div style={{ padding: "18px 16px 18px 0", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "34px", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>★ {v.pp.rating}</span>
                  <span style={{ fontSize: "13px", color: "#6B7085" }}>{v.pp.reviews} reviews</span>
                </div>
                <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: "4px", borderLeft: "1px solid #EEF0F5" }}>
                  <span style={{ fontSize: "34px", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>
                    {v.pp.exp}
                    <span style={{ fontSize: "16px", fontWeight: "300" }}>{" "}yrs</span>
                  </span>
                  <span style={{ fontSize: "13px", color: "#6B7085" }}>Experience</span>
                </div>
                <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: "4px", borderLeft: "1px solid #EEF0F5" }}>
                  <span style={{ fontSize: "34px", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>
                    {v.pp.km}
                    <span style={{ fontSize: "16px", fontWeight: "300" }}>{" "}km</span>
                  </span>
                  <span style={{ fontSize: "13px", color: "#6B7085" }}>From {v.loc}</span>
                </div>
                <div style={{ padding: "18px 16px", display: "flex", flexDirection: "column", gap: "4px", borderLeft: "1px solid #EEF0F5" }}>
                  <span style={{ fontSize: "34px", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>{v.pp.priceText}</span>
                  <span style={{ fontSize: "13px", color: "#6B7085" }}>{v.pp.unitText}</span>
                </div>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", alignItems: "center" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "6px 12px", fontSize: "13px", background: v.pp.availBg, color: v.pp.availFg }}>
                  <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: v.pp.availFg }}></span>
                  {v.pp.availText}
                </div>
                {v.pp.langsList.map((lg: any, i0: number) => (
                  <Fragment key={i0}>
                    <span style={{ border: "1px solid #E6E8EF", borderRadius: "999px", padding: "6px 12px", fontSize: "13px" }}>{lg}</span>
                  </Fragment>
                ))}
              </div>
              <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginTop: "6px" }}>
                <button onClick={v.ppBook} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "15px 28px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-8">Book now</button>
                {v.ppCanPlan && (
                  <>
                    <button onClick={v.ppPlanBook} style={{ background: "#fff", color: "#02084D", border: "1px solid #02084D", borderRadius: "999px", padding: "15px 24px", font: "inherit", fontSize: "15px", fontWeight: "500", cursor: "pointer", transition: "background .2s" }} className="mth-hover-6">Book a treatment plan</button>
                  </>
                )}
                <button onClick={v.ppChat} style={{ background: "none", color: "#02084D", border: "none", borderRadius: "999px", padding: "15px 12px", font: "inherit", fontSize: "15px", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px" }}>
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M21 12a8.5 8.5 0 0 1-12.4 7.6L3 21l1.4-5.6A8.5 8.5 0 1 1 21 12z" />
                  </svg>
                  Ask a question
                </button>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>About</h3>
              <p style={{ margin: "0", fontSize: "18px", lineHeight: "1.6", fontWeight: "300", maxWidth: "640px", textWrap: "pretty" }}>{v.pp.bio}</p>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <h3 style={{ margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Services & prices</h3>
              <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden" }}>
                {v.ppSvcs.map((sv: any, i0: number) => (
                  <Fragment key={i0}>
                    <div style={{ display: "flex", alignItems: "center", gap: "16px", padding: "16px 20px", borderBottom: "1px solid #F0F1F5", transition: "background .2s" }} className="mth-hover-6">
                      <div style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "15px", fontWeight: "400" }}>{sv.n}</span>
                        <span style={{ fontSize: "13px", color: "#6B7085" }}>{sv.d}</span>
                      </div>
                      <div style={{ fontSize: "15px", whiteSpace: "nowrap" }}>
                        <span style={{ fontWeight: "600" }}>{sv.price}</span>
                        <span style={{ color: "#6B7085", fontSize: "13px" }}>{" "}{sv.unit}</span>
                      </div>
                      <button onClick={sv.book} style={{ border: "1px solid #E6E8EF", background: "#fff", borderRadius: "999px", padding: "8px 16px", font: "inherit", fontSize: "13px", color: "#02084D", cursor: "pointer", transition: "all .2s" }} className="mth-hover-12">Book</button>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", flexWrap: "wrap" }}>
                <h3 style={{ margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Availability this week</h3>
                <span style={{ fontSize: "13px", color: "#6B7085" }}>Tap a time to book</span>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(7,minmax(0,1fr))", gap: "6px" }}>
                {v.week.map((wd: any, i0: number) => (
                  <Fragment key={i0}>
                    <button onClick={wd.pick} style={{ border: `1px solid ${wd.bd}`, background: wd.bg, color: wd.fg, borderRadius: "14px", padding: "10px 2px", font: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", transition: "border-color .2s" }} className="mth-hover-1">
                      <span style={{ fontSize: "11px", opacity: ".8" }}>{wd.dow}</span>
                      <span style={{ fontSize: "20px", fontWeight: "400" }}>{wd.n}</span>
                      <span style={{ fontSize: "10px", opacity: ".7" }}>{wd.sub}</span>
                    </button>
                  </Fragment>
                ))}
              </div>
              {v.hasSlots && (
                <>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                    {v.pslots.map((sl: any, i0: number) => (
                      <Fragment key={i0}>
                        <button onClick={sl.pick} style={{ border: `1px solid ${sl.bd}`, background: sl.bg, color: sl.fg, borderRadius: "999px", padding: "9px 14px", font: "inherit", fontSize: "13px", cursor: sl.cur, transition: "border-color .2s" }} className="mth-hover-1">{sl.label}</button>
                      </Fragment>
                    ))}
                  </div>
                </>
              )}
              {v.noSlots && (
                <>
                  <div style={{ padding: "18px", borderRadius: "12px", background: "#F6F7FA", fontSize: "14px", color: "#6B7085" }}>Not available on {v.selDayText}. Try another day.</div>
                </>
              )}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Service area</h3>
              <div style={{ height: "240px", borderRadius: "16px", backgroundColor: "#EEF0F6", backgroundImage: "repeating-linear-gradient(0deg,transparent 0 39px,#E3E6EF 39px 40px),repeating-linear-gradient(90deg,transparent 0 39px,#E3E6EF 39px 40px)", position: "relative", overflow: "hidden" }}>
                <div style={{ position: "absolute", left: "50%", top: "50%", width: "190px", height: "190px", transform: "translate(-50%,-50%)", borderRadius: "50%", background: "rgba(2,8,77,.06)", border: "1px dashed rgba(2,8,77,.35)" }}></div>
                <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 24 24" fill="#02084D" stroke="#fff" strokeWidth="1">
                    <path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
                  </svg>
                </div>
                <div style={{ position: "absolute", left: "calc(50% + 58px)", top: "calc(50% + 34px)", width: "12px", height: "12px", borderRadius: "50%", background: "#1F9D6B", boxShadow: "0 0 0 5px rgba(31,157,107,.18)" }}></div>
                <div style={{ position: "absolute", left: "calc(50% + 76px)", top: "calc(50% + 28px)", background: "#fff", borderRadius: "999px", padding: "3px 10px", fontSize: "12px" }}>You · {v.pp.km} km</div>
                <div style={{ position: "absolute", left: "14px", bottom: "14px", background: "#fff", borderRadius: "999px", padding: "6px 12px", fontSize: "12px" }}>Visits within {v.pp.radius} km of {v.pp.locality}, {v.pp.district}</div>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <h3 style={{ margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Reviews · ★ {v.pp.rating} from {v.pp.reviews}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: "12px" }}>
                {v.ppRevs.map((rv: any, i0: number) => (
                  <Fragment key={i0}>
                    <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#EEF0F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "14px", fontWeight: "500" }}>{rv.initial}</span>
                        <span style={{ display: "flex", flexDirection: "column" }}>
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>{rv.name}</span>
                          <span style={{ fontSize: "12px", color: "#6B7085" }}>{rv.place} · {rv.when}</span>
                        </span>
                      </div>
                      <div style={{ fontSize: "13px", letterSpacing: ".1em" }}>{rv.starsTxt}</div>
                      <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", fontWeight: "300", color: "#3A3F5C" }}>{rv.text}</p>
                    </div>
                  </Fragment>
                ))}
              </div>
            </div>
          </div>
        </div>
        {v.hasSimilar && (
          <>
            <div style={{ marginTop: "88px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <h2 style={{ margin: "0", fontSize: "clamp(26px,3vw,38px)", fontWeight: "300", letterSpacing: "-.03em" }}>
                Similar{" "}
                <span style={{ fontWeight: "600" }}>near you</span>
              </h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "20px" }}>
                {v.similar.map((p: any, i0: number) => (
                  <Fragment key={i0}>
                    <ProCard pro={p} />
                  </Fragment>
                ))}
              </div>
            </div>
          </>
        )}
        {v.mob && (
          <>
            <div className="keyboard-hide" style={{ position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "40", background: "#fff", borderTop: "1px solid #E6E8EF", padding: "12px 18px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>
                  {v.pp.priceText}{" "}
                  <span style={{ fontWeight: "300", fontSize: "13px", color: "#6B7085" }}>{v.pp.unitText}</span>
                </span>
                <span style={{ fontSize: "12px", color: v.pp.availFg }}>{v.pp.availText}</span>
              </div>
              <button onClick={v.ppBook} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "14px 26px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer" }}>Book now</button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
