"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";

export function BookingView() {
  const v = useSite();
  if (!v.b) return null;
  return (
    <>
      <div style={{ maxWidth: "1240px", margin: "0 auto", padding: "24px clamp(18px,4vw,48px) 140px", animation: "mthIn .35s ease" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "16px", flexWrap: "wrap", marginBottom: "28px" }}>
          <button onClick={v.back} style={{ background: "none", border: "none", font: "inherit", fontSize: "14px", color: "#4A4F6A", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 0" }} className="mth-hover-0">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M19 12H5M11 6l-6 6 6 6" />
            </svg>
            {v.backLabel}
          </button>
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "#6B7085" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5">
              <path d="M6 11h12v10H6zM8 11V7a4 4 0 0 1 8 0v4" />
            </svg>
            Secure booking
          </div>
        </div>
        <div className="mth-steps" style={{ display: "flex", alignItems: "center", gap: "0", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "4px", marginBottom: "clamp(28px,4vw,48px)" }}>
          {v.steps.map((st: any, i0: number) => (
            <Fragment key={i0}>
              <div style={{ display: "flex", alignItems: "center", flex: st.flex }}>
                <button onClick={st.go} style={{ display: "flex", alignItems: "center", gap: "10px", background: "none", border: "none", font: "inherit", cursor: "pointer", padding: "4px 0", whiteSpace: "nowrap" }}>
                  <span style={{ width: "28px", height: "28px", borderRadius: "50%", border: `1px solid ${st.dotBd}`, background: st.dotBg, color: st.dotFg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "500", transition: "all .3s" }}>{st.n}</span>
                  {" "}
                  <span style={{ fontSize: "14px", color: st.fg, fontWeight: st.w, display: st.lblDisp }}>{st.t}</span>
                </button>
                {st.notLast && (
                  <>
                    <span className="mth-step-bar" style={{ flex: "1", minWidth: "20px", height: "1px", background: st.bar, margin: "0 14px", transition: "background .3s" }}></span>
                  </>
                )}
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(24px,4vw,56px)", alignItems: "flex-start" }}>
          <div style={{ flex: "1 1 560px", minWidth: "0", display: "flex", flexDirection: "column", gap: "28px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "13px", color: "#6B7085" }}>{v.stepNo}</span>
              <h1 style={{ margin: "0", fontSize: "clamp(32px,4vw,48px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1.05" }}>{v.stepTitle}</h1>
            </div>
            {v.st0 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "28px", animation: "mthIn .3s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {v.svcs.map((sv: any, i0: number) => (
                      <Fragment key={i0}>
                        <button onClick={sv.pick} style={{ display: "flex", alignItems: "center", gap: "14px", textAlign: "left", border: `1px solid ${sv.rbd}`, background: sv.rbg, borderRadius: "14px", padding: "16px 18px", font: "inherit", color: "#02084D", cursor: "pointer", transition: "border-color .2s, background .2s" }} className="mth-hover-1">
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: `1px solid ${sv.dotBd}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: sv.dot }}></span>
                          </span>
                          {" "}
                          <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                            <span style={{ fontSize: "15px", fontWeight: "400" }}>{sv.n}</span>
                            <span style={{ fontSize: "13px", color: "#6B7085" }}>{sv.d}</span>
                          </span>
                          {" "}
                          <span style={{ fontSize: "15px", fontWeight: "600" }}>{sv.price}</span>
                        </button>
                      </Fragment>
                    ))}
                  </div>
                  {v.canPlan && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Plan type</div>
                        <div style={{ display: "inline-flex", background: "#F6F7FA", borderRadius: "999px", padding: "4px", gap: "4px", flexWrap: "wrap", alignSelf: "flex-start" }}>
                          <button onClick={v.setSingle} style={{ border: "none", background: v.planSingleChip.bg, color: v.planSingleChip.fg, borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .25s" }}>Single visit</button>
                          {" "}
                          <button onClick={v.setPlan} style={{ border: "none", background: v.planMultiChip.bg, color: v.planMultiChip.fg, borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .25s" }}>{v.multiLabel}</button>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "14px", color: "#4A4F6A" }}>
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="1.5">
                            <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 11v5M12 8h.01" />
                          </svg>
                          {v.planNote}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </>
            )}
            {v.st1 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "22px", animation: "mthIn .3s ease" }}>
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {v.addrOpts.map((a: any, i0: number) => (
                      <Fragment key={i0}>
                        <button onClick={a.pick} style={{ border: `1px solid ${a.bd}`, background: a.bg, color: a.fg, borderRadius: "999px", padding: "9px 16px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }}>{a.l}</button>
                      </Fragment>
                    ))}
                  </div>
                  <div style={{ height: "220px", borderRadius: "16px", backgroundColor: "#EEF0F6", backgroundImage: "repeating-linear-gradient(0deg,transparent 0 39px,#E3E6EF 39px 40px),repeating-linear-gradient(90deg,transparent 0 39px,#E3E6EF 39px 40px)", position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", left: "0", right: "0", top: "58%", height: "14px", background: "#fff", transform: "rotate(-8deg)" }}></div>
                    <div style={{ position: "absolute", top: "0", bottom: "0", left: "38%", width: "10px", background: "#fff", transform: "rotate(12deg)" }}></div>
                    <div style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-100%)", display: "flex", flexDirection: "column", alignItems: "center", cursor: "grab" }}>
                      <svg width="36" height="36" viewBox="0 0 24 24" fill="#02084D" stroke="#fff" strokeWidth="1">
                        <path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" />
                      </svg>
                    </div>
                    <div style={{ position: "absolute", left: "50%", top: "calc(50% + 6px)", transform: "translateX(-50%)", background: "#fff", borderRadius: "999px", padding: "4px 12px", fontSize: "12px", whiteSpace: "nowrap" }}>Drag to adjust pin</div>
                    <div style={{ position: "absolute", left: "14px", top: "14px", background: "#fff", borderRadius: "999px", padding: "6px 12px", fontSize: "12px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="2">
                        <path d="M5 12.5l4.5 4.5L19 7.5" />
                      </svg>
                      Location detected · {v.locality}
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      House / flat name
                      <input value={v.house} onChange={v.onHouse} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                    {" "}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Street
                      <input value={v.street} onChange={v.onStreet} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                    {" "}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Landmark
                      <input value={v.landmark} onChange={v.onLandmark} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                    {" "}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Locality
                      <select value={v.locality} onChange={v.onLocality} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", background: "#fff", fontWeight: "300" }}>
                        {v.locNames.map((ln: any, i0: number) => (
                          <Fragment key={i0}>
                            <option value={ln}>{ln}</option>
                          </Fragment>
                        ))}
                      </select>
                    </label>
                    {" "}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Pincode
                      <input value={v.pin} onChange={v.onPin} inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                  </div>
                </div>
              </>
            )}
            {v.st2 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "26px", animation: "mthIn .3s ease" }}>
                  {v.planSession && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Number of sessions</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                          {v.sessOpts.map((o: any, i0: number) => (
                            <Fragment key={i0}>
                              <button onClick={o.pick} style={{ minWidth: "56px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "9px 16px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-1">{o.label}</button>
                            </Fragment>
                          ))}
                          {v.isCustomN && (
                            <>
                              <input value={v.customN} onChange={v.onCustomN} inputMode="numeric" style={{ width: "90px", border: "1px solid #02084D", borderRadius: "999px", padding: "9px 14px", fontSize: "14px", outline: "none", color: "#02084D" }} />
                            </>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                  {v.planCare && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Hours per day</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {v.hourOpts.map((o: any, i0: number) => (
                              <Fragment key={i0}>
                                <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "9px 16px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-1">{o.label}</button>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Number of days</div>
                          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                            {v.ndayOpts.map((o: any, i0: number) => (
                              <Fragment key={i0}>
                                <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "9px 16px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-1">{o.label}</button>
                              </Fragment>
                            ))}
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                  {v.plan && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Start date</div>
                        <div style={{ display: "flex", gap: "6px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "2px" }}>
                          {v.startDays.map((d: any, i0: number) => (
                            <Fragment key={i0}>
                              <button onClick={d.pick} style={{ flex: "none", width: "58px", border: `1px solid ${d.bd}`, background: d.bg, color: d.fg, borderRadius: "14px", padding: "8px 0", font: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", transition: "border-color .2s" }} className="mth-hover-1">
                                <span style={{ fontSize: "10px", opacity: ".75" }}>{d.dow}</span>
                                <span style={{ fontSize: "18px", fontWeight: "400" }}>{d.n}</span>
                                <span style={{ fontSize: "10px", opacity: ".75" }}>{d.mon}</span>
                              </button>
                            </Fragment>
                          ))}
                        </div>
                      </div>
                    </>
                  )}
                  {v.planSession && (
                    <>
                      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Frequency</div>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                          {v.freqOpts.map((o: any, i0: number) => (
                            <Fragment key={i0}>
                              <button onClick={o.pick} style={{ border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "9px 16px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-1">{o.label}</button>
                            </Fragment>
                          ))}
                        </div>
                        {v.isCustomDays && (
                          <>
                            <div style={{ display: "flex", gap: "6px", marginTop: "4px" }}>
                              {v.dayOpts.map((o: any, i0: number) => (
                                <Fragment key={i0}>
                                  <button onClick={o.pick} style={{ width: "40px", height: "40px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "50%", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>{o.l}</button>
                                </Fragment>
                              ))}
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "24px", alignItems: "flex-start" }}>
                    <div style={{ flex: "1 1 300px", border: "1px solid #E6E8EF", borderRadius: "16px", padding: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <span style={{ fontSize: "15px", fontWeight: "500" }}>{v.calLabel}</span>
                        <div style={{ display: "flex", gap: "4px" }}>
                          <button onClick={v.calPrev} aria-label="Previous month" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", opacity: v.prevOp }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6">
                              <path d="M15 6l-6 6 6 6" />
                            </svg>
                          </button>
                          {" "}
                          <button onClick={v.calNext} aria-label="Next month" style={{ width: "34px", height: "34px", borderRadius: "50%", border: "1px solid #E6E8EF", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6">
                              <path d="M9 6l6 6-6 6" />
                            </svg>
                          </button>
                        </div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "2px", fontSize: "11px", color: "#9A9EB3", textAlign: "center" }}>
                        {v.wkHdr.map((w: any, i0: number) => (
                          <Fragment key={i0}>
                            <span>{w}</span>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: "4px" }}>
                        {v.cells.map((c: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={c.click} style={{ aspectRatio: "1", maxHeight: "44px", borderRadius: "50%", border: `1px solid ${c.bd}`, background: c.bg, color: c.fg, textDecoration: c.deco, font: "inherit", fontSize: "14px", cursor: c.cur, display: "flex", alignItems: "center", justifyContent: "center", transition: "background .2s, color .2s", padding: "0" }}>{c.n}</button>
                          </Fragment>
                        ))}
                      </div>
                      {v.plan && (
                        <>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", fontSize: "12px", color: "#6B7085", paddingTop: "6px", borderTop: "1px solid #F0F1F5" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#02084D" }}></span>
                              Session
                            </span>
                            {" "}
                            <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                              <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: "#F1F2F6", border: "1px solid #D9DCE6" }}></span>
                              Skipped
                            </span>
                            {" "}
                            <span>Tap a session to skip it</span>
                          </div>
                        </>
                      )}
                      {v.single && (
                        <>
                          <div style={{ fontSize: "12px", color: "#6B7085", paddingTop: "6px", borderTop: "1px solid #F0F1F5" }}>Struck-out dates are unavailable for this professional.</div>
                        </>
                      )}
                    </div>
                    <div style={{ flex: "1 1 260px", display: "flex", flexDirection: "column", gap: "16px" }}>
                      {v.slotGroups.length === 0 && (
                        <div style={{ padding: "18px", borderRadius: "12px", background: "#F6F7FA", fontSize: "14px", color: "#6B7085" }}>No visits on this day. Please pick another date.</div>
                      )}
                      {v.slotGroups.map((g: any, i0: number) => (
                        <Fragment key={i0}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            <div style={{ fontSize: "13px", color: "#6B7085" }}>{g.g}</div>
                            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                              {g.slots.map((t: any, i1: number) => (
                                <Fragment key={i1}>
                                  <button onClick={t.pick} style={{ border: `1px solid ${t.bd}`, background: t.bg, color: t.fg, borderRadius: "999px", padding: "9px 14px", font: "inherit", fontSize: "13px", cursor: t.cur, transition: "all .2s" }} className="mth-hover-1">{t.t}</button>
                                </Fragment>
                              ))}
                            </div>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "14px", background: "#F6F7FA", flexWrap: "wrap" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4" />
                    </svg>
                    {" "}
                    <span style={{ fontSize: "15px", fontWeight: "500", flex: "1", minWidth: "200px" }}>{v.summary}</span>
                    {v.hasSkip && (
                      <>
                        <span style={{ fontSize: "12px", color: "#6B7085" }}>{v.skipText}</span>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
            {v.st3 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "22px", animation: "mthIn .3s ease" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Who is this for?</div>
                    <div style={{ display: "inline-flex", background: "#F6F7FA", borderRadius: "999px", padding: "4px", gap: "4px", alignSelf: "flex-start" }}>
                      {v.whoOpts.map((o: any, i0: number) => (
                        <Fragment key={i0}>
                          <button onClick={o.pick} style={{ border: "none", background: o.bg, color: o.fg, borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .25s" }}>{o.l}</button>
                        </Fragment>
                      ))}
                    </div>
                    {v.isFam && (
                      <>
                        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginTop: "4px" }}>
                          {v.famOpts.map((o: any, i0: number) => (
                            <Fragment key={i0}>
                              <button onClick={o.pick} style={{ display: "flex", alignItems: "center", gap: "10px", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "6px 16px 6px 6px", font: "inherit", cursor: "pointer", transition: "all .2s" }}>
                                <span style={{ width: "30px", height: "30px", borderRadius: "50%", background: "#EEF0F6", color: "#02084D", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "500" }}>{o.l}</span>
                                <span style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.2" }}>
                                  <span style={{ fontSize: "14px" }}>{o.l}</span>
                                  <span style={{ fontSize: "11px", opacity: ".7" }}>{o.sub}</span>
                                </span>
                              </button>
                            </Fragment>
                          ))}
                          <button onClick={v.addFam} style={{ border: "1px dashed #C9CCD8", background: "#fff", color: "#4A4F6A", borderRadius: "999px", padding: "6px 16px", font: "inherit", fontSize: "14px", cursor: "pointer" }}>+ Add</button>
                        </div>
                      </>
                    )}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: "14px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A", gridColumn: "1/-1" }}>
                      Patient name
                      <input value={v.pname} onChange={v.onPname} style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                    {" "}
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Age
                      <input value={v.age} onChange={v.onAge} inputMode="numeric" style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300" }} className="mth-focus-13" />
                    </label>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A" }}>
                      Gender
                      <div style={{ display: "flex", gap: "6px" }}>
                        {v.genderOpts.map((o: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={o.pick} style={{ flex: "1", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "12px", padding: "13px 6px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }}>{o.l}</button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px", fontSize: "13px", color: "#4A4F6A", gridColumn: "1/-1" }}>
                      Condition / notes for the professional
                      <textarea value={v.notes} onChange={v.onNotes} rows={3} placeholder="E.g. Right knee replacement on 12 Oct. Uses a walker. Prefers Malayalam." style={{ border: "1px solid #E6E8EF", borderRadius: "12px", padding: "13px 14px", fontSize: "15px", color: "#02084D", outline: "none", fontWeight: "300", resize: "vertical" }} className="mth-focus-13"></textarea>
                    </label>
                  </div>
                  <button onClick={v.togShare} style={{ display: "flex", alignItems: "center", gap: "14px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "14px", padding: "16px 18px", font: "inherit", color: "#02084D", cursor: "pointer", textAlign: "left" }}>
                    <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                      <span style={{ fontSize: "15px", fontWeight: "400" }}>Share my health records with this professional</span>
                      <span style={{ fontSize: "13px", color: "#6B7085" }}>Only for this booking. You can turn it off anytime.</span>
                    </span>
                    {" "}
                    <span style={{ width: "44px", height: "26px", borderRadius: "999px", background: v.shareBg, position: "relative", transition: "background .25s", flex: "none" }}>
                      <span style={{ position: "absolute", top: "2px", left: v.shareX, width: "22px", height: "22px", borderRadius: "50%", background: "#fff", transition: "left .25s", boxShadow: "0 1px 3px rgba(0,0,0,.15)" }}></span>
                    </span>
                  </button>
                </div>
              </>
            )}
            {v.st4 && (
              <>
                <div style={{ display: "flex", flexDirection: "column", gap: "22px", animation: "mthIn .3s ease" }}>
                  <div style={{ border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden" }}>
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "4px", borderBottom: "1px solid #F0F1F5" }}>
                      <span style={{ fontSize: "12px", color: "#6B7085" }}>Service</span>
                      <span style={{ fontSize: "16px", fontWeight: "500" }}>{v.svcName} · {v.planLabel}</span>
                    </div>
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "10px", borderBottom: "1px solid #F0F1F5" }}>
                      <span style={{ fontSize: "12px", color: "#6B7085" }}>Schedule · {v.sessCount} date(s)</span>
                      {v.sched.map((sd: any, i0: number) => (
                        <Fragment key={i0}>
                          <div style={{ display: "flex", gap: "14px", fontSize: "14px" }}>
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
                    <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: "4px" }}>
                      <span style={{ fontSize: "12px", color: "#6B7085" }}>Address</span>
                      <span style={{ fontSize: "15px" }}>{v.addrShort}, {v.addrDistrict} {v.pin}</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    <div style={{ fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Payment</div>
                    {v.payOpts.map((po: any, i0: number) => (
                      <Fragment key={i0}>
                        <button onClick={po.pick} style={{ display: "flex", alignItems: "center", gap: "14px", textAlign: "left", border: `1px solid ${po.rbd}`, background: po.rbg, borderRadius: "14px", padding: "14px 18px", font: "inherit", color: "#02084D", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
                          <span style={{ width: "18px", height: "18px", borderRadius: "50%", border: `1px solid ${po.dotBd}`, display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                            <span style={{ width: "10px", height: "10px", borderRadius: "50%", background: po.dot }}></span>
                          </span>
                          {" "}
                          <span style={{ flex: "1", display: "flex", flexDirection: "column", gap: "1px" }}>
                            <span style={{ fontSize: "15px" }}>{po.l}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>{po.sub}</span>
                          </span>
                        </button>
                      </Fragment>
                    ))}
                    {v.payLater && (
                      <>
                        <div style={{ fontSize: "13px", color: "#6B7085" }}>Pay the professional after your first visit. Remaining sessions are billed weekly.</div>
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: "10px", alignItems: "center", paddingTop: "8px" }}>
              {v.hasErr && <div role="alert" style={{ width: "100%", color: "#C22F2F", fontSize: "14px" }}>{v.err}</div>}
              <button onClick={v.next} disabled={v.nextDisabled} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "16px 32px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-8">{v.nextLabel}</button>
              {" "}
              <button onClick={v.back} style={{ background: "none", border: "none", font: "inherit", fontSize: "15px", color: "#4A4F6A", cursor: "pointer", padding: "16px 12px" }}>{v.backLabel}</button>
            </div>
          </div>
          <aside style={{ flex: "0 1 360px", minWidth: "280px", position: v.bkSticky, top: "96px", border: "1px solid #E6E8EF", borderRadius: "20px", padding: "22px", display: "flex", flexDirection: "column", gap: "18px", background: "#fff" }}>
            <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
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
              <div style={{ display: "flex", flexDirection: "column", gap: "3px", minWidth: "0" }}>
                <span style={{ fontSize: "16px", fontWeight: "600" }}>{v.bkPro.name}</span>
                <span style={{ fontSize: "13px", color: "#6B7085" }}>{v.bkRole} · ★ {v.bkPro.rating}</span>
                <span style={{ fontSize: "12px", color: "#6B7085" }}>{v.bkPro.distLine}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", borderTop: "1px solid #F0F1F5", paddingTop: "16px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ color: "#6B7085" }}>Service</span>
                <span style={{ textAlign: "right" }}>{v.svcName}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", gap: "12px" }}>
                <span style={{ color: "#6B7085" }}>Plan</span>
                <span style={{ textAlign: "right" }}>{v.planLabel}</span>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ color: "#6B7085" }}>Schedule</span>
                <span style={{ lineHeight: "1.45" }}>{v.summary}</span>
              </div>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "9px", fontSize: "14px", borderTop: "1px solid #F0F1F5", paddingTop: "16px" }}>
              {v.rows.map((r: any, i0: number) => (
                <Fragment key={i0}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", color: r.green }}>
                    <span style={{ fontWeight: "300" }}>{r.l}</span>
                    <span>{r.v}</span>
                  </div>
                </Fragment>
              ))}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "12px", borderTop: "1px solid #F0F1F5", paddingTop: "12px", marginTop: "4px" }}>
                <span style={{ fontSize: "15px" }}>Total</span>
                <span style={{ fontSize: "26px", fontWeight: "700", letterSpacing: "-.02em" }}>{v.total}</span>
              </div>
              {v.hasSaving && (
                <>
                  <div style={{ alignSelf: "flex-end", fontSize: "12px", color: "#1F9D6B", background: "#E8F5EF", borderRadius: "999px", padding: "3px 10px" }}>{v.saving}</div>
                </>
              )}
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", color: "#6B7085" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5">
                <path d="M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18zM12 7v5l3 2" />
              </svg>
              Free cancellation up to 4 hours before a visit
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
