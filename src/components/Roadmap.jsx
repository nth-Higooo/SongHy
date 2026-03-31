import { useEffect, useMemo, useRef, useState } from "react";

/* ===== DATA ===== */
export const milestones = [
  {
    city: "HCM",
    venue: "Galaxy Kinh Dương Vương",
    date: "31.03.2026",
    times: ["10:04", "10:40"],
  },
  // 01/04
  {
    city: "HCM",
    venue: "Galaxy Kinh Dương Vương",
    date: "01.04.2026",
    times: ["18:00"],
  },
  {
    city: "HCM",
    venue: "CGV Sư Vạn Hạnh",
    date: "01.04.2026",
    times: ["19:30", "20:10"],
  },
  {
    city: "HCM",
    venue: "Cinestar Quốc Thanh",
    date: "01.04.2026",
    times: ["21:30", "22:00"],
  },

  // 02/04
  {
    city: "HCM",
    venue: "Lotte Cinema Gò Vấp",
    date: "02.04.2026",
    times: ["19:00", "19:30"],
  },
  {
    city: "HCM",
    venue: "BHD Star Quang Trung",
    date: "02.04.2026",
    times: ["20:30", "20:50"],
  },
  {
    city: "HCM",
    venue: "Beta Quang Trung",
    date: "02.04.2026",
    times: ["21:30", "22:00"],
  },

  // 03/04
  {
    city: "HCM",
    venue: "CGV Landmark 81",
    date: "03.04.2026",
    times: ["18:00", "18:30"],
  },
  {
    city: "HCM",
    venue: "CGV Giga Mall",
    date: "03.04.2026",
    times: ["19:30", "20:00"],
  },
  {
    city: "HCM",
    venue: "Beta Ung Văn Khiêm",
    date: "03.04.2026",
    times: ["21:00", "21:30"],
  },

  // 04/04
  {
    city: "Biên Hòa",
    venue: "Lotte Cinema Vincom Biên Hòa",
    date: "04.04.2026",
    times: ["18:00", "18:30"],
  },
  {
    city: "Bình Dương",
    venue: "CGV AEON Canary",
    date: "04.04.2026",
    times: ["20:00"],
  },
  {
    city: "Bình Dương",
    venue: "CGV Bình Dương Square",
    date: "04.04.2026",
    times: ["21:00", "21:30"],
  },

  // 05/04
  {
    city: "HCM",
    venue: "Cinestar Sinh Viên",
    date: "05.04.2026",
    times: ["18:00", "18:30"],
  },
  {
    city: "HCM",
    venue: "BHD Star Lê Văn Việt",
    date: "05.04.2026",
    times: ["19:30", "20:00"],
  },
  {
    city: "HCM",
    venue: "CGV Vincom Mega Mall Grand Park",
    date: "05.04.2026",
    times: ["21:00", "21:30"],
  },

  // 06/04
  {
    city: "HCM",
    venue: "Galaxy Parc Mall",
    date: "06.04.2026",
    times: ["18:00", "18:30"],
  },
  {
    city: "HCM",
    venue: "Lotte Cinema Nam Sài Gòn",
    date: "06.04.2026",
    times: ["19:30", "20:00"],
  },
  {
    city: "HCM",
    venue: "CGV Crescent Mall",
    date: "06.04.2026",
    times: ["21:00"],
  },

  // 07/04
  {
    city: "HCM",
    venue: "Galaxy Nguyễn Du",
    date: "07.04.2026",
    times: ["18:00", "18:30"],
  },
  {
    city: "HCM",
    venue: "Mega GS Cao Thắng",
    date: "07.04.2026",
    times: ["19:30", "20:00"],
  },
  {
    city: "HCM",
    venue: "Beta Trần Quang Khải",
    date: "07.04.2026",
    times: ["21:00", "21:30"],
  },

  // 08/04
  {
    city: "HCM",
    venue: "CGV AEON Bình Tân",
    date: "08.04.2026",
    times: ["18:40"],
  },
  {
    city: "HCM",
    venue: "CGV Celadon Tân Phú",
    date: "08.04.2026",
    times: ["19:30", "20:00"],
  },
  {
    city: "HCM",
    venue: "Galaxy Tân Bình",
    date: "08.04.2026",
    times: ["21:00", "21:30"],
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

  const TWO_HOURS = 2 * 60 * 60 * 1000;

  const allTimes = times.map((t) => parseDateTime(dateStr, t));

  // nếu có mốc nào nằm trong khoảng [-2h, +∞) => vẫn coi là current
  if (
    allTimes.some((t) => {
      const diff = now - t;
      return diff >= 0 && diff <= TWO_HOURS;
    })
  ) {
    return "current";
  }

  // nếu có mốc sắp tới
  if (allTimes.some((t) => t > now)) {
    return "upcoming";
  }

  return "past";
}
function formatCountdown(diff) {
  if (diff <= 0) return "Đang diễn ra";

  const totalSec = Math.floor(diff / 1000);
  const d = Math.floor(totalSec / (3600 * 24));
  const h = Math.floor((totalSec % (3600 * 24)) / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;

  if (d > 0) return `${d} ngày`;
  if (h > 0) return `${h}h`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

function getTimeStatus(dateStr, timeStr, now) {
  const t = parseDateTime(dateStr, timeStr);
  if (!t) return { type: "tbd", label: timeStr };

  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const diff = t - now;

  // đang diễn ra (tới +2h)
  if (diff <= 0 && Math.abs(diff) <= TWO_HOURS) {
    return {
      type: "current",
      label: `${timeStr} - đang diễn ra`,
    };
  }

  // đã qua >2h
  if (diff < 0) {
    return {
      type: "past",
      label: timeStr,
    };
  }

  // sắp tới
  return {
    type: "upcoming",
    label: `${timeStr} `,
  };
}

function getNearestTime(dateStr, times, now) {
  if (!times?.length) return null;

  const futureTimes = times
    .map((t) => parseDateTime(dateStr, t))
    .filter((t) => t > now)
    .sort((a, b) => a - b);

  return futureTimes[0] || null;
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

  function isWithinNextDays(dateStr, now, days = 4) {
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!match) return false;

    const [, d, m, y] = match;
    const date = new Date(y, m - 1, d);

    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const end = new Date(start);
    end.setDate(start.getDate() + days);

    return date >= start && date <= end;
  }
  /* ===== SORT ===== */
  const sorted = useMemo(() => {
    return [...milestones]
      .filter((m) => isWithinNextDays(m.date, now, 4))
      .map((m) => ({
        ...m,
        parsed: parseDateTime(m.date, m.times?.[0]),
      }))
      .sort((a, b) => (a.parsed || Infinity) - (b.parsed || Infinity));
  }, [now]);

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
            const nearestTime = getNearestTime(m.date, m.times, now);
            const diff = nearestTime ? nearestTime - now : null;
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
                    const info = getTimeStatus(m.date, t, now);

                    const isNearest =
                      i === globalNearest.milestoneIndex &&
                      idx === globalNearest.timeIndex;

                    return (
                      <span
                        key={idx}
                        className={`time-pill ${info.type} ${isNearest ? "active" : ""}`}
                      >
                        {info.label}
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
