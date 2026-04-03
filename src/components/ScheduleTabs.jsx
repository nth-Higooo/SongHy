import { useMemo, useState, useEffect } from "react";
import { milestones } from "./Roadmap";

/* ===== HELPERS ===== */

function parseDateTime(dateStr, timeStr) {
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return null;

  const [, d, m, y] = match;
  const [h, min] = timeStr.split(":");

  return new Date(y, m - 1, d, h, min);
}

function isWithinNextDays(dateStr, now, days = 3) {
  const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
  if (!match) return false;

  const [, d, m, y] = match;
  const date = new Date(y, m - 1, d);

  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + days);

  return date >= start && date <= end;
}

function getTimeStatus(dateStr, timeStr, now) {
  const t = parseDateTime(dateStr, timeStr);
  if (!t) return { type: "tbd", label: timeStr };

  const TWO_HOURS = 2 * 60 * 60 * 1000;
  const diff = t - now;

  // đang diễn ra (<= 2h sau khi bắt đầu)
  if (diff <= 0 && Math.abs(diff) <= TWO_HOURS) {
    return { type: "current", label: `${timeStr}` };
  }

  if (diff < 0) {
    return { type: "past", label: timeStr };
  }

  return { type: "upcoming", label: timeStr };
}

function getEventStatus(dateStr, times, now) {
  if (!times?.length) return "tbd";

  const TWO_HOURS = 2 * 60 * 60 * 1000;

  const allTimes = times.map((t) => parseDateTime(dateStr, t));

  if (
    allTimes.some((t) => {
      const diff = now - t;
      return diff >= 0 && diff <= TWO_HOURS;
    })
  ) {
    return "current";
  }

  if (allTimes.some((t) => t > now)) {
    return "upcoming";
  }

  return "past";
}

/* ===== COMPONENT ===== */

export default function ScheduleTabsPro() {
  const [now, setNow] = useState(new Date());
  const [activeDate, setActiveDate] = useState(null);

  /* realtime */
  useEffect(() => {
    const i = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(i);
  }, []);

  /* ===== FILTER 4 NGÀY (AUTO UPDATE) ===== */
  const filtered = useMemo(() => {
    return milestones.filter((m) => isWithinNextDays(m.date, now, 4));
  }, [now]);

  /* ===== GROUP BY DATE ===== */
  const grouped = useMemo(() => {
    const map = {};

    filtered.forEach((m) => {
      if (!map[m.date]) map[m.date] = [];
      map[m.date].push(m);
    });

    return map;
  }, [filtered]);

  const dates = Object.keys(grouped).sort(
    (a, b) => parseDateTime(a, "00:00") - parseDateTime(b, "00:00"),
  );
  function getGlobalNearest(sorted, now) {
    let result = { date: null, time: null };

    let minDiff = Infinity;

    sorted.forEach((m) => {
      m.times?.forEach((t) => {
        const time = parseDateTime(m.date, t);
        if (!time) return;

        const diff = time - now;

        if (diff > 0 && diff < minDiff) {
          minDiff = diff;
          result = {
            date: m.date,
            time: t,
          };
        }
      });
    });

    return result;
  }
  const nearest = useMemo(() => {
    return getGlobalNearest(filtered, now);
  }, [filtered, now]);
  function formatDateDisplay(dateStr) {
    const match = dateStr.match(/(\d{2})\.(\d{2})\.(\d{4})/);
    if (!match) return dateStr;

    const [, d, m] = match;
    return `${d}.${m}`; // 👈 bỏ năm
  }

  /* ===== AUTO CHỌN NGÀY GẦN NHẤT ===== */
  useEffect(() => {
    if (!dates.length) return;

    // nếu activeDate không còn trong list (qua ngày)
    if (!dates.includes(activeDate)) {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      const nearest =
        dates.find((d) => {
          const dt = parseDateTime(d, "00:00");
          return dt >= today;
        }) || dates[0];

      setActiveDate(nearest);
    }
  }, [dates, now]); // 👈 cần cả now

  if (!activeDate) return null;

  return (
    <div className="roadmap-section">
      <div className="roadmap-heading center">
        <h2>Lịch Cinetour</h2>
        <p>
          <span className="live-dot"></span>
          Cập nhật liên tục
          <span className="live-dot"></span>
        </p>
      </div>
      <div className="schedule">
        {/* ===== DATE TABS ===== */}
        <div className="schedule-tabs">
          {dates.map((d) => (
            <button
              key={d}
              className={`schedule-tab ${d === activeDate ? "active" : ""}`}
              onClick={() => setActiveDate(d)}
            >
              {formatDateDisplay(d)}
            </button>
          ))}
        </div>

        {/* ===== LIST ===== */}
        <div className="schedule-list">
          {grouped[activeDate].map((m, i) => {
            const status = getEventStatus(m.date, m.times, now);

            return (
              <div key={i} className={`schedule-card ${status}`}>
                {/* TAG */}
                <div className="schedule-card-header">
                  <div className="schedule-venue">
                    {m.venue} <span>({m.city})</span>
                  </div>

                  <div className={`tag tag-${status}`}>
                    {status === "past"
                      ? "Đã diễn ra"
                      : status === "current"
                        ? "Đang diễn ra"
                        : status === "upcoming"
                          ? "Sắp tới"
                          : "Đang cập nhật"}
                  </div>
                </div>

                <div className="schedule-times">
                  {m.times?.map((t, idx) => {
                    const info = getTimeStatus(m.date, t, now);
                    const isNearest =
                      m.date === nearest.date && t === nearest.time;
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
          })}
        </div>
      </div>
    </div>
  );
}
