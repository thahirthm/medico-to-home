"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment } from "react";
import { useSite } from "./SiteProvider";
import { ProCard } from "./ProCard";
import { BodyViewer } from "./BodyViewer";

export function HomeView() {
  const v = useSite();
  return (
    <>
      <main>
        <section style={{ padding: "clamp(48px,9vw,120px) clamp(18px,4vw,48px) clamp(40px,6vw,72px)", marginTop: "-72px", paddingTop: "calc(72px + clamp(48px,8vw,110px))" }}>
          <div style={{ maxWidth: "1100px", margin: "0 auto", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "22px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "6px 14px 6px 8px", fontSize: "13px", fontWeight: "400", color: "#4A4F6A" }}>
              <span style={{ background: "#E8F5EF", color: "#1F9D6B", borderRadius: "999px", padding: "2px 8px", fontSize: "12px", fontWeight: "500" }}>New</span>
              Book trusted Medicos
            </div>
            <h1 style={{ margin: "0", fontSize: "clamp(46px,8.4vw,112px)", lineHeight: ".98", fontWeight: "300", letterSpacing: "-.045em", color: "#02084D", textWrap: "balance" }}>
              Care that comes{" "}
              <span style={{ fontWeight: "600" }}>home</span>
              .
            </h1>
            <div style={{ width: "100%", maxWidth: "1040px", marginTop: "18px", background: "#fff", border: "1px solid #E6E8EF", borderRadius: v.searchR, boxShadow: "0 1px 0 rgba(2,8,77,.02), 0 20px 50px -24px rgba(2,8,77,.14)", display: "flex", flexWrap: "wrap", alignItems: "stretch", padding: "8px", textAlign: "left", position: "relative", zIndex: "20" }}>
              <div data-dd="1" style={{ flex: "1.5 1 260px", position: "relative", padding: "12px 20px", borderRadius: "999px", display: "flex", flexDirection: "column", gap: "3px", justifyContent: "center", transition: "background .2s" }} className="mth-hover-6">
                <label style={{ fontSize: "12px", fontWeight: "500", color: "#02084D" }}>What are you looking for?</label>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <input value={v.q} onChange={v.onQ} onFocus={v.onQFocus} onKeyDown={v.onQKey} placeholder="Physiotherapy, nursing, lab test…" style={{ border: "none", outline: "none", background: "transparent", fontSize: "16px", fontWeight: "300", color: "#02084D", width: "100%", padding: "2px 0" }} />
                  {v.hasQ && (
                    <>
                      <button onClick={v.clearQ} aria-label="Clear" style={{ border: "none", background: "#EEF0F5", width: "22px", height: "22px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="2">
                          <path d="M6 6l12 12M18 6 6 18" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
                {v.qOpen && (
                  <>
                    <div style={{ position: "absolute", left: "0", top: "calc(100% + 14px)", width: "min(420px,calc(100vw - 40px))", background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", boxShadow: "0 24px 50px -20px rgba(2,8,77,.2)", padding: "8px", zIndex: "30", animation: "mthIn .18s ease" }}>
                      <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", padding: "8px 12px 6px", fontWeight: "500" }}>Popular searches</div>
                      {v.sugs.map((s: any, i0: number) => (
                        <Fragment key={i0}>
                          <button onClick={s.pick} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "10px 12px", border: "none", background: "#fff", borderRadius: "10px", cursor: "pointer", textAlign: "left", font: "inherit", transition: "background .15s" }} className="mth-hover-6">
                            <span style={{ width: "34px", height: "34px", borderRadius: "10px", background: "#F1F2F7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                              <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                <path d={s.icon} />
                              </svg>
                            </span>
                            {" "}
                            <span style={{ display: "flex", flexDirection: "column" }}>
                              <span style={{ fontSize: "14px", fontWeight: "400", color: "#02084D" }}>{s.label}</span>
                              <span style={{ fontSize: "12px", color: "#6B7085", fontWeight: "300" }}>{s.sub}</span>
                            </span>
                          </button>
                        </Fragment>
                      ))}
                    </div>
                  </>
                )}
              </div>
              <div data-dd="1" style={{ flex: "1 1 220px", position: "relative", borderLeft: v.segL, borderTop: v.segT }}>
                <button onClick={v.toggleLoc} style={{ width: "100%", height: "100%", textAlign: "left", border: "none", background: "transparent", padding: "12px 20px", borderRadius: "999px", cursor: "pointer", font: "inherit", display: "flex", flexDirection: "column", gap: "3px", justifyContent: "center", transition: "background .2s" }} className="mth-hover-6">
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#02084D" }}>Location</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "300", color: "#02084D" }}>
                    {v.locLoading && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5" style={{ animation: "mthSpin 1s linear infinite" }}>
                          <path d="M12 3a9 9 0 1 0 9 9" />
                        </svg>
                        <span style={{ color: "#6B7085" }}>Detecting location…</span>
                      </>
                    )}
                    {v.locReady && (
                      <>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                        <span style={{ whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.locText}</span>
                      </>
                    )}
                  </span>
                </button>
                {v.locOpen && (
                  <>
                    <div style={{ position: "absolute", left: "0", top: "calc(100% + 14px)", width: "min(460px,calc(100vw - 40px))", background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", boxShadow: "0 24px 50px -20px rgba(2,8,77,.2)", padding: "16px", zIndex: "30", display: "flex", flexDirection: "column", gap: "14px", animation: "mthIn .18s ease" }}>
                      <button onClick={v.useMyLoc} style={{ display: "flex", alignItems: "center", gap: "10px", border: "1px solid #E6E8EF", background: "#fff", borderRadius: "12px", padding: "12px 14px", font: "inherit", fontSize: "14px", fontWeight: "400", color: "#02084D", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                          <path d="M12 2v3M12 19v3M2 12h3M19 12h3M12 6a6 6 0 1 0 0 12 6 6 0 0 0 0-12zM12 10a2 2 0 1 0 0 4 2 2 0 0 0 0-4z" />
                        </svg>
                        Use my current location{" "}
                      </button>
                      {v.here && (
                        <div style={{ display: "flex", gap: "10px", background: "#F6F7FA", borderRadius: "12px", padding: "12px 14px" }}>
                          <span aria-hidden style={{ color: "#1F9D6B", fontSize: "16px", lineHeight: "1.3" }}>●</span>
                          <span style={{ display: "flex", flexDirection: "column", gap: "2px", minWidth: "0" }}>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>Your location</span>
                            <span style={{ fontSize: "14px", fontWeight: "500", color: "#02084D" }}>{v.here.address}</span>
                            <span style={{ fontSize: "12px", color: "#6B7085" }}>{v.accuracyText(v.here)} · served from {v.loc}</span>
                          </span>
                        </div>
                      )}
                      {v.outside && (
                        <div role="status" style={{ display: "flex", flexDirection: "column", gap: "4px", background: "#FDF1EC", borderRadius: "12px", padding: "12px 14px", color: "#8A3B1F" }}>
                          <span style={{ fontSize: "12px" }}>Your location</span>
                          <span style={{ fontSize: "14px", fontWeight: "500" }}>{v.outside.address}</span>
                          <span style={{ fontSize: "13px", lineHeight: "1.5" }}>We do not visit here yet. Choose the nearest area we serve:</span>
                        </div>
                      )}
                      {v.nearby.length > 0 && (
                        <>
                          <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Nearest areas we serve</div>
                          <div style={{ display: "flex", flexDirection: "column" }}>
                            {v.nearby.map((n: any) => (
                              <button key={n.name} onClick={n.pick} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "10px", border: "none", borderBottom: "1px solid #EEF0F5", background: n.on ? "#F6F7FA" : "#fff", padding: "10px 6px", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer", textAlign: "left" }}>
                                <span>{n.name}, <span style={{ color: "#6B7085" }}>{n.district}</span></span>
                                <span style={{ fontSize: "13px", color: "#6B7085", whiteSpace: "nowrap" }}>{n.kmText}</span>
                              </button>
                            ))}
                          </div>
                          <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>All areas</div>
                        </>
                      )}
                      <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Kozhikode</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {v.kozLocs.map((l: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={l.pick} style={{ border: `1px solid ${l.bd}`, background: l.bg, color: l.fg, borderRadius: "999px", padding: "6px 12px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">{l.name}</button>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Malappuram</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                        {v.mlpLocs.map((l: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={l.pick} style={{ border: `1px solid ${l.bd}`, background: l.bg, color: l.fg, borderRadius: "999px", padding: "6px 12px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "border-color .2s" }} className="mth-hover-1">{l.name}</button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <div data-dd="1" style={{ flex: ".8 1 170px", position: "relative", borderLeft: v.segL, borderTop: v.segT }}>
                <button onClick={v.toggleWhen} style={{ width: "100%", height: "100%", textAlign: "left", border: "none", background: "transparent", padding: "12px 20px", borderRadius: "999px", cursor: "pointer", font: "inherit", display: "flex", flexDirection: "column", gap: "3px", justifyContent: "center", transition: "background .2s" }} className="mth-hover-6">
                  <span style={{ fontSize: "12px", fontWeight: "500", color: "#02084D" }}>When</span>
                  {" "}
                  <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", fontWeight: "300", color: "#02084D" }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                      <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4" />
                    </svg>
                    {v.when}
                  </span>
                </button>
                {v.whenOpen && (
                  <>
                    <div style={{ position: "absolute", right: "0", top: "calc(100% + 14px)", width: "min(340px,calc(100vw - 40px))", background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", boxShadow: "0 24px 50px -20px rgba(2,8,77,.2)", padding: "16px", zIndex: "30", display: "flex", flexDirection: "column", gap: "12px", animation: "mthIn .18s ease" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {v.whenOpts.map((o: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={o.pick} style={{ flex: "1", border: `1px solid ${o.bd}`, background: o.bg, color: o.fg, borderRadius: "999px", padding: "9px 12px", font: "inherit", fontSize: "13px", cursor: "pointer" }}>{o.label}</button>
                          </Fragment>
                        ))}
                      </div>
                      <div style={{ fontSize: "11px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Pick a date</div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(5,1fr)", gap: "6px" }}>
                        {v.days.map((d: any, i0: number) => (
                          <Fragment key={i0}>
                            <button onClick={d.pick} style={{ border: `1px solid ${d.bd}`, background: d.bg, color: d.fg, borderRadius: "12px", padding: "8px 0", font: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "1px", transition: "border-color .2s" }} className="mth-hover-1">
                              <span style={{ fontSize: "10px", opacity: ".75" }}>{d.dow}</span>
                              <span style={{ fontSize: "16px", fontWeight: "500" }}>{d.n}</span>
                              <span style={{ fontSize: "10px", opacity: ".75" }}>{d.mon}</span>
                            </button>
                          </Fragment>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
              <button onClick={v.doSearch} style={{ flex: "0 0 auto", minHeight: "60px", minWidth: v.searchBtnW, margin: v.searchBtnM, display: "flex", alignItems: "center", justifyContent: "center", gap: "10px", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "0 30px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-8">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.8" strokeLinecap="round">
                  <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />
                </svg>
                Search{" "}
              </button>
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 22px", fontSize: "13px", fontWeight: "300", color: "#6B7085", marginTop: "6px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="2">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Verified professionals
              </span>
              {" "}
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="2">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Transparent prices
              </span>
              {" "}
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="2">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                Live visit tracking
              </span>
              {" "}
              <span style={{ color: "#02084D", fontWeight: "400" }}>1,200+ professionals · ★ 4.8 average rating</span>
            </div>
          </div>
        </section>
        <section id="mth-browse" style={{ padding: "0 0 clamp(56px,7vw,96px)" }}>
          <div style={{ position: "sticky", top: "72px", zIndex: "15", background: "rgba(255,255,255,.96)", backdropFilter: "blur(8px)", borderBottom: "1px solid #EEF0F5" }}>
            <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "14px clamp(18px,4vw,48px)", display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none" }}>
              {v.tabs.map((t: any, i0: number) => (
                <Fragment key={i0}>
                  <button onClick={t.pick} style={{ flex: "none", display: "flex", alignItems: "center", gap: "8px", border: `1px solid ${t.bd}`, background: t.bg, color: t.fg, borderRadius: "999px", padding: "9px 16px 9px 13px", font: "inherit", fontSize: "13px", fontWeight: "400", cursor: "pointer", whiteSpace: "nowrap", scrollSnapAlign: "start", transition: "background .25s, color .25s, border-color .25s" }} className="mth-hover-1">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={t.stroke} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d={t.icon} />
                    </svg>
                    {t.label}{" "}
                  </button>
                </Fragment>
              ))}
            </div>
          </div>
          <div style={{ maxWidth: "1320px", margin: "0 auto", padding: "0 clamp(18px,4vw,48px)", display: "flex", flexDirection: "column", gap: "clamp(56px,6vw,80px)", marginTop: "clamp(36px,4vw,56px)" }}>
            <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <h2 style={{ margin: "0", fontSize: "clamp(26px,3vw,38px)", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1.1" }}>
                  <span style={{ fontWeight: "600" }}>Top rated</span>
                  {" "}{v.catTitle} near you
                </h2>
                <button onClick={v.setTop} style={{ background: "none", border: "none", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", padding: "6px 0" }}>
                  See all{" "}
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </button>
              </div>
              <div className="mth-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "20px" }}>
                {v.loading && (
                  <>
                    {v.skel4.map((k: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ border: "1px solid #EEF0F5", borderRadius: "16px", overflow: "hidden" }}>
                          <div style={{ aspectRatio: "4/5", background: "#F1F2F6", animation: "mthSk 1.4s ease infinite" }}></div>
                          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ height: "14px", width: "60%", background: "#F1F2F6", borderRadius: "6px", animation: "mthSk 1.4s ease infinite" }}></div>
                            <div style={{ height: "12px", width: "85%", background: "#F1F2F6", borderRadius: "6px", animation: "mthSk 1.4s ease infinite" }}></div>
                            <div style={{ height: "22px", width: "50%", background: "#F1F2F6", borderRadius: "999px", animation: "mthSk 1.4s ease infinite" }}></div>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </>
                )}
                {v.notLoading && (
                  <>
                    {v.top.map((p: any, i0: number) => (
                      <Fragment key={i0}>
                        <ProCard pro={p} />
                      </Fragment>
                    ))}
                  </>
                )}
              </div>
            </div>
            {v.hasAvail && (
              <>
                <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
                  <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                    <h2 style={{ margin: "0", fontSize: "clamp(26px,3vw,38px)", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1.1" }}>
                      <span style={{ fontWeight: "600" }}>Available now</span>
                      {" "}near you
                    </h2>
                    <span style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#1F9D6B", fontWeight: "400" }}>
                      <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#1F9D6B", boxShadow: "0 0 0 4px #E8F5EF" }}></span>
                      Can visit you today
                    </span>
                  </div>
                  <div className="mth-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "20px" }}>
                    {v.loading && (
                      <>
                        {v.skel4.map((k: any, i0: number) => (
                          <Fragment key={i0}>
                            <div style={{ border: "1px solid #EEF0F5", borderRadius: "16px", overflow: "hidden" }}>
                              <div style={{ aspectRatio: "4/5", background: "#F1F2F6", animation: "mthSk 1.4s ease infinite" }}></div>
                              <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                                <div style={{ height: "14px", width: "60%", background: "#F1F2F6", borderRadius: "6px" }}></div>
                                <div style={{ height: "12px", width: "85%", background: "#F1F2F6", borderRadius: "6px" }}></div>
                              </div>
                            </div>
                          </Fragment>
                        ))}
                      </>
                    )}
                    {v.notLoading && (
                      <>
                        {v.avail.map((p: any, i0: number) => (
                          <Fragment key={i0}>
                            <ProCard pro={p} />
                          </Fragment>
                        ))}
                      </>
                    )}
                  </div>
                </div>
              </>
            )}
            <div id="mth-grid" style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
              <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: "16px", flexWrap: "wrap" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  <h2 style={{ margin: "0", fontSize: "clamp(26px,3vw,38px)", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1.1" }}>
                    Browse{" "}
                    <span style={{ fontWeight: "600" }}>all</span>
                    {" "}{v.catTitle}
                  </h2>
                  {v.hasQApplied && (
                    <>
                      <div style={{ fontSize: "14px", color: "#6B7085" }}>{v.qAppliedText}</div>
                    </>
                  )}
                </div>
                <label className="mth-find" style={{ flex: "1 1 260px", maxWidth: "360px", display: "flex", alignItems: "center", gap: "10px", border: "1px solid #E6E8EF", borderRadius: "999px", padding: "0 6px 0 16px", background: "#fff", transition: "border-color .2s" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true" style={{ flex: "none" }}>
                    <circle cx="11" cy="11" r="7" />
                    <path d="m20 20-3.5-3.5" />
                  </svg>
                  <input type="search" value={v.find} onChange={v.onFind} placeholder="Search by name or category" aria-label="Search professionals by name or category" enterKeyHint="search"
                    style={{ flex: "1", minWidth: "0", border: "none", outline: "none", background: "transparent", font: "inherit", fontSize: "14px", fontWeight: "300", color: "#02084D", padding: "11px 0" }} />
                  {v.hasFind && (
                    <button type="button" onClick={v.clearFind} aria-label="Clear search" style={{ flex: "none", width: "30px", height: "30px", borderRadius: "50%", border: "none", background: "#F6F7FA", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="2">
                        <path d="M6 6l12 12M18 6 6 18" />
                      </svg>
                    </button>
                  )}
                </label>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "12px", flexWrap: "wrap", padding: "12px 0", borderTop: "1px solid #EEF0F5", borderBottom: "1px solid #EEF0F5" }}>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={v.setTop} style={{ border: `1px solid ${v.sortTop.bd}`, background: v.sortTop.bg, color: v.sortTop.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>Top rated</button>
                  {" "}
                  <button onClick={v.setNear} style={{ border: `1px solid ${v.sortNear.bd}`, background: v.sortNear.bg, color: v.sortNear.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", transition: "all .2s" }}>Nearest</button>
                  {" "}
                  <button onClick={v.togAvail} style={{ border: `1px solid ${v.availChip.bd}`, background: v.availChip.bg, color: v.availChip.fg, borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "all .2s" }}>
                    <span style={{ width: "7px", height: "7px", borderRadius: "50%", background: "#1F9D6B" }}></span>
                    Available now
                  </button>
                  {" "}
                  <button onClick={v.openFilters} style={{ border: "1px solid #E6E8EF", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "8px 14px", font: "inherit", fontSize: "13px", cursor: "pointer", display: "flex", alignItems: "center", gap: "7px", transition: "border-color .2s" }} className="mth-hover-1">
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5" strokeLinecap="round">
                      <path d="M4 6h16M7 12h10M10 18h4" />
                    </svg>
                    Filters{" "}
                    {v.hasFc && (
                      <>
                        <span style={{ background: "#02084D", color: "#fff", borderRadius: "999px", fontSize: "11px", minWidth: "18px", height: "18px", display: "inline-flex", alignItems: "center", justifyContent: "center", padding: "0 5px" }}>{v.fc}</span>
                      </>
                    )}
                  </button>
                </div>
                <div style={{ fontSize: "14px", color: "#6B7085", fontWeight: "300" }}>{v.countText}</div>
              </div>
              <div className="mth-cards" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: "20px" }}>
                {v.loading && (
                  <>
                    {v.skel.map((k: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ border: "1px solid #EEF0F5", borderRadius: "16px", overflow: "hidden" }}>
                          <div style={{ aspectRatio: "4/5", background: "#F1F2F6", animation: "mthSk 1.4s ease infinite" }}></div>
                          <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                            <div style={{ height: "14px", width: "60%", background: "#F1F2F6", borderRadius: "6px" }}></div>
                            <div style={{ height: "12px", width: "85%", background: "#F1F2F6", borderRadius: "6px" }}></div>
                          </div>
                        </div>
                      </Fragment>
                    ))}
                  </>
                )}
                {v.gridHas && (
                  <>
                    {v.grid.map((p: any, i0: number) => (
                      <Fragment key={i0}>
                        <div style={{ animation: "mthIn .4s ease both" }}>
                          <ProCard pro={p} />
                        </div>
                      </Fragment>
                    ))}
                  </>
                )}
                {v.gridHasMore && (
                  <div style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "center", paddingTop: "8px" }}>
                    <button onClick={v.showMore} style={{ border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "12px 24px", font: "inherit", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>{v.moreLabel}</button>
                  </div>
                )}
              </div>
              {v.gridEmpty && (
                <>
                  <div style={{ border: "1px dashed #D9DCE6", borderRadius: "16px", padding: "56px 24px", display: "flex", flexDirection: "column", alignItems: "center", gap: "14px", textAlign: "center" }}>
                    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.2">
                      <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />
                    </svg>
                    <div style={{ fontSize: "18px", fontWeight: "400", maxWidth: "440px", textWrap: "balance" }}>{v.emptyText}</div>
                    <button onClick={v.resetAll} style={{ border: "1px solid #02084D", background: "#fff", color: "#02084D", borderRadius: "999px", padding: "10px 20px", font: "inherit", fontSize: "14px", cursor: "pointer", transition: "all .2s" }} className="mth-hover-2">Clear filters</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </section>
        <section id="mth-services" style={{ background: "#F6F7FA", padding: "clamp(64px,8vw,120px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(32px,4vw,56px)" }}>
            <div data-reveal="1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", flexWrap: "wrap" }}>
              <h2 style={{ margin: "0", fontSize: "clamp(36px,5.2vw,68px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1", maxWidth: "720px" }}>
                Everything you need, at{" "}
                <span style={{ fontWeight: "600" }}>home</span>
                .
              </h2>
              <p style={{ margin: "0", maxWidth: "380px", fontSize: "16px", lineHeight: "1.55", color: "#6B7085" }}>Ten services, one booking flow. Every price is shown before you book — no surprises at the door.</p>
            </div>
            <div className="mth-swipe" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: "16px" }}>
              {v.services.map((g: any, i0: number) => (
                <Fragment key={i0}>
                  <div data-reveal="1" style={{ background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", padding: "24px", display: "flex", flexDirection: "column", gap: "20px", transition: "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s" }} className="mth-hover-9">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ fontSize: "22px", letterSpacing: "-.02em", lineHeight: "1.1" }}>
                        <span style={{ fontWeight: "600" }}>{g.brand}</span>
                        <span style={{ fontWeight: "300" }}>{" "}To Home.</span>
                      </div>
                      <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#F1F2F7", display: "flex", alignItems: "center", justifyContent: "center", flex: "none" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d={g.icon} />
                        </svg>
                      </span>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {g.items.map((it: any, i1: number) => (
                        <Fragment key={i1}>
                          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", padding: "9px 0", borderTop: "1px solid #F0F1F5", fontSize: "14px" }}>
                            <span style={{ fontWeight: "300", color: "#3A3F5C" }}>{it.n}</span>
                            <span style={{ fontWeight: "400", whiteSpace: "nowrap" }}>{it.p}</span>
                          </div>
                        </Fragment>
                      ))}
                    </div>
                    <button onClick={g.go} style={{ marginTop: "auto", alignSelf: "flex-start", background: "none", border: "none", padding: "4px 0", font: "inherit", fontSize: "14px", fontWeight: "500", color: "#02084D", cursor: "pointer", display: "flex", alignItems: "center", gap: "6px", transition: "gap .2s" }} className="mth-hover-10">
                      Explore{" "}
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                        <path d="M5 12h14M13 6l6 6-6 6" />
                      </svg>
                    </button>
                  </div>
                </Fragment>
              ))}
            </div>
          </div>
        </section>
        <section id="mth-explain" style={{ padding: "clamp(64px,8vw,120px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(28px,3vw,44px)" }}>
            <div data-reveal="1" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "24px", flexWrap: "wrap" }}>
              <h2 style={{ margin: "0", fontSize: "clamp(36px,5.2vw,68px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1" }}>
                See how your{" "}
                <span style={{ fontWeight: "600" }}>therapy</span>
                {" "}works.
              </h2>
              <p style={{ margin: "0", maxWidth: "360px", fontSize: "16px", lineHeight: "1.55", color: "#6B7085" }}>Pick a therapy. Drag to rotate, scroll to zoom.</p>
            </div>
            <div style={{ display: "flex", gap: "8px", overflowX: "auto", scrollbarWidth: "none", paddingBottom: "2px" }}>
              {v.therapies.map((t: any, i0: number) => (
                <Fragment key={i0}>
                  <button onClick={t.pick} style={{ flex: "none", border: `1px solid ${t.bd}`, background: t.bg, color: t.fg, borderRadius: "999px", padding: "10px 18px", font: "inherit", fontSize: "14px", cursor: "pointer", whiteSpace: "nowrap", transition: "all .25s" }} className="mth-hover-1">{t.label}</button>
                </Fragment>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "clamp(20px,3vw,40px)", alignItems: "stretch" }}>
              <div style={{ flex: "1.35 1 420px", minHeight: "clamp(380px,46vw,600px)", background: "#F6F7FA", borderRadius: "24px", position: "relative", overflow: "hidden" }}>
                <BodyViewer focus={v.thFocus} />
                <div style={{ position: "absolute", left: "20px", bottom: "18px", fontSize: "12px", color: "#6B7085", display: "flex", alignItems: "center", gap: "6px", pointerEvents: "none" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5">
                    <path d="M12 3a9 9 0 1 0 9 9M21 3v6h-6" />
                  </svg>
                  Drag to rotate · Scroll to zoom{" "}
                </div>
              </div>
              <div style={{ flex: "1 1 340px", display: "flex", flexDirection: "column", gap: "26px", padding: "clamp(4px,1vw,16px) 0" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <div style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>What it helps with</div>
                  <div style={{ fontSize: "clamp(26px,2.6vw,34px)", fontWeight: "300", letterSpacing: "-.03em", lineHeight: "1.1" }}>{v.th.label}</div>
                  <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "#4A4F6A", textWrap: "pretty" }}>{v.th.helps}</p>
                </div>
                <div style={{ display: "flex", flexDirection: "column" }}>
                  <div style={{ fontSize: "12px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500", marginBottom: "6px" }}>A typical session</div>
                  {v.thSteps.map((st: any, i0: number) => (
                    <Fragment key={i0}>
                      <div style={{ display: "flex", gap: "18px", padding: "14px 0", borderTop: "1px solid #EEF0F5", animation: "mthIn .4s ease both" }}>
                        <span style={{ fontSize: "13px", fontWeight: "500", color: "#6B7085", width: "22px", flex: "none", paddingTop: "2px" }}>{st.n}</span>
                        {" "}
                        <span style={{ fontSize: "15px", lineHeight: "1.5", color: "#02084D" }}>{st.t}</span>
                      </div>
                    </Fragment>
                  ))}
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "15px", padding: "14px 16px", background: "#F6F7FA", borderRadius: "12px" }}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5">
                    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4" />
                  </svg>
                  {" "}
                  <span style={{ color: "#6B7085" }}>Typical plan</span>
                  <span style={{ fontWeight: "500" }}>{v.th.plan}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", flexWrap: "wrap", alignItems: "center" }}>
                  <button onClick={v.thBook} style={{ background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "15px 26px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-8">{v.thCta}</button>
                  {" "}
                  <button onClick={v.thMore} style={{ background: "none", border: "none", font: "inherit", fontSize: "14px", color: "#02084D", cursor: "pointer", padding: "10px 4px" }}>Compare therapists</button>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section id="mth-how" style={{ background: "#F6F7FA", padding: "clamp(64px,8vw,120px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(36px,4vw,60px)" }}>
            <h2 data-reveal="1" style={{ margin: "0", fontSize: "clamp(36px,5.2vw,68px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1" }}>
              How it{" "}
              <span style={{ fontWeight: "600" }}>works</span>
              .
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: "clamp(24px,3vw,48px)" }}>
              <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid #02084D", paddingTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "clamp(48px,5vw,72px)", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>01</span>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3">
                    <path d="M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14zM21 21l-5-5" />
                  </svg>
                </div>
                <div style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-.02em" }}>Search</div>
                <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#6B7085" }}>Tell us what you need and where. Compare verified professionals by rating, distance and price.</p>
              </div>
              <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid #02084D", paddingTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "clamp(48px,5vw,72px)", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>02</span>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3">
                    <path d="M4 6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zM4 10h16M8 2v4M16 2v4" />
                  </svg>
                </div>
                <div style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-.02em" }}>Book</div>
                <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#6B7085" }}>Choose one visit or a full treatment plan. Pick dates and times — pay by UPI, card, or after the first visit.</p>
              </div>
              <div data-reveal="1" style={{ display: "flex", flexDirection: "column", gap: "16px", borderTop: "1px solid #02084D", paddingTop: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "clamp(48px,5vw,72px)", fontWeight: "200", letterSpacing: "-.04em", lineHeight: "1" }}>03</span>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3">
                    <path d="M3 10l9-7 9 7v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" />
                  </svg>
                </div>
                <div style={{ fontSize: "22px", fontWeight: "500", letterSpacing: "-.02em" }}>Get care at home</div>
                <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.55", color: "#6B7085" }}>Track your professional live. Notes and reports stay in your records.</p>
              </div>
            </div>
          </div>
        </section>
        <section style={{ padding: "clamp(64px,8vw,120px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(36px,4vw,56px)" }}>
            <h2 data-reveal="1" style={{ margin: "0", fontSize: "clamp(36px,5.2vw,68px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1" }}>
              Why{" "}
              <span style={{ fontWeight: "600" }}>Medico</span>
              {" "}To Home.
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(230px,1fr))", gap: "1px", background: "#E6E8EF", border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden" }}>
              <div data-reveal="1" style={{ background: "#fff", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", transition: "background .25s" }} className="mth-hover-6">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" />
                </svg>
                <div style={{ fontSize: "18px", fontWeight: "500" }}>Verified professionals</div>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6B7085" }}>Council registration, ID and police checks, plus an in-person interview.</p>
              </div>
              <div data-reveal="1" style={{ background: "#fff", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", transition: "background .25s" }} className="mth-hover-6">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20.6 13.4l-7.2 7.2a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8zM7.5 7.5h.01" />
                </svg>
                <div style={{ fontSize: "18px", fontWeight: "500" }}>Transparent prices</div>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6B7085" }}>Every fee shown upfront, with package discounts on longer plans.</p>
              </div>
              <div data-reveal="1" style={{ background: "#fff", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", transition: "background .25s" }} className="mth-hover-6">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM18 9a2 2 0 1 0 0-4 2 2 0 0 0 0 4zM8 17h7a3 3 0 0 0 0-6H9a3 3 0 0 1 0-6h7" />
                </svg>
                <div style={{ fontSize: "18px", fontWeight: "500" }}>Live tracking</div>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6B7085" }}>See when they leave, where they are, and when they’ll arrive.</p>
              </div>
              <div data-reveal="1" style={{ background: "#fff", padding: "28px", display: "flex", flexDirection: "column", gap: "14px", transition: "background .25s" }} className="mth-hover-6">
                <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 3H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9zM14 3v6h6M8 13h8M8 17h5" />
                </svg>
                <div style={{ fontSize: "18px", fontWeight: "500" }}>Records in one place</div>
                <p style={{ margin: "0", fontSize: "14px", lineHeight: "1.55", color: "#6B7085" }}>Prescriptions, session notes and lab reports for the whole family.</p>
              </div>
            </div>
          </div>
        </section>
        <section style={{ padding: "0 clamp(18px,4vw,48px)" }}>
          <div data-reveal="1" style={{ maxWidth: "1320px", margin: "0 auto", background: "#02084D", borderRadius: "24px", padding: "clamp(36px,5vw,72px)", display: "flex", flexWrap: "wrap", gap: "32px", alignItems: "flex-end", justifyContent: "space-between", color: "#fff" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxWidth: "640px" }}>
              <div style={{ fontSize: "12px", letterSpacing: ".1em", textTransform: "uppercase", fontWeight: "500", color: "#B9BCE0" }}>For professionals</div>
              <div style={{ fontSize: "clamp(32px,4.4vw,58px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1.02" }}>
                Earn on your own time.{" "}
                <span style={{ fontWeight: "600" }}>Join as a professional.</span>
              </div>
              <p style={{ margin: "0", fontSize: "16px", lineHeight: "1.55", color: "#C9CBE6" }}>Set your hours and service area. Get paid weekly, straight to your bank.</p>
            </div>
            <button onClick={v.goJoin} style={{ background: "#fff", color: "#02084D", border: "none", borderRadius: "999px", padding: "16px 30px", font: "inherit", fontSize: "15px", fontWeight: "600", cursor: "pointer", transition: "transform .2s" }} className="mth-hover-11">Join now</button>
          </div>
        </section>
        <section style={{ padding: "clamp(64px,8vw,120px) clamp(18px,4vw,48px)" }}>
          <div style={{ maxWidth: "1320px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "clamp(32px,4vw,52px)" }}>
            <h2 data-reveal="1" style={{ margin: "0", fontSize: "clamp(36px,5.2vw,68px)", fontWeight: "300", letterSpacing: "-.04em", lineHeight: "1" }}>
              From families{" "}
              <span style={{ fontWeight: "600" }}>like yours</span>
              .
            </h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))", gap: "16px" }}>
              <figure data-reveal="1" style={{ margin: "0", border: "1px solid #E6E8EF", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }}>
                <blockquote style={{ margin: "0", fontSize: "19px", lineHeight: "1.45", fontWeight: "300", letterSpacing: "-.01em" }}>“After Uppa’s knee surgery, Shahid came home every evening for three weeks. He’s walking to the mosque on his own again.”</blockquote>
                <figcaption style={{ fontSize: "14px", color: "#6B7085" }}>
                  <span style={{ color: "#02084D", fontWeight: "500" }}>Muhsina K.</span>
                  {" "}· Eranhipalam
                </figcaption>
              </figure>
              <figure data-reveal="1" style={{ margin: "0", border: "1px solid #E6E8EF", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }}>
                <blockquote style={{ margin: "0", fontSize: "19px", lineHeight: "1.45", fontWeight: "300", letterSpacing: "-.01em" }}>“We live in Dubai. Booking a caregiver for Amma in Kottakkal and seeing every visit on the app gave us real peace of mind.”</blockquote>
                <figcaption style={{ fontSize: "14px", color: "#6B7085" }}>
                  <span style={{ color: "#02084D", fontWeight: "500" }}>Sreejith Menon</span>
                  {" "}· Kottakkal
                </figcaption>
              </figure>
              <figure data-reveal="1" style={{ margin: "0", border: "1px solid #E6E8EF", borderRadius: "16px", padding: "28px", display: "flex", flexDirection: "column", gap: "24px", justifyContent: "space-between" }}>
                <blockquote style={{ margin: "0", fontSize: "19px", lineHeight: "1.45", fontWeight: "300", letterSpacing: "-.01em" }}>“The nurse came for an IV drip within two hours, on a Sunday. The price was exactly what the app showed.”</blockquote>
                <figcaption style={{ fontSize: "14px", color: "#6B7085" }}>
                  <span style={{ color: "#02084D", fontWeight: "500" }}>Teresa Joseph</span>
                  {" "}· West Hill
                </figcaption>
              </figure>
            </div>
          </div>
        </section>
        <section style={{ padding: "0 clamp(18px,4vw,48px) clamp(64px,8vw,120px)" }}>
          <div data-reveal="1" style={{ maxWidth: "1320px", margin: "0 auto", background: "#F6F7FA", borderRadius: "24px", padding: "clamp(32px,4vw,56px)", display: "flex", flexWrap: "wrap", gap: "28px", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", maxWidth: "560px" }}>
              <div style={{ fontSize: "clamp(28px,3.4vw,44px)", fontWeight: "300", letterSpacing: "-.035em", lineHeight: "1.05" }}>
                Care in your pocket.{" "}
                <span style={{ fontWeight: "600" }}>Get the app.</span>
              </div>
              <p style={{ margin: "0", fontSize: "15px", color: "#6B7085", lineHeight: "1.55" }}>Track visits live, chat with your professional, and keep the family’s records together.</p>
            </div>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button style={{ display: "flex", alignItems: "center", gap: "10px", background: "#02084D", color: "#fff", border: "none", borderRadius: "12px", padding: "10px 18px", font: "inherit", cursor: "pointer", transition: "transform .2s" }} className="mth-hover-11">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.4">
                  <path d="M7 3h10a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zM11 18h2" />
                </svg>
                <span style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.15" }}>
                  <span style={{ fontSize: "10px", opacity: ".75" }}>Download on the</span>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>App Store</span>
                </span>
              </button>
              {" "}
              <button style={{ display: "flex", alignItems: "center", gap: "10px", background: "#02084D", color: "#fff", border: "none", borderRadius: "12px", padding: "10px 18px", font: "inherit", cursor: "pointer", transition: "transform .2s" }} className="mth-hover-11">
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="1.4">
                  <path d="M5 3l14 9-14 9z" />
                </svg>
                <span style={{ display: "flex", flexDirection: "column", textAlign: "left", lineHeight: "1.15" }}>
                  <span style={{ fontSize: "10px", opacity: ".75" }}>Get it on</span>
                  <span style={{ fontSize: "15px", fontWeight: "600" }}>Google Play</span>
                </span>
              </button>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
