const steps = [
  "Chụp ảnh check in tại poster/booth hoặc chụp vé (Có chữ SHLN).",
  "Đăng bài review kèm hashtag #SongHyLamNguy #SHLN.",
  "Điền form link bài đăng review.",
];

const gifts = [
  { icon: "🎫", name: " Landyard Song Hỷ Lâm Nguy " },
  { icon: "🧳", name: "Tag Vali MisThy" },
  { icon: "🖼️", name: "Polaroid (limited)" },
];

export default function Giveaway() {
  return (
    <section className="section" style={{ paddingTop: 0 }}>
      <div className="ga-card">
        {/* HEADER */}
        <div className="ga-header">
          <div className="ga-eyebrow">Chương trình GIVEAWAY</div>
        </div>

        {/* BODY */}
        <div className="ga-body">
          <p className="ga-desc">
            Đăng bài review phim để nhận quà tặng hấp dẫn từ FC:
          </p>

          {/* STEPS */}
          <div className="giveaway-steps">
            {steps.map((s, i) => (
              <div key={i} className="giveaway-step">
                <div className="step-number">{i + 1}</div>
                <div className="step-content">{s}</div>
              </div>
            ))}
          </div>

          {/* GIFTS */}
          <p className="gift-label">Quà tặng giveaway</p>

          <div className="gift-row">
            {gifts.map((g, i) => (
              <div key={i} className="gift-item">
                <div className="gift-placeholder">
                  <div className="icon">{g.icon}</div>
                  <div className="name">{g.name}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* FOOTER */}
        <div className="ga-footer">
          <button className="btn-detail">
            {/* 👇 QUAN TRỌNG: SVG */}
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>

            <span>Xem chi tiết</span>
          </button>
        </div>
      </div>
    </section>
  );
}
