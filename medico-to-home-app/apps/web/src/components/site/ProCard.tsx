"use client";

/* eslint-disable */
// Converted from the prototype.
export function ProCard({ pro }: { pro: any }) {
  return (
    <div onClick={pro.open} style={{ background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", height: "100%", transition: "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s", fontFamily: "Inter,system-ui,sans-serif", color: "#02084D" }} className="mth-hover-16 mth-card">
      <div className="mth-card-img" style={{ position: "relative", aspectRatio: "4/5", background: "#EEF0F6", overflow: "hidden" }}>
        {pro.hasImg && (
          <>
            <img src={pro.img} alt={pro.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%", display: "block" }} />
          </>
        )}
        {pro.noImg && (
          <>
            <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF0F6" }}>
              <div className="mth-card-initials" style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#DFE2EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D" }}>{pro.initials}</div>
            </div>
          </>
        )}
        <div className="mth-card-badge" style={{ position: "absolute", left: "12px", top: "12px", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "5px 10px 5px 8px", fontSize: "12px", fontWeight: "500", color: "#02084D" }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" />
          </svg>
          {" "}Verified{" "}
        </div>
      </div>
      <div className="mth-card-body" style={{ padding: "16px 16px 16px", display: "flex", flexDirection: "column", gap: "10px", flex: "1" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "8px", alignItems: "baseline" }}>
            <div style={{ fontSize: "16px", fontWeight: "600", letterSpacing: "-.01em" }}>{pro.name}</div>
            <div style={{ fontSize: "13px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "3px" }}>
              <span style={{ color: "#02084D" }}>★</span>
              <span style={{ fontWeight: "500" }}>{pro.rating}</span>
              <span style={{ color: "#6B7085", fontWeight: "300" }}>({pro.reviews})</span>
            </div>
          </div>
          <div style={{ fontSize: "13px", color: "#6B7085", fontWeight: "300", lineHeight: "1.45" }}>{pro.roleLine}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px", fontSize: "13px", fontWeight: "300", color: "#3A3F5C" }}>
          <div>{pro.exp} yrs exp · {pro.langs}</div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5">
              <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
            </svg>
            {pro.distLine}
          </div>
        </div>
        <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: "6px", borderRadius: "999px", padding: "4px 10px", fontSize: "12px", fontWeight: "400", background: pro.availBg, color: pro.availFg }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: pro.availFg }}></span>
          {pro.availText}{" "}
        </div>
        <div style={{ marginTop: "auto", paddingTop: "12px", borderTop: "1px solid #EEF0F5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ fontSize: "15px" }}>
            <span style={{ fontWeight: "600" }}>{pro.priceText}</span>
            <span style={{ color: "#6B7085", fontWeight: "300", fontSize: "13px" }}>{" "}{pro.unitText}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
            <button onClick={pro.open} style={{ background: "none", border: "none", padding: "8px 8px", font: "inherit", fontSize: "13px", color: "#02084D", cursor: "pointer", borderRadius: "999px", transition: "background .2s" }} className="mth-hover-17 mth-card-profile">Profile</button>
            {" "}
            <button onClick={pro.book} style={{ background: "#02084D", color: "#fff", border: "none", padding: "9px 16px", font: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer", borderRadius: "999px", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-18">Book</button>
          </div>
        </div>
      </div>
    </div>
  );
}
