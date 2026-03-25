import { useEffect, useMemo, useRef, useState } from "react";

/* ===== DATA ===== */
export const milestones = [
  {
    city: "HCM",
    venue: "Galaxy Kinh Dương Vương",
    date: "01.04.2026",
    times: ["19:00", "19:30"],
  },
  {
    city: "HCM",
    venue: "CGV Sư Vạn Hạnh",
    date: "01.04.2026",
    times: ["20:30", "21:00"],
  },
  {
    city: "HCM",
    venue: "Cinestar Quốc Thanh",
    date: "01.04.2026",
    times: ["22:00", "22:30"],
  },
  {
    city: "HCM",
    venue: "Lotte Cinema Gò Vấp",
    date: "02.04.2026",
    times: ["19:00", "19:30"],
  },
  {
    city: "HCM",
    venue: "BHD Quang Trung",
    date: "02.04.2026",
    times: ["20:30"],
  },
  {
    city: "HCM",
    venue: "Beta Quang Trung",
    date: "02.04.2026",
    times: ["21:30", "22:00"],
  },
];

/* ===== HELPERS ===== */

function parseDateTime(dateStr, timeStr) {
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;

  const [, d, m, y] = match;
  const [h, min] = timeStr.split(":");

  return new Date(y, m - 1, d, h, min);
}

function getGlobalNearest(sorted, now) {
  let result = {
    milestoneIndex: -1,
    timeIndex: -1,
    time: null,
  };

  let minDiff = Infinity;

  sorted.forEach((m, mi) => {
    m.times?.forEach((t, ti) => {
      const time = parseDateTime(m.date, t);
      if (!time) return;

      const diff = time - now;

      if (diff > 0 && diff < minDiff) {
        minDiff = diff;
        result = {
          milestoneIndex: mi,
          timeIndex: ti,
          time,
        };
      }
    });
  });

  return result;
}

function getStatus(dateStr, times, now) {
  if (!times?.length) return "tbd";

  const allTimes = times.map((t) => parseDateTime(dateStr, t));

  if (allTimes.every((t) => now > t)) return "past";

  if (allTimes.some((t) => Math.abs(now - t) < 60 * 60 * 1000))
    return "current";

  return "upcoming";
}

function formatCountdown(diff) {
  if (diff <= 0) return "Đang diễn ra";

  const h = Math.floor(diff / (1000 * 60 * 60));
  const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const s = Math.floor((diff % (1000 * 60)) / 1000);

  return `${h}h ${m}m ${s}s`;
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
  const [now, setNow] = useState(new Date());

  /* 🔥 realtime clock */
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  /* ===== SORT ===== */
  const sorted = useMemo(() => {
    return [...milestones]
      .map((m) => ({
        ...m,
        parsed: parseDateTime(m.date, m.times?.[0]),
      }))
      .sort((a, b) => (a.parsed || Infinity) - (b.parsed || Infinity));
  }, []);

  /* ===== GLOBAL NEAREST ===== */
  const globalNearest = useMemo(
    () => getGlobalNearest(sorted, now),
    [sorted, now],
  );

  const nearestIndex = globalNearest.milestoneIndex;

  /* ===== SCROLL ===== */

  const scrollToNearest = () => {
    const el = itemRefs.current[nearestIndex];
    if (!el) return;

    el.scrollIntoView({ behavior: "smooth", block: "center" });
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
          {sorted.map((m, i) => {
            const isOdd = i % 2 === 0;
            const status = getStatus(m.date, m.times, now);
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

                <div className="m-card-times">
                  {m.times?.map((t, idx) => {
                    const isNearest =
                      i === globalNearest.milestoneIndex &&
                      idx === globalNearest.timeIndex;

                    return (
                      <span
                        key={idx}
                        className={`time-pill ${isNearest ? "active" : ""}`}
                      >
                        {t}
                      </span>
                    );
                  })}
                </div>
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
          TỚI LỊCH GẦN NHẤT
        </div>
      )}
    </div>
  );
}
