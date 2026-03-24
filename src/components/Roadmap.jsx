import { useEffect, useRef, useState } from "react";

/* ===== HELPERS ===== */
export const milestones = [
  // ===== PAST =====
  {
    city: "Sài Gòn",
    venue: "CGV Vincom Center Đồng Khởi",
    date: "20.03.2026 - 19:00",
  },
  {
    city: "Hải Phòng",
    venue: "Lotte Cinema Hải Phòng",
    date: "22.03.2026 · 18:30",
  },

  // ===== CURRENT (gần hiện tại để test highlight) =====
  {
    city: "Hà Nội",
    venue: "BHD Star Phạm Ngọc Thạch",
    date: "25.03.2026 - 20:00",
  },

  // ===== UPCOMING =====
  {
    city: "Đà Nẵng",
    venue: "CGV Vincom Ngô Quyền",
    date: "27.03.2026 · 19:00",
  },
  {
    city: "Huế",
    venue: "Starlight Cinema",
    date: "30.03.2026 · 18:30",
  },
  {
    city: "Cần Thơ",
    venue: "CGV Sense City",
    date: "05.04.2026 · 19:00",
  },

  // ===== TBD (thiếu info) =====
  {
    city: "Nha Trang",
  },
  {
    venue: "Galaxy Cinema",
  },
  {
    // hoàn toàn chưa có info
  },
];

function parseDate(dateStr) {
  if (!dateStr) return null;
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4}).*?(\d{2}):(\d{2})/);
  if (!match) return null;
  const [, d, m, y, h, min] = match;
  return new Date(y, m - 1, d, h, min);
}

function getStatus(dateStr) {
  const now = new Date();
  const date = parseDate(dateStr);
  if (!date) return "tbd";

  if (now > date) return "past";

  const diff = date - now;
  if (diff < 3 * 60 * 60 * 1000) return "current";

  return "upcoming";
}

function safe(v) {
  return v || "Đang cập nhật";
}

/* ===== COMPONENT ===== */

export default function Roadmap() {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showJump, setShowJump] = useState(false);

  /* ===== SORT + LẤY 4 CÁI GẦN NHẤT ===== */
  const sorted = [...milestones]
    .map((m) => ({ ...m, parsed: parseDate(m.date) }))
    .sort((a, b) => (a.parsed || 9999999999) - (b.parsed || 9999999999));

  const now = new Date();

  // tìm index upcoming gần nhất
  const nearestIndex = sorted.findIndex((m) => m.parsed && m.parsed > now);

  const visibleMilestones = sorted;

  /* ===== SCROLL CENTER DETECT ===== */

  const scrollToNearest = () => {
    const el = itemRefs.current[nearestIndex];
    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "center",
    });
  };
  useEffect(() => {
    const container = containerRef.current?.querySelector(".roadmap");
    if (!container) return;

    const handleScroll = () => {
      const rectContainer = container.getBoundingClientRect();
      const centerY = rectContainer.top + rectContainer.height / 2;

      let closest = 0;
      let minDist = Infinity;

      itemRefs.current.forEach((el, i) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const dist = Math.abs(centerY - elCenter);

        if (dist < minDist) {
          minDist = dist;
          closest = i;
        }
      });

      setActiveIndex(closest);

      // check nearest visibility
      const nearestEl = itemRefs.current[nearestIndex];
      if (!nearestEl) return;

      const rect = nearestEl.getBoundingClientRect();
      const inView =
        rect.top >= rectContainer.top && rect.bottom <= rectContainer.bottom;

      setShowJump(!inView);
    };

    container.addEventListener("scroll", handleScroll);
    handleScroll();

    return () => container.removeEventListener("scroll", handleScroll);
  }, [nearestIndex]);

  return (
    <div className="roadmap-section" ref={containerRef}>
      <div className="roadmap-heading center">
        <h2>Lịch Cinetour</h2>
        <p>
          <span className="live-dot"></span>
          Cập nhật liên tục
          <span className="live-dot"></span>
        </p>
      </div>

      <div className="roadmap">
        <div className="road-spine"></div>

        <div className="milestones">
          {visibleMilestones.map((m, i) => {
            const isOdd = i % 2 === 0;
            const status = getStatus(m.date);
            const isActive = i === activeIndex;

            const card = (
              <div className="m-card">
                <div className={`tag tag-${status}`}>
                  {status === "past"
                    ? "Đã diễn ra"
                    : status === "current"
                      ? "Đang diễn ra"
                      : status === "upcoming"
                        ? "Sắp tới"
                        : "Đang cập nhật"}
                </div>

                <div className="m-card-venue">{safe(m.venue)}</div>
                <div className="m-card-date">{safe(m.date)}</div>
              </div>
            );

            return (
              <div
                key={i}
                ref={(el) => (itemRefs.current[i] = el)}
                className={`milestone ${status} ${isActive ? "active" : ""}`}
              >
                <div className="m-left">{isOdd ? card : null}</div>

                <div className="m-spine">
                  <div className="m-dot">
                    <div className="m-dot-inner"></div>
                  </div>
                </div>
                <div className="m-right">{!isOdd ? card : null}</div>
              </div>
            );
          })}
        </div>
      </div>
      {showJump && (
        <div className="jump-nearest" onClick={scrollToNearest}>
          TỚI LỊCH CINETOUR GẦN NHẤT
        </div>
      )}
    </div>
  );
}
