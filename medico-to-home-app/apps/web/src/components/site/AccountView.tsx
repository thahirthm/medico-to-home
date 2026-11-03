"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function AccountView() {
  const v = useSite();
  if (!v.acTabs) return null;
  return (
    <>
      <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "clamp(24px,4vw,48px) clamp(16px,4vw,48px) 100px", animation: "mthIn .35s ease", display: "flex", flexDirection: "column", gap: "clamp(22px,3vw,32px)" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <span style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#EEF0F6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "24px", fontWeight: "300", flex: "none" }}>{v.userInitial}</span>
          <div style={{ flex: "1", minWidth: "200px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <h1 style={{ margin: "0", fontSize: "clamp(30px,4vw,48px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1.05" }}>{v.acInfo.name}</h1>
            <span style={{ fontSize: "14px", color: "#6B7085" }}>{v.acInfo.phone ? `+91 ${v.acInfo.phone} · ` : ""}{v.acInfo.email}</span>
          </div>
          <button onClick={v.logout} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">Log out</button>
        </div>
        <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", borderBottom: "1px solid #EEF0F5", paddingBottom: "16px" }}>
          {v.acTabs.map((t: any, i0: number) => (
            <Fragment key={i0}>
              <button onClick={t.pick} style={{ flex: "none", border: `1px solid ${t.bd}`, background: t.bg, color: t.fg, borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "all .25s" }} className="mth-hover-1">{t.l}</button>
            </Fragment>
          ))}
        </div>
        {v.acRecords && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "22px", animation: "mthIn .3s ease" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Records for</span>
                <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "2px", alignItems: "center" }}>
                  {v.acMembers.map((o: any, i0: number) => (
                    <Fragment key={i0}>
                      <button onClick={o.pick} style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "5px 16px 5px 5px", font: "inherit", cursor: "pointer", transition: "all .2s" }} className="mth-hover-1">
                        <span style={{ width: "34px", height: "34px", borderRadius: "50%", background: "#EEF0F6", color: "#02084D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "13px", fontWeight: "500" }}>{o.init}</span>
                        <span style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2", whiteSpace: "nowrap" }}>
                          <span style={{ fontSize: "14px" }}>{o.l}</span>
                          <span style={{ fontSize: "11px", opacity: ".7" }}>{o.sub}</span>
                        </span>
                      </button>
                    </Fragment>
                  ))}
                  <div style={{ flex: "none", display: "flex", gap: "6px", alignItems: "center" }}>
                    <input value={v.dNewM} onChange={v.onDNewM} placeholder="Add member, e.g. Ammamma" style={{ border: "1px solid #E6E8EF", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", width: "200px", borderRadius: "999px", padding: "11px 16px" }} />
                    <button onClick={v.addMember} aria-label="Add member" style={{ flex: "none", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s", width: "44px", height: "44px" }}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.8">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,340px),1fr))", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Health profile</span>
                      <button onClick={v.acTogEdit} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "7px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">{v.acEditBtn}</button>
                    </div>
                    {v.acView && (
                      <>
                        <div style={{ fontSize: "22px", fontWeight: "400", letterSpacing: "-.02em" }}>
                          {v.acM.name}{" "}
                          <span style={{ fontSize: "14px", color: "#6B7085", fontWeight: "300" }}>{[v.acM.age && `${v.acM.age} yrs`, v.acM.gender].filter(Boolean).map((x: string) => ` · ${x}`).join("")}</span>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(4,minmax(0,1fr))", borderTop: "1px solid #EEF0F5", borderBottom: "1px solid #EEF0F5" }}>
                          <div style={{ padding: "14px 8px 14px 0", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: "300", letterSpacing: "-.03em" }}>{v.acM.blood || "—"}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>Blood</span>
                          </div>
                          <div style={{ padding: "14px 8px", display: "flex", flexDirection: "column", gap: "2px", borderLeft: "1px solid #EEF0F5" }}>
                            <span style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: "300", letterSpacing: "-.03em" }}>{v.acM.h || "—"}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>Height cm</span>
                          </div>
                          <div style={{ padding: "14px 8px", display: "flex", flexDirection: "column", gap: "2px", borderLeft: "1px solid #EEF0F5" }}>
                            <span style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: "300", letterSpacing: "-.03em" }}>{v.acM.w || "—"}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>Weight kg</span>
                          </div>
                          <div style={{ padding: "14px 8px", display: "flex", flexDirection: "column", gap: "2px", borderLeft: "1px solid #EEF0F5" }}>
                            <span style={{ fontSize: "clamp(20px,2.4vw,26px)", fontWeight: "300", letterSpacing: "-.03em" }}>{v.acBmi}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>BMI</span>
                          </div>
                        </div>
                      </>
                    )}
                    {v.acEdit && (
                      <>
                        <div style={{ display: "grid", gridTemplateColumns: "repeat(2,minmax(0,1fr))", gap: "10px", animation: "mthIn .2s ease" }}>
                          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#4A4F6A", gridColumn: "1/-1" }}>
                            Name
                            <input value={v.acM.name} onChange={v.acOnName} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} className="mth-focus-13" />
                          </label>
                          {" "}
                          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#4A4F6A" }}>
                            Age
                            <input value={v.acM.age} onChange={v.acOnAge} inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} className="mth-focus-13" />
                          </label>
                          {" "}
                          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#4A4F6A" }}>
                            Blood group
                            <select value={v.acM.blood} onChange={v.acOnBlood} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }}>
                              {v.acBloods.map((bg: any, i0: number) => (
                                <Fragment key={i0}>
                                  <option value={bg}>{bg}</option>
                                </Fragment>
                              ))}
                            </select>
                          </label>
                          {" "}
                          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#4A4F6A" }}>
                            Height (cm)
                            <input value={v.acM.h} onChange={v.acOnH} inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} className="mth-focus-13" />
                          </label>
                          {" "}
                          <label style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "12px", color: "#4A4F6A" }}>
                            Weight (kg)
                            <input value={v.acM.w} onChange={v.acOnW} inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} className="mth-focus-13" />
                          </label>
                        </div>
                      </>
                    )}
                    <button onClick={v.acTogShare} style={{ display: "flex", alignItems: "center", gap: "14px", border: "none", background: "#F6F7FA", borderRadius: "12px", padding: "14px", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }}>
                      <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                        <span style={{ fontSize: "14px", fontWeight: "400" }}>Share with professionals I book</span>
                        <span style={{ fontSize: "12px", color: "#6B7085" }}>Only for active bookings</span>
                      </span>
                      {" "}
                      <span style={{ width: "44px", height: "26px", borderRadius: "999px", background: v.acShareBg, position: "relative", transition: "background .25s", flex: "none" }}>
                        <span style={{ position: "absolute", top: "2px", left: v.acShareX, width: "22px", height: "22px", borderRadius: "50%", background: "#fff", transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }}></span>
                      </span>
                    </button>
                  </div>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Conditions</span>
                    {v.acNoConds && (
                      <>
                        <span style={{ fontSize: "14px", color: "#9A9EB3" }}>No conditions added.</span>
                      </>
                    )}
                    {v.acConds.map((c: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #F0F1F5" }}>
                          <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "15px" }}>{c.n}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>Since {c.since}</span>
                          </span>
                          <button onClick={c.rm} aria-label="Remove" style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="2">
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                          </button>
                        </div>
                      </Fragment>
                    ))}
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      <input value={v.dCond} onChange={v.onDCond} placeholder="Add condition" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", flex: "2 1 150px" }} />
                      <input value={v.dSince} onChange={v.onDSince} placeholder="Year" inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", flex: "1 1 90px" }} />
                      <button onClick={v.addCond} style={{ flex: "none", border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "12px", padding: "0 16px", minHeight: "44px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">Add</button>
                    </div>
                  </div>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Allergies</span>
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                      {v.acNoAlg && (
                        <>
                          <span style={{ fontSize: "14px", color: "#9A9EB3" }}>No known allergies.</span>
                        </>
                      )}
                      {v.acAlg.map((a: any, i0: number) => (
                        <Fragment key={i0}>
                          <span style={{ display: "flex", alignItems: "center", gap: "6px", background: "#FDF1EC", color: "#8A3B1F", borderRadius: "999px", padding: "6px 6px 6px 14px", fontSize: "13px" }}>
                            {a.a}
                            <button onClick={a.rm} aria-label="Remove" style={{ border: "none", background: "#fff", width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="2">
                                <path d="M6 6l12 12M18 6 6 18" />
                              </svg>
                            </button>
                          </span>
                        </Fragment>
                      ))}
                    </div>
                    <div style={{ display: "flex", gap: "8px" }}>
                      <input value={v.dAlg} onChange={v.onDAlg} onKeyDown={v.onAlgKey} placeholder="Add allergy, e.g. Peanuts" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", flex: "1" }} />
                      <button onClick={v.addAlg} style={{ flex: "none", border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "12px", padding: "0 16px", minHeight: "44px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">Add</button>
                    </div>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Current medications</span>
                    {v.acNoMeds && (
                      <>
                        <span style={{ fontSize: "14px", color: "#9A9EB3" }}>No medications added.</span>
                      </>
                    )}
                    {v.acMeds.map((c: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #F0F1F5" }}>
                          <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#F1F2F7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                              <path d="M10.5 20.5l10-10a5 5 0 0 0-7-7l-10 10a5 5 0 0 0 7 7ZM8.5 8.5l7 7" />
                            </svg>
                          </span>
                          <span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "15px" }}>
                              {c.n}{" "}
                              <span style={{ color: "#6B7085", fontWeight: "300" }}>{c.dose}</span>
                            </span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>{c.freq}</span>
                          </span>
                          <button onClick={c.rm} aria-label="Remove" style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="2">
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                          </button>
                        </div>
                      </Fragment>
                    ))}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: "8px" }}>
                      <input value={v.dMedN} onChange={v.onDMedN} placeholder="Medicine" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} />
                      <input value={v.dMedD} onChange={v.onDMedD} placeholder="Dose, e.g. 5 mg" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} />
                      <select value={v.dMedF} onChange={v.onDMedF} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }}>
                        {v.acFreqs.map((fq: any, i0: number) => (
                          <Fragment key={i0}>
                            <option value={fq}>{fq}</option>
                          </Fragment>
                        ))}
                      </select>
                      <button onClick={v.addMed} style={{ flex: "none", border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "12px", padding: "0 16px", minHeight: "44px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">Add medicine</button>
                    </div>
                  </div>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Visit history</span>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", background: "#F6F7FA", borderRadius: "12px", padding: "12px" }}>
                      <input value={v.dHT} onChange={v.onDHT} placeholder="Add an entry, e.g. Eye check-up at Comtrust" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff" }} />
                      <div style={{ display: "flex", gap: "8px" }}>
                        <input value={v.dHN} onChange={v.onDHN} placeholder="Notes (optional)" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "11px 12px", fontSize: "14px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", flex: "1" }} />
                        <button onClick={v.addHist} style={{ flex: "none", border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "12px", padding: "0 16px", minHeight: "44px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">Add</button>
                      </div>
                    </div>
                    {v.acNoHist && (
                      <>
                        <span style={{ fontSize: "14px", color: "#9A9EB3" }}>No visits yet.</span>
                      </>
                    )}
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {v.acHist.map((h: any, i0: number) => (
                        <Fragment key={i0}>
                          <div style={{ display: "flex", gap: "14px", animation: "mthIn .3s ease" }}>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", paddingTop: "5px" }}>
                              <span style={{ width: "9px", height: "9px", borderRadius: "50%", background: "#02084D", flex: "none" }}></span>
                              <span style={{ width: "1px", flex: "1", background: "#E6E8EF", marginTop: "4px" }}></span>
                            </div>
                            <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px", paddingBottom: "18px" }}>
                              <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "flex-start" }}>
                                <span style={{ fontSize: "15px", fontWeight: "400" }}>{h.title}</span>
                                <button onClick={h.rm} aria-label="Remove" style={{ flex: "none", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s", width: "26px", height: "26px" }} className="mth-hover-1">
                                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="2">
                                    <path d="M6 6l12 12M18 6 6 18" />
                                  </svg>
                                </button>
                              </div>
                              <span style={{ fontSize: "12px", color: "#6B7085" }}>{h.date} · {h.by}</span>
                              {" "}
                              <span style={{ fontSize: "14px", color: "#4A4F6A", lineHeight: "1.5" }}>{h.note}</span>
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px" }}>
                      <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Reports & prescriptions</span>
                      <button onClick={v.addRep} style={{ display: "flex", alignItems: "center", gap: "6px", border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "7px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                          <path d="M12 16V4M7 9l5-5 5 5M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" />
                        </svg>
                        Upload
                      </button>
                    </div>
                    {v.acNoReps && (
                      <>
                        <span style={{ fontSize: "14px", color: "#9A9EB3" }}>No reports uploaded.</span>
                      </>
                    )}
                    {v.acReps.map((r: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "10px 0", borderTop: "1px solid #F0F1F5" }}>
                          <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#F1F2F7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                              <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" />
                            </svg>
                          </span>
                          <button onClick={r.view} style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "1px", background: "none", border: "none", padding: "0", font: "inherit", color: "#02084D", textAlign: "left", cursor: "pointer" }}>
                            <span style={{ fontSize: "14px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "100%" }}>{r.n}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>{r.date} · {r.size}</span>
                          </button>
                          <button onClick={r.rm} aria-label="Remove" style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "border-color .2s" }} className="mth-hover-1">
                            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="2">
                              <path d="M6 6l12 12M18 6 6 18" />
                            </svg>
                          </button>
                        </div>
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
        {v.acBookings && (
          <>
            <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "mthIn .3s ease" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Upcoming</span>
                {v.acNoUpcoming && <span style={{ fontSize: "15px", color: "#6B7085" }}>No upcoming bookings yet.</span>}
                {v.acUpcoming.map((u: any, i0: number) => (
                  <Fragment key={i0}>
                    <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", background: "#fff", flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: "16px" }}>
                      <div style={{ width: "56px", height: "70px", borderRadius: "12px", flex: "none", backgroundColor: "#EEF0F6", backgroundImage: `url(${u.img})`, backgroundSize: "cover", backgroundPosition: "center" }}></div>
                      <div style={{ flex: "1 1 160px", minWidth: "0", display: "flex", flexDirection: "column", gap: "3px" }}>
                        <span style={{ fontSize: "16px", fontWeight: "500" }}>{u.t}</span>
                        <span style={{ fontSize: "13px", color: "#6B7085" }}>{u.name} · for {u.who}</span>
                        <span style={{ fontSize: "13px", color: "#1F9D6B" }}>{u.w}</span>
                      </div>
                      <div style={{ display: "flex", gap: "8px" }}>
                        <button onClick={u.open} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "10px 16px", font: "inherit", fontSize: "13px", cursor: "pointer" }} className="mth-hover-1">Profile</button>
                        <button onClick={u.cancel} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer" }}>Cancel</button>
                        <button onClick={u.track} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer" }} className="mth-hover-7">Track</button>
                      </div>
                    </div>
                  </Fragment>
                ))}
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Past</span>
                <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden" }}>
                  {v.acNoPast && <span style={{ fontSize: "15px", color: "#6B7085" }}>Past bookings will appear here.</span>}
                  {v.acPast.map((u: any, i0: number) => (
                    <Fragment key={i0}>
                      <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "12px 16px", padding: "16px 20px", borderBottom: "1px solid #F0F1F5" }}>
                        <div style={{ flex: "1 1 220px", display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "15px" }}>{u.t}</span>
                          <span style={{ fontSize: "13px", color: "#6B7085" }}>{u.w} · {u.name} · for {u.who}</span>
                        </div>
                        <span style={{ fontSize: "15px", fontWeight: "600" }}>{u.amt}</span>
                        <div style={{ display: "flex", gap: "6px" }}>
                          {u.canRate && (
                            <span aria-label="Rate this visit" style={{ display: "flex", alignItems: "center" }}>
                              {[1, 2, 3, 4, 5].map((n) => (
                                <button key={n} onClick={() => u.rate(n)} aria-label={`${n} stars`} style={{ border: "none", background: "none", color: "#02084D", padding: "6px 2px", fontSize: "16px", cursor: "pointer" }}>★</button>
                              ))}
                            </span>
                          )}
                          <button onClick={u.rebook} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "8px 16px", font: "inherit", fontSize: "13px", cursor: "pointer" }} className="mth-hover-1">Book again</button>
                        </div>
                      </div>
                    </Fragment>
                  ))}
                </div>
              </div>
            </div>
          </>
        )}
        {v.acDetails && (
          <>
            <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "clamp(18px,2.4vw,24px)", display: "flex", flexDirection: "column", gap: "14px", background: "#fff", maxWidth: "760px", animation: "mthIn .3s ease" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,240px),1fr))", gap: "14px" }}>
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                  Full name
                  <input value={v.acInfo.name} onChange={v.onIName} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", padding: "13px 14px", fontSize: "15px" }} className="mth-focus-13" />
                </label>
                {" "}
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                  Mobile
                  <input value={v.acInfo.phone} onChange={v.onIPhone} inputMode="tel" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", padding: "13px 14px", fontSize: "15px" }} className="mth-focus-13" />
                </label>
                {" "}
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                  Email
                  <input value={v.acInfo.email} readOnly style={{ border: "1px solid #E6E8EF", borderRadius: "12px", color: "#6B7085", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", padding: "13px 14px", fontSize: "15px" }} className="mth-focus-13" />
                </label>
                {" "}
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                  Date of birth
                  <input value={v.acInfo.dob} onChange={v.onIDob} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", padding: "13px 14px", fontSize: "15px" }} className="mth-focus-13" />
                </label>
                {" "}
                <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A", gridColumn: "1/-1" }}>
                  Emergency contact
                  <input value={v.acInfo.emerg} onChange={v.onIEmerg} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", color: "#02084D", outline: "none", fontWeight: "300", minWidth: "0", background: "#fff", padding: "13px 14px", fontSize: "15px" }} className="mth-focus-13" />
                </label>
              </div>
              <button onClick={v.saveInfo} style={{ alignSelf: "flex-start", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "14px 26px", font: "inherit", fontSize: "14px", fontWeight: "600", cursor: "pointer" }} className="mth-hover-7">Save changes</button>
            </div>
          </>
        )}
        {v.acAddr && (
          <>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(min(100%,300px),1fr))", gap: "16px" }}>
              {v.acNoAddr && <span style={{ fontSize: "15px", color: "#6B7085" }}>Addresses you use for bookings will appear here.</span>}
              {v.acAddresses.map((a: any, i0: number) => (
                <div key={i0} style={{ border: "1px solid #E6E8EF", borderRadius: "16px", padding: "20px", display: "flex", flexDirection: "column", gap: "8px", alignItems: "flex-start" }}>
                  <span style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>{a.label}</span>
                  <span style={{ fontSize: "15px", lineHeight: "1.5" }}>{a.text}</span>
                  <button onClick={a.rm} style={{ border: "none", background: "none", color: "#6B7085", padding: "0", font: "inherit", fontSize: "13px", textDecoration: "underline", cursor: "pointer" }}>Remove</button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </>
  );
}
