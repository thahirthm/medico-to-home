"use client";

/* eslint-disable */
// Converted from the prototype. Reads demo values from the site store.
import { Fragment, useState } from "react";
import { useSite } from "./SiteProvider";
import { ProCard } from "./ProCard";

export function ProfessionalView() {
  const v = useSite();
  if (v.mob) return <PhoneProfessional v={v} />;
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
                        <span style={{ fontSize: "15px", fontWeight: "400" }}>{sv.n}{sv.online && <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", marginLeft: "8px", verticalAlign: "middle", fontSize: "11px", fontWeight: "500", color: "#1F6FB2", background: "#EAF3FB", borderRadius: "999px", padding: "2px 8px" }}><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#1F6FB2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M15 10l5-3v10l-5-3M4 6h11v12H4z" /></svg>Online</span>}</span>
                        <span style={{ fontSize: "13px", color: "#6B7085" }}>{sv.online ? sv.d + " · video call" : sv.d}</span>
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
            <ServiceArea v={v} />
            <Reviews v={v} />
          </div>
        </div>
        <Similar v={v} />
      </div>
    </>
  );
}

function ServiceArea({ v, phone }: { v: any; phone?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <h3 style={phone ? phoneH : { margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Service area</h3>
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
      {v.pp.towns && <p style={{ margin: "0", fontSize: "14px", color: "#4A4F6A", lineHeight: "1.5" }}>Also visits {v.pp.towns}</p>}
    </div>
  );
}

function Reviews({ v, phone }: { v: any; phone?: boolean }) {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
      <h3 style={phone ? phoneH : { margin: "0", fontSize: "13px", letterSpacing: ".08em", textTransform: "uppercase", color: "#6B7085", fontWeight: "500" }}>Reviews · ★ {v.pp.rating} from {v.pp.reviews}</h3>
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
  );
}

function Similar({ v, top = "88px" }: { v: any; top?: string }) {
  if (!v.hasSimilar) return null;
  return (
    <div style={{ marginTop: top, display: "flex", flexDirection: "column", gap: "22px" }}>
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
  );
}

const PHONE_TABS = [["about", "About"], ["services", "Services"], ["avail", "Availability"]];
const iconBtn: any = { width: "44px", height: "44px", borderRadius: "50%", border: "none", background: "none", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "#02084D", flex: "none" };
const phoneH: any = { margin: "0", fontSize: "19px", fontWeight: "600", letterSpacing: "-.01em" };

/** The phone layout: a compact profile header, quick tabs that jump to each section, and a booking bar. */
function PhoneProfessional({ v }: { v: any }) {
  const [tab, setTab] = useState("about");
  const jump = (k: string) => { setTab(k); document.getElementById(`mth-pp-${k}`)?.scrollIntoView({ behavior: "smooth", block: "start" }); };
  return (
    <div style={{ padding: "8px 16px 130px", animation: "mthIn .35s ease" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "4px", margin: "0 -6px 14px" }}>
        <button onClick={v.ppBack} aria-label="Back" style={{ ...iconBtn, background: "#fff", boxShadow: "0 2px 10px rgba(2,8,77,.08)" }}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M11 6l-6 6 6 6" /></svg>
        </button>
        <h1 style={{ flex: "1", margin: "0", textAlign: "center", fontSize: "17px", fontWeight: "600" }}>{v.pp.role} Details</h1>
        <button onClick={v.ppSave} aria-label="Save" style={iconBtn}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round"><path d="M6 3h12v18l-6-4.5L6 21z" /></svg>
        </button>
        <button onClick={v.ppShare} aria-label="Share" style={iconBtn}>
          <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M12 15V3M7.5 7.5 12 3l4.5 4.5M5 12v8h14v-8" /></svg>
        </button>
      </div>

      <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
        <div style={{ width: "min(118px,32vw)", aspectRatio: "1", flex: "none", borderRadius: "20px", overflow: "hidden", background: "#EEF0F6", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {v.pp.hasImg
            ? <div role="img" aria-label={v.pp.name} style={{ width: "100%", height: "100%", backgroundImage: `url(${v.pp.img})`, backgroundSize: "cover", backgroundPosition: "center 25%" }}></div>
            : <span style={{ fontSize: "34px", fontWeight: "300" }}>{v.pp.initials}</span>}
        </div>
        <div style={{ minWidth: "0", display: "flex", flexDirection: "column", gap: "6px", alignItems: "flex-start" }}>
          <div style={{ fontSize: "23px", fontWeight: "500", letterSpacing: "-.02em", lineHeight: "1.15" }}>{v.pp.name}</div>
          <div style={{ fontSize: "14px", color: "#6B7085", lineHeight: "1.4" }}>{v.pp.qual}</div>
          <span style={{ display: "inline-flex", alignItems: "center", gap: "5px", marginTop: "2px", background: "#E8F5EF", color: "#1F9D6B", borderRadius: "999px", padding: "5px 11px", fontSize: "12px", fontWeight: "500" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="1.8"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" /></svg>
            Verified {v.pp.role}
          </span>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", margin: "22px 0 20px" }}>
        {[
          [<><svg width="19" height="19" viewBox="0 0 24 24" fill="#02084D" style={{ flex: "none" }}><path d="m12 2.5 2.9 6 6.6.8-4.9 4.6 1.3 6.6L12 17.2l-5.9 3.3 1.3-6.6-4.9-4.6 6.6-.8z" /></svg>{v.pp.reviews ? v.pp.rating : "New"}</>, v.pp.reviews ? `${v.pp.reviews} reviews` : "No reviews yet"],
          [<>{v.pp.exp}<small style={{ fontSize: "14px", fontWeight: "400" }}>yrs</small></>, "Experience"],
          [<><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6" style={{ flex: "none" }}><path d="M12 22s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12z" /><circle cx="12" cy="10" r="2.5" /></svg>{v.pp.km}<small style={{ fontSize: "14px", fontWeight: "400" }}>km</small></>, `From ${v.loc}`],
        ].map(([big, small], i) => (
          <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", padding: "2px 6px", borderLeft: i ? "1px solid #E6E8EF" : "none", minWidth: "0" }}>
            <span style={{ display: "flex", alignItems: "baseline", gap: "4px", fontSize: "24px", fontWeight: "400", letterSpacing: "-.02em", lineHeight: "1.1" }}>{big}</span>
            <span style={{ fontSize: "12px", color: "#6B7085", maxWidth: "100%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{small}</span>
          </div>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3,minmax(0,1fr))", gap: "8px", marginBottom: "26px" }}>
        {PHONE_TABS.map(([k, label]) => (
          <button key={k} onClick={() => jump(k)} style={{ border: "none", borderRadius: "999px", padding: "12px 4px", font: "inherit", fontSize: "14px", fontWeight: tab === k ? "500" : "400", background: tab === k ? "#02084D" : "#EEF0F6", color: tab === k ? "#fff" : "#02084D", cursor: "pointer", transition: "background .2s" }}>{label}</button>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "30px" }}>
        <section id="mth-pp-about" style={{ scrollMarginTop: "84px", display: "flex", flexDirection: "column", gap: "10px", paddingBottom: "26px", borderBottom: "1px solid #E6E8EF" }}>
          <h2 style={phoneH}>About</h2>
          {v.pp.bio && <p style={{ margin: "0", fontSize: "15px", lineHeight: "1.6", color: "#4A4F6A" }}>{v.pp.bio}</p>}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginTop: "4px" }}>
            {v.pp.langsList.map((lg: string) => <span key={lg} style={{ border: "1px solid #E6E8EF", borderRadius: "999px", padding: "5px 11px", fontSize: "12px" }}>{lg}</span>)}
          </div>
          {v.pp.reg && <div style={{ fontSize: "12px", color: "#6B7085" }}>{v.pp.reg} · ID & background verified</div>}
        </section>

        <section id="mth-pp-services" style={{ scrollMarginTop: "84px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <h2 style={phoneH}>Services & Prices</h2>
          <div style={{ border: "1px solid #E6E8EF", borderRadius: "18px", padding: "0 14px" }}>
            {v.ppSvcs.map((sv: any, i: number) => (
              <button key={i} onClick={sv.book} style={{ width: "100%", display: "flex", alignItems: "center", gap: "12px", padding: "14px 0", border: "none", borderTop: i ? "1px solid #EEF0F5" : "none", background: "none", font: "inherit", color: "inherit", textAlign: "left", cursor: "pointer" }}>
                <span style={{ width: "44px", height: "44px", flex: "none", borderRadius: "12px", background: "#EEF2FA", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  {sv.online
                    ? <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6" strokeLinejoin="round"><path d="M15 10l5-3v10l-5-3M3 6h12v12H3z" /></svg>
                    : <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6" strokeLinecap="round"><path d="M6 3v6a4 4 0 0 0 8 0V3M10 13v2a5 5 0 0 0 10 0v-2" /><circle cx="20" cy="11" r="2" /></svg>}
                </span>
                <span style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "500" }}>{sv.n}</span>
                  <span style={{ fontSize: "13px", color: "#6B7085" }}>{sv.d} · {sv.online ? "Video call" : "Home visit"}</span>
                </span>
                <span style={{ textAlign: "right", flex: "none" }}>
                  <span style={{ display: "block", fontSize: "16px", fontWeight: "600" }}>{sv.price}</span>
                  <span style={{ display: "block", fontSize: "12px", color: "#6B7085" }}>{sv.unit}</span>
                </span>
              </button>
            ))}
          </div>
          {v.ppCanPlan && <button onClick={v.ppPlanBook} style={{ background: "#fff", color: "#02084D", border: "1px solid #02084D", borderRadius: "999px", padding: "13px", font: "inherit", fontSize: "14px", fontWeight: "500", cursor: "pointer" }}>Book a treatment plan</button>}
        </section>

        <section id="mth-pp-avail" style={{ scrollMarginTop: "84px", display: "flex", flexDirection: "column", gap: "14px" }}>
          <h2 style={{ ...phoneH, display: "flex", alignItems: "center", gap: "10px" }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.5" strokeLinecap="round"><rect x="3.5" y="5" width="17" height="15.5" rx="2.5" /><path d="M3.5 10h17M8 3v4M16 3v4" /></svg>
            Availability
          </h2>
          <div style={{ display: "flex", gap: "10px", overflowX: "auto", margin: "0 -16px", padding: "2px 16px", scrollbarWidth: "none" }}>
            {v.week.map((wd: any, i: number) => (
              <button key={i} onClick={wd.pick} style={{ flex: "none", width: "70px", border: `1px solid ${wd.bd}`, background: wd.bg, color: wd.fg, borderRadius: "16px", padding: "12px 4px", font: "inherit", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: "3px" }}>
                <span style={{ fontSize: "13px" }}>{wd.dow}</span>
                <span style={{ fontSize: "22px", fontWeight: "400" }}>{wd.n}</span>
                <span style={{ fontSize: "12px", opacity: ".75" }}>{wd.sub}</span>
              </button>
            ))}
          </div>
          {v.hasSlots
            ? <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(92px,1fr))", gap: "8px" }}>
                {v.pslots.map((sl: any, i: number) => (
                  <button key={i} onClick={sl.pick} style={{ border: `1px solid ${sl.bd}`, background: sl.bg, color: sl.fg, borderRadius: "999px", padding: "10px 6px", font: "inherit", fontSize: "13px", cursor: sl.cur }}>{sl.label}</button>
                ))}
              </div>
            : <div style={{ padding: "16px", borderRadius: "12px", background: "#F6F7FA", fontSize: "14px", color: "#6B7085" }}>Not available on {v.selDayText}. Try another day.</div>}
        </section>

        <ServiceArea v={v} phone />
        <Reviews v={v} phone />
      </div>
      <Similar v={v} top="48px" />

      <div className="keyboard-hide" style={{ position: "fixed", left: "0", right: "0", bottom: "0", zIndex: "40", background: "#fff", borderTop: "1px solid #E6E8EF", padding: "12px 16px calc(12px + env(safe-area-inset-bottom))", display: "flex", alignItems: "center", gap: "12px" }}>
        <div style={{ flex: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
          <span style={{ fontSize: "22px", fontWeight: "600", letterSpacing: "-.02em" }}>
            {v.pp.priceText}{" "}
            <span style={{ fontWeight: "400", fontSize: "14px", color: "#6B7085", letterSpacing: "0" }}>{v.pp.unitText}</span>
          </span>
          <span style={{ fontSize: "13px", color: v.pp.availFg, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{v.pp.nextSlot}</span>
        </div>
        <button onClick={v.ppBook} style={{ flex: "none", display: "flex", alignItems: "center", gap: "10px", background: "#02084D", color: "#fff", border: "none", borderRadius: "999px", padding: "15px 24px", font: "inherit", fontSize: "16px", fontWeight: "500", cursor: "pointer" }}>
          Book Now
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
        </button>
      </div>
    </div>
  );
}
