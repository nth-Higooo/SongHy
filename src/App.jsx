import { useEffect, useState } from "react";

import Poster from "./components/Poster";
import FilmStrip from "./components/FilmStrip";
import ThankYou from "./components/ThankYou";
import Giveaway from "./components/Giveaway";
import Roadmap from "./components/Roadmap";
import Footer from "./components/Footer";
import { Icon } from "@iconify/react";
import ScheduleTabs from "./components/ScheduleTabs";

export default function App() {
  const [isLight, setIsLight] = useState(() => {
    const saved = localStorage.getItem("theme");

    if (saved) return saved === "light";

    return true;
  });

  useEffect(() => {
    document.body.classList.toggle("light", isLight);
    localStorage.setItem("theme", isLight ? "light" : "dark");
  }, [isLight]);

  return (
    <main>
      {/* ✅ BUTTON */}
      <button className="theme-toggle" onClick={() => setIsLight(!isLight)}>
        <Icon icon="line-md:light-dark" width={18} />
      </button>
      <Poster />
      <FilmStrip />
      <ThankYou />
      {/* <Giveaway /> */}
      {/* <Roadmap /> */}
      <ScheduleTabs />
      <FilmStrip />
      <Footer />
    </main>
  );
}
