"use client";

/* eslint-disable */
// Converted from the prototype.
export function ProCard({ pro }: { pro: any }) {
  return (
    <div onClick={pro.open} style={{ background: "#fff", border: "1px solid #E6E8EF", borderRadius: "16px", overflow: "hidden", display: "flex", flexDirection: "column", cursor: "pointer", height: "100%", transition: "transform .3s cubic-bezier(.2,.7,.2,1), box-shadow .3s, border-color .3s", fontFamily: "Inter,system-ui,sans-serif", color: "#02084D" }} className="mth-hover-16 mth-card">
      <div className="mth-card-img" style={{ position: "relative", aspectRatio: "1/1", background: "#EEF0F6", overflow: "hidden" }}>
        {pro.hasImg && (
          <>
            <img src={pro.img} alt={pro.name} loading="lazy" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%", display: "block" }} />
          </>
        )}
        {pro.noImg && (
          <>
            <div style={{ position: "absolute", inset: "0", display: "flex", alignItems: "center", justifyContent: "center", background: "#EEF0F6" }}>
              <div className="mth-card-initials" style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#DFE2EF", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "30px", fontWeight: "300", letterSpacing: "-.02em", color: "#02084D" }}>{pro.initials}</div>
            </div>
          </>
        )}
        <div className="mth-card-tag mth-card-avail" style={{ position: "absolute", left: "10px", top: "10px", maxWidth: "calc(100% - 20px)", display: "flex", alignItems: "center", gap: "5px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "4px 9px", fontSize: "11px", fontWeight: "500", color: pro.availFg, whiteSpace: "nowrap" }}>
          <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: pro.availFg, flex: "none" }}></span>
          <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{pro.availShort}</span>
        </div>
        {pro.hasOnline && (
          <div className="mth-card-tag mth-card-video" title="Offers online video consultations" style={{ position: "absolute", left: "10px", bottom: "10px", display: "flex", alignItems: "center", gap: "4px", background: "rgba(255,255,255,.94)", borderRadius: "999px", padding: "4px 9px", fontSize: "11px", fontWeight: "500", color: "#02084D", whiteSpace: "nowrap" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#02084D" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }}><path d="M15 10l5-3v10l-5-3M4 6h11v12H4z" /></svg>
            Video
          </div>
        )}
        <div className="mth-card-tag mth-card-exp" style={{ position: "absolute", right: "10px", bottom: "10px", background: "rgba(2,8,77,.82)", borderRadius: "999px", padding: "4px 9px", fontSize: "11px", fontWeight: "500", color: "#fff", whiteSpace: "nowrap" }}>{pro.exp} yrs exp</div>
      </div>
      <div className="mth-card-body" style={{ padding: "14px", display: "flex", flexDirection: "column", gap: "6px", flex: "1", minWidth: "0" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", minWidth: "0" }}>
          <div style={{ fontSize: "15px", fontWeight: "600", letterSpacing: "-.01em", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pro.name}</div>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#1F9D6B" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" style={{ flex: "none" }} aria-label="Verified">
            <title>Verified</title>
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10M8.5 12l2.5 2.5 4.5-5" />
          </svg>
        </div>
        <div style={{ fontSize: "12px", color: "#6B7085", fontWeight: "300", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pro.roleLine}</div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", fontSize: "12px", fontWeight: "300", color: "#3A3F5C", minWidth: "0" }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7085" strokeWidth="1.5" style={{ flex: "none" }}>
            <path d="M12 21s-7-6.2-7-12a7 7 0 0 1 14 0c0 5.8-7 12-7 12zM12 11.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" />
          </svg>
          <span style={{ flex: "1", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{pro.distShort}</span>
          <div style={{ fontSize: "12px", whiteSpace: "nowrap", display: "flex", alignItems: "center", gap: "3px", flex: "none" }}>
            <span style={{ color: "#02084D" }}>★</span>
            <span style={{ fontWeight: "500" }}>{pro.rating}</span>
            <span style={{ color: "#6B7085", fontWeight: "300" }}>({pro.reviews})</span>
          </div>
        </div>
        <div style={{ marginTop: "auto", paddingTop: "10px", borderTop: "1px solid #EEF0F5", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
          <div style={{ fontSize: "15px", whiteSpace: "nowrap", minWidth: "0", overflow: "hidden", textOverflow: "ellipsis" }}>
            <span style={{ fontWeight: "600" }}>{pro.priceText}</span>
            <span style={{ color: "#6B7085", fontWeight: "300", fontSize: "12px" }}>{" "}{pro.unitText}</span>
          </div>
          <button onClick={pro.book} style={{ flex: "none", background: "#02084D", color: "#fff", border: "none", padding: "8px 16px", font: "inherit", fontSize: "13px", fontWeight: "500", cursor: "pointer", borderRadius: "999px", transition: "background .2s, transform .15s" }} className="mth-hover-7 mth-active-18">Book</button>
        </div>
      </div>
    </div>
  );
}
